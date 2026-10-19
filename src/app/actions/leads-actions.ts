"use server";

import { authService } from "@/services/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

/**
 * Save a new lead from the chat widget.
 * Now supports visitorId for anonymous identification and
 * accepts a full context_snippet from the last 3 messages.
 */
export async function createLead(data: {
    botId: string;
    visitorId?: string;
    name?: string;
    email?: string;
    phone?: string;
    conversationSnippet?: string;
    metadata?: any;
}) {
    const lead = await prisma.botLead.create({
        data: {
            botId: data.botId,
            visitorId: data.visitorId || null,
            name: data.name,
            email: data.email,
            phone: data.phone,
            conversationSnippet: data.conversationSnippet || null,
            metadata: data.metadata || {},
        },
    });

    return { leadId: lead.id };
}

/**
 * Get all leads for a specific bot.
 */
export async function getBotLeads(botId: string) {
    
    const user = await authService.requireCreator();

    

    // Verify ownership via bot
    const bot = await prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
    });

    if (!bot) throw new Error("Bot not found");

    return prisma.botLead.findMany({
        where: { botId },
        orderBy: { createdAt: "desc" },
    });
}

/**
 * Delete a lead.
 */
export async function deleteLead(leadId: string) {
    
    const user = await authService.requireCreator();

    

    // Verify ownership (simplified: check if bot belongs to user)
    const lead = await prisma.botLead.findUnique({
        where: { id: leadId },
        include: { bot: true },
    });

    if (!lead || lead.bot.userId !== user.id) {
        throw new Error("Lead not found or unauthorized");
    }

    await prisma.botLead.delete({
        where: { id: leadId },
    });

    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * Export all leads for a bot as a CSV string.
 * Returns a CSV string that the client can download.
 */
export async function exportLeadsToCSV(botId: string): Promise<string> {
    
    const user = await authService.requireCreator();

    

    const bot = await prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
    });

    if (!bot) throw new Error("Bot not found");

    const leads = await prisma.botLead.findMany({
        where: { botId },
        orderBy: { createdAt: "desc" },
    });

    const escapeCSV = (val: string) => `"${(val || "").replace(/"/g, '""')}"`;

    const headers = ["Name", "Email", "Phone", "Visitor ID", "Date", "Conversation Snippet", "Metadata"];
    const rows = leads.map((lead) => [
        escapeCSV(lead.name || ""),
        escapeCSV(lead.email || ""),
        escapeCSV(lead.phone || ""),
        escapeCSV(lead.visitorId || ""),
        escapeCSV(format(new Date(lead.createdAt), "yyyy-MM-dd HH:mm:ss")),
        escapeCSV(lead.conversationSnippet || ""),
        escapeCSV(JSON.stringify(lead.metadata || {})),
    ]);

    const csv = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
    ].join("\n");

    return csv;
}
