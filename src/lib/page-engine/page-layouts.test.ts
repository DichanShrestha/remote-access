import test from 'node:test';
import assert from 'node:assert/strict';
import { PageDocumentSchema } from './schemas';
import { extractWebsiteConfig } from './site-config';
import { TEMPLATE_RESTAURANT } from './templates';
import { buildPageDocument } from './page-layouts';
import { CREATABLE_PAGE_TYPES, getPageLayouts } from './page-types';

const siteConfig = extractWebsiteConfig(PageDocumentSchema.parse(TEMPLATE_RESTAURANT));

test('every creatable page type and layout builds a valid page document', () => {
  for (const type of CREATABLE_PAGE_TYPES) {
    const layouts = getPageLayouts(type);
    assert.ok(layouts.length > 0, `expected layouts for ${type}`);

    for (const layout of layouts) {
      const document = buildPageDocument({
        type,
        layoutId: layout.id,
        pageTitle: layout.name,
        businessName: 'Acme Studio',
        bio: 'Thoughtful work, done well.',
        siteConfig,
      });

      const parsed = PageDocumentSchema.safeParse(document);
      assert.equal(parsed.success, true, `${type}/${layout.id} should be valid`);
      assert.ok(document.sections.length > 0, `${type}/${layout.id} should start with sections`);
      assert.equal(
        document.sections.some(
          (node) => 'type' in node && (node.type === 'site-navbar' || node.type === 'site-footer'),
        ),
        false,
        `${type}/${layout.id} should not persist shared chrome`,
      );
      assert.deepEqual(document.theme, siteConfig.theme);
      assert.equal(document.settings.seoTitle, `${layout.name} | Acme Studio`);
    }
  }
});

test('new page layouts never inherit another page type content', () => {
  const about = buildPageDocument({
    type: 'ABOUT',
    layoutId: 'story',
    pageTitle: 'About',
    businessName: 'Acme Studio',
    siteConfig,
  });
  const contact = buildPageDocument({
    type: 'CONTACT',
    layoutId: 'form',
    pageTitle: 'Contact',
    businessName: 'Acme Studio',
    siteConfig,
  });

  assert.equal(about.sections.some((node) => 'type' in node && node.type === 'lead-form'), false);
  assert.equal(contact.sections.some((node) => 'type' in node && node.type === 'lead-form'), true);
});
