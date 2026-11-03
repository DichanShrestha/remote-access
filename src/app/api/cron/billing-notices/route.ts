import { NextResponse } from 'next/server';
import db from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Daily, idempotent in-app billing reminders. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const now = new Date();
  const endOfLookahead = new Date(now.getTime() + 8 * 86400000);
  const subscriptions = await db.subscription.findMany({
    where: { status: { in: ['active', 'past_due', 'expired', 'canceled'] }, OR: [{ currentPeriodEnd: { lte: endOfLookahead } }, { status: 'past_due' }] },
    select: { id: true, userId: true, planId: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true },
  });
  const notices: Array<{ userId: string; subscriptionId: string; kind: string; message: string }> = [];
  for (const sub of subscriptions) {
    if (!sub.currentPeriodEnd) continue;
    const daysUntilEnd = Math.ceil((sub.currentPeriodEnd.getTime() - now.getTime()) / 86400000);
    if (sub.cancelAtPeriodEnd && [7, 3, 1].includes(daysUntilEnd)) {
      notices.push({ userId: sub.userId, subscriptionId: sub.id, kind: `expiration-${daysUntilEnd}`, message: `Your ${sub.planId === 'smart_page_ai' ? 'Growth' : 'Starter'} plan is scheduled to end in ${daysUntilEnd} day${daysUntilEnd === 1 ? '' : 's'} (${sub.currentPeriodEnd.toLocaleDateString()}). Your website and paid features remain available until then.` });
    }
    if (sub.status === 'past_due' && !sub.cancelAtPeriodEnd) {
      notices.push({ userId: sub.userId, subscriptionId: sub.id, kind: 'payment-failed', message: 'Your subscription payment needs attention. AI and other paid operations are paused until payment succeeds.' });
    }
    if (daysUntilEnd <= 0) {
      notices.push({ userId: sub.userId, subscriptionId: sub.id, kind: 'period-ended', message: sub.status === 'past_due' ? 'Your billing period has ended. Your public website remains online during the 7-day payment grace period.' : 'Your subscription period has ended. Review billing to restore paid features.' });
      const isPaymentGrace = ['past_due', 'expired', 'active'].includes(sub.status) && !sub.cancelAtPeriodEnd;
      if (isPaymentGrace) {
        const graceDaysLeft = Math.ceil((sub.currentPeriodEnd.getTime() + 7 * 86400000 - now.getTime()) / 86400000);
        if (graceDaysLeft <= 0) notices.push({ userId: sub.userId, subscriptionId: sub.id, kind: 'grace-day-0', message: 'Your 7-day payment grace period has ended. Update billing to restore public hosting.' });
        else notices.push({ userId: sub.userId, subscriptionId: sub.id, kind: `grace-day-${graceDaysLeft}`, message: `Your public website is online during the payment grace period. ${graceDaysLeft} day${graceDaysLeft === 1 ? '' : 's'} remain before hosting is paused.` });
      }
    }
  }
  if (notices.length) await db.billingNotice.createMany({ data: notices, skipDuplicates: true });
  return NextResponse.json({ noticesCreated: notices.length });
}
