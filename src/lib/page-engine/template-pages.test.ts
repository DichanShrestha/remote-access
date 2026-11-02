import assert from 'node:assert/strict';
import test from 'node:test';
import { TEMPLATES_MAP } from './templates';
import { PageDocumentSchema, type PageNode, type PageSection } from './schemas';
import { buildTemplatePages } from './template-pages';

test('starter pages reuse substantive sections while preserving every homepage section', () => {
  const flattenSections = (nodes: PageNode[]): PageSection[] => nodes.flatMap((node) =>
    'kind' in node ? flattenSections(node.children) : [node],
  );
  for (const [templateId, document] of Object.entries(TEMPLATES_MAP)) {
    const { home, starterPages } = buildTemplatePages(templateId, document);
    assert.deepEqual(home.sections, document.sections, `${templateId} homepage remains intact`);
    assert.equal(PageDocumentSchema.safeParse(home).success, true, `${templateId} homepage stays valid`);
    assert.ok(starterPages.length > 0, `${templateId} has relevant starter pages`);
    assert.equal(new Set(starterPages.map((page) => page.slug)).size, starterPages.length, `${templateId} starter page URLs are unique`);

    for (const page of starterPages) {
      assert.equal(PageDocumentSchema.safeParse({ ...document, sections: page.sections }).success, true, `${templateId} ${page.slug} page stays valid`);
      assert.ok(page.sections.length > 1, `${templateId} ${page.slug} contains template content beyond its title`);
      const sourceIds = new Set(flattenSections(document.sections).map((section) => section.id));
      for (const section of page.sections.slice(1)) assert.ok(sourceIds.has(section.id), `${templateId} ${page.slug} uses an existing section`);
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
