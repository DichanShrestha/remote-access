import db from '@/lib/prisma';
import { getSmartPageEntitlement } from '@/lib/tier-limits';

export async function getUserEntitlement(userId: string) {
  const account = await db.user.findUnique({ where: { id: userId }, include: { subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 }, usage: true } });
  if (!account) throw new Error('Workspace not found');
  return { account, entitlement: getSmartPageEntitlement(account) };
}

export async function requirePageAccess(userId: string) {
  const { entitlement } = await getUserEntitlement(userId);
  if (entitlement.trialExpired) throw new Error('Your trial has ended. Choose a plan to continue managing your Smart Page.');
  return entitlement;
}

export async function requireAIEntitlement(userId: string) {
  const entitlement = await requirePageAccess(userId);
  if (!entitlement.aiEnabled) throw new Error('AI features require an active trial or Smart Page + AI plan.');
  return entitlement;
}
