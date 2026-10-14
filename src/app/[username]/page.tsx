import React from 'react';
import { notFound } from 'next/navigation';
import db from '@/lib/prisma';
import { PageRenderer } from '@/components/page-render/PageRenderer';
import { PageDocumentSchema } from '@/lib/page-engine/schemas';
import { TEMPLATE_CREATOR_PROFILE } from '@/lib/page-engine/templates';
import { getSmartPageEntitlement } from '@/lib/tier-limits';

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
      alternates: { canonical: '/demo' },
    };
  }
  const profile = await db.profile.findUnique({
    where: { username: username.toLowerCase() },
    include: { page: true, user: { include: { subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 } } } }
  });

  if (!profile || !profile.page || !profile.page.isPublished) {
    return { title: 'Page Not Found', robots: { index: false, follow: false } };
  }

  // Parse config safely
  const parsed = PageDocumentSchema.safeParse(profile.page.publishedConfig);
  if (!parsed.success) {
    return { title: profile.displayName || profile.username, robots: { index: false, follow: false } };
  }

  const { settings } = parsed.data;
  const entitlement = getSmartPageEntitlement(profile.user);
  const unavailable = entitlement.trialExpired && new Date() > entitlement.publicGraceEndsAt;
  const title = settings.seoTitle || (profile.displayName || profile.username);
  const description = settings.seoDescription || profile.bio || 'Discover this Pageory page.';

  return {
    title,
    description,
    alternates: { canonical: `/${profile.username}` },
    ...(unavailable ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: 'website',
      title,
      description,
      url: `https://pageory.app/${profile.username}`,
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

export default async function PublicPage({ params }: PublicPageProps) {
  const { username } = await params;

  // Hardcoded preview for "demo" user using the creator template (useful for early testing before DB is seeded)
  if (username.toLowerCase() === 'demo') {
    return <PageRenderer document={TEMPLATE_CREATOR_PROFILE} />;
  }


  const profile = await db.profile.findUnique({
    where: { username: username.toLowerCase() },
    include: { page: true, user: { include: { subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 } } } }
  });

  if (!profile || !profile.page || !profile.page.isPublished) {
    notFound();
  }

  const entitlement = getSmartPageEntitlement(profile.user);
  if (entitlement.trialExpired && new Date() > entitlement.publicGraceEndsAt) {
    return <div className="min-h-screen grid place-items-center bg-[#FDFCF8] p-6 text-center"><div><h1 className="font-serif text-3xl text-[#292A25]">This page is temporarily unavailable</h1><p className="mt-3 text-[#777970]">The owner can restore it by choosing a Pageory plan.</p></div></div>;
  }

  const parsed = PageDocumentSchema.safeParse(profile.page.publishedConfig);

  if (!parsed.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full border border-red-200 dark:border-red-900">
          <h2 className="text-2xl font-bold mb-2">Configuration Error</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">This page&apos;s configuration is invalid and cannot be displayed.</p>
          <pre className="text-left text-xs bg-slate-100 dark:bg-slate-900 p-4 rounded overflow-auto text-red-500">
            {parsed.error.message}
          </pre>
        </div>
      </div>
    );
  }

  return <PageRenderer document={parsed.data} pageId={profile.page.id} botId={profile.page.botId || undefined} />;
}
