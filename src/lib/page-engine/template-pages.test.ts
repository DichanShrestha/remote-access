import assert from 'node:assert/strict';
import test from 'node:test';
import { TEMPLATES_MAP } from './templates';
import { PageDocumentSchema, type PageNode, type PageSection } from './schemas';
import { buildTemplatePages } from './template-pages';
import { BUSINESS_TEMPLATE_PAGE_BLUEPRINTS } from './business-template-pages';

const BUSINESS_TEMPLATES = Object.keys(BUSINESS_TEMPLATE_PAGE_BLUEPRINTS);

const flattenSections = (nodes: PageNode[]): PageSection[] => nodes.flatMap((node) =>
  'kind' in node ? flattenSections(node.children) : [node],
);

test('business templates keep their homepage and expose purpose-built starter pages', () => {
  for (const templateId of BUSINESS_TEMPLATES) {
    const document = TEMPLATES_MAP[templateId];
    assert.ok(document, `${templateId} template exists`);

    const { home, starterPages } = buildTemplatePages(templateId, document);
    assert.deepEqual(home.sections, document.sections, `${templateId} homepage remains intact`);
    assert.equal(PageDocumentSchema.safeParse(home).success, true, `${templateId} homepage stays valid`);

    const expected = BUSINESS_TEMPLATE_PAGE_BLUEPRINTS[templateId];
    assert.deepEqual(
      starterPages.map((page) => page.slug),
      expected.map((page) => page.slug),
      `${templateId} blueprint routes are preserved`,
    );
    assert.equal(new Set(starterPages.map((page) => page.slug)).size, starterPages.length, `${templateId} starter page URLs are unique`);
    assert.ok(starterPages.length >= 4, `${templateId} has a complete secondary page set`);

    for (const page of starterPages) {
      assert.ok(page.title.length > 0, `${templateId} ${page.slug} has a title`);
      assert.ok(page.sections.length >= 3, `${templateId} ${page.slug} has a full page structure`);
      assert.equal(PageDocumentSchema.safeParse({ ...document, sections: page.sections }).success, true, `${templateId} ${page.slug} page stays valid`);

      const ids = page.sections.map((section) => section.id);
      assert.equal(new Set(ids).size, ids.length, `${templateId} ${page.slug} section ids are unique`);

      for (const section of page.sections) {
        assert.notEqual(section.type, 'site-navbar', `${templateId} ${page.slug} has no duplicated header`);
        assert.notEqual(section.type, 'site-footer', `${templateId} ${page.slug} has no duplicated footer`);
      }
    }
  }
});

test('business templates include a dark first-screen hero where the header needs one', () => {
  for (const templateId of BUSINESS_TEMPLATES) {
    const { starterPages } = buildTemplatePages(templateId, TEMPLATES_MAP[templateId]);
    for (const page of starterPages) {
      const first = page.sections[0];
      assert.equal(first.type, 'hero', `${templateId} ${page.slug} opens with a hero`);
      if (templateId === 'restaurant') {
        assert.equal(first.variant, 'restaurant-cover', `${templateId} ${page.slug} uses the dark restaurant cover`);
      }
    }
  }
});

test('business templates include the homepage primary CTA anchor on every page', () => {
  const primaryAnchorByTemplate: Record<string, string> = {
    restaurant: 'booking',
    'corporate-consulting': 'contact',
    'luxury-skincare': '',
    'spa-salon': 'contact',
    'tattoo-artist': 'contact',
  };

  for (const templateId of BUSINESS_TEMPLATES) {
    const anchor = primaryAnchorByTemplate[templateId];
    if (!anchor) continue;
    const { starterPages } = buildTemplatePages(templateId, TEMPLATES_MAP[templateId]);
    for (const page of starterPages) {
      assert.ok(page.sections.some((section) => section.id === anchor), `${templateId} ${page.slug} includes #${anchor}`);
    }
  }
});

test('creator templates keep the original section-bucketing behaviour', () => {
  const creatorTemplates = Object.keys(TEMPLATES_MAP).filter((templateId) => !BUSINESS_TEMPLATES.includes(templateId));
  assert.ok(creatorTemplates.length > 0, 'creator templates are still present');

  for (const templateId of creatorTemplates) {
    const document = TEMPLATES_MAP[templateId];
    const { home, starterPages } = buildTemplatePages(templateId, document);
    assert.deepEqual(home.sections, document.sections, `${templateId} homepage remains intact`);
    assert.ok(starterPages.length > 0, `${templateId} has relevant starter pages`);
    assert.equal(new Set(starterPages.map((page) => page.slug)).size, starterPages.length, `${templateId} starter page URLs are unique`);

    for (const page of starterPages) {
      assert.equal(PageDocumentSchema.safeParse({ ...document, sections: page.sections }).success, true, `${templateId} ${page.slug} page stays valid`);
      assert.ok(page.sections.length > 1, `${templateId} ${page.slug} contains template content beyond its title`);
      const sourceIds = new Set(flattenSections(document.sections).map((section) => section.id));
      for (const section of page.sections.slice(1)) assert.ok(sourceIds.has(section.id), `${templateId} ${page.slug} reuses an existing section`);
    }
  }
});

test('template page sections remain reusable through the shared component registry', async () => {
  const { ComponentRegistry } = await import('./registry');

  for (const [templateId, document] of Object.entries(TEMPLATES_MAP)) {
    const { starterPages } = buildTemplatePages(templateId, document);
    for (const page of starterPages) {
      for (const section of page.sections) {
        assert.ok(ComponentRegistry[section.type], `${templateId} ${page.slug} ${section.type} is in the shared editor registry`);
      }
    }
  }
});
