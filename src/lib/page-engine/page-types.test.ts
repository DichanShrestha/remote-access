import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CREATABLE_PAGE_TYPES,
  buildPagePath,
  isCreatablePageType,
  isPageLayoutForType,
  normalizePageSlug,
  slugifyPageTitle,
  validatePageSlug,
} from './page-types';

test('normalizes page titles and typed slugs into safe URL segments', () => {
  assert.equal(normalizePageSlug('  About   Our Studio!  '), 'about-our-studio');
  assert.equal(normalizePageSlug('Café & Co'), 'caf-co');
  assert.equal(slugifyPageTitle('Products / Menu'), 'products-menu');
  assert.equal(slugifyPageTitle('!!!'), 'page');
});

test('accepts clean page slugs and rejects unsafe or reserved URLs', () => {
  assert.deepEqual(validatePageSlug('about-us'), { valid: true, slug: 'about-us' });
  assert.equal(validatePageSlug('About Us').valid, false);
  assert.equal(validatePageSlug('home').valid, false);
  assert.equal(validatePageSlug('index').valid, false);
  assert.equal(validatePageSlug('').valid, false);
  assert.deepEqual(validatePageSlug('', { allowEmpty: true }), { valid: true, slug: '' });
});

test('keeps slug uniqueness scoped by building tenant-safe page paths', () => {
  assert.equal(buildPagePath('acme', ''), '/acme');
  assert.equal(buildPagePath('acme', 'about'), '/acme/about');
  assert.equal(buildPagePath('other', 'about'), '/other/about');
});

test('exposes only non-home page types and validates layouts per type', () => {
  assert.equal(isCreatablePageType('HOME'), false);
  assert.equal(isCreatablePageType('ABOUT'), true);
  assert.equal(CREATABLE_PAGE_TYPES.includes('HOME' as never), false);
  assert.equal(isPageLayoutForType('ABOUT', 'story'), true);
  assert.equal(isPageLayoutForType('ABOUT', 'grid'), false);
});
