import React from 'react';
import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/page-render/PageRenderer';
import { PageStructuredData } from '@/components/seo/PageStructuredData';
import { TEMPLATE_CREATOR_PROFILE } from '@/lib/page-engine/templates';
import { resolvePageSeo, resolveSiteUrl } from '@/lib/seo';
import { getPublishedPage } from '@/lib/public-page';

interface PublicPageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: PublicPageProps) {
  const { username } = await params;
  if (username.toLowerCase() === 'demo') {
    return {
      title: 'Pageory Demo Page',
      description: 'Explore a sample personal page built with Pageory.',
      alternates: { canonical: `${resolveSiteUrl()}/demo` },
      robots: { index: false, follow: false },
      openGraph: {
        type: 'website',
        title: 'Pageory Demo Page',
        description: 'Explore a sample personal page built with Pageory.',
        url: `${resolveSiteUrl()}/demo`,
        images: [{ url: `${resolveSiteUrl()}/logo.png`, alt: 'Pageory' }],
      },
    };
  }

  const lookup = await getPublishedPage(username);
  if (lookup.status !== 'ok') {
    return { title: 'Page Not Found', robots: { index: false, follow: false } };
  }

  const { profile, page, document, unavailable, websitePublished } = lookup.data;
  const seo = resolvePageSeo({
    siteUrl: resolveSiteUrl(),
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    page: { title: page.title, slug: page.slug, pageType: page.pageType },
    document,
    indexable: websitePublished && !unavailable,
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

export default async function PublicPage({ params }: PublicPageProps) {
  const { username } = await params;

  // Hardcoded preview for "demo" user using the creator template (useful for early testing before DB is seeded)
  if (username.toLowerCase() === 'demo') {
    return <PageRenderer document={TEMPLATE_CREATOR_PROFILE} />;
  }

  const lookup = await getPublishedPage(username);
  if (lookup.status === 'not-found') notFound();
  if (lookup.status === 'invalid-config') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full border border-red-200 dark:border-red-900">
          <h2 className="text-2xl font-bold mb-2">Configuration Error</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">This page&apos;s configuration is invalid and cannot be displayed.</p>
        </div>
      </div>
    );
  }

  const { data } = lookup;
  if (data.unavailable) {
    return <div className="min-h-screen grid place-items-center bg-[#FDFCF8] p-6 text-center"><div><h1 className="font-serif text-3xl text-[#292A25]">This page is temporarily unavailable</h1><p className="mt-3 text-[#777970]">The owner can restore it by choosing a Pageory plan.</p></div></div>;
  }

  const seo = resolvePageSeo({
    siteUrl: resolveSiteUrl(),
    username: data.profile.username,
    displayName: data.profile.displayName,
    bio: data.profile.bio,
    page: { title: data.page.title, slug: data.page.slug, pageType: data.page.pageType },
    document: data.document,
    indexable: data.websitePublished,
  });

  return (
    <>
      <PageStructuredData seo={seo} username={data.profile.username} updatedAt={data.page.updatedAt} />
      <PageRenderer document={data.document} pageId={data.page.id} botId={data.homeBotId} />
    </>
  );
}
