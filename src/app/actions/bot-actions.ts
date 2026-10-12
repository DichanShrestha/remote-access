"use server";

import { authService } from "@/services/auth";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { sanitizeInput, getStringSize } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import type { BotFormData } from "@/lib/supabase/types";
import { enforceBotGuard, updateStorageUsage } from "@/lib/guards/resource-manager";
import { requirePageAccess, requireAIEntitlement } from "@/lib/billing/entitlements";
import { LeadCaptureSettings, DEFAULT_LEAD_CAPTURE_SETTINGS } from "@/types/lead-capture";

/**
 * Create a new bot during onboarding.
 */
export async function createBot(data: BotFormData) {
    
    const user = await authService.requireUser();
    await requirePageAccess(user.id);

    

    // Enforce bot limit
    await enforceBotGuard(user.id);

    // Build system prompt based on purpose and tone
    const systemPrompt = await buildDefaultSystemPrompt(
        sanitizeInput(data.name),
        sanitizeInput(data.description),
        data.purpose,
        data.tone
    );

    const bot = await prisma.bot.create({
        data: {
            userId: user.id,
            name: sanitizeInput(data.name),
            description: sanitizeInput(data.description),
            purpose: data.purpose,
            avatarEmoji: data.avatarEmoji,
            avatarUrl: data.faviconUrl || null,
            colorTheme: data.colorTheme,
            welcomeMessage: sanitizeInput(data.welcomeMessage),
            welcomeMessages: data.welcomeMessages ? data.welcomeMessages.map(sanitizeInput) : [],
            tone: data.tone,
            systemPrompt,
            status: "draft",
        },
    });

    return { botId: bot.id };
}

/**
 * Update a bot's configuration.
 */
export async function updateBot(botId: string, data: Partial<BotFormData>) {
    
    const user = await authService.requireUser();
    await requirePageAccess(user.id);

    

    // Verify ownership
    const existingBot = await prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
    });

    if (!existingBot) throw new Error("Bot not found");

    const updateData: Record<string, unknown> = {};

    if (data.name) updateData.name = sanitizeInput(data.name);
    if (data.description !== undefined)
        updateData.description = sanitizeInput(data.description);
    if (data.purpose) updateData.purpose = data.purpose;
    if (data.avatarEmoji) updateData.avatarEmoji = data.avatarEmoji;
    if (data.faviconUrl !== undefined) updateData.avatarUrl = data.faviconUrl;
    if (data.colorTheme) updateData.colorTheme = data.colorTheme;
    if (data.welcomeMessage)
        updateData.welcomeMessage = sanitizeInput(data.welcomeMessage);
    if (data.welcomeMessages !== undefined)
        updateData.welcomeMessages = data.welcomeMessages ? data.welcomeMessages.map(sanitizeInput) : [];
    if (data.removeWatermark !== undefined)
        updateData.removeWatermark = data.removeWatermark;
    if (data.collectLeads !== undefined)
        updateData.collectLeads = data.collectLeads;
    if (data.leadGenConfig !== undefined) {
        // We cast to any because Prisma's Json input type might be slightly different 
        // than our LeadGenConfig type, but it's a valid JSON object.
        updateData.leadGenConfig = data.leadGenConfig ? (data.leadGenConfig as any) : null;
    }
    if (data.leadCaptureConfig !== undefined) {
        updateData.leadCaptureConfig = data.leadCaptureConfig ? (data.leadCaptureConfig as any) : null;
    }
    if (data.bookingLink !== undefined) {
        if (data.bookingLink) {
            try {
                const url = new URL(data.bookingLink);
                if (url.protocol !== "http:" && url.protocol !== "https:") {
                    throw new Error("Booking URL must start with http:// or https://");
                }
                updateData.bookingLink = url.toString();
            } catch (error: any) {
                if (error.message.includes("Booking URL must start")) throw error;
                throw new Error("Invalid booking URL");
            }
        } else {
            updateData.bookingLink = null;
        }
    }

    if (data.tone) {
        updateData.tone = data.tone;
        // Only auto-generate if no explicit systemPrompt was provided
        if (data.systemPrompt === undefined) {
            updateData.systemPrompt = await buildDefaultSystemPrompt(
                data.name || existingBot.name,
                data.description || existingBot.description || "",
                data.purpose || existingBot.purpose,
                data.tone
            );
        }
    }

    if (data.systemPrompt !== undefined) {
        updateData.systemPrompt = data.systemPrompt;
    }

    if (data.temperature !== undefined) updateData.temperature = data.temperature;
    if (data.rateLimitMessages !== undefined) updateData.rateLimitMessages = data.rateLimitMessages;
    if (data.rateLimitWindow !== undefined) updateData.rateLimitWindow = data.rateLimitWindow;
    if (data.rateLimitMessage !== undefined) updateData.rateLimitMessage = sanitizeInput(data.rateLimitMessage);

    const bot = await prisma.bot.update({
        where: { id: botId },
        data: updateData,
    });

    revalidatePath("/dashboard");
    return { botId: bot.id };
}

/**
 * Delete a bot and all its related data.
 */
export async function deleteBot(botId: string) {
    
    const user = await authService.requireUser();

    

    // Verify ownership and get sources for cleanup
    const bot = await prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
        include: { dataSources: true, qaPairs: true }
    });

    if (!bot) throw new Error("Bot not found");

    // Calculate how much storage this bot was using to free it up
    let totalBotStorage = 0;
    for (const source of bot.dataSources) {
        const metadata = source.metadata as any;
        if (metadata?.storageBytes) {
            totalBotStorage += metadata.storageBytes;
        } else {
            // Fallback for legacy data
            const chunks = await prisma.documentChunk.findMany({
                where: { dataSourceId: source.id },
                select: { content: true }
            });
            totalBotStorage += chunks.reduce((acc, c) => acc + getStringSize(c.content), 0);
        }
    }

    for (const qa of bot.qaPairs) {
        totalBotStorage += getStringSize(qa.questions.join(" ") + " " + qa.answer);
    }

    // Update global usage metric
    if (totalBotStorage > 0) {
        await updateStorageUsage(user.id, -totalBotStorage);
    }

    // Cascade delete handles related records in DB
    await prisma.bot.delete({ where: { id: botId } });

    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * Get all bots for the current user.
 */
export async function getUserBots() {
    
    const user = await authService.requireUser();

    

    return prisma.bot.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        include: {
            _count: {
                select: { dataSources: true },
            },
        },
    });
}

/**
 * Get a single bot by ID (with ownership check).
 */
export async function getBot(botId: string) {
    if (!botId || botId === "undefined") return null;

    
    const user = await authService.requireUser();

    

    return prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
        include: {
            dataSources: { orderBy: { createdAt: "desc" } },
            qaPairs: { orderBy: { createdAt: "desc" } },
            _count: { select: { chunks: true } },
            user: {
                include: {
                    usage: true,
                    subscriptions: true
                }
            }
        },
    });
}

/**
 * Mark the current user's onboarding as complete.
 */
export async function completeOnboarding() {
    
    const user = await authService.requireUser();

    

    await prisma.user.update({
        where: { id: user.id },
        data: {}, // Removing onboardingComplete as it's not in Smart Page User
    });

    revalidatePath("/dashboard");
}

// ─── Dedicated System Prompt Update ─────────────────────────

/**
 * Update only the system prompt for a bot.
 * Used from the Playground Instructions panel.
 */
export async function updateBotSystemPrompt(botId: string, systemPrompt: string) {
    
    const user = await authService.requireUser();
    await requireAIEntitlement(user.id);

    

    const existingBot = await prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
    });

    if (!existingBot) throw new Error("Bot not found");

    await prisma.bot.update({
        where: { id: botId },
        data: { systemPrompt },
    });

    revalidatePath("/dashboard");
    return { success: true };
}

// ─── Helpers ────────────────────────────────────────────────
export async function buildDefaultSystemPrompt(
    name: string,
    description: string,
    purpose: string,
    tone: string
): Promise<string> {
    const roleIdentities: Record<string, string> = {
        customer_support:
            `You are **${name}**, a professional and empathetic customer support assistant. Help users resolve their issues efficiently and build trust.`,
        product_faq:
            `You are **${name}**, a clear and accurate product FAQ assistant. Help users understand the product and build trust.`,
        booking_assistant:
            `You are **${name}**, a highly organized booking assistant. Help users schedule appointments smoothly and build trust.`,
        bilingual:
            `You are **${name}**, a professional bilingual assistant (Nepali and English). Respond in the user's language carefully to build trust.`,
        lead_generation:
            `You are **${name}**, a persuasive and helpful sales associate. Use a helpful, consultative tone to engage visitors and build trust.`,
        general:
            `You are **${name}**, a helpful assistant. Use a consultative tone to assist users and build trust.`,
    };

    const identity = roleIdentities[purpose] || roleIdentities.general;
    const businessContext = description?.trim()
        ? `\n\n### About This Business\n${description.trim()}`
        : "";

    return `### Role & Identity
${identity}
${businessContext}

### Communication Style
- Don't lead with "I'm an AI" or add disclaimers unprompted — focus on being naturally helpful.
- If a user sincerely and directly asks whether they're talking to a human or an AI, answer honestly.`;
}

/**
 * Get lead capture trigger configuration
 */
export async function getLeadCaptureConfig(botId: string): Promise<LeadCaptureSettings> {
    const user = await authService.requireUser();

    const bot = await prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
        select: { leadCaptureConfig: true, collectLeads: true },
    });

    if (!bot) throw new Error("Bot not found");

    const saved = bot.leadCaptureConfig as Partial<LeadCaptureSettings> | null;
    return {
        ...DEFAULT_LEAD_CAPTURE_SETTINGS,
        enabled: bot.collectLeads ?? false,
        ...(saved || {}),
    };
}

/**
 * Update lead capture trigger configuration
 */
export async function updateLeadCaptureConfig(botId: string, config: Partial<LeadCaptureSettings>) {
    const user = await authService.requireUser();

    const existingBot = await prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
    });

    if (!existingBot) throw new Error("Bot not found");

    const isEnabled = Boolean(config.enabled);

    await prisma.bot.update({
        where: { id: botId },
        data: {
            collectLeads: isEnabled,
            leadCaptureConfig: config ? (config as any) : null,
        },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/leads/capture");
    return { success: true };
}

