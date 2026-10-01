import { authService } from '@/services/auth';
import db from '@/db/prisma';
import { EditorShell } from '@/components/editor/EditorShell';
import { PageDocumentSchema } from '@/lib/page-engine/schemas';
import { CREATOR_DEMO } from '@/lib/page-engine/templates';

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const params = await searchParams;
  let user;
  try {
    user = await authService.requireUser();
  } catch {
    // For V1 testing before full login is complete, show a demo shell
    return <EditorShell initialDocument={CREATOR_DEMO} pageId="demo-id" />;
  }

  // Allow ?demo=creator or ?demo=business for testing
  if (params.demo === 'creator' || params.demo === 'business') {
    const { BUSINESS_DEMO } = await import('@/lib/page-engine/templates');
    const demoDoc = params.demo === 'business' ? BUSINESS_DEMO : CREATOR_DEMO;
    return <EditorShell initialDocument={demoDoc} pageId="demo-id" />;
  }

  const profile = await db.profile.findUnique({ 
    where: { userId: user.id }, 
    include: { page: true }
  });
  
  if (!profile) {
    return <EditorShell initialDocument={CREATOR_DEMO} pageId="demo-id" />;
  }

  if (!profile.page) {
    return <div>No page found for this profile.</div>;
  }

  let doc = PageDocumentSchema.safeParse(profile.page.draftConfig);
  if (!doc.success) {
    doc = PageDocumentSchema.safeParse(CREATOR_DEMO);
  }

  return (
    <EditorShell 
      initialDocument={doc.success ? doc.data : CREATOR_DEMO} 
      pageId={profile.page.id} 
    />
  );
}
