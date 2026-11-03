import test from 'node:test';
import assert from 'node:assert/strict';
import {
  describeSaveState,
  extractArticleHeadings,
  getEditorReadingMinutes,
  getEditorWordCount,
  htmlToPlainText,
  isValidArticleSlug,
  isValidEditorHref,
  normalizeEditorHref,
  plainTextToBlogHtml,
  slugifyArticleTitle,
} from './blog-editor';

test('converts editor HTML into readable text for counts and previews', () => {
  assert.equal(
    htmlToPlainText('<h2>Hello&nbsp;world</h2><p>Tom &amp; Jerry &#39;live&#39; here.</p>'),
    "Hello world Tom & Jerry 'live' here.",
  );
  assert.equal(htmlToPlainText(''), '');
});

test('counts words and reading time without counting markup', () => {
  const html = '<h2>One</h2><p>' + Array.from({ length: 440 }, () => 'word').join(' ') + '</p>';
  assert.equal(getEditorWordCount(html), 441);
  assert.equal(getEditorReadingMinutes(html), 3);
  assert.equal(getEditorReadingMinutes(''), 0);
});

test('creates safe article slugs from titles', () => {
  assert.equal(slugifyArticleTitle('  A Better Way to Publish!  '), 'a-better-way-to-publish');
  assert.equal(slugifyArticleTitle('!!!'), 'article');
  assert.equal(isValidArticleSlug('a-better-way'), true);
  assert.equal(isValidArticleSlug('A Better Way'), false);
  assert.equal(isValidArticleSlug('trailing-'), false);
});

test('normalises and validates editor links', () => {
  assert.equal(normalizeEditorHref('example.com/post'), 'https://example.com/post');
  assert.equal(normalizeEditorHref('/about'), '/about');
  assert.equal(normalizeEditorHref('#section'), '#section');
  assert.equal(normalizeEditorHref('//evil.example'), '');
  assert.equal(isValidEditorHref('https://example.com'), true);
  assert.equal(isValidEditorHref('mailto:hi@example.com'), true);
  assert.equal(isValidEditorHref('javascript:alert(1)'), false);
});

test('extracts a usable outline from heading tags', () => {
  assert.deepEqual(
    extractArticleHeadings('<h2>First</h2><p>x</p><h3><strong>Second</strong></h3><h2>Third</h2>'),
    [
      { level: 2, text: 'First' },
      { level: 3, text: 'Second' },
      { level: 2, text: 'Third' },
    ],
  );
});

test('describes save state for the studio header', () => {  assert.equal(describeSaveState('saving'), 'Saving…');
  assert.equal(describeSaveState('unsaved'), 'Unsaved changes');
  assert.equal(describeSaveState('error'), 'Could not save');
  assert.equal(describeSaveState('saved'), 'Saved');
});

test('turns imported drafts into safe article HTML', () => {
  assert.equal(
    plainTextToBlogHtml('# Title\n\nFirst line\nsecond line\n\n- one\n- two\n\n1. first\n2. second'),
    '<h2>Title</h2><p>First line second line</p><ul><li>one</li><li>two</li></ul><ol><li>first</li><li>second</li></ol>',
  );
  assert.equal(plainTextToBlogHtml('<script>alert(1)</script>'), '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
  assert.equal(plainTextToBlogHtml(''), '');
});
