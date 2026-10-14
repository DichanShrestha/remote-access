import prisma from "@/lib/prisma";
import { TIER_LIMITS, TierType, getEffectiveTier } from "@/lib/tier-limits";

export class GuardError extends Error {
    public type: "bot_limit" | "storage_limit" | "message_limit" | "catalog_limit" | "bot_disabled" | "unauthorized";
    constructor(
        message: string,
        type: "bot_limit" | "storage_limit" | "message_limit" | "catalog_limit" | "bot_disabled" | "unauthorized"
    ) {
        super(message);
        this.name = "GuardError";
        this.type = type;
    }
}

/**
 * Validates if the user can create another bot.
 */
export async function enforceBotGuard(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscriptions: true },
    });

    if (!user) throw new GuardError("User not found", "unauthorized");

    const tier = getEffectiveTier(user);
    const limit = TIER_LIMITS[tier]?.bots || TIER_LIMITS.free.bots;

    const currentBots = await prisma.bot.count({ where: { userId } });

    if (currentBots >= limit) {
        throw new GuardError("Bot limit reached for current tier.", "bot_limit");
    }
}

/**
 * Validates if the user can upload more data to a bot.
 * Should be called BEFORE uploading. 
 * If successful, you must separately update the storageUsedBytes in Usage.
 */
export async function enforceStorageGuard(userId: string, incomingBytes: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscriptions: true, usage: true },
    });

    if (!user) throw new GuardError("User not found", "unauthorized");

    // If usage missing, we assume 0 for now (should be fixed by seed script)
    const currentUsageBytes = user.usage?.storageUsedBytes || 0;

    const tier = getEffectiveTier(user);
    const limit = TIER_LIMITS[tier]?.characterLimit || TIER_LIMITS.free.characterLimit;

    if (currentUsageBytes + incomingBytes > limit) {
        throw new GuardError("Character limit reached for current tier.", "storage_limit");
    }
}

/**
 * Update the storageUsedBytes in Usage after a successful upload.
 */
export async function updateStorageUsage(userId: string, incomingBytes: number) {
    const usage = await prisma.usage.findUnique({ where: { userId } });

    if (usage) {
        await prisma.usage.update({
            where: { userId },
            data: { storageUsedBytes: { increment: incomingBytes } },
        });
    } else {
        // Failsafe creation
        await prisma.usage.create({
            data: { userId, storageUsedBytes: incomingBytes, monthlyMessages: 0 },
        });
    }
}

/**
 * Validates if a user can send a message.
 * Deducts quota or credit_wallet if allowed. 
 * Blocks if both are zero.
 */
export async function enforceMessageGuard(botId: string) {
    const bot = await prisma.bot.findUnique({
        where: { id: botId },
        select: { userId: true },
    });

    if (!bot) throw new GuardError("Bot not found", "unauthorized");

    const userId = bot.userId;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscriptions: true, usage: true },
    });

    if (!user) throw new GuardError("User not found", "unauthorized");

    const tier = getEffectiveTier(user);
    const monthlyLimit = TIER_LIMITS[tier]?.messages || TIER_LIMITS.free.messages;

    let monthlyMessages = user.usage?.monthlyMessages || 0;
    
    // In Pageory, there can be multiple subscriptions. We take the active one or the first one.
    // For simplicity, we just take the first one or default to 0.
    const sub = user.subscriptions?.[0];
    let creditWallet = sub?.creditWallet || 0;

    const now = new Date();
    const resetDate = sub?.monthlyResetDate;

    // Dynamic Monthly Reset Check (Just-in-time reset)
    if (resetDate && now >= resetDate) {
        monthlyMessages = 0; // Reset local counter

        // Advance the reset date by exactly 1 month increments until it's in the future
        const nextResetDate = new Date(resetDate);
        while (nextResetDate <= now) {
            nextResetDate.setMonth(nextResetDate.getMonth() + 1);
        }

        // Apply reset to the database atomically
        if (sub) {
            await prisma.$transaction([
                prisma.usage.upsert({
                    where: { userId },
                    create: { userId, monthlyMessages: 0, storageUsedBytes: 0 },
                    update: { monthlyMessages: 0 },
                }),
                prisma.subscription.update({
                    where: { id: sub.id },
                    data: { monthlyResetDate: nextResetDate },
                }),
            ]);
        }

        // Ensure the deduction logic below knows the usage definitely exists now
        if (!user.usage) {
            user.usage = { monthlyMessages: 0, storageUsedBytes: 0 } as any;
        }
    }

    // Monthly deduction logic
    if (monthlyMessages < monthlyLimit) {
        // Deduct from monthly quota (we increment monthlyMessages used)
        if (user.usage) {
            await prisma.usage.update({
                where: { userId },
                data: { monthlyMessages: { increment: 1 } },
            });
        } else {
            await prisma.usage.create({
                data: { userId, monthlyMessages: 1, storageUsedBytes: 0 },
            });
        }
    } else if (creditWallet > 0) {
        // Deduct from credit wallet
        if (sub) {
            await prisma.subscription.update({
                where: { id: sub.id },
                data: { creditWallet: { decrement: 1 } },
            });
        }
    } else {
        throw new GuardError("Top-up Required: Message limit reached.", "message_limit");
    }
}

/**
 * Validates if the user can add another catalog image.
 * Checks the user's total catalog item count against their tier limit.
 */
export async function enforceCatalogGuard(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscriptions: true },
    });

    if (!user) throw new GuardError("User not found", "unauthorized");

    const tier = getEffectiveTier(user);
    const limit = TIER_LIMITS[tier]?.catalogImages ?? TIER_LIMITS.free.catalogImages;

    if (limit === 0) {
        throw new GuardError(
            "Catalog is not available on the Free plan. Upgrade to Starter or above to upload product images.",
            "catalog_limit"
        );
    }

    const currentCount = await prisma.catalogImage.count({ where: { catalogItem: { userId } } });

    if (currentCount >= limit) {
        throw new GuardError(
            `You've reached the catalog limit of ${limit} images for the ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan. Upgrade to add more.`,
            "catalog_limit"
        );
    }

    return { currentCount, limit };
}

/**
 * Execution guard: Validates if a specific bot is entitled to respond.
 * On the Free tier, only the user's oldest bot (by createdAt) is allowed.
 * All other bots are soft-locked — data persists but the bot cannot serve responses.
 */
export async function enforceBotEntitlement(botId: string) {
    const bot = await prisma.bot.findUnique({
        where: { id: botId },
        select: { userId: true, createdAt: true },
    });

    if (!bot) throw new GuardError("Bot not found", "unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: bot.userId },
        include: { subscriptions: true },
    });

    if (!user) throw new GuardError("User not found", "unauthorized");

    const tier = getEffectiveTier(user);
    const allowedBots = TIER_LIMITS[tier]?.bots || TIER_LIMITS.free.bots;

    // Count user's total bots
    const totalBots = await prisma.bot.count({ where: { userId: bot.userId } });

    // If within limit, all bots are entitled
    if (totalBots <= allowedBots) return;

    // User has excess bots — only the N oldest bots (by createdAt) are entitled
    const entitledBots = await prisma.bot.findMany({
        where: { userId: bot.userId },
        orderBy: { createdAt: "asc" },
        take: allowedBots,
        select: { id: true },
    });

    const isEntitled = entitledBots.some(b => b.id === botId);

    if (!isEntitled) {
        throw new GuardError(
            `This bot is disabled on the ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan. Only your ${allowedBots} oldest bot(s) can respond. Upgrade your plan to re-enable this bot.`,
            "bot_disabled"
        );
    }
}

/**
 * Execution guard: Returns the maximum number of catalog search results
 * allowed for a bot owner's tier. Returns 0 if catalog is not available.
 */
export async function getCatalogSearchLimit(botId: string): Promise<number> {
    const bot = await prisma.bot.findUnique({
        where: { id: botId },
        select: { userId: true },
    });

    if (!bot) return 0;

    const user = await prisma.user.findUnique({
        where: { id: bot.userId },
        include: { subscriptions: true },
    });

    if (!user) return 0;

    const tier = getEffectiveTier(user);
    return TIER_LIMITS[tier]?.catalogSearchResults ?? 0;
}
