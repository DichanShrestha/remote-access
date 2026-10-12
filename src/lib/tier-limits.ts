export const SMART_PAGE_LIMITS = {
  trial: { pages: 1, pageMediaBytes: 250 * 1024 * 1024, imageBytes: 10 * 1024 * 1024, aiReplies: 100, knowledgeSources: 5, knowledgeBytes: 10 * 1024 * 1024, knowledgeFileBytes: 5 * 1024 * 1024, faqEntries: 50, indexedTokens: 100_000 },
  smart_page: { pages: 1, pageMediaBytes: 250 * 1024 * 1024, imageBytes: 10 * 1024 * 1024, aiReplies: 0, knowledgeSources: 0, knowledgeBytes: 0, knowledgeFileBytes: 0, faqEntries: 0, indexedTokens: 0 },
  smart_page_ai: { pages: 1, pageMediaBytes: 250 * 1024 * 1024, imageBytes: 10 * 1024 * 1024, aiReplies: 800, knowledgeSources: 20, knowledgeBytes: 50 * 1024 * 1024, knowledgeFileBytes: 10 * 1024 * 1024, faqEntries: 200, indexedTokens: 500_000 },
} as const;

// Legacy KnowChat limits remain for existing resource-manager callers.
export const TIER_LIMITS = {
  free: { bots: 1, characterLimit: 400000, messages: 300, catalogImages: 5, catalogSearchResults: 2 },
  starter: { bots: 3, characterLimit: 2000000, messages: 1000, catalogImages: 20, catalogSearchResults: 3 },
  pro: { bots: 5, characterLimit: 5000000, messages: 4000, catalogImages: 100, catalogSearchResults: 5 },
  business: { bots: 10, characterLimit: 11000000, messages: 10000, catalogImages: 500, catalogSearchResults: 10 },
  expired: { bots: 0, characterLimit: 0, messages: 0, catalogImages: 0, catalogSearchResults: 0 },
};
export type TierType = keyof typeof TIER_LIMITS;
export const TRIAL_MS = 14 * 24 * 60 * 60 * 1000;
export const AI_MAX_INPUT_TOKENS = Number(process.env.AI_MAX_INPUT_TOKENS || 6000);
export const AI_MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS || 1000);
// Conservative estimate where the selected provider tokenizer is not exposed.
export const AI_CHARS_PER_TOKEN = Number(process.env.AI_CHARS_PER_TOKEN || 3);

export function normalizePlan(plan?: string | null) {
  const value = (plan || '').toLowerCase();
  if (value === 'smart_page_ai' || value.includes('ai') || value.includes('knowchat')) return 'smart_page_ai' as const;
  return 'smart_page' as const;
}

export function getSmartPageEntitlement(user: { createdAt: Date; trialGrantedAt?: Date | null; subscriptions?: Array<{ tier?: string; planId?: string; status?: string; trialStart?: Date | null; trialEnd?: Date | null; currentPeriodEnd?: Date | null }> | null }, now = new Date()) {
  const sub = user.subscriptions?.[0];
  const trialStart = sub?.trialStart ?? user.trialGrantedAt ?? user.createdAt;
  const trialEnd = sub?.trialEnd ?? new Date(trialStart.getTime() + TRIAL_MS);
  const paidActive = !!sub && ['active', 'past_due'].includes(sub.status || '') && (!sub.currentPeriodEnd || sub.currentPeriodEnd > now);
  const onTrial = sub?.status === 'trialing' && trialEnd > now;
  const plan = paidActive ? normalizePlan(sub?.planId || sub?.tier) : onTrial ? 'trial' : 'smart_page';
  return { plan, limits: SMART_PAGE_LIMITS[plan], aiEnabled: plan !== 'smart_page', trialStart, trialEnd, trialExpired: !!(sub || user.trialGrantedAt) && !paidActive && !onTrial && now >= trialEnd, publicGraceEndsAt: new Date(trialEnd.getTime() + 3 * 24 * 60 * 60 * 1000), paidActive, onTrial };
}

export function getEffectiveTier(user: { createdAt: Date; subscriptions?: { tier: string; status?: string; trialEnd?: Date | null; currentPeriodEnd?: Date | null }[] | null }): TierType {
  const raw = user.subscriptions?.[0]?.tier || 'free';
  if (['smart_page', 'smart_page_ai'].includes(normalizePlan(raw)) && raw !== 'free') return 'pro';
  if (raw === 'free') return new Date(user.createdAt.getTime() + TRIAL_MS) < new Date() ? 'expired' : 'free';
  if (!(raw in TIER_LIMITS)) return 'free';
  return raw as TierType;
}
export function getTrialInfo(user: { createdAt: Date; subscriptions?: { trialStart?: Date | null; trialEnd?: Date | null }[] | null }) {
  const sub = user.subscriptions?.[0];
  const trialEndsAt = sub?.trialEnd ?? new Date((sub?.trialStart ?? user.createdAt).getTime() + TRIAL_MS);
  const msRemaining = trialEndsAt.getTime() - Date.now();
  return { trialEndsAt, daysRemaining: Math.max(0, Math.ceil(msRemaining / 86400000)), isExpired: msRemaining <= 0 };
}
