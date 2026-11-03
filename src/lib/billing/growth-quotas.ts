import { randomUUID } from 'node:crypto';
import db from '@/lib/prisma';
import type { AiUsageSummary } from '@/lib/ai/usage';
import { getCrossedQuotaThresholds, getGrowthAIOperation, GROWTH_LIMITS } from './growth-quota-policy';
export { GROWTH_LIMITS } from './growth-quota-policy';

export class GrowthQuotaError extends Error {
  constructor(public readonly quota: 'articleGenerations' | 'writingCredits', public readonly limit: number) {
    super(quota === 'articleGenerations'
      ? `You’ve used all ${limit} article generations this billing cycle. Your allowance renews with your plan.`
      : `You’ve used all ${limit} writing credits this billing cycle. Your allowance renews with your plan.`);
  }
}

type QuotaKind = 'articleGenerations' | 'writingCredits';

function cycleBounds(subscription: { currentPeriodStart: Date | null; currentPeriodEnd: Date | null; createdAt: Date }) {
  const start = subscription.currentPeriodStart || subscription.createdAt;
  const end = subscription.currentPeriodEnd || new Date(start.getTime() + 30 * 86400000);
  return { start, end };
}

export async function reserveGrowthAI(userId: string, action: string): Promise<{
  finish(success: boolean, usage?: AiUsageSummary): Promise<{ used: number; limit: number; renewsAt: Date; warning?: 'low' | 'limit' } | null>;
} | null> {
  const { kind, amount } = getGrowthAIOperation(action);
  const limit = kind === 'articleGenerations' ? GROWTH_LIMITS.articleGenerations : GROWTH_LIMITS.writingCredits;
  const subscription = await db.subscription.findFirst({ where: { userId }, orderBy: { updatedAt: 'desc' }, select: { id: true, planId: true, tier: true, status: true, currentPeriodStart: true, currentPeriodEnd: true, createdAt: true } });
  if (!subscription || subscription.status !== 'active' || !['smart_page_ai', 'growth'].includes((subscription.planId || subscription.tier).toLowerCase())) return null;
  const { start, end } = cycleBounds(subscription);
  const requestId = randomUUID();
  const usedField = kind === 'articleGenerations' ? 'articleGenerationsUsed' : 'writingCreditsUsed';
  const reservedField = kind === 'articleGenerations' ? 'articleGenerationsReserved' : 'writingCreditsReserved';

  await db.$transaction(async (tx) => {
    // A per-workspace row lock serializes reservations across every website owned by the account.
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId}::uuid FOR UPDATE`;
    await tx.usage.upsert({ where: { userId }, create: { userId }, update: {} });
    let usage = await tx.usage.findUniqueOrThrow({ where: { userId } });
    if (!usage.quotaPeriodStart || usage.quotaPeriodStart.getTime() !== start.getTime()) {
      usage = await tx.usage.update({ where: { userId }, data: {
        articleGenerationsUsed: 0, articleGenerationsReserved: 0,
        writingCreditsUsed: 0, writingCreditsReserved: 0,
        quotaPeriodStart: start, quotaPeriodEnd: end,
      } });
    }
    const currentUsed = usage[usedField];
    const currentReserved = usage[reservedField];
    if (currentUsed + currentReserved + amount > limit) throw new GrowthQuotaError(kind, limit);
    await tx.usage.update({ where: { userId }, data: { [reservedField]: { increment: amount } } });
    await tx.blogAIQuotaReservation.create({ data: { requestId, userId, action, kind, amount, periodStart: start } });
  });

  let finalized = false;
  return {
    async finish(success, usageSummary): Promise<{ used: number; limit: number; renewsAt: Date; warning?: 'low' | 'limit' } | null> {
      if (finalized) return null;
      const result = await db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId}::uuid FOR UPDATE`;
        const reservation = await tx.blogAIQuotaReservation.findUnique({ where: { requestId } });
        if (!reservation || reservation.status !== 'reserved') return null;
        const currentUsage = await tx.usage.findUniqueOrThrow({ where: { userId } });
        if (currentUsage.quotaPeriodStart?.getTime() !== reservation.periodStart.getTime()) {
          await tx.blogAIQuotaReservation.update({ where: { requestId }, data: { status: success ? 'committed' : 'released', finalizedAt: new Date() } });
          if (success && usageSummary) await tx.blogAIUsage.create({ data: { userId, action, inputTokens: usageSummary.inputTokens || 0, outputTokens: usageSummary.outputTokens || 0, costUsd: usageSummary.estimatedCostUsd, credits: reservation.kind === 'articleGenerations' ? 0 : reservation.amount, periodStart: reservation.periodStart } });
          return null;
        }
        const isArticle = reservation.kind === 'articleGenerations';
        const used = isArticle ? 'articleGenerationsUsed' : 'writingCreditsUsed';
        const reserved = isArticle ? 'articleGenerationsReserved' : 'writingCreditsReserved';
        const row = await tx.usage.update({ where: { userId }, data: {
          [reserved]: { decrement: reservation.amount },
          ...(success ? { [used]: { increment: reservation.amount } } : {}),
        } });
        await tx.blogAIQuotaReservation.update({ where: { requestId }, data: { status: success ? 'committed' : 'released', finalizedAt: new Date() } });
        if (success && usageSummary) {
          await tx.blogAIUsage.create({ data: {
            userId, action, inputTokens: usageSummary.inputTokens || 0,
            outputTokens: usageSummary.outputTokens || 0,
            costUsd: usageSummary.estimatedCostUsd,
            credits: isArticle ? 0 : amount,
            periodStart: start,
          } });
        }
        const usedNow = row[used];
        if (success) {
          const previous = usedNow - reservation.amount;
          const noticeRows = getCrossedQuotaThresholds(previous, usedNow, limit).map((threshold) => ({
            userId,
            key: `growth-${kind}-${threshold}-${start.toISOString()}`,
            message: threshold === 100
              ? `You used all ${limit} ${kind === 'articleGenerations' ? 'AI article generations' : 'AI writing credits'} for this billing cycle. The allowance renews ${end.toLocaleDateString()}.`
              : `You used 80% of your ${kind === 'articleGenerations' ? 'AI article generation' : 'AI writing assistance'} allowance. ${Math.max(0, limit - usedNow)} remain until ${end.toLocaleDateString()}.`,
          }));
          if (noticeRows.length) await tx.usageNotice.createMany({ data: noticeRows, skipDuplicates: true });
        }
        const warning: 'limit' | 'low' | undefined = usedNow >= limit ? 'limit' : usedNow >= Math.ceil(limit * 0.8) ? 'low' : undefined;
        return { used: usedNow, limit, renewsAt: end, warning };
      });
      finalized = true;
      return result;
    },
  };
}

export async function getGrowthQuotaSummary(userId: string) {
  const [subscription, usage] = await Promise.all([
    db.subscription.findFirst({ where: { userId }, orderBy: { updatedAt: 'desc' }, select: { planId: true, tier: true, status: true, currentPeriodStart: true, currentPeriodEnd: true, createdAt: true } }),
    db.usage.findUnique({ where: { userId } }),
  ]);
  const { start, end } = subscription ? cycleBounds(subscription) : { start: new Date(0), end: new Date(0) };
  const sameCycle = usage?.quotaPeriodStart?.getTime() === start.getTime();
  return {
    renewsAt: end,
    articleGenerations: sameCycle ? usage?.articleGenerationsUsed || 0 : 0,
    writingCredits: sameCycle ? usage?.writingCreditsUsed || 0 : 0,
    articleGenerationsReserved: sameCycle ? usage?.articleGenerationsReserved || 0 : 0,
    writingCreditsReserved: sameCycle ? usage?.writingCreditsReserved || 0 : 0,
  };
}
