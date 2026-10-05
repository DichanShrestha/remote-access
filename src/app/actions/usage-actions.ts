"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { TIER_LIMITS, TierType, getEffectiveTier, getTrialInfo } from "@/lib/tier-limits";
import { getStringSize } from "@/lib/utils";

export async function getUserUsage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        include: { subscriptions: true, usage: true },
    });

    if (!userProfile) throw new Error("Profile not found");

    const currentBots = await prisma.bot.count({ where: { userId: user.id } });
    const currentCatalogImages = await prisma.catalogImage.count({ where: { catalogItem: { userId: user.id } } });

    const tier = getEffectiveTier(userProfile);
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;

    let storageBytes = userProfile.usage?.storageUsedBytes || 0;

    // Healing logic: if storage is 0 but we have bots/data, recalculate
    if (storageBytes === 0 && currentBots > 0) {
        storageBytes = await recalculateStorageBytes(user.id);
    }

    // Compute trial info for free-tier users
    const sub = userProfile.subscriptions?.[0];
    const rawTier = (sub?.tier || "free") as string;
    const trialInfo = rawTier === "free" ? getTrialInfo(userProfile) : null;

    return {
        tier,
        limits,
        usage: {
            bots: currentBots,
            storageBytes,
            messages: userProfile.usage?.monthlyMessages || 0,
            creditWallet: sub?.creditWallet || 0,
            catalogImages: currentCatalogImages,
        },
        trial: trialInfo ? {
            daysRemaining: trialInfo.daysRemaining,
            isExpired: trialInfo.isExpired,
            endsAt: trialInfo.trialEndsAt.toISOString(),
        } : null,
    };
}

/**
 * Re-scan all data sources and Q&A pairs for a user to find the true storage size.
 * Useful for healing if incremental updates failed or for legacy data.
 */
async function recalculateStorageBytes(userId: string) {
    // Sum storageBytes from all DataSource metadata
    const dataSources = await prisma.dataSource.findMany({
        where: { userId },
        select: { id: true, metadata: true }
    });

    let totalBytes = 0;
    for (const source of dataSources) {
        const metadata = source.metadata as any;
        if (metadata?.storageBytes) {
            totalBytes += metadata.storageBytes;
        } else {
            // Fallback for legacy data: Sum character length of all chunks for this source
            const chunks = await prisma.documentChunk.findMany({
                where: { dataSourceId: (source as any).id },
                select: { content: true }
            });
            totalBytes += chunks.reduce((acc, c) => acc + getStringSize(c.content), 0);
        }
    }

    // Sum from Q&A pairs
    const qaPairs = await prisma.qAPair.findMany({
        where: { userId },
        select: { questions: true, answer: true }
    });

    for (const qa of qaPairs) {
        totalBytes += getStringSize(qa.questions.join(" ") + " " + qa.answer);
    }

    // Update Usage
    await prisma.usage.upsert({
        where: { userId },
        create: { userId, storageUsedBytes: totalBytes, monthlyMessages: 0 },
        update: { storageUsedBytes: totalBytes }
    });

    return totalBytes;
}
