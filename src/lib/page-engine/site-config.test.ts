import test from 'node:test';
import assert from 'node:assert/strict';
import { PageDocumentSchema } from './schemas';
import { TEMPLATE_RESTAURANT } from './templates';
import {
  applyManagedNavigation,
  applyWebsiteConfig,
  extractWebsiteConfig,
  getNavigationLinksForPages,
  toPageContentDocument,
} from './site-config';

const template = PageDocumentSchema.parse(TEMPLATE_RESTAURANT);

function hasSiteChrome(document: ReturnType<typeof toPageContentDocument>) {
  return document.sections.some(
    (node) => 'type' in node && (node.type === 'site-navbar' || node.type === 'site-footer'),
  );
}

test('extracting a website config captures shared chrome and design once', () => {
  const config = extractWebsiteConfig(template);

  assert.equal(config.theme.primaryColor, template.theme.primaryColor);
  assert.equal(config.settings.showFooterBranding, template.settings.showFooterBranding);
  assert.ok(config.header, 'expected a shared header');
  assert.ok(config.footer, 'expected a shared footer');
});

test('page content removes shared chrome while preserving page-only sections', () => {
  const pageContent = toPageContentDocument(template);

  assert.equal(hasSiteChrome(pageContent), false);
  assert.ok(pageContent.sections.length > 0);
  assert.equal(pageContent.sections.length, template.sections.length - 2);
});

test('applying a website config restores shared chrome without duplicating it', () => {
  const config = extractWebsiteConfig(template);
  const pageContent = toPageContentDocument(template);
  const merged = applyWebsiteConfig(pageContent, config);

  const first = merged.sections[0];
  const last = merged.sections.at(-1);
  assert.equal(first && 'type' in first ? first.type : undefined, 'site-navbar');
  assert.equal(last && 'type' in last ? last.type : undefined, 'site-footer');
  assert.equal(merged.sections.filter((node) => 'type' in node && node.type === 'site-navbar').length, 1);
  assert.equal(merged.sections.filter((node) => 'type' in node && node.type === 'site-footer').length, 1);

  const mergedTwice = applyWebsiteConfig(merged, config);
  assert.equal(mergedTwice.sections.length, merged.sections.length);
});

test('navigation links are generated only from the given published pages', () => {
  const links = getNavigationLinksForPages('acme', [
    { id: 'services', title: 'Services', slug: 'services', pageType: 'SERVICES', navOrder: 1 },
    { id: 'home', title: 'Home', slug: '', pageType: 'HOME', navOrder: 0 },
  ]);

  assert.deepEqual(links.map((link) => link.url), ['/acme', '/acme/services']);
  assert.equal(links[0].label, 'Home');
});

test('managed navigation updates matching links and adds missing pages without mutating input', () => {
  const links = getNavigationLinksForPages('acme', [
    { id: 'home', title: 'Home', slug: '', pageType: 'HOME', navOrder: 0 },
    { id: 'services', title: 'Services', slug: 'services', pageType: 'SERVICES', navOrder: 1 },
  ]);
  const pageContent = toPageContentDocument(template);
  const renderedDocument = applyWebsiteConfig(pageContent, extractWebsiteConfig(template));
  const withNavigation = applyManagedNavigation(renderedDocument, links);
  const header = withNavigation.sections.find((node) => 'type' in node && node.type === 'site-navbar');

  assert.ok(header && 'content' in header);
  const headerLinks = (header as { content: { links: Array<{ label: string; url: string }> } }).content.links;
  assert.equal(headerLinks.some((link) => link.url === '/acme'), true);
  assert.equal(headerLinks.some((link) => link.url === '/acme/services'), true);

  // Rendering navigation must never persist managed links into the stored doc.
  assert.equal(JSON.stringify(pageContent).includes('/acme/services'), false);
  assert.equal(JSON.stringify(renderedDocument).includes('/acme/services'), false);
});
