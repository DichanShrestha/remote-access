"use server";

import { generateObject } from 'ai';
import { getDefaultChatModel } from '@/lib/ai/providers';
import { PageDocumentSchema, PageSectionSchema } from '@/lib/page-engine/schemas';
import { ComponentRegistry } from '@/lib/page-engine/registry';
import { authService } from '@/services/auth';
import db from '@/lib/prisma';

export async function composePage(prompt: string, pageId: string) {
  if (pageId !== 'demo-id') {
    const user = await authService.requireCreator();

    // Basic usage accounting: ensure profile exists
    const profile = await db.profile.findUnique({
      where: { userId: user.id }
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Track usage (Chunk 7/8 requirement)
    await db.usage.upsert({
      where: { userId: user.id },
      create: { userId: user.id, pageGenerations: 1 },
      update: { pageGenerations: { increment: 1 } }
    });
  }

  const componentDescriptions = Object.entries(ComponentRegistry)
    .map(([type, meta]) => `- ${type}: ${meta.label}`)
    .join('\n');

  const { object } = await generateObject({
    model: getDefaultChatModel(),
    schema: PageDocumentSchema,
    system: `You are an expert web designer and copywriter building a premium "Pageory".
The user will provide an intent or content description.
You must generate a complete, beautiful page document adhering strictly to the schema.
Choose appropriate theme settings (colors, radius, style). Make the design WOW the user.
You may use ONLY the following component types:
${componentDescriptions}

Ensure the page has a logical flow (e.g., hero at top, then content, then links, FAQ at bottom).
Generate high-quality, conversion-optimized copy. Ensure unique IDs for all sections and items.`,
    prompt: prompt,
  });

  return object;
}

export async function editSection(prompt: string, section: any, pageId: string) {
  if (pageId !== 'demo-id') {
    const user = await authService.requireCreator();
    const profile = await db.profile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new Error("Profile not found");

    await db.usage.upsert({
      where: { userId: user.id },
      create: { userId: user.id, aiEdits: 1 },
      update: { aiEdits: { increment: 1 } }
    });
  }

  const { object } = await generateObject({
    model: getDefaultChatModel(),
    schema: PageSectionSchema,
    system: `You are an expert web editor and copywriter.
The user wants to edit a specific section of their Pageory.
Apply the user's requested changes and return the FULL updated section JSON.
CRITICAL: Do NOT change the section's 'id' or 'type'. 
Only modify the 'content' or 'layout' properties to fulfill the user's request.
Ensure your copy is highly engaging, grammatically perfect, and conversion-optimized.`,
    prompt: `Current Section JSON: ${JSON.stringify(section, null, 2)}\n\nUser Request: ${prompt}`,
  });

  return object;
}

