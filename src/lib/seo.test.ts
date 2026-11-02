import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRobotsConfig,
  buildSitemapIndexXml,
  buildSitemapUrlSetXml,
  buildSeoDefaults,
  collectDocumentText,
  getSeoPublishSnapshot,
  resolveCanonicalUrl,
  resolvePageSeo,
  resolveSitemapUrl,
  stripTrailingSlash,
  truncateText,
} from './seo';

const siteUrl = 'https://pageory.app';

const contentSections = [
  {
    id: 'hero-1',
    type: 'hero',
    content: {
      title: 'Handmade ceramics for everyday rituals',
      subtitle: 'Small-batch stoneware made in Kathmandu.',
    },
  },
  {
    id: 'rich-1',
    type: 'rich-text',
    content: {
      text: '<h2>Our studio</h2><p>We throw, glaze and fire every piece by hand.</p>',
    },
  },
];

test('homepage and child pages get unique, useful defaults', () => {
  const home = resolvePageSeo({
    siteUrl,
    username: 'acme',
    displayName: 'Acme Studio',
    bio: 'A small ceramics studio.',
    page: { title: 'Home', slug: '', pageType: 'HOME' },
    document: { settings: {}, sections: contentSections },
    indexable: true,
  });
  const about = resolvePageSeo({
    siteUrl,
    username: 'acme',
    displayName: 'Acme Studio',
    bio: 'A small ceramics studio.',
    page: { title: 'About', slug: 'about', pageType: 'ABOUT' },
    document: { settings: {}, sections: contentSections },
    indexable: true,
  });

  assert.equal(home.title, 'Acme Studio');
  assert.equal(about.title, 'About | Acme Studio');
  assert.notEqual(home.title, about.title);
  assert.match(about.description, /^About — Acme Studio\./);
  assert.match(about.description, /Handmade ceramics/);
  assert.notEqual(home.description, about.description);
  assert.ok(about.description.length <= 160);
});

test('default descriptions are generated from page content without AI', () => {
  const defaults = buildSeoDefaults({
    businessName: 'Acme Studio',
    page: { title: 'Services', slug: 'services', pageType: 'SERVICES' },
    document: { sections: contentSections },
  });

  assert.match(defaults.description, /Handmade ceramics for everyday rituals/);
  assert.match(defaults.description, /Small-batch stoneware/);
  assert.ok(!/AI/i.test(defaults.description));
});

test('rich text is converted to readable text and long copy is truncated', () => {
  const text = collectDocumentText([
    { id: 'rich', type: 'rich-text', content: { text: '<p>Hello &amp; welcome to <strong>our studio</strong>.</p>' } },
  ]);
  assert.equal(text, 'Hello & welcome to our studio.');

  const short = truncateText('one two three four five', 12);
  assert.ok(short.length <= 13);
  assert.match(short, /…$/);
});

test('canonical URLs are absolute, trailing-slash free and tenant scoped', () => {
  const normal = resolveCanonicalUrl({ siteUrl, username: 'acme', slug: 'about' });
  assert.equal(normal, 'https://pageory.app/acme/about');

  const slashOverride = resolveCanonicalUrl({
    siteUrl,
    username: 'acme',
    slug: 'about',
    override: '/acme/about/',
  });
  assert.equal(slashOverride, 'https://pageory.app/acme/about');

  const crossTenant = resolveCanonicalUrl({
    siteUrl,
    username: 'acme',
    slug: 'about',
    override: '/another-business/about',
  });
  assert.equal(crossTenant, 'https://pageory.app/acme/about');

  const external = resolveCanonicalUrl({
    siteUrl,
    username: 'acme',
    slug: 'about',
    override: 'https://spam.example/acme/about',
  });
  assert.equal(external, 'https://pageory.app/acme/about');

  const sameTenantAbsolute = resolveCanonicalUrl({
    siteUrl,
    username: 'acme',
    slug: 'about',
    override: 'https://pageory.app/acme/our-story/',
  });
  assert.equal(sameTenantAbsolute, 'https://pageory.app/acme/our-story');
});

test('sitemap URLs are self-canonical and omit pages that canonicalise elsewhere', () => {
  // No override: the preferred URL is listed.
  assert.equal(
    resolveSitemapUrl({ siteUrl, username: 'acme', slug: 'about' }),
    'https://pageory.app/acme/about',
  );

  // A normalised override that resolves to the same URL stays listed.
  assert.equal(
    resolveSitemapUrl({
      siteUrl,
      username: 'acme',
      slug: 'about',
      canonicalOverride: '/acme/about/',
    }),
    'https://pageory.app/acme/about',
  );

  // Invalid cross-business overrides are ignored by the canonical resolver,
  // so the page still represents itself in the sitemap.
  assert.equal(
    resolveSitemapUrl({
      siteUrl,
      username: 'acme',
      slug: 'about',
      canonicalOverride: '/another-business/about',
    }),
    'https://pageory.app/acme/about',
  );

  // A valid but different in-tenant canonical marks the page as a duplicate,
  // so it must not appear in the sitemap at all.
  assert.equal(
    resolveSitemapUrl({
      siteUrl,
      username: 'acme',
      slug: 'about',
      canonicalOverride: '/acme/our-story',
    }),
    null,
  );
});

test('the same child slug on different businesses produces different canonicals', () => {
  const acme = resolvePageSeo({
    siteUrl,
    username: 'acme',
    displayName: 'Acme Studio',
    page: { title: 'Services', slug: 'services', pageType: 'SERVICES' },
    document: { settings: {}, sections: contentSections },
    indexable: true,
  });
  const beta = resolvePageSeo({
    siteUrl,
    username: 'beta',
    displayName: 'Beta Studio',
    page: { title: 'Services', slug: 'services', pageType: 'SERVICES' },
    document: { settings: {}, sections: contentSections },
    indexable: true,
  });

  assert.equal(acme.canonicalUrl, 'https://pageory.app/acme/services');
  assert.equal(beta.canonicalUrl, 'https://pageory.app/beta/services');
  assert.notEqual(acme.canonicalUrl, beta.canonicalUrl);
});

test('Open Graph and Twitter metadata use absolute images with a safe fallback', () => {
  const fallback = resolvePageSeo({
    siteUrl,
    username: 'acme',
    displayName: 'Acme Studio',
    page: { title: 'About', slug: 'about', pageType: 'ABOUT' },
    document: { settings: {}, sections: contentSections },
    indexable: true,
  });
  assert.equal(fallback.openGraph.images[0].url, 'https://pageory.app/logo.png');
  assert.equal(fallback.twitter.card, 'summary_large_image');

  const custom = resolvePageSeo({
    siteUrl,
    username: 'acme',
    displayName: 'Acme Studio',
    page: { title: 'About', slug: 'about', pageType: 'ABOUT' },
    document: {
      settings: {
        ogTitle: 'A different social title',
        ogDescription: 'A different social description',
        ogImage: '/api/media/example',
      },
      sections: [],
    },
    indexable: true,
  });
  assert.equal(custom.title, 'About | Acme Studio');
  assert.equal(custom.openGraph.title, 'A different social title');
  assert.equal(custom.openGraph.description, 'A different social description');
  assert.equal(custom.openGraph.images[0].url, 'https://pageory.app/api/media/example');
});

test('noindex and unpublished websites produce blocking robots directives', () => {
  const noindex = resolvePageSeo({
    siteUrl,
    username: 'acme',
    displayName: 'Acme Studio',
    page: { title: 'About', slug: 'about', pageType: 'ABOUT' },
    document: { settings: { noindex: true }, sections: contentSections },
    indexable: true,
  });
  assert.equal(noindex.robots.index, false);
  assert.equal(noindex.robots.follow, false);

  const unpublishedSite = resolvePageSeo({
    siteUrl,
    username: 'acme',
    displayName: 'Acme Studio',
    page: { title: 'About', slug: 'about', pageType: 'ABOUT' },
    document: { settings: {}, sections: contentSections },
    indexable: false,
  });
  assert.equal(unpublishedSite.robots.index, false);
});

test('publish snapshot mirrors only the published indexing settings', () => {
  assert.deepEqual(getSeoPublishSnapshot({}), { canonicalUrl: null, noindex: false });
  assert.deepEqual(
    getSeoPublishSnapshot({ canonicalUrl: ' /acme/about/ ', noindex: true }),
    { canonicalUrl: '/acme/about/', noindex: true },
  );
});

test('sitemap XML is standards-shaped, escaped and duplicate free', () => {
  const xml = buildSitemapUrlSetXml([
    { url: 'https://pageory.app/acme', lastModified: new Date('2026-01-02T03:04:05.000Z'), priority: 0.8 },
    { url: 'https://pageory.app/acme/services?x=1&y=2', changeFrequency: 'weekly' },
    { url: 'https://pageory.app/acme', lastModified: new Date('2026-02-01T00:00:00.000Z') },
    { url: 'not-a-url' },
  ]);

  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
  assert.equal((xml.match(/<url>/g) || []).length, 2);
  assert.match(xml, /<lastmod>2026-01-02T03:04:05.000Z<\/lastmod>/);
  assert.match(xml, /x=1&amp;y=2/);
  assert.match(xml, /<\/urlset>$/);
});

test('sitemap index XML is valid and de-duplicated', () => {
  const xml = buildSitemapIndexXml([
    { url: 'https://pageory.app/sitemap-pages/1', lastModified: '2026-01-02T03:04:05.000Z' },
    { url: 'https://pageory.app/sitemap-pages/1' },
    { url: 'https://pageory.app/sitemap-pages/2' },
  ]);

  assert.match(xml, /<sitemapindex xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
  assert.equal((xml.match(/<sitemap>/g) || []).length, 2);
});

test('robots config allows public sites and named crawlers while protecting app routes', () => {
  const config = buildRobotsConfig(siteUrl);
  assert.equal(config.sitemap, 'https://pageory.app/sitemap.xml');
  assert.deepEqual(config.rules.map((rule) => rule.userAgent), ['*', 'Googlebot', 'Bingbot', 'OAI-SearchBot']);

  for (const rule of config.rules) {
    assert.ok(rule.allow.includes('/'));
    assert.ok(rule.allow.includes('/api/media/'));
    assert.ok(rule.disallow.includes('/dashboard'));
    assert.ok(rule.disallow.includes('/editor'));
    assert.ok(!rule.disallow.includes('/api/media/'));
  }
});

test('trailing slash normalization never turns the root into an empty path', () => {
  assert.equal(stripTrailingSlash('/acme/about/'), '/acme/about');
  assert.equal(stripTrailingSlash('/acme/about///'), '/acme/about');
  assert.equal(stripTrailingSlash('/'), '/');
  assert.equal(stripTrailingSlash('///'), '/');
});
