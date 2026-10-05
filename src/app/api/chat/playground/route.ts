import { resolvePlaygroundModel } from "@/lib/ai/providers";
import { streamText, createUIMessageStream, createUIMessageStreamResponse, convertToModelMessages } from "ai";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { retrieveRelevantChunks, formatContextForPrompt, buildSystemPrompt } from "@/lib/ai/rag";
import { sanitizeInput } from "@/lib/utils";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getCatalogSearchLimit } from "@/lib/guards/resource-manager";

export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") ?? "anonymous";

        // 1. Global IP Rate Limit
        const globalLimit = rateLimit(`playground-global:${ip}`, RATE_LIMITS.chat);
        if (!globalLimit.success) {
            return new Response("Too many requests. Please try again later.", { status: 429 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { messages, botId, model, temperature, systemPromptOverride } = body;

        if (!botId || !messages) {
            return new Response("Missing botId or messages", { status: 400 });
        }

        const bot = await prisma.bot.findUnique({
            where: { id: botId, userId: user.id },
        });

        if (!bot) {
            return new Response("Bot not found", { status: 404 });
        }

        // 2. Per-Bot Custom Rate Limit
        const botLimit = rateLimit(`playground-bot:${botId}:${ip}`, {
            limit: bot.rateLimitMessages,
            windowSeconds: bot.rateLimitWindow,
        });

        if (!botLimit.success) {
            return new Response(JSON.stringify({ error: bot.rateLimitMessage || "Rate limit exceeded" }), {
                status: 429,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Get last user message for RAG
        const lastUserMessage = messages.filter((m: any) => m.role === "user").at(-1);
        const query = sanitizeInput(lastUserMessage?.content || "");

        // Unified RAG retrieval (includes Q&A pairs via vector search)
        const relevantChunks = await retrieveRelevantChunks(query, botId);

        // 5. Catalog Search Guard — gate based on tier entitlement
        let catalogContext = "";
        try {
            const catalogSearchLimit = await getCatalogSearchLimit(botId);
            if (query && catalogSearchLimit > 0) {
                const { searchVisualSets } = await import("@/app/actions/catalog-actions");
                const catalogResults = await searchVisualSets(botId, query, catalogSearchLimit);
                const relevantCatalogItems = (catalogResults as any[]).filter(r => r.similarity > 0.3);

                console.log("relevant visual sets (playground): ", relevantCatalogItems)
                if (relevantCatalogItems.length > 0) {
                    catalogContext = `\n\n[RECOMMENDED VISUAL SETS]\n` + relevantCatalogItems.map(set => {
                        const imagesXml = (set.images || []).map((img: any) =>
                            `<img src="${img.publicUrl}" caption="${img.caption || ''}" />`
                        ).join("");
                        const priceAttr = set.price != null ? ` price="${set.price}"` : "";
                        const currencyAttr = set.currency ? ` currency="${set.currency}"` : "";
                        const redirectAttr = set.redirectUrl ? ` redirectUrl="${set.redirectUrl}"` : "";
                        return `<visualset title="${set.title}"${priceAttr}${currencyAttr}${redirectAttr}>${imagesXml}</visualset>`;
                    }).join("\n");
                }
            }
        } catch (e) {
            console.error("[Catalog Search Error - playground]:", e);
        }

        // Build the final context. If visual sets are found, prioritize them and omit generic chunks to avoid dilution.
        const context = formatContextForPrompt(relevantChunks) + catalogContext;

        const finalSystemPrompt = buildSystemPrompt(
            systemPromptOverride || bot.systemPrompt || "",
            context,
            bot.name,
            bot.tone || "friendly",
            bot.collectLeads,
            bot.purpose,
            bot.bookingLink
        );

        // Create a conversation in DB if it doesn't exist for this session
        // For Playground, we might want to group by a playground-specific sessionId
        const sessionId = `playground-${botId}`;
        let conversation = await (prisma as any).conversation.findFirst({
            where: { botId, userId: user.id, id: sessionId }
        });

        if (!conversation) {
            // Since we force-reset the DB, we might need a real UUID or just use the botId-playground string if it fits
            // Actually, let's just create a new conversation every time for playground or use a fixed one.
            // For now, let's use a real UUID for playground sessions.
        }

        const stream = createUIMessageStream({
            execute: async ({ writer }) => {
                writer.write({
                    type: 'data-citations',
                    data: relevantChunks.map((c, i) => ({
                        id: i + 1,
                        source: (c.metadata as any)?.type === "qa" ? "Q&A (Semantic Match)" : (c.metadata as any)?.source || "Unknown",
                        content: c.content,
                        similarity: c.similarity
                    }))
                });

                const result = streamText({
                    model: resolvePlaygroundModel(model),
                    temperature: temperature ?? 0.7,
                    system: finalSystemPrompt,
                    messages: await convertToModelMessages(messages),
                    onFinish: async ({ text }: { text: string }) => {
                        // Save messages to DB
                        // Use a fixed session ID for playground chats so they group together
                        const playgroundSessionId = `playground-${user.id}`;

                        // Save user message
                        await prisma.chatMessage.create({
                            data: {
                                botId,
                                sessionId: playgroundSessionId,
                                role: "user",
                                content: query,
                            }
                        });

                        // Save assistant message
                        await prisma.chatMessage.create({
                            data: {
                                botId,
                                sessionId: playgroundSessionId,
                                role: "assistant",
                                content: text,
                            }
                        });

                        // Track if the booking link was shown
                        if (bot.bookingLink && text.includes(bot.bookingLink)) {
                            await (prisma as any).bookingEvent.create({
                                data: {
                                    botId,
                                    event: "booking_link_shown",
                                    sessionId
                                }
                            });
                        }
                    }
                });

                writer.merge(result.toUIMessageStream());
            },
        });

        return createUIMessageStreamResponse({ stream });
    } catch (error) {
        console.error("[Playground API] Error:", error);
        return new Response("Internal server error", { status: 500 });
    }
}
