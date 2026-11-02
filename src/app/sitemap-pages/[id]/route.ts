import { NextResponse } from 'next/server';
import { buildSitemapUrlSetXml, resolveSiteUrl } from '@/lib/seo';
import {
  countSitemapPages,
  getSitemapShardCount,
  getStaticSitemapEntries,
  loadSitemapEntries,
  SITEMAP_SHARD_SIZE,
} from '@/lib/sitemap';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function xmlResponse(body: string) {
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600',
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const shard = Number.parseInt(id, 10);

  if (!Number.isInteger(shard) || shard < 1) {
    return new NextResponse('Not found', { status: 404 });
  }

  const siteUrl = resolveSiteUrl();
  const totalPages = await countSitemapPages();
  if (shard > getSitemapShardCount(totalPages)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const entries = await loadSitemapEntries({
    siteUrl,
    skip: (shard - 1) * SITEMAP_SHARD_SIZE,
    take: SITEMAP_SHARD_SIZE,
  });

  return xmlResponse(buildSitemapUrlSetXml(
    shard === 1 ? [...getStaticSitemapEntries(siteUrl), ...entries] : entries,
  ));
}
