import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBlogPostingGraph, buildPublisherSchema, buildWebsitePageGraph, serializeJsonLd } from './schema';
import { resolvePageSeo } from './seo';

const seo = resolvePageSeo({ siteUrl: 'https://pageory.app', username: 'acme', displayName: 'Acme Studio', page: { title: 'Services', slug: 'services', pageType: 'SERVICES' }, document: { sections: [] } });

test('business pages get connected tenant-scoped publisher, website, service and page schema', () => {
  const graph = buildWebsitePageGraph({
    profile: { username: 'acme', displayName: 'Acme Studio', type: 'BUSINESS' },
    page: { title: 'Services', slug: 'services', pageType: 'SERVICES' }, seo,
    sections: [{ type: 'services', isHidden: false, content: { items: [{ title: 'Consulting', description: 'Business consulting' }, { title: '', description: '' }] } }],
  });
  const parsed = JSON.parse(serializeJsonLd(graph));
  assert.equal(parsed['@graph'][0]['@type'], 'Organization');
  assert.equal(parsed['@graph'][1]['@type'], 'WebSite');
  assert.equal(parsed['@graph'][2]['@type'], 'CollectionPage');
  assert.equal(parsed['@graph'][2].mainEntity.length, 1);
  assert.match(parsed['@graph'][2].url, /\/acme\/services$/);
  assert.equal(parsed['@graph'][2].breadcrumb.itemListElement.length, 2);
});

test('creator stays a Person and missing business facts are omitted', () => {
  const publisher = buildPublisherSchema({ profile: { username: 'writer', displayName: 'Writer', type: 'CREATOR' } });
  assert.equal(publisher['@type'], 'Person');
  assert.equal('address' in publisher, false);
  assert.equal('telephone' in publisher, false);
  assert.equal('aggregateRating' in publisher, false);
});

test('blog post graph uses the published author and tenant article URL', () => {
  const graph = buildBlogPostingGraph({
    profile: { username: 'writer', displayName: 'Writer', type: 'CREATOR' },
    article: { publicSlug: 'saved-article', publishedAt: new Date('2026-01-01'), snapshot: {
      version: 1, title: 'Saved title', slug: 'saved-article', excerpt: 'Saved excerpt', bodyHtml: '<p>Body</p>',
      featuredImageUrl: null, featuredImageAlt: null, categories: ['Notes'], tags: [], authorName: 'Guest Author', authorAvatarUrl: null,
      seoTitle: null, seoDescription: null, canonicalUrl: null, ogImage: null, noindex: false, readingMinutes: 1,
      publishedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z',
    } },
  });
  const article = JSON.parse(serializeJsonLd(graph))['@graph'][2];
  assert.equal(article['@type'], 'BlogPosting');
  assert.equal(article.author.name, 'Guest Author');
  assert.equal(article.mainEntityOfPage['@id'], 'https://pageory.app/writer/blog/saved-article');
  assert.equal('image' in article, false);
});

test('JSON-LD serialization escapes script-closing input safely', () => {
  assert.equal(serializeJsonLd({ value: '</script>' }), '{"value":"\\u003c/script>"}');
});
