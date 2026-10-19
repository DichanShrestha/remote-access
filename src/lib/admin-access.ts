export type ComplimentaryPlanId = 'trial' | 'smart_page' | 'smart_page_ai';

export function buildComplimentaryGrant(planId: ComplimentaryPlanId, days: number, start: Date) {
  const end = new Date(start.getTime() + days * 86400000);
  const trial = planId === 'trial';
  return {
    planId,
    tier: planId,
    status: trial ? 'trialing' : 'active',
    billingMethod: 'admin_comp',
    trialStart: trial ? start : null,
    trialEnd: trial ? end : null,
    ...(trial ? { trialEverGranted: true } : {}),
    currentPeriodStart: start,
    currentPeriodEnd: end,
    cancelAtPeriodEnd: false,
  };
}
