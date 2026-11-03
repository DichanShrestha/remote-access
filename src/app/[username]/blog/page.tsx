import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock3 } from 'lucide-react';
import {
  PublicBlogChrome,
  PublicBlogUnavailable,
} from '@/components/blog/PublicBlogChrome';
import {
  blogArticlePath,
  blogListingUrl,
  formatBlogDate,
} from '@/lib/blog';
import { getPublicBlogListing } from '@/lib/public-blog';
import { resolveSiteUrl } from '@/lib/seo';

interface PublicBlogIndexProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const lookup = await getPublicBlogListing(username);
  if (lookup.status !== 'ok') {
    return { title: 'Journal not found', robots: { index: false, follow: false } };
  }

  const { profile } = lookup.data;
  const siteUrl = resolveSiteUrl();
  const indexable = profile.websitePublished && !profile.unavailable;
  const title = `${profile.displayName} — Writing`;
  const description =
    profile.bio?.trim() || `Read the latest writing from ${profile.displayName}.`;
  const canonical = blogListingUrl(siteUrl, profile.username);

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: indexable, follow: indexable },
    openGraph: {
      type: 'website',
      siteName: profile.displayName,
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function PublicBlogIndex({
  params,
  searchParams,
}: PublicBlogIndexProps) {
  const { username } = await params;
  const { page: pageParam } = await searchParams;
  const requestedPage = Number.parseInt(pageParam || '1', 10);
  const lookup = await getPublicBlogListing(
    username,
    Number.isFinite(requestedPage) ? requestedPage : 1,
  );

  if (lookup.status !== 'ok') notFound();

  const { profile, articles, page, pageCount, total } = lookup.data;
  const [featured, ...rest] = articles;

  return (
    <PublicBlogChrome
      username={profile.username}
      displayName={profile.displayName}
      active="writing"
    >
      {profile.unavailable ? (
        <PublicBlogUnavailable displayName={profile.displayName} />
      ) : (
        <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#e4e0d6] pb-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a2a398]">
                Journal
              </p>
              <h1 className="mt-2 font-serif text-[clamp(3.2rem,8vw,5.8rem)] leading-[0.9] tracking-[-0.055em] text-[#1b1c17]">
                Writing
              </h1>
            </div>
            <div className="max-w-sm pb-1">
              <p className="text-sm leading-6 text-[#77786f]">
                {profile.bio?.trim() ||
                  `Notes, stories and practical ideas from ${profile.displayName}.`}
              </p>
              {total > 0 && (
                <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[#a2a398]">
                  {total} {total === 1 ? 'article' : 'articles'}
                </p>
              )}
            </div>
          </div>

          {featured ? (
            <>
              <Link
                href={blogArticlePath(profile.username, featured.publicSlug)}
                className="group mt-9 grid overflow-hidden rounded-2xl border border-[#e4e0d6] bg-[#fffefb] transition hover:border-[#c8c3b6] md:grid-cols-[1.1fr_1fr]"
              >
                {featured.snapshot.featuredImageUrl ? (
                  <div className="relative order-first min-h-[220px] overflow-hidden bg-[#efede6] md:order-last md:min-h-[340px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featured.snapshot.featuredImageUrl}
                      alt={featured.snapshot.featuredImageAlt || ''}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                ) : (
                  <div className="order-first flex min-h-[180px] items-end bg-[#edeadf] p-6 md:order-last md:min-h-[340px]">
                    <span className="font-serif text-5xl leading-none tracking-[-0.05em] text-[#b9b4a6]">
                      {featured.snapshot.categories[0] || profile.displayName}
                    </span>
                  </div>
                )}

                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a9b92]">
                    {featured.snapshot.categories[0] && (
                      <>
                        <span className="text-[#6d7a5e]">
                          {featured.snapshot.categories[0]}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-[#c9c5ba]" />
                      </>
                    )}
                    <span>{formatBlogDate(featured.publishedAt)}</span>
                    <span className="h-1 w-1 rounded-full bg-[#c9c5ba]" />
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3 w-3" />
                      {Math.max(1, featured.snapshot.readingMinutes)} min
                    </span>
                  </div>

                  <h2 className="mt-4 font-serif text-[clamp(1.9rem,4vw,3rem)] leading-[1.02] tracking-[-0.04em] text-[#1b1c17]">
                    {featured.snapshot.title}
                  </h2>

                  {featured.snapshot.excerpt && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#77786f]">
                      {featured.snapshot.excerpt}
                    </p>
                  )}

                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[#4e5f42]">
                    Read article
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>

              {rest.length > 0 && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <Link
                      key={article.id}
                      href={blogArticlePath(profile.username, article.publicSlug)}
                      className="group flex flex-col overflow-hidden rounded-xl border border-[#e6e2d8] bg-[#fffefb] transition hover:border-[#c8c3b6]"
                    >
                      {article.snapshot.featuredImageUrl ? (
                        <div className="overflow-hidden bg-[#efede6]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={article.snapshot.featuredImageUrl}
                            alt={article.snapshot.featuredImageAlt || ''}
                            className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-[4/3] items-end bg-[#efece2] p-5">
                          <span className="font-serif text-3xl leading-none tracking-[-0.04em] text-[#c1bcae]">
                            {article.snapshot.categories[0] || 'Essay'}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#a2a398]">
                          {article.snapshot.categories[0] && (
                            <span className="text-[#6d7a5e]">
                              {article.snapshot.categories[0]}
                            </span>
                          )}
                          <span>{formatBlogDate(article.publishedAt)}</span>
                        </div>
                        <h2 className="mt-2 line-clamp-2 font-serif text-xl leading-[1.15] tracking-[-0.02em] text-[#1f201b]">
                          {article.snapshot.title}
                        </h2>
                        {article.snapshot.excerpt && (
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#85867d]">
                            {article.snapshot.excerpt}
                          </p>
                        )}
                        <span className="mt-auto pt-4 text-[10px] font-medium text-[#8a8b82]">
                          {Math.max(1, article.snapshot.readingMinutes)} min read
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-[#d8d4c9] bg-[#fffefb] px-6 py-20 text-center">
              <p className="font-serif text-3xl tracking-[-0.03em] text-[#2d2e28]">
                The first piece is on its way.
              </p>
              <p className="mt-2 text-sm text-[#8a8b82]">
                Published articles from {profile.displayName} will appear here.
              </p>
            </div>
          )}

          {pageCount > 1 && (
            <nav className="mt-10 flex items-center justify-between border-t border-[#e4e0d6] pt-5 text-xs">
              {page > 1 ? (
                <Link
                  href={`/${profile.username}/blog?page=${page - 1}`}
                  className="font-medium text-[#5f6058] hover:text-[#1f201b]"
                >
                  ← Newer
                </Link>
              ) : (
                <span />
              )}
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#a2a398]">
                Page {page} of {pageCount}
              </span>
              {page < pageCount ? (
                <Link
                  href={`/${profile.username}/blog?page=${page + 1}`}
                  className="font-medium text-[#5f6058] hover:text-[#1f201b]"
                >
                  Older →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </main>
      )}
    </PublicBlogChrome>
  );
}
