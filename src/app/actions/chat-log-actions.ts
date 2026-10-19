"use server";

import { authService } from "@/services/auth";
import { prisma } from "@/lib/prisma";
import type { ConversationSummary, ConversationMessage } from "@/types/conversations";


/**
 * Get all conversations (grouped by sessionId) for a bot.
 * Returns summary info for the sidebar list.
 */
export async function getBotConversations(botId: string): Promise<ConversationSummary[]> {

    const user = await authService.requireCreator();



    // Verify bot ownership
    const bot = await prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
        select: { id: true },
    });

    if (!bot) throw new Error("Bot not found");

    // Get all messages for this bot, ordered by creation time
    const messages = await prisma.chatMessage.findMany({
        where: { botId },
        orderBy: { createdAt: "desc" },
        select: {
            sessionId: true,
            role: true,
            content: true,
            createdAt: true,
        },
    });

    // Group by sessionId
    const sessionMap = new Map<string, typeof messages>();
    for (const msg of messages) {
        const existing = sessionMap.get(msg.sessionId) || [];
        existing.push(msg);
        sessionMap.set(msg.sessionId, existing);
    }

    // Build summaries
    const summaries: ConversationSummary[] = [];
    for (const [sessionId, sessionMessages] of sessionMap) {
        // Messages are already desc, reverse for chronological order
        const sorted = [...sessionMessages].sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );

        const userMessages = sorted.filter((m) => m.role === "user");
        const firstUserMsg = userMessages[0]?.content || "No messages";
        const lastMsg = sorted[sorted.length - 1]?.content || "";

        summaries.push({
            sessionId,
            firstMessage: firstUserMsg.slice(0, 120),
            lastMessage: lastMsg.slice(0, 120),
            messageCount: sorted.length,
            createdAt: sorted[0].createdAt,
            updatedAt: sorted[sorted.length - 1].createdAt,
        });
    }

    // Sort by most recently updated
    summaries.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return summaries;
}

/**
 * Get all messages for a specific conversation session.
 */
export async function getConversationMessages(
    botId: string,
    sessionId: string
): Promise<ConversationMessage[]> {

    const user = await authService.requireCreator();



    // Verify bot ownership
    const bot = await prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
        select: { id: true },
    });

    if (!bot) throw new Error("Bot not found");

    const messages = await prisma.chatMessage.findMany({
        where: { botId, sessionId },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
        },
    });

    return messages;
}

/**
 * Delete a conversation (all messages for a session).
 */
export async function deleteConversation(
    botId: string,
    sessionId: string
): Promise<{ success: boolean }> {

    const user = await authService.requireCreator();



    // Verify bot ownership
    const bot = await prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
        select: { id: true },
    });

    if (!bot) throw new Error("Bot not found");

    await prisma.chatMessage.deleteMany({
        where: { botId, sessionId },
    });

    return { success: true };
}
