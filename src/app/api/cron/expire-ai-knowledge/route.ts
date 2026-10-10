import { NextResponse } from 'next/server';
import db from '@/lib/prisma';
import { storageService } from '@/lib/storage/service';

export const dynamic = 'force-dynamic';

/** Invoke daily from the hosting scheduler with Authorization: Bearer CRON_SECRET. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const cutoff = new Date(Date.now() - 30 * 86400000);
  const candidates = await db.subscription.findMany({
    where: {
      aiKnowledgePurgedAt: null,
      OR: [
        { aiAccessEndedAt: { lte: cutoff } },
        { planId: 'trial', trialEnd: { lte: cutoff }, status: { in: ['trialing', 'expired', 'canceled'] } },
      ],
      NOT: { planId: 'smart_page_ai', status: 'active' },
    },
    select: { id: true, userId: true },
  });
  let purged = 0;
  for (const sub of candidates) {
    const sources = await db.dataSource.findMany({ where: { userId: sub.userId }, select: { id: true, filePath: true } });
    const objects = sources.filter((source) => source.filePath).map((source) => ({ bucket: 'docs', key: source.filePath! }));
    const catalog = await db.catalogItem.findMany({ where: { userId: sub.userId }, include: { images: { select: { publicUrl: true } } } });
    for (const image of catalog.flatMap((item) => item.images)) {
      const key = storageService.keyFromPublicUrl('catalog-assets', image.publicUrl);
      if (key) objects.push({ bucket: 'catalog-assets', key });
    }
    if (objects.length) await storageService.delete(objects);
    await db.$transaction(async (tx) => {
      await tx.dataSource.deleteMany({ where: { userId: sub.userId } });
      await tx.qAPair.deleteMany({ where: { userId: sub.userId } });
      await tx.catalogItem.deleteMany({ where: { userId: sub.userId } });
      await tx.usage.updateMany({ where: { userId: sub.userId }, data: { knowledgeBytes: 0, indexedTokens: 0 } });
      await tx.subscription.update({ where: { id: sub.id }, data: { aiKnowledgePurgedAt: new Date() } });
    });
    purged++;
  }
  return NextResponse.json({ purged });
}
