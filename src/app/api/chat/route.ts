import { resolveChatModel, GEMINI_DEFAULT_MODEL } from "@/lib/ai/providers";
import { streamText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { retrieveRelevantChunks, formatContextForPrompt, buildSystemPrompt } from "@/lib/ai/rag";
import { getUserApiKey } from "@/app/actions/settings-actions";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/utils";
import crypto from "crypto";
import { enforceMessageGuard, enforceBotEntitlement, getCatalogSearchLimit, GuardError } from "@/lib/guards/resource-manager";
import { getSmartPageEntitlement, AI_CHARS_PER_TOKEN, AI_MAX_INPUT_TOKENS, AI_MAX_OUTPUT_TOKENS } from "@/lib/tier-limits";
import { reserveAIReply } from "@/lib/ai/reply-usage";

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
        const owner = await prisma.user.findUnique({ where: { id: user.id }, include: { subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 } } });
        if (!owner) return new Response("Workspace not found", { status: 404 });
        const entitlement = getSmartPageEntitlement(owner);
        if (!entitlement.aiEnabled) return Response.json({ error: "AI is unavailable on your current plan. Choose Smart Page + AI to restore your assistant." }, { status: 402 });

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
        let catalogVisualSetXml = "";
        try {
            const catalogSearchLimit = await getCatalogSearchLimit(botId);
            if (sanitizedQuery && catalogSearchLimit > 0) {
                const { searchVisualSets } = await import("@/app/actions/catalog-actions");
                const catalogResults = await searchVisualSets(botId, sanitizedQuery, catalogSearchLimit);
                const relevantCatalogItems = (catalogResults as any[]).filter(r => r.similarity > 0.3);

                if (relevantCatalogItems.length > 0) {
                    catalogContext = `\n\n[RECOMMENDED CATALOG ITEMS]\n` + relevantCatalogItems.map((set: any) => {
                        const parts = [`- ${set.title}`];
                        if (set.price != null) parts.push(`Price: ${set.currency || '$'}${set.price}`);
                        if (set.description) parts.push(`Description: ${set.description}`);
                        parts.push(`Images: ${(set.images || []).length} photo(s)`);
                        return parts.join(' | ');
                    }).join('\n');

                    catalogVisualSetXml = "\n" + relevantCatalogItems.map((set: any) => {
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

        // Build the final context.
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

        const charsPerToken = AI_CHARS_PER_TOKEN;
        const estimate = (value: string) => Math.ceil(value.length / charsPerToken);
        const systemTokens = estimate(systemPrompt);
        if (systemTokens >= AI_MAX_INPUT_TOKENS) return new Response("AI request is too large. Shorten the system instructions.", { status: 413 });
        let boundedMessages = formattedMessages.slice(-12);
        while (boundedMessages.length > 1 && systemTokens + estimate(JSON.stringify(boundedMessages)) > AI_MAX_INPUT_TOKENS) boundedMessages = boundedMessages.slice(1);
        if (systemTokens + estimate(JSON.stringify(boundedMessages)) > AI_MAX_INPUT_TOKENS) return new Response("Your message exceeds the 6,000 token request limit. Please shorten it and try again.", { status: 413 });
        const reservation = await reserveAIReply(user.id, botId, owner.subscriptions[0]?.id, entitlement.limits.aiReplies, entitlement.onTrial ? 'trialing' : 'active');
        if (!reservation) return Response.json({ error: "Your AI reply allowance is used up. Upgrade to Smart Page + AI or wait for the next billing period." }, { status: 429 });

        // Extremely native lead intent detection based on the user's latest query
        const buyingIntentRegex = /(pricing|cost|quote|how much|buy|purchase|upgrade|contact sales|talk to sales|demo|interested)/i;
        const hasBuyingIntent = sanitizedQuery.length > 5 && buyingIntentRegex.test(sanitizedQuery);
        const shouldFlagIntent = bot.collectLeads && hasBuyingIntent;

        // Stream response using Vercel AI SDK
        const result = streamText({
            model: resolveChatModel(!!userApiKey),
            system: systemPrompt,
            messages: boundedMessages,
            maxOutputTokens: AI_MAX_OUTPUT_TOKENS,
            maxRetries: 0,
            async onFinish({ text, usage }) {
                await reservation.finish(userApiKey ? 'openai-byok' : process.env.AI_CHAT_MODEL || GEMINI_DEFAULT_MODEL, usage?.inputTokens || 0, usage?.outputTokens || 0, text ? 'completed' : 'empty', undefined, Boolean(text));
                // Persist assistant response (including visualset XML)
                const fullText = catalogVisualSetXml ? (text || "") + catalogVisualSetXml : text;
                if (fullText) {
                    await prisma.chatMessage.create({
                        data: {
                            botId,
                            sessionId,
                            role: "assistant",
                            content: fullText,
                        },
                    });

                    // Track if the booking link was shown
                    if (bot.bookingLink && fullText.includes(bot.bookingLink)) {
                        await (prisma as any).bookingEvent.create({
                            data: {
                                botId,
                                event: "booking_link_shown",
                                sessionId,
                            },
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
            async onError({ error }: { error: unknown }) {
                await reservation.finish(userApiKey ? 'openai-byok' : process.env.AI_CHAT_MODEL || GEMINI_DEFAULT_MODEL, 0, 0, 'error', error instanceof Error ? error.message : 'Provider request failed');
            },
        });

        // Expose a custom HTTP header indicating intent for simple frontend interception if necessary
        const responseHeaders: Record<string, string> = { "X-Session-Id": sessionId };
        if (shouldFlagIntent) {
            responseHeaders["x-lead-intent"] = "true";
        }

        if (catalogVisualSetXml) {
            const xmlToAppend = catalogVisualSetXml;
            const reader = result.textStream.getReader();

            const outputStream = new ReadableStream<string>({
                async pull(controller) {
                    try {
                        const { done, value } = await reader.read();
                        if (done) {
                            controller.enqueue(xmlToAppend);
                            controller.close();
                            return;
                        }
                        controller.enqueue(value);
                    } catch (err) {
                        controller.error(err);
                    }
                },
                cancel(reason) {
                    return reader.cancel(reason);
                },
            });

            return new Response(outputStream.pipeThrough(new TextEncoderStream()), {
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    ...responseHeaders,
                },
            });
        }

        return result.toTextStreamResponse({
            headers: responseHeaders
        });
    } catch (error) {
        console.error("[Chat API] Error:", error);
        return new Response("Internal server error", { status: 500 });
    }
}
