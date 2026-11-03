import { buildWebsitePageGraph, serializeJsonLd } from '@/lib/schema';
import type { ResolvedPageSeo } from '@/lib/seo';

/**
 * Server-rendered structured data. Search and AI crawlers receive this in the
 * initial HTML response; it never depends on client JavaScript.
 */
export function PageStructuredData({
  seo,
  username,
  updatedAt,
  displayName,
  profileType,
  bio,
  avatarUrl,
  sections,
  pageSlug,
  pageType,
}: {
  seo: ResolvedPageSeo;
  username: string;
  updatedAt: Date;
  displayName: string;
  profileType: string;
  bio?: string | null;
  avatarUrl?: string | null;
  sections: unknown;
  pageSlug: string;
  pageType: string;
}) {
  const data = buildWebsitePageGraph({
    profile: { username, displayName, type: profileType, bio, avatarUrl },
    page: { title: seo.title, slug: pageSlug, pageType, updatedAt },
    seo,
    sections,
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(data),
      }}
    />
  );
}
