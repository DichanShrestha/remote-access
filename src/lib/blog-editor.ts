import { normalizePageSlug } from './page-engine/page-types';

/**
 * Client-safe helpers for the blog writing studio.
 *
 * These intentionally avoid `isomorphic-dompurify` and other server-oriented
 * imports so the editor can compute word counts, slugs and link validation
 * without pulling the sanitiser into the browser bundle.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};

export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&([a-z]+);/gi, (match, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? match)
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

export function getEditorWordCount(html: string | null | undefined): number {
  const text = htmlToPlainText(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export function getEditorReadingMinutes(html: string | null | undefined): number {
  const words = getEditorWordCount(html);
  if (!words) return 0;
  return Math.max(1, Math.ceil(words / 220));
}

export function slugifyArticleTitle(title: string): string {
  return normalizePageSlug(title).slice(0, 64).replace(/-+$/g, '') || 'article';
}

export function isValidArticleSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Accept the kinds of destinations a writer realistically pastes. Bare domains
 * are upgraded to https, while protocol-relative URLs are rejected.
 */
export function normalizeEditorHref(value: string): string {
  const href = value.trim();
  if (!href) return '';
  if (href.startsWith('//')) return '';
  if (/^(?:https?:|mailto:|tel:)/i.test(href)) return href;
  if (href.startsWith('#') || href.startsWith('/')) return href;
  if (/^[^\s/]+\.[^\s]+/.test(href)) return `https://${href}`;
  return href;
}

export function isValidEditorHref(value: string): boolean {
  const href = normalizeEditorHref(value);
  if (!href) return false;
  if (href.startsWith('#') || (href.startsWith('/') && !href.startsWith('//'))) return true;
  if (/^(?:mailto|tel):/i.test(href)) return true;
  try {
    const parsed = new URL(href);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function extractArticleHeadings(html: string | null | undefined): Array<{ level: 2 | 3; text: string }> {
  if (!html) return [];
  const headings: Array<{ level: 2 | 3; text: string }> = [];
  const pattern = /<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html))) {
    const text = htmlToPlainText(match[2]);
    if (text) headings.push({ level: match[1] === '3' ? 3 : 2, text });
  }
  return headings;
}

/**
 * Convert an imported plain-text or light Markdown draft into safe article HTML.
 * Everything is escaped first, so importing a file can never inject markup.
 */
export function plainTextToBlogHtml(value: string | null | undefined): string {
  if (!value) return '';
  const escape = (text: string) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const blocks: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];
  let paragraph: string[] = [];

  const flushList = () => {
    if (!listType || listItems.length === 0) {
      listType = null;
      listItems = [];
      return;
    }
    blocks.push(`<${listType}>${listItems.join('')}</${listType}>`);
    listType = null;
    listItems = [];
  };

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(`<p>${paragraph.join(' ')}</p>`);
    paragraph = [];
  };

  for (const rawLine of value.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length === 1 ? 2 : 3;
      blocks.push(`<h${level}>${escape(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = line.match(/^[-*+]\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || numbered) {
      flushParagraph();
      const nextType = bullet ? 'ul' : 'ol';
      if (listType !== nextType) {
        flushList();
        listType = nextType;
      }
      listItems.push(`<li>${escape((bullet || numbered)![1])}</li>`);
      continue;
    }

    flushList();
    paragraph.push(escape(line));
  }

  flushParagraph();
  flushList();
  return blocks.join('');
}

export function formatEditorDate(value: string | Date | null | undefined): string {  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatEditorDateTime(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export type EditorSaveState = 'saved' | 'unsaved' | 'saving' | 'error';

export function describeSaveState(state: EditorSaveState, lastSavedAt?: Date | string | null): string {
  if (state === 'saving') return 'Saving…';
  if (state === 'unsaved') return 'Unsaved changes';
  if (state === 'error') return 'Could not save';
  const saved = formatEditorDateTime(lastSavedAt);
  return saved ? `Saved ${saved}` : 'Saved';
}
