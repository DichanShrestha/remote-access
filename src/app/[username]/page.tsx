import React from 'react';
import { notFound } from 'next/navigation';
import db from '@/db/prisma';
import { PageRenderer } from '@/components/page-render/PageRenderer';
import { PageDocumentSchema } from '@/lib/page-engine/schemas';
import { TEMPLATE_CREATOR_PROFILE, TEMPLATE_LOCAL_SERVICE } from '@/lib/page-engine/templates';

interface PublicPageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: PublicPageProps) {
  const { username } = await params;
  const profile = await db.profile.findUnique({
    where: { username: username.toLowerCase() },
    include: { page: true }
  });

  if (!profile || !profile.page || !profile.page.isPublished) {
    return { title: 'Page Not Found' };
  }

  // Parse config safely
  const parsed = PageDocumentSchema.safeParse(profile.page.publishedConfig);
  if (!parsed.success) {
    return { title: profile.displayName };
  }

  const { settings } = parsed.data;

  return {
    title: settings.seoTitle || `${profile.displayName} | Smart Pages`,
    description: settings.seoDescription || profile.bio,
    openGraph: {
      images: settings.ogImage ? [settings.ogImage] : [],
    }
  };
}

export default async function PublicPage({ params }: PublicPageProps) {
  const { username } = await params;
  
  // Hardcoded preview for "demo" user using the creator template (useful for early testing before DB is seeded)
  if (username.toLowerCase() === 'demo') {
    return <PageRenderer document={TEMPLATE_CREATOR_PROFILE} />;
  }
  
  if (username.toLowerCase() === 'acme') {
    return <PageRenderer document={TEMPLATE_LOCAL_SERVICE} />;
  }

  const profile = await db.profile.findUnique({
    where: { username: username.toLowerCase() },
    include: { page: true }
  });

  if (!profile || !profile.page || !profile.page.isPublished) {
    notFound();
  }

  const parsed = PageDocumentSchema.safeParse(profile.page.publishedConfig);
  
  if (!parsed.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full border border-red-200 dark:border-red-900">
          <h2 className="text-2xl font-bold mb-2">Configuration Error</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">This page's configuration is invalid and cannot be displayed.</p>
          <pre className="text-left text-xs bg-slate-100 dark:bg-slate-900 p-4 rounded overflow-auto text-red-500">
            {parsed.error.message}
          </pre>
        </div>
      </div>
    );
  }

  return <PageRenderer document={parsed.data} />;
}
