import { resolveChatModel } from "@/lib/ai/providers";
import { streamText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { retrieveRelevantChunks, formatContextForPrompt, buildSystemPrompt } from "@/lib/ai/rag";
import { getUserApiKey } from "@/app/actions/settings-actions";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/utils";
import crypto from "crypto";
import { enforceMessageGuard, enforceBotEntitlement, getCatalogSearchLimit, GuardError } from "@/lib/guards/resource-manager";

/**
 * Authenticated chat API route.
 * Uses Vercel AI SDK for streaming + RAG retrieval.
 * Persists all messages for chat log tracking.
 */
export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") ?? "anonymous";

        // 1. Global IP Rate Limit
        const globalLimit = rateLimit(`chat-global:${ip}`, RATE_LIMITS.chat);
        if (!globalLimit.success) {
            return new Response("Too many requests. Please try again later.", { status: 429 });
        }

        const body = await req.json();
        const { messages, botId, sessionId: clientSessionId } = body;

        if (!botId || !messages || !Array.isArray(messages)) {
            return new Response("Missing botId or messages", { status: 400 });
        }

        // Auth check
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Use client-provided session ID or generate one
        const sessionId = clientSessionId || crypto.randomUUID();

        // Get bot config
        const bot = await prisma.bot.findFirst({
            where: { id: botId, userId: user.id },
        });

        if (!bot) {
            return new Response("Bot not found", { status: 404 });
        }

        // 2. Per-Bot Custom Rate Limit
        const botLimit = rateLimit(`bot-chat:${botId}:${ip}`, {
            limit: bot.rateLimitMessages,
            windowSeconds: bot.rateLimitWindow,
        });

        if (!botLimit.success) {
            return new Response(JSON.stringify({ error: bot.rateLimitMessage || "Rate limit exceeded" }), {
                status: 429,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 3. Message Guard check (Quota)
        try {
            await enforceMessageGuard(botId);
        } catch (error: any) {
            if (error instanceof GuardError) {
                const limitMessage = '0:"This workspace has reached its conversation limit. If you are the admin, please visit your dashboard to increase your capacity."\n';
                return new Response(limitMessage, {
                    status: 200,
                    headers: {
                        "Content-Type": "text/plain; charset=utf-8",
                        "x-vercel-ai-data-stream": "v1"
                    }
                });
            }
            throw error;
        }

        // 4. Bot Entitlement Guard (Soft-Lock excess bots on downgraded plans)
        try {
            await enforceBotEntitlement(botId);
        } catch (error: any) {
            if (error instanceof GuardError && error.type === "bot_disabled") {
                const disabledMessage = `0:"${error.message}"\n`;
                return new Response(disabledMessage, {
                    status: 200,
                    headers: {
                        "Content-Type": "text/plain; charset=utf-8",
                        "x-vercel-ai-data-stream": "v1"
                    }
                });
            }
            throw error;
        }

        // Map messages to ensure string content (handles new AI SDK parts array)
        const formattedMessages = messages.map((m: any) => {
            let content = m.content || "";
            if (!content && m.parts && Array.isArray(m.parts)) {
                content = m.parts.filter((p: any) => p.type === "text").map((p: any) => p.text).join("\n");
            }
            return {
                role: m.role,
                content,
            };
        });

        // Get user's last message for RAG
        const lastUserMessage = formattedMessages
            .filter((m: any) => m.role === "user")
            .pop();

        let sanitizedQuery = sanitizeInput(lastUserMessage?.content ?? "");

        // SMART RETRIEVAL: Normalize query to remove the Bot's name if mentioned.
        // Direct mentions of the name (e.g. "Where do I download NoWow?") often confuse vector search 
        // because the name itself becomes the strongest signal rather than the intent.
        if (sanitizedQuery && bot.name) {
            const nameRegex = new RegExp(`\\b${bot.name}\\b`, 'gi');
            sanitizedQuery = sanitizedQuery.replace(nameRegex, "").trim();
            // If the query was JUST the name, we might want to put it back or handle differently,
            // but for now, this helps isolate the intent.
            if (sanitizedQuery === "" || sanitizedQuery === "?") {
                sanitizedQuery = lastUserMessage?.content ?? "";
            }
        }

        // Persist the latest user message
        if (lastUserMessage?.content) {
            await prisma.chatMessage.create({
                data: {
                    botId,
                    sessionId,
                    role: "user",
                    content: lastUserMessage.content,
                },
            });
        }

        // Get user's BYOK key (if any)
        const userApiKey = await getUserApiKey(user.id);

        // Unified RAG retrieval (includes Q&A pairs via vector search)
        const relevantChunks = sanitizedQuery
            ? await retrieveRelevantChunks(
                sanitizedQuery,
                botId,
                { apiKey: userApiKey ?? undefined }
            )
            : [];

        console.log("Relavent chunks: ", relevantChunks)

        // 5. Catalog Search Guard — gate based on tier entitlement
        let catalogContext = "";
        try {
            const catalogSearchLimit = await getCatalogSearchLimit(botId);
            if (sanitizedQuery && catalogSearchLimit > 0) {
                const { searchVisualSets } = await import("@/app/actions/catalog-actions");
                const catalogResults = await searchVisualSets(botId, sanitizedQuery, catalogSearchLimit);
                const relevantCatalogItems = (catalogResults as any[]).filter(r => r.similarity > 0.3);

                console.log("relevant visual sets: ", relevantCatalogItems)
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
            console.error("[Catalog Search Error]:", e);
        }

        // Build the final context. If visual sets are found, prioritize them and omit generic chunks to avoid dilution.
        const context = formatContextForPrompt(relevantChunks) + catalogContext;
        const systemPrompt = buildSystemPrompt(
            bot.systemPrompt,
            context,
            bot.name,
            bot.tone,
            bot.collectLeads,
            bot.purpose,
            bot.bookingLink
        );

        // Extremely native lead intent detection based on the user's latest query
        const buyingIntentRegex = /(pricing|cost|quote|how much|buy|purchase|upgrade|contact sales|talk to sales|demo|interested)/i;
        const hasBuyingIntent = sanitizedQuery.length > 5 && buyingIntentRegex.test(sanitizedQuery);
        const shouldFlagIntent = bot.collectLeads && hasBuyingIntent;

        // Stream response using Vercel AI SDK
        const result = streamText({
            model: resolveChatModel(!!userApiKey),
            system: systemPrompt,
            messages: formattedMessages,
            async onFinish({ text }) {
                // Persist assistant response
                if (text) {
                    await prisma.chatMessage.create({
                        data: {
                            botId,
                            sessionId,
                            role: "assistant",
                            content: text,
                        },
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

                // [Silent Lead Extraction] 
                // Scan the last user message for an email anywhere in the text
                if (lastUserMessage?.content) {
                    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
                    const match = lastUserMessage.content.match(emailRegex);
                    if (match) {
                        const email = match[0].toLowerCase();
                        try {
                            // Because 'botId' and 'email' might not have a compound unique index, we use findFirst
                            const existingLead = await prisma.botLead.findFirst({
                                where: { botId, email }
                            });
                            if (!existingLead) {
                                await prisma.botLead.create({
                                    data: {
                                        botId,
                                        email,
                                        metadata: { source: "chat_extraction" },
                                        conversationSnippet: text.substring(0, 500)
                                    }
                                });
                            }
                        } catch (e) {
                            console.error("Silent Lead Extraction Failed:", e);
                        }
                    }
                }
            },
        });

        // Expose a custom HTTP header indicating intent for simple frontend interception if necessary
        const responseHeaders: Record<string, string> = { "X-Session-Id": sessionId };
        if (shouldFlagIntent) {
            responseHeaders["x-lead-intent"] = "true";
        }

        return result.toTextStreamResponse({
            headers: responseHeaders
        });
    } catch (error) {
        console.error("[Chat API] Error:", error);
        return new Response("Internal server error", { status: 500 });
    }
}
