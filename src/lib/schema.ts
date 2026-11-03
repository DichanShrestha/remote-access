import type { BlogArticleSnapshot } from './blog';
import { buildPagePath } from './page-engine/page-types';
import { resolveSiteUrl, toAbsoluteUrl, type ResolvedPageSeo } from './seo';

type JsonObject = Record<string, unknown>;
type SchemaProfile = { username: string; displayName: string; type?: 'CREATOR' | 'BUSINESS' | string; bio?: string | null; avatarUrl?: string | null };
type SchemaPage = { id?: string; title: string; slug: string; pageType: string; updatedAt?: Date | string };

const clean = (value: unknown): string | undefined => typeof value === 'string' && value.trim() ? value.trim() : undefined;
const object = (value: unknown): JsonObject | undefined => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : undefined;
const hidden = (section: JsonObject) => section.isHidden === true;

export function buildSchemaIds(siteUrl: string, username: string) {
  const root = new URL(buildPagePath(username, ''), resolveSiteUrl(siteUrl)).toString();
  return { root, website: `${root}#website`, publisher: `${root}#publisher` };
}

export function buildPublisherSchema(input: { profile: SchemaProfile; siteUrl?: string; sections?: unknown }): JsonObject {
  const siteUrl = resolveSiteUrl(input.siteUrl);
  const ids = buildSchemaIds(siteUrl, input.profile.username);
  const sections = Array.isArray(input.sections) ? input.sections.map(object).filter((x): x is JsonObject => Boolean(x) && !hidden(x!)) : [];
  const logoSection = sections.find((s) => s.type === 'site-navbar');
  const logo = clean(object(logoSection?.content)?.logoUrl);
  const socials: string[] = [];
  const emails: string[] = [];
  const phones: string[] = [];
  const addresses: string[] = [];
  for (const section of sections) {
    const content = object(section.content);
    if (!content) continue;
    for (const key of ['socialLinks', 'links']) {
      const links = content[key];
      if (Array.isArray(links)) for (const link of links) {
        const url = clean(object(link)?.url);
        if (url && /^https?:\/\//i.test(url) && !url.includes('#')) {
          try {
            const parsed = new URL(url);
            // Bare platform homepages are template placeholders, not profile URLs.
            if (parsed.pathname.replace(/\/+$/, '')) socials.push(url);
          } catch { /* Ignore malformed links. */ }
        }
      }
    }
    if (section.type === 'contact') {
      const email = clean(content.email); const phone = clean(content.phone);
      if (email && !/@example\.(com|org|net)$/i.test(email)) emails.push(email);
      if (phone && !/^(?:\+?0|\+?1)?[\s()-]*0{5,}$/.test(phone)) phones.push(phone);
      const address = clean(content.address); if (address) addresses.push(address);
    }
  }
  const identityType = input.profile.type === 'CREATOR' ? 'Person' : 'Organization';
  return {
    '@type': identityType, '@id': ids.publisher, name: input.profile.displayName,
    url: ids.root,
    ...(clean(input.profile.bio) ? { description: clean(input.profile.bio) } : {}),
    ...(clean(input.profile.avatarUrl) ? { image: toAbsoluteUrl(input.profile.avatarUrl!, siteUrl) } : {}),
    ...(logo ? { logo: toAbsoluteUrl(logo, siteUrl) } : {}),
    ...(emails.length ? { email: [...new Set(emails)] } : {}),
    ...(phones.length ? { telephone: [...new Set(phones)] } : {}),
    ...(addresses.length ? { address: [...new Set(addresses)].map((streetAddress) => ({ '@type': 'PostalAddress', streetAddress })) } : {}),
    ...(socials.length ? { sameAs: [...new Set(socials)] } : {}),
  };
}

export function buildWebsiteSchema(input: { profile: SchemaProfile; siteUrl?: string; publisherId?: string }): JsonObject {
  const siteUrl = resolveSiteUrl(input.siteUrl); const ids = buildSchemaIds(siteUrl, input.profile.username);
  return { '@type': 'WebSite', '@id': ids.website, name: input.profile.displayName, url: ids.root, publisher: { '@id': input.publisherId || ids.publisher } };
}

export function buildBreadcrumbSchema(input: { siteUrl?: string; username: string; page: SchemaPage }): JsonObject | undefined {
  if (!input.page.slug) return undefined;
  const siteUrl = resolveSiteUrl(input.siteUrl);
  return { '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: new URL(buildPagePath(input.username, ''), siteUrl).toString() },
    { '@type': 'ListItem', position: 2, name: input.page.title, item: new URL(buildPagePath(input.username, input.page.slug), siteUrl).toString() },
  ] };
}

export function buildPageSchema(input: { profile: SchemaProfile; page: SchemaPage; seo: ResolvedPageSeo; sections: unknown; siteUrl?: string }): JsonObject {
  const siteUrl = resolveSiteUrl(input.siteUrl); const ids = buildSchemaIds(siteUrl, input.profile.username);
  const type = input.page.pageType === 'ABOUT' ? 'AboutPage' : input.page.pageType === 'CONTACT' ? 'ContactPage' : ['GALLERY', 'PRODUCTS', 'SERVICES', 'FAQ'].includes(input.page.pageType) ? 'CollectionPage' : 'WebPage';
  const sections = Array.isArray(input.sections) ? input.sections.map(object).filter((x): x is JsonObject => Boolean(x) && !hidden(x!)) : [];
  const serviceSections = sections.filter((s) => s.type === 'services').flatMap((s) => {
    const items = object(s.content)?.items;
    return Array.isArray(items) ? items.map(object).filter((item): item is JsonObject => Boolean(item) && Boolean(clean(item!.title)) && Boolean(clean(item!.description))) : [];
  });
  const serviceEntities = serviceSections.map((item, i) => ({ '@type': 'Service', '@id': `${input.seo.canonicalUrl}#service-${i + 1}`, name: clean(item.title), description: clean(item.description), provider: { '@id': ids.publisher }, ...(clean(item.imageUrl) ? { image: toAbsoluteUrl(clean(item.imageUrl)!, siteUrl) } : {}) }));
  return {
    '@type': type, '@id': `${input.seo.canonicalUrl}#webpage`, name: input.seo.title,
    description: input.seo.description, url: input.seo.canonicalUrl,
    isPartOf: { '@id': ids.website }, about: { '@id': ids.publisher },
    ...(input.seo.openGraph.images[0]?.url ? { primaryImageOfPage: input.seo.openGraph.images[0].url } : {}),
    ...(input.page.updatedAt ? { dateModified: new Date(input.page.updatedAt).toISOString() } : {}),
    ...(serviceEntities.length ? { mainEntity: serviceEntities } : {}),
    ...(buildBreadcrumbSchema({ siteUrl, username: input.profile.username, page: input.page }) ? { breadcrumb: buildBreadcrumbSchema({ siteUrl, username: input.profile.username, page: input.page }) } : {}),
  };
}

export function buildWebsitePageGraph(input: { profile: SchemaProfile; page: SchemaPage; seo: ResolvedPageSeo; sections: unknown; siteUrl?: string }): JsonObject {
  const publisher = buildPublisherSchema({ profile: input.profile, siteUrl: input.siteUrl, sections: input.sections });
  return { '@context': 'https://schema.org', '@graph': [publisher, buildWebsiteSchema({ profile: input.profile, siteUrl: input.siteUrl }), buildPageSchema(input)] };
}

export function buildBlogIndexGraph(input: { profile: SchemaProfile; articles: Array<{ publicSlug: string; snapshot: BlogArticleSnapshot; publishedAt: Date }>; siteUrl?: string }): JsonObject {
  const siteUrl = resolveSiteUrl(input.siteUrl); const ids = buildSchemaIds(siteUrl, input.profile.username);
  const publisher = buildPublisherSchema({ profile: input.profile, siteUrl });
  const blogUrl = new URL(`/${input.profile.username}/blog`, siteUrl).toString();
  return { '@context': 'https://schema.org', '@graph': [publisher, buildWebsiteSchema({ profile: input.profile, siteUrl }), {
    '@type': ['Blog', 'CollectionPage'], '@id': `${blogUrl}#blog`, name: `${input.profile.displayName} — Writing`, url: blogUrl,
    isPartOf: { '@id': ids.website }, publisher: { '@id': ids.publisher },
    blogPost: input.articles.map((article) => ({ '@type': 'BlogPosting', headline: article.snapshot.title, url: new URL(`/${input.profile.username}/blog/${article.publicSlug}`, siteUrl).toString() })),
  }] };
}

export function buildBlogPostingGraph(input: { profile: SchemaProfile; article: { publicSlug: string; snapshot: BlogArticleSnapshot; publishedAt: Date }; canonicalUrl?: string; siteUrl?: string }): JsonObject {
  const siteUrl = resolveSiteUrl(input.siteUrl); const ids = buildSchemaIds(siteUrl, input.profile.username);
  const publisher = buildPublisherSchema({ profile: input.profile, siteUrl });
  const canonical = input.canonicalUrl || new URL(`/${input.profile.username}/blog/${input.article.publicSlug}`, siteUrl).toString();
  const authorName = clean(input.article.snapshot.authorName) || input.profile.displayName;
  return { '@context': 'https://schema.org', '@graph': [publisher, buildWebsiteSchema({ profile: input.profile, siteUrl }), {
    '@type': 'BlogPosting', '@id': `${canonical}#article`, headline: input.article.snapshot.title,
    ...(clean(input.article.snapshot.excerpt) ? { description: input.article.snapshot.excerpt } : {}),
    ...(input.article.snapshot.ogImage || input.article.snapshot.featuredImageUrl ? { image: toAbsoluteUrl(input.article.snapshot.ogImage || input.article.snapshot.featuredImageUrl!, siteUrl) } : {}),
    datePublished: input.article.snapshot.publishedAt, dateModified: input.article.snapshot.updatedAt,
    author: { '@type': 'Person', name: authorName, ...(input.article.snapshot.authorAvatarUrl ? { image: toAbsoluteUrl(input.article.snapshot.authorAvatarUrl, siteUrl) } : {}) },
    publisher: { '@id': ids.publisher }, mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    isPartOf: { '@id': `${new URL(`/${input.profile.username}/blog`, siteUrl).toString()}#blog` },
    ...(input.article.snapshot.categories[0] ? { articleSection: input.article.snapshot.categories[0] } : {}),
    ...(input.article.snapshot.tags.length ? { keywords: input.article.snapshot.tags.join(', ') } : {}),
  }] };
}

export function serializeJsonLd(value: unknown): string { return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'); }
