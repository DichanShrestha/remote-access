import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function reserveAIReply(userId: string, botId: string, subscriptionId: string | undefined, quota: number, requiredStatus: string) {
  if (!subscriptionId) return null;
  const reserved = await prisma.$executeRaw`
    UPDATE "Subscription" SET "aiRepliesReserved" = "aiRepliesReserved" + 1
    WHERE id = ${subscriptionId} AND ("aiRepliesUsed" + "aiRepliesReserved") < ${quota} AND status = ${requiredStatus}
  `;
  if (!reserved) return null;
  const requestId = randomUUID();
  let finalized = false;
  return {
    async finish(modelId: string, inputTokens: number, outputTokens: number, status: string, error?: string, countReply = false) {
      if (finalized) return;
      finalized = true;
      const inputRate = Number(process.env.AI_INPUT_COST_PER_MILLION_USD || 0.15);
      const outputRate = Number(process.env.AI_OUTPUT_COST_PER_MILLION_USD || 0.6);
      await prisma.$transaction([
        prisma.subscription.update({ where: { id: subscriptionId }, data: { aiRepliesReserved: { decrement: 1 }, ...(countReply ? { aiRepliesUsed: { increment: 1 } } : {}) } }),
        prisma.aIRequestUsage.create({ data: { requestId, userId, botId, modelId, inputTokens, outputTokens, costUsd: (inputTokens * inputRate + outputTokens * outputRate) / 1_000_000, status, error } }),
      ]);
    },
  };
}
