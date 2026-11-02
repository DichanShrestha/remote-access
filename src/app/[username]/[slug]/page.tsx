import React from 'react';
import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/page-render/PageRenderer';
import { buildPagePath } from '@/lib/page-engine/page-types';
import { getPublishedPage } from '@/lib/public-page';

interface PublicSubPageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PublicSubPageProps) {
  const { username, slug } = await params;
  const lookup = await getPublishedPage(username, slug);
  if (lookup.status !== 'ok') {
    return { title: 'Page Not Found', robots: { index: false, follow: false } };
  }

  const { profile, page, document } = lookup.data;
  const { settings } = document;
  const title = settings.seoTitle || `${page.title || 'Page'} | ${profile.displayName || profile.username}`;
  const description = settings.seoDescription || profile.bio || `Visit the ${page.title || 'page'} page for ${profile.displayName || profile.username}.`;
  const path = buildPagePath(profile.username, page.slug);

  return {
    title,
    description,
    alternates: { canonical: path },
    ...(lookup.data.unavailable ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: 'website',
      title,
      description,
      url: `https://pageory.app${path}`,
      images: settings.ogImage ? [settings.ogImage] : undefined,
    },
    twitter: {
      card: settings.ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: settings.ogImage ? [settings.ogImage] : undefined,
    },
  };
}

export default async function PublicSubPage({ params }: PublicSubPageProps) {
  const { username, slug } = await params;
  const lookup = await getPublishedPage(username, slug);

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

  return <PageRenderer document={data.document} pageId={data.page.id} botId={data.homeBotId} />;
}
