import { NextResponse } from 'next/server';
import {
  buildSitemapIndexXml,
  buildSitemapUrlSetXml,
  resolveSiteUrl,
} from '@/lib/seo';
import {
  countSitemapPages,
  getLatestSitemapPageUpdate,
  getSitemapShardCount,
  getStaticSitemapEntries,
  loadSitemapEntries,
  SITEMAP_MAX_URLS,
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

export async function GET() {
  const siteUrl = resolveSiteUrl();
  const staticEntries = getStaticSitemapEntries(siteUrl);
  const totalPages = await countSitemapPages();

  // Large installations switch to a standards-compliant sitemap index so no
  // single file exceeds the 50,000 URL limit.
  if (totalPages + staticEntries.length > SITEMAP_MAX_URLS) {
    const latestUpdate = await getLatestSitemapPageUpdate();
    const shardCount = getSitemapShardCount(totalPages);
    return xmlResponse(buildSitemapIndexXml(
      Array.from({ length: shardCount }, (_, index) => ({
        url: `${siteUrl}/sitemap-pages/${index + 1}`,
        lastModified: latestUpdate ?? undefined,
      })),
    ));
  }

  const entries = await loadSitemapEntries({
    siteUrl,
    take: SITEMAP_MAX_URLS - staticEntries.length,
  });

  return xmlResponse(buildSitemapUrlSetXml([...staticEntries, ...entries]));
}
