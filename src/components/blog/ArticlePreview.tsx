'use client';

import { CalendarDays, Clock3 } from 'lucide-react';
import {
  formatEditorDate,
  getEditorReadingMinutes,
  getEditorWordCount,
} from '@/lib/blog-editor';
import type { BlogArticleDraft } from './types';

export function ArticlePreview({ article }: { article: BlogArticleDraft }) {
  const category = article.categories[0];
  const published = article.publishedAt || article.updatedAt;
  const reading = getEditorReadingMinutes(article.bodyHtml);
  const words = getEditorWordCount(article.bodyHtml);
  const authorInitials = article.authorName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <article className="mx-auto w-full max-w-[760px] px-5 py-10 sm:px-8 sm:py-14">
      <header className="mx-auto max-w-[680px]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8b82]">
          {category && <span className="text-[#6d7a5e]">{category}</span>}
          {category && <span className="h-1 w-1 rounded-full bg-[#c9c5ba]" />}
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" />
            {formatEditorDate(published) || 'Draft'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3 w-3" />
            {reading || 1} min read
          </span>
        </div>

        <h1 className="mt-5 font-serif text-[clamp(2.2rem,5.2vw,3.9rem)] leading-[0.98] tracking-[-0.045em] text-[#1b1c17]">
          {article.title.trim() || 'Untitled article'}
        </h1>

        {article.excerpt.trim() && (
          <p className="mt-6 max-w-[620px] text-[1.05rem] leading-8 text-[#6e6f67] sm:text-[1.15rem]">
            {article.excerpt.trim()}
          </p>
        )}

        <div className="mt-7 flex items-center gap-3 border-y border-[#ece9e1] py-3.5">
          {article.authorAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.authorAvatarUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#efede6] text-[11px] font-semibold text-[#5f6058]">
              {authorInitials || 'P'}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[#2d2e28]">
              {article.authorName.trim() || 'Pageory author'}
            </p>
            <p className="text-[11px] text-[#8a8b82]">{words} words</p>
          </div>
        </div>
      </header>

      {article.featuredImageUrl && (
        <figure className="mx-auto mt-9 max-w-[760px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.featuredImageUrl}
            alt={article.featuredImageAlt || ''}
            className="aspect-[16/9] w-full rounded-md object-cover"
          />
          {article.featuredImageAlt && (
            <figcaption className="mt-2.5 text-center text-[11px] text-[#8a8b82]">
              {article.featuredImageAlt}
            </figcaption>
          )}
        </figure>
      )}

      <div className="mx-auto mt-10 max-w-[680px]">
        {article.bodyHtml.trim() ? (
          <div className="article-prose" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
        ) : (
          <div className="rounded-xl border border-dashed border-[#d8d4c9] bg-[#fbfaf6] px-6 py-14 text-center">
            <p className="font-serif text-2xl text-[#2d2e28]">Nothing written yet.</p>
            <p className="mt-2 text-sm text-[#8a8b82]">
              Switch back to the editor and start shaping this article.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
