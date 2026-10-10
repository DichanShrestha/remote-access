import { NextResponse } from 'next/server';
import db from '@/lib/prisma';
import { storageService } from '@/lib/storage/service';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = await params;
  const asset = await db.pageMediaAsset.findUnique({ where: { id: assetId } });
  if (!asset) return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  const url = storageService.publicUrl({ bucket: asset.bucket, key: asset.objectKey });
  return NextResponse.redirect(url, { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } });
}
