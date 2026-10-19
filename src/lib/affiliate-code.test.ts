import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAffiliateCode, validateCustomAffiliateCode } from './affiliate-code';

test('normalizes custom affiliate codes to uppercase', () => {
  assert.equal(normalizeAffiliateCode('  pageory-25  '), 'PAGEORY-25');
  assert.deepEqual(validateCustomAffiliateCode('pageory-25'), { code: 'PAGEORY-25' });
});

test('requires 4 to 24 characters', () => {
  assert.match(validateCustomAffiliateCode('abc').error || '', /4 to 24/);
  assert.match(validateCustomAffiliateCode('a'.repeat(25)).error || '', /4 to 24/);
});

test('accepts letters, numbers and internal hyphens only', () => {
  assert.deepEqual(validateCustomAffiliateCode('PAGE-25'), { code: 'PAGE-25' });
  assert.match(validateCustomAffiliateCode('-PAGE').error || '', /Start and end/);
  assert.match(validateCustomAffiliateCode('PAGE_25').error || '', /letters, numbers, and hyphens/);
  assert.match(validateCustomAffiliateCode('PAGE 25').error || '', /letters, numbers, and hyphens/);
});
