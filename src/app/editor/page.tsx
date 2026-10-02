import { authService } from '@/services/auth';
import db from '@/db/prisma';
import { EditorShell } from '@/components/editor/EditorShell';
import { PageDocumentSchema } from '@/lib/page-engine/schemas';
import { TEMPLATE_CREATOR_PROFILE, TEMPLATES_MAP } from '@/lib/page-engine/templates';

const DEFAULT_DEMO = TEMPLATE_CREATOR_PROFILE;

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
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
    include: { page: true }
  });
  
  if (!profile) {
    return <EditorShell initialDocument={DEFAULT_DEMO} pageId="demo-id" />;
  }

  if (!profile.page) {
    return <div>No page found for this profile.</div>;
  }

  let doc = PageDocumentSchema.safeParse(profile.page.draftConfig);
  if (!doc.success) {
    doc = PageDocumentSchema.safeParse(DEFAULT_DEMO);
  }

  return (
    <EditorShell 
      initialDocument={doc.success ? doc.data : DEFAULT_DEMO} 
      pageId={profile.page.id} 
    />
  );
}
