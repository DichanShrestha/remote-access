"use server";

import prisma from "@/lib/prisma";
import { authService } from "@/services/auth";

export async function getOrCreateBotForPage(pageId: string) {
    const user = await authService.requireUser();
    
    const page = await prisma.page.findFirst({
        where: { id: pageId, profile: { userId: user.id } },
        include: { bot: true }
    });
    
    if (!page) throw new Error("Page not found");
    
    if (page.bot) return page.bot;
    
    const bot = await prisma.bot.create({
        data: {
            userId: user.id,
            name: "My AI Assistant",
            colorTheme: "#000000",
            welcomeMessage: "Hello! How can I help you today?",
            systemPrompt: "You are a helpful assistant for this website. Answer questions based on the provided knowledge base.",
            collectLeads: false
        }
    });
    
    await prisma.page.update({
        where: { id: pageId },
        data: { botId: bot.id }
    });
    
    return bot;
}

export async function updateBotSettings(botId: string, data: any) {
    const user = await authService.requireUser();
    
    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot || bot.userId !== user.id) throw new Error("Unauthorized");
    
    return prisma.bot.update({
        where: { id: botId },
        data: {
            name: data.name,
            welcomeMessage: data.welcomeMessage,
            systemPrompt: data.systemPrompt,
            colorTheme: data.colorTheme,
            collectLeads: data.collectLeads,
        }
    });
}
