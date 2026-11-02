import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import { EditorShell } from '@/components/editor/EditorShell';
import { PageDocumentSchema } from '@/lib/page-engine/schemas';
import { TEMPLATE_CREATOR_PROFILE, TEMPLATES_MAP } from '@/lib/page-engine/templates';
import { applyWebsiteConfig } from '@/lib/page-engine/site-config';
import { getWebsiteConfig } from '@/lib/page-engine/site-store';

const DEFAULT_DEMO = TEMPLATE_CREATOR_PROFILE;

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ demo?: string; page?: string }> }) {
  const params = await searchParams;
  let user;
  try {
    user = await authService.requireUser();
  } catch {
    // For V1 testing before full login is complete, show a demo shell
    return <EditorShell initialDocument={DEFAULT_DEMO} pageId="demo-id" />;
  }

  // Allow ?demo=<template-id> for testing any template
  if (params.demo && TEMPLATES_MAP[params.demo]) {
    return <EditorShell initialDocument={TEMPLATES_MAP[params.demo]} pageId="demo-id" />;
  }

  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    include: {
      pages: { orderBy: [{ navOrder: 'asc' }, { createdAt: 'asc' }] },
    },
  });

  if (!profile) {
    return <EditorShell initialDocument={DEFAULT_DEMO} pageId="demo-id" />;
  }

  const home = profile.pages.find((page) => page.pageType === 'HOME' || page.slug === '');
  const target = params.page ? profile.pages.find((page) => page.id === params.page) : home;

  if (!target) {
    return <div>No page found for this profile.</div>;
  }

  let doc = PageDocumentSchema.safeParse(target.draftConfig);
  if (!doc.success) {
    doc = PageDocumentSchema.safeParse(DEFAULT_DEMO);
  }

  const pageDocument = doc.success ? doc.data : DEFAULT_DEMO;
  const { config } = await getWebsiteConfig(profile.id, 'draft', pageDocument);

  return (
    <EditorShell
      key={target.id}
      initialDocument={applyWebsiteConfig(pageDocument, config)}
      pageId={target.id}
    />
  );
}
