import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { authService } from "@/services/auth";

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new Response("Unauthorized", { status: 401 });
        }
        await authService.ensureActive(user.id);
        if (!await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } })) {
            return new Response("Creator access required", { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const botId = searchParams.get("botId");

        if (!botId) {
            return new Response("Missing botId", { status: 400 });
        }

        // Verify bot ownership to prevent IDOR
        const bot = await prisma.bot.findFirst({
            where: { id: botId, userId: user.id },
            select: { id: true },
        });

        if (!bot) {
            return new Response("Bot not found or unauthorized", { status: 404 });
        }

        // Fetch all chat messages for this bot
        const allMessages = await prisma.chatMessage.findMany({
            where: { botId },
            orderBy: { createdAt: "asc" }
        });

        // Group into conversations by sessionId
        const conversationsMap = new Map();
        for (const msg of allMessages) {
            if (!conversationsMap.has(msg.sessionId)) {
                conversationsMap.set(msg.sessionId, { id: msg.sessionId, messages: [] });
            }
            conversationsMap.get(msg.sessionId).messages.push(msg);
        }
        const conversations = Array.from(conversationsMap.values());

        const userMessages = allMessages.filter((m: any) => m.role === "user");
        const assistantMessages = allMessages.filter((m: any) => m.role === "assistant");

        // Top 5 questions (naive approach: most common starting words/phrases)
        const questions = userMessages.map((m: any) => m.content.trim().toLowerCase());
        const topQuestions = Array.from(new Set(questions))
            .map((q: any) => ({
                question: q,
                count: questions.filter((x: any) => x === q).length
            }))
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 5);

        // Satisfaction
        const upvotes = assistantMessages.filter((m: any) => m.feedback === "up").length;
        const downvotes = assistantMessages.filter((m: any) => m.feedback === "down").length;
        const totalFeedback = upvotes + downvotes;
        const satisfaction = totalFeedback > 0 ? (upvotes / totalFeedback) * 100 : 0;

        // Fetch booking events
        const bookingEvents = await (prisma as any).bookingEvent.findMany({
            where: { botId }
        });

        const bookingStats = {
            opportunities: bookingEvents.filter((e: any) => e.event === "booking_link_shown").length,
            clicks: bookingEvents.filter((e: any) => e.event === "booking_link_clicked").length,
        };

        return Response.json({
            history: conversations,
            analytics: {
                totalConversations: conversations.length,
                totalMessages: allMessages.length,
                topQuestions,
                satisfaction: {
                    upvotes,
                    downvotes,
                    percentage: satisfaction.toFixed(1)
                },
                bookingStats
            }
        });
    } catch (error) {
        console.error("[Analytics API] Error:", error);
        return new Response("Internal server error", { status: 500 });
    }
}
