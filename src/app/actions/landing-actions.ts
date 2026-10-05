"use server";

import { prisma } from "@/lib/prisma";

export async function getLandingMetrics() {
    try {
        const [botsCount, messagesCount, chunksCount] = await Promise.all([
            prisma.bot.count(),
            prisma.chatMessage.count(),
            prisma.documentChunk.count(),
        ]);

        return {
            botsCount: botsCount > 0 ? botsCount : 20,
            messagesCount: messagesCount > 0 ? messagesCount : 450,
            chunksCount: chunksCount > 0 ? chunksCount : 30,
        };
    } catch (error) {
        console.error("Error fetching landing metrics:", error);
        return {
            botsCount: 20,
            messagesCount: 450,
            chunksCount: 30,
        };
    }
}
