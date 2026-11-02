'use server';

import { z } from 'zod';
import db from '@/lib/prisma';
import { requireAffiliateAdmin } from '@/services/affiliates';
import { buildComplimentaryGrant } from '@/lib/admin-access';

const userIdSchema = z.string().uuid();
const reasonSchema = z.string().trim().min(5, 'Enter a reason of at least 5 characters.').max(1000, 'Reason must be 1,000 characters or fewer.');

export async function setAccountSuspension(userId: string, suspended: boolean, rawReason: string) {
  const admin = await requireAffiliateAdmin();
  const targetId = userIdSchema.parse(userId);
  const reason = reasonSchema.parse(rawReason);
  if (targetId === admin.id) throw new Error('You cannot suspend your own admin account.');
  const target = await db.user.findUnique({ where: { id: targetId }, select: { id: true, suspendedAt: true } });
  if (!target) throw new Error('User not found.');
  if (Boolean(target.suspendedAt) === suspended) throw new Error(suspended ? 'This account is already suspended.' : 'This account is already active.');
  const now = new Date();
  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: targetId }, data: { suspendedAt: suspended ? now : null, suspensionReason: suspended ? reason : null } });
    await tx.affiliateAuditEvent.create({ data: { actorId: admin.id, action: suspended ? 'account_suspended' : 'account_reactivated', entityType: 'user', entityId: targetId, details: { reason } } });
  });
}

const accessSchema = z.object({
  userId: userIdSchema,
  action: z.enum(['grant_trial', 'grant_plan', 'extend', 'revoke']),
  plan: z.enum(['trial', 'smart_page', 'smart_page_ai']).optional(),
  days: z.coerce.number().int().min(1).max(3650).optional(),
  reason: reasonSchema,
});

export async function manageComplimentaryAccess(input: { userId: string; action: 'grant_trial' | 'grant_plan' | 'extend' | 'revoke'; plan?: 'trial' | 'smart_page' | 'smart_page_ai'; days?: number; reason: string }) {
  const admin = await requireAffiliateAdmin();
  const valid = accessSchema.parse(input);
  if (valid.action === 'grant_trial' && (!valid.days || valid.days > 90)) throw new Error('Free trial grants must be between 1 and 90 days.');
  if (valid.action === 'grant_plan' && (!valid.days || !valid.plan || valid.plan === 'trial')) throw new Error('Choose Starter or Growth and set access days.');
  if (valid.action === 'extend' && !valid.days) throw new Error('Choose the number of days to extend access.');

  await db.$transaction(async (tx) => {
    const target = await tx.user.findUnique({ where: { id: valid.userId }, select: { id: true } });
    if (!target) throw new Error('User not found.');
    const current = await tx.subscription.findFirst({ where: { userId: valid.userId }, orderBy: { updatedAt: 'desc' } });
    const now = new Date();
    const currentIsPaid = Boolean(current && ['dodo', 'manual'].includes(current.billingMethod) && ['active', 'past_due'].includes(current.status));
    if ((valid.action === 'grant_trial' || valid.action === 'grant_plan') && currentIsPaid) throw new Error('This user already has a paid subscription. Complimentary access was not applied.');

    if (valid.action === 'grant_trial' || valid.action === 'grant_plan') {
      const planId = valid.action === 'grant_trial' ? 'trial' : valid.plan!;
      const data = buildComplimentaryGrant(planId, valid.days!, now);
      if (current?.billingMethod === 'admin_comp' && ['active', 'trialing'].includes(current.status)) await tx.subscription.update({ where: { id: current.id }, data });
      else await tx.subscription.create({ data: { userId: valid.userId, ...data } });
    } else if (valid.action === 'extend') {
      if (!current || current.billingMethod !== 'admin_comp' || !['active', 'trialing'].includes(current.status)) throw new Error('Only active complimentary access can be extended.');
      const end = new Date(Math.max(current.currentPeriodEnd?.getTime() || now.getTime(), now.getTime()) + valid.days! * 86400000);
      await tx.subscription.update({ where: { id: current.id }, data: { currentPeriodEnd: end, ...(current.status === 'trialing' ? { trialEnd: end } : {}) } });
    } else {
      if (!current || current.billingMethod !== 'admin_comp' || !['active', 'trialing'].includes(current.status)) throw new Error('There is no active complimentary access to revoke.');
      await tx.subscription.update({ where: { id: current.id }, data: { status: 'canceled', cancelAtPeriodEnd: false, currentPeriodEnd: now, trialEnd: current.status === 'trialing' ? now : current.trialEnd } });
    }

    await tx.affiliateAuditEvent.create({ data: { actorId: admin.id, action: `complimentary_access_${valid.action}`, entityType: 'subscription', entityId: current?.id || valid.userId, details: { userId: valid.userId, plan: valid.plan || (valid.action === 'grant_trial' ? 'trial' : undefined), days: valid.days, reason: valid.reason } } });
  }, { isolationLevel: 'Serializable' });
}

export async function resolvePlanAccessRequest(requestId: string, decision: 'approved' | 'rejected', days: number, rawReason: string) {
  const admin = await requireAffiliateAdmin();
  const id = z.string().min(8).max(40).parse(requestId);
  const reason = reasonSchema.parse(rawReason);
  const duration = z.number().int().min(1).max(3650).parse(days);
  await db.$transaction(async (tx) => {
    const request = await tx.planAccessRequest.findUnique({ where: { id } });
    if (!request || request.status !== 'pending') throw new Error('This request is no longer pending. Refresh the page.');
    const now = new Date();
    if (decision === 'approved') {
      if (request.requestType === 'trial' && duration > 90) throw new Error('Free trials must be 90 days or fewer.');
      const active = await tx.subscription.findFirst({ where: { userId: request.userId, status: { in: ['active', 'past_due', 'trialing'] }, OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }] } });
      if (active && !(['active', 'trialing'].includes(active.status) && active.billingMethod === 'admin_comp')) throw new Error('The user already has active paid access.');
      if (request.requestType === 'trial') {
        const user = await tx.user.findUnique({ where: { id: request.userId }, select: { trialGrantedAt: true } });
        const usedTrial = await tx.subscription.findFirst({ where: { userId: request.userId, OR: [{ trialEverGranted: true }, { trialStart: { not: null } }] }, select: { id: true } });
        if (user?.trialGrantedAt || usedTrial) throw new Error('This account has already used its trial.');
      }
      const isTrial = request.requestType === 'trial';
      const planId = isTrial ? 'trial' : request.planId;
      const data = buildComplimentaryGrant(planId as 'trial' | 'smart_page' | 'smart_page_ai', duration, now);
      if (active?.billingMethod === 'admin_comp') await tx.subscription.update({ where: { id: active.id }, data });
      else await tx.subscription.create({ data: { userId: request.userId, ...data } });
      if (isTrial) await tx.user.update({ where: { id: request.userId }, data: { trialGrantedAt: now } });
      const profile = await tx.profile.findUnique({
        where: { userId: request.userId },
        include: {
          pages: { where: { OR: [{ pageType: 'HOME' }, { slug: '' }] }, orderBy: { createdAt: 'asc' }, take: 1 },
          website: true,
        },
      });
      const home = profile?.pages[0];
      if (home && Object.keys(home.draftConfig as object).length) {
        await tx.page.update({ where: { id: home.id }, data: { publishedConfig: home.draftConfig as never, isPublished: true } });
      }
      if (profile?.website) {
        await tx.website.update({ where: { id: profile.website.id }, data: { publishedConfig: profile.website.draftConfig as never } });
      }
    }
    await tx.planAccessRequest.update({ where: { id }, data: { status: decision, reviewedAt: now, reviewedBy: admin.id, reviewReason: reason } });
    await tx.affiliateAuditEvent.create({ data: { actorId: admin.id, action: `plan_access_request_${decision}`, entityType: 'plan_access_request', entityId: id, details: { userId: request.userId, requestType: request.requestType, planId: request.planId, days: decision === 'approved' ? duration : undefined, reason } } });
  }, { isolationLevel: 'Serializable' });
}
