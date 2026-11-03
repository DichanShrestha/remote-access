import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock3 } from 'lucide-react';
import {
  PublicBlogChrome,
  PublicBlogUnavailable,
} from '@/components/blog/PublicBlogChrome';
import { formatBlogDate, resolveBlogArticleSeo } from '@/lib/blog';
import { getPublicBlogArticle } from '@/lib/public-blog';
import { resolveSiteUrl } from '@/lib/seo';
import { buildBlogPostingGraph, serializeJsonLd } from '@/lib/schema';

interface PublicBlogArticleProps {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PublicBlogArticleProps): Promise<Metadata> {
  const { username, slug } = await params;
  const lookup = await getPublicBlogArticle(username, slug);
  if (lookup.status !== 'ok') {
    return { title: 'Article not found', robots: { index: false, follow: false } };
  }

  const { profile, article } = lookup.data;
  const seo = resolveBlogArticleSeo({
    siteUrl: resolveSiteUrl(),
    username: profile.username,
    displayName: profile.displayName,
    article: { ...article.snapshot, slug: article.publicSlug },
    indexable: profile.websitePublished && !profile.unavailable,
  });

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalUrl },
    robots: seo.robots,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
  };
}

export default async function PublicBlogArticle({
  params,
}: PublicBlogArticleProps) {
  const { username, slug } = await params;
  const lookup = await getPublicBlogArticle(username, slug);

  if (lookup.status !== 'ok') notFound();

  const { profile, article } = lookup.data;
  const snapshot = article.snapshot;
  const siteUrl = resolveSiteUrl();
  const seo = resolveBlogArticleSeo({ siteUrl, username: profile.username, displayName: profile.displayName, article: { ...snapshot, slug: article.publicSlug }, indexable: profile.websitePublished && !profile.unavailable });
  const jsonLd = buildBlogPostingGraph({ profile, article, canonicalUrl: seo.canonicalUrl, siteUrl });
  const authorName = snapshot.authorName.trim() || profile.displayName;
  const authorInitials =
    authorName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'P';

  return (
    <PublicBlogChrome
      username={profile.username}
      displayName={profile.displayName}
      active="writing"
    >
      {profile.unavailable ? (
        <PublicBlogUnavailable displayName={profile.displayName} />
      ) : (
        <main>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

          <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
            <Link
              href={`/${profile.username}/blog`}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#8a8b82] transition hover:text-[#292a25]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All writing
            </Link>

            <header className="mt-8">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a9b92]">
                {snapshot.categories[0] && (
                  <>
                    <span className="text-[#6d7a5e]">{snapshot.categories[0]}</span>
                    <span className="h-1 w-1 rounded-full bg-[#c9c5ba]" />
                  </>
                )}
                <span>{formatBlogDate(article.publishedAt)}</span>
                <span className="h-1 w-1 rounded-full bg-[#c9c5ba]" />
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  {Math.max(1, snapshot.readingMinutes)} min read
                </span>
              </div>

              <h1 className="mt-5 font-serif text-[clamp(2.4rem,6vw,4.3rem)] leading-[0.98] tracking-[-0.045em] text-[#1b1c17]">
                {snapshot.title}
              </h1>

              {snapshot.excerpt && (
                <p className="mt-6 max-w-[620px] text-[1.05rem] leading-8 text-[#6e6f67] sm:text-[1.15rem]">
                  {snapshot.excerpt}
                </p>
              )}

              <div className="mt-7 flex items-center gap-3 border-y border-[#ece9e1] py-3.5">
                {snapshot.authorAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={snapshot.authorAvatarUrl}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#efede6] text-[11px] font-semibold text-[#5f6058]">
                    {authorInitials}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#2d2e28]">
                    {authorName}
                  </p>
                  <p className="text-[11px] text-[#8a8b82]">
                    {formatBlogDate(snapshot.updatedAt)}
                  </p>
                </div>
              </div>
            </header>

            {snapshot.featuredImageUrl && (
              <figure className="mt-9">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={snapshot.featuredImageUrl}
                  alt={snapshot.featuredImageAlt || ''}
                  className="aspect-[16/9] w-full rounded-md object-cover"
                />
                {snapshot.featuredImageAlt && (
                  <figcaption className="mt-2.5 text-center text-[11px] text-[#8a8b82]">
                    {snapshot.featuredImageAlt}
                  </figcaption>
                )}
              </figure>
            )}

            <div
              className="article-prose mt-10"
              dangerouslySetInnerHTML={{ __html: snapshot.bodyHtml }}
            />

            {snapshot.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-1.5 border-t border-[#ece9e1] pt-6">
                {snapshot.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#e2dfd6] bg-[#fffefb] px-2.5 py-1 text-[10px] font-medium text-[#77786f]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <footer className="mt-10 rounded-2xl border border-[#e6e2d8] bg-[#fffefb] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#292a25] text-xs font-semibold text-[#f7f5ee]">
                  {authorInitials}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1f201b]">{authorName}</p>
                  <p className="mt-1 text-xs leading-5 text-[#85867d]">
                    More notes and stories from {profile.displayName}.
                  </p>
                  <Link
                    href={`/${profile.username}/blog`}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#4e5f42] hover:underline"
                  >
                    Read more writing →
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </main>
      )}
    </PublicBlogChrome>
  );
}
