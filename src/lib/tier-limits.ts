export const TIER_LIMITS = {
    free: { bots: 1, characterLimit: 400000, messages: 300, catalogImages: 5, catalogSearchResults: 2 },
    starter: { bots: 3, characterLimit: 2000000, messages: 1000, catalogImages: 20, catalogSearchResults: 3 },
    pro: { bots: 5, characterLimit: 5000000, messages: 4000, catalogImages: 100, catalogSearchResults: 5 },
    business: { bots: 10, characterLimit: 11000000, messages: 10000, catalogImages: 500, catalogSearchResults: 10 },
    expired: { bots: 0, characterLimit: 0, messages: 0, catalogImages: 0, catalogSearchResults: 0 },
};

export type TierType = keyof typeof TIER_LIMITS;

export function getEffectiveTier(user: { createdAt: Date, subscriptions?: { tier: string }[] | null }): TierType {
    const sub = user.subscriptions?.[0];
    const rawTier = (sub?.tier || "free") as string;
    
    // Only check expiration for the free plan (trial)
    if (rawTier === "free") {
        const trialDurationMs = 14 * 24 * 60 * 60 * 1000;
        const trialEndsAt = new Date(user.createdAt.getTime() + trialDurationMs);
        
        if (new Date() > trialEndsAt) {
            return "expired";
        }
    }
    
    // Safety fallback
    if (!(rawTier in TIER_LIMITS)) {
        return "free";
    }
    
    return rawTier as TierType;
}

export function getTrialInfo(user: { createdAt: Date }) {
    const trialDurationMs = 14 * 24 * 60 * 60 * 1000;
    const trialEndsAt = new Date(user.createdAt.getTime() + trialDurationMs);
    const now = new Date();
    
    const msRemaining = trialEndsAt.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
    
    return {
        trialEndsAt,
        daysRemaining,
        isExpired: now > trialEndsAt
    };
}
