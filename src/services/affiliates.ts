import { randomBytes } from 'node:crypto';
import { Prisma, type Commission, type PrismaClient } from '@prisma/client';
import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { roundCurrency } from '@/lib/affiliate-math';

export async function requireAffiliateAdmin() {
  const user = await authService.requireUser();
  const allowedIds = (process.env.AFFILIATE_ADMIN_USER_IDS || '').split(',').map((id) => id.trim()).filter(Boolean);
  if (!allowedIds.includes(user.id)) throw new Error('Forbidden');
  return user;
}

export async function getAffiliateConfig(tx: Prisma.TransactionClient | PrismaClient = db) {
  return tx.affiliateConfig.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} });
}

export async function generateAffiliateCode(tx: Prisma.TransactionClient, userId: string, applicationId: string) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 8; attempt++) {
    const bytes = randomBytes(8);
    const code = `PAGE${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')}`;
    try {
      return await tx.affiliateCode.create({ data: { affiliateId: userId, applicationId, code } });
    } catch (error: unknown) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
    }
  }
  throw new Error('Could not generate a unique referral code. Please retry.');
}

export async function recordCommissionReversal(
  tx: Prisma.TransactionClient,
  commission: Commission,
  input: { refundReference: string; refundAmount: number; refundCurrency: string; fraction: number; at: Date },
) {
  if (await tx.commissionReversal.findUnique({ where: { refundReference: input.refundReference } })) return null;
  const fraction = Math.max(0, Math.min(1, input.fraction));
  if (!fraction || Number(commission.amount) <= 0) return null;
  const commissionAmount = Math.min(Number(commission.amount), roundCurrency(Number(commission.amount) * fraction));
  const revenueAmount = Math.min(Number(commission.eligibleRevenue), roundCurrency(Number(commission.eligibleRevenue) * fraction));
  await tx.commissionReversal.create({ data: { commissionId: commission.id, refundReference: input.refundReference, refundAmount: roundCurrency(input.refundAmount), commissionAmount, refundCurrency: input.refundCurrency, commissionCurrency: commission.currency } });
  const remaining = roundCurrency(Number(commission.amount) - commissionAmount);
  const remainingRevenue = roundCurrency(Number(commission.eligibleRevenue) - revenueAmount);
  const fullyReversed = remaining <= 0;
  await tx.commission.update({ where: { id: commission.id }, data: { amount: Math.max(0, remaining), eligibleRevenue: Math.max(0, remainingRevenue), eligibilityStatus: fullyReversed ? 'reversed' : commission.eligibilityStatus, payoutStatus: fullyReversed && commission.payoutStatus === 'unpaid' ? 'reversed' : commission.payoutStatus, reversalReference: input.refundReference, reversedAt: input.at } });
  return { fullyReversed, refundFraction: fraction, commissionAmount };
}
