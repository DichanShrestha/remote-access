import { getDefaultChatModel } from "@/lib/ai/providers";
import { streamText, convertToModelMessages } from "ai";
import { prisma } from "@/lib/prisma";
import { retrieveRelevantChunks, formatContextForPrompt, buildSystemPrompt } from "@/lib/ai/rag";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/utils";
import crypto from "crypto";
import { enforceMessageGuard, enforceBotEntitlement, getCatalogSearchLimit, GuardError } from "@/lib/guards/resource-manager";

/**
 * Public chat API route (for embeddable widget).
 * No auth required — rate limited more aggressively.
 * CORS enabled for cross-origin widget embedding.
 * Persists all messages for chat log tracking.
 */
export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") ?? "anonymous";

        // 1. Global IP Rate Limit (Broad protection)
        const globalLimit = rateLimit(`public-global:${ip}`, RATE_LIMITS.publicChat);
        if (!globalLimit.success) {
            return new Response("Too many requests. Please try again later.", {
                status: 429,
                headers: corsHeaders(),
            });
        }

        const body = await req.json();
        const { messages, botId, sessionId: clientSessionId } = body;
        const visitorId = body.visitorId?.trim() || null;

        if (!botId || !messages || !Array.isArray(messages)) {
            return new Response("Missing botId or messages", {
                status: 400,
                headers: corsHeaders(),
            });
        }

        // Use client-provided session ID or generate one
        const sessionId = clientSessionId || crypto.randomUUID();

        // Get bot config (public — no user check)
        const bot = await prisma.bot.findFirst({
            where: { id: botId, status: "active" },
        });

        if (!bot) {
            return new Response("Bot not found or not active", {
                status: 404,
                headers: corsHeaders(),
            });
        }

        // 2. Per-Bot Custom Rate Limit
        const botLimit = rateLimit(`bot-public:${botId}:${ip}`, {
            limit: bot.rateLimitMessages,
            windowSeconds: bot.rateLimitWindow,
        });

        if (!botLimit.success) {
            return new Response(JSON.stringify({ error: bot.rateLimitMessage || "Rate limit exceeded" }), {
                status: 429,
                headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders(),
                },
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
                        "x-vercel-ai-data-stream": "v1",
                        ...corsHeaders()
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
                        "x-vercel-ai-data-stream": "v1",
                        ...corsHeaders()
                    }
                });
            }
            throw error;
        }

        // Sanitize user message for RAG
        const lastUserMessage = messages
            .filter((m: any) => m.role === "user")
            .pop();

        // Extra robust content extraction (handles parts or raw content)
        const rawQuery = lastUserMessage?.parts
            ?.filter((p: any) => p.type === "text")
            .map((p: any) => p.text)
            .join("") || lastUserMessage?.content || "";

        const sanitizedQuery = sanitizeInput(rawQuery);

        // Persist the latest user message
        if (rawQuery) {
            await prisma.chatMessage.create({
                data: {
                    botId,
                    sessionId,
                    visitorId: visitorId || null,
                    role: "user",
                    content: rawQuery,
                },
            });
        }

        // Unified RAG retrieval (includes Q&A pairs via vector search)
        const relevantChunks = sanitizedQuery
            ? await retrieveRelevantChunks(
                sanitizedQuery,
                botId
            )
            : [];

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

        // Convert UI messages to Model messages (Crucial for AI SDK streamText)
        const modelMessages = await convertToModelMessages(messages);

        // Stream response
        const result = streamText({
            model: getDefaultChatModel(),
            system: systemPrompt,
            messages: modelMessages,
            temperature: bot.temperature ?? 0.7,
            async onFinish({ text }) {
                // Persist assistant response
                if (text) {
                    await prisma.chatMessage.create({
                        data: {
                            botId,
                            sessionId,
                            visitorId: visitorId || null,
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
            },
        });

        return result.toTextStreamResponse({
            headers: {
                ...corsHeaders(),
                "X-Session-Id": sessionId,
            },
        });
    } catch (error: any) {
        console.error("[Public Chat API] Error:", error);
        return new Response(error.message, {
            status: 500,
            headers: corsHeaders(),
        });
    }
}

/**
 * Handle CORS preflight requests.
 */
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders(),
    });
}

function corsHeaders(): HeadersInit {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
    };
}

