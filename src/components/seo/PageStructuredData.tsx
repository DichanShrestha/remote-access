import { resolveSiteUrl, type ResolvedPageSeo } from '@/lib/seo';

/**
 * Server-rendered structured data. Search and AI crawlers receive this in the
 * initial HTML response; it never depends on client JavaScript.
 */
export function PageStructuredData({
  seo,
  username,
  updatedAt,
}: {
  seo: ResolvedPageSeo;
  username: string;
  updatedAt: Date;
}) {
  const siteUrl = resolveSiteUrl();
  const businessUrl = `${siteUrl}/${encodeURIComponent(username)}`;

  const data = {
    '@context': 'https://schema.org',
    '@type': seo.isHome ? 'WebSite' : 'WebPage',
    name: seo.title,
    description: seo.description,
    url: seo.canonicalUrl,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: seo.openGraph.siteName,
      url: businessUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: seo.openGraph.siteName,
      url: businessUrl,
    },
    dateModified: updatedAt.toISOString(),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
