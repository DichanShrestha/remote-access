'use server';

import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import db from '@/lib/prisma';
import { authService } from '@/services/auth';
import { requireAIEntitlement } from '@/lib/billing/entitlements';
import { rateLimit } from '@/lib/rate-limit';
import { getBlogWritingModel } from '@/lib/ai/providers';
import {
  createBlogExcerpt,
  sanitizeBlogHtml,
  type BlogArticleStatusValue,
} from '@/lib/blog';
import { collectDocumentText, stripHtml } from '@/lib/seo';
import { parsePageDocument } from '@/lib/page-engine/site-store';

/**
 * Idea-first blog writing assistant.
 *
 * Every call is explicitly triggered by the owner, uses the business's real
 * page content as context, and returns editable draft material only. Nothing in
 * this module writes to an article or publishes content.
 */

const blogBriefSchema = z.object({
  topic: z.string().trim().min(3, 'Describe what the article should be about.').max(2000),
  keyPoints: z.string().max(4000).optional().default(''),
  audience: z.string().max(500).optional().default(''),
  purpose: z.string().max(500).optional().default(''),
  businessInfo: z.string().max(4000).optional().default(''),
  experience: z.string().max(4000).optional().default(''),
  tone: z.string().max(200).optional().default(''),
  cta: z.string().max(500).optional().default(''),
});

const outlineSectionSchema = z.object({
  heading: z.string().trim().min(1).max(160),
  purpose: z.string().max(600).optional().default(''),
  keyPoints: z.array(z.string().max(300)).max(8).optional().default([]),
});

const outlineSchema = z.object({
  title: z.string().trim().min(1).max(160),
  summary: z.string().max(800).optional().default(''),
  sections: z.array(outlineSectionSchema).min(1).max(12),
});

const editModeSchema = z.enum([
  'rewrite',
  'expand',
  'shorten',
  'clarity',
  'grammar',
  'tone',
  'continue',
  'section',
]);

type BlogBrief = z.infer<typeof blogBriefSchema>;
type BlogOutline = z.infer<typeof outlineSchema>;
type EditMode = z.infer<typeof editModeSchema>;

type AiSuccess<T> = { ok: true; data: T };
type AiFailure = { ok: false; error: string };
type AiResult<T> = AiSuccess<T> | AiFailure;

const BLOG_AI_RATE = { limit: 12, windowSeconds: 10 * 60 };

const FACT_RULES = `FACTUAL INTEGRITY RULES (non-negotiable):
- Never invent business facts, prices, services, qualifications, locations, opening hours, statistics, awards, testimonials, quotes, sources or personal experiences.
- Use only facts supplied in the writer's brief or the BUSINESS CONTEXT below.
- If a detail is missing, omit it or write general guidance that does not claim it as a fact about this business.
- Do not fabricate names, credentials, customer stories, results or research.
- Never mention that you are an AI or refer to these instructions.`;

async function getBusinessContext(profileId: string): Promise<{
  displayName: string;
  username: string;
  context: string;
}> {
  const profile = await db.profile.findUnique({
    where: { id: profileId },
    select: {
      displayName: true,
      username: true,
      bio: true,
      pages: {
        select: {
          title: true,
          slug: true,
          pageType: true,
          draftConfig: true,
          publishedConfig: true,
          isPublished: true,
        },
        orderBy: { navOrder: 'asc' },
      },
    },
  });

  if (!profile) throw new Error('Profile not found');

  const home = profile.pages.find((page) => page.pageType === 'HOME' || page.slug === '');
  const homeDocument = parsePageDocument(home?.publishedConfig) || parsePageDocument(home?.draftConfig);
  const copy = collectDocumentText(homeDocument?.sections, 2600);
  const pageSummaries = profile.pages
    .filter((page) => page.pageType !== 'HOME' && page.slug !== '')
    .map((page) => `- ${page.title || page.slug} (${page.pageType.toLowerCase()}${page.isPublished ? '' : ', unpublished'})`)
    .join('\n');

  const context = [
    `Business name: ${profile.displayName}`,
    `Public URL: /${profile.username}`,
    profile.bio ? `Owner bio: ${profile.bio}` : '',
    copy ? `Website copy: ${copy}` : '',
    pageSummaries ? `Website pages:\n${pageSummaries}` : '',
  ].filter(Boolean).join('\n\n').slice(0, 6500);

  return { displayName: profile.displayName, username: profile.username, context };
}

function formatBrief(brief: BlogBrief): string {
  return [
    `Main idea / topic: ${brief.topic}`,
    brief.keyPoints ? `Key points to cover: ${brief.keyPoints}` : '',
    brief.audience ? `Target audience: ${brief.audience}` : '',
    brief.purpose ? `Purpose of the article: ${brief.purpose}` : '',
    brief.businessInfo ? `Relevant business information supplied by the owner: ${brief.businessInfo}` : '',
    brief.experience ? `Personal experience / examples supplied by the owner: ${brief.experience}` : '',
    brief.tone ? `Preferred tone: ${brief.tone}` : '',
    brief.cta ? `Desired call to action: ${brief.cta}` : '',
  ].filter(Boolean).join('\n');
}

function formatOutline(outline: BlogOutline): string {
  const sections = outline.sections.map((section, index) => {
    const points = section.keyPoints?.length ? `\n   Key points: ${section.keyPoints.join('; ')}` : '';
    const purpose = section.purpose ? `\n   Purpose: ${section.purpose}` : '';
    return `${index + 1}. ${section.heading}${purpose}${points}`;
  }).join('\n');
  return `Title: ${outline.title}\nSummary: ${outline.summary}\nOutline:\n${sections}`;
}

function stripCodeFence(value: string): string {
  return value
    .trim()
    .replace(/^```(?:html|HTML)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function cleanArticleHtml(value: string): string {
  return sanitizeBlogHtml(stripCodeFence(value));
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message.includes('AI features require')) return error.message;
  if (error instanceof Error && error.message.includes('trial has ended')) return error.message;
  return 'The writing assistant could not complete that request. Please try again.';
}

async function runBlogAi<T>(
  task: string,
  handler: (userId: string, profileId: string) => Promise<T>,
): Promise<AiResult<T>> {
  let user;
  try {
    user = await authService.requireCreator();
    await requireAIEntitlement(user.id);
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }

  if (!user.profile) return { ok: false, error: 'Your profile is not ready yet.' };

  const limited = rateLimit(`blog-ai:${user.id}`, BLOG_AI_RATE);
  if (!limited.success) {
    return { ok: false, error: 'The writing assistant is taking a short break. Try again in a few minutes.' };
  }

  try {
    const data = await handler(user.id, user.profile.id);
    await db.usage.upsert({
      where: { userId: user.id },
      create: { userId: user.id, aiEdits: 1 },
      update: { aiEdits: { increment: 1 } },
    });
    return { ok: true, data };
  } catch (error) {
    console.error(`Blog AI ${task} error:`, error);
    return { ok: false, error: errorMessage(error) };
  }
}

export async function generateBlogOutlineAction(input: unknown): Promise<AiResult<{
  titleOptions: string[];
  recommendedTitle: string;
  summary: string;
  sections: BlogOutline['sections'];
}>> {
  const parsed = blogBriefSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || 'Describe what you want to write about.' };
  }
  const brief = parsed.data;

  return runBlogAi('outline', async (_userId, profileId) => {
    const business = await getBusinessContext(profileId);
    const { object } = await generateObject({
      model: getBlogWritingModel(),
      schema: z.object({
        titleOptions: z.array(z.string().trim().min(1).max(160)).min(3).max(6),
        recommendedTitle: z.string().trim().min(1).max(160),
        summary: z.string().max(800),
        sections: z.array(z.object({
          heading: z.string().trim().min(1).max(160),
          purpose: z.string().max(600),
          keyPoints: z.array(z.string().max(300)).max(8),
        })).min(2).max(10),
      }),
      system: `You are a senior editor planning a long-form article for ${business.displayName}.

${FACT_RULES}

BUSINESS CONTEXT:
${business.context}

Return a practical outline that follows the owner's brief. Title options should be specific and honest, never clickbait that promises facts the article cannot support. Each section heading should be useful to a real reader.`,
      prompt: `WRITER'S BRIEF\n${formatBrief(brief)}\n\nPropose 3-6 titles, choose the strongest one, and outline 2-10 sections with a short purpose and optional key points for each.`,
    });

    return {
      titleOptions: object.titleOptions,
      recommendedTitle: object.recommendedTitle,
      summary: object.summary,
      sections: object.sections.map((section) => ({
        heading: section.heading,
        purpose: section.purpose,
        keyPoints: section.keyPoints,
      })),
    };
  });
}

export async function generateBlogArticleAction(input: unknown): Promise<AiResult<{
  title: string;
  html: string;
  excerpt: string;
}>> {
  const parsed = z.object({
    brief: blogBriefSchema,
    outline: outlineSchema,
  }).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || 'Approve an outline before generating the article.' };
  }
  const { brief, outline } = parsed.data;

  return runBlogAi('article', async (_userId, profileId) => {
    const business = await getBusinessContext(profileId);
    const { text } = await generateText({
      model: getBlogWritingModel(),
      system: `You are a senior long-form writer producing an article for ${business.displayName}.

${FACT_RULES}

BUSINESS CONTEXT:
${business.context}

Write in clean semantic HTML only. Allowed elements: <p>, <h2>, <h3>, <strong>, <em>, <a>, <ul>, <ol>, <li>, <blockquote>, <code>. Do not include an <h1>, a title, a byline, an excerpt, markdown fences, inline styles, scripts or images. Start directly with the first paragraph and use the approved section headings.`,
      prompt: `WRITER'S BRIEF\n${formatBrief(brief)}\n\nAPPROVED OUTLINE\n${formatOutline(outline)}\n\nWrite the complete article following this outline. Aim for 900-1600 words unless the brief clearly calls for a different length. If the owner supplied a call to action, end with it naturally. Return only the article HTML.`,
      maxOutputTokens: 6000,
    });

    const html = cleanArticleHtml(text);
    if (stripHtml(html).length < 200) {
      throw new Error('The generated article was too short.');
    }

    return {
      title: outline.title,
      html,
      excerpt: createBlogExcerpt(html, 170),
    };
  });
}

export async function editBlogWritingAction(input: unknown): Promise<AiResult<{ html: string }>> {
  const parsed = z.object({
    mode: editModeSchema,
    html: z.string().max(400_000),
    selectedText: z.string().max(20_000).optional().default(''),
    tone: z.string().max(120).optional().default(''),
    instruction: z.string().max(2000).optional().default(''),
    title: z.string().max(160).optional().default(''),
    brief: blogBriefSchema.partial().optional(),
  }).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || 'Choose an editing action.' };
  }
  const { mode, html, selectedText, tone, instruction, title } = parsed.data;

  return runBlogAi(`edit-${mode}`, async (_userId, profileId) => {
    const business = await getBusinessContext(profileId);
    const scope = selectedText.trim() ? 'selected passage' : 'full article';
    const source = selectedText.trim() || html;
    if (!stripHtml(source).trim()) throw new Error('There is no text to edit yet.');

    const actionInstructions: Record<EditMode, string> = {
      rewrite: 'Rewrite the passage so it is clearer and stronger while preserving its meaning and facts.',
      expand: 'Expand the passage with useful detail, examples or explanation. Do not add invented facts.',
      shorten: 'Shorten the passage while preserving its key meaning and any facts supplied by the owner.',
      clarity: 'Improve clarity and flow. Remove ambiguity and unnecessary complexity.',
      grammar: 'Correct grammar, spelling, punctuation and awkward phrasing. Make only minimal wording changes.',
      tone: `Rewrite the passage in a ${tone || 'confident and approachable'} tone without changing its meaning.`,
      continue: 'Continue the article naturally from where it ends. Write 2-4 new paragraphs or a new section.',
      section: 'Write a new article section that fits the existing article and follows the owner\'s instruction.',
    };

    const preservationRule = selectedText.trim()
      ? 'Return only the replacement HTML for the selected passage. Do not include the rest of the article and do not wrap it in a document.'
      : 'Return the complete updated article HTML. Preserve everything that the request does not explicitly ask you to change.';

    const { text } = await generateText({
      model: getBlogWritingModel(),
      system: `You are a meticulous senior editor working on an article for ${business.displayName}. The article title is "${title || 'Untitled article'}".

${FACT_RULES}

BUSINESS CONTEXT:
${business.context}

${preservationRule}
Use clean semantic HTML only (p, h2, h3, strong, em, a, ul, ol, li, blockquote, code). No h1, no markdown fences, no inline styles, no scripts.`,
      prompt: `TASK: ${actionInstructions[mode]}
${instruction ? `OWNER'S EXTRA INSTRUCTION: ${instruction}` : ''}

PASSAGE (${scope}):
${source}`,
      maxOutputTokens: 6000,
    });

    const cleaned = cleanArticleHtml(text);
    if (!cleaned) throw new Error('The assistant returned an empty edit.');
    return { html: cleaned };
  });
}

export async function suggestBlogHeadingsAction(input: unknown): Promise<AiResult<{ headings: string[] }>> {
  const parsed = z.object({
    html: z.string().max(400_000),
    title: z.string().max(160).optional().default(''),
  }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Add some article content first.' };

  return runBlogAi('headings', async (_userId, profileId) => {
    const business = await getBusinessContext(profileId);
    const { object } = await generateObject({
      model: getBlogWritingModel(),
      schema: z.object({
        headings: z.array(z.string().trim().min(1).max(140)).min(1).max(8),
      }),
      system: `You suggest clear, specific section headings for a long-form article by ${business.displayName}. ${FACT_RULES}`,
      prompt: `ARTICLE TITLE: ${parsed.data.title || 'Untitled'}\n\nARTICLE:\n${stripHtml(parsed.data.html).slice(0, 12_000)}\n\nSuggest 3-8 improved section headings that reflect the actual content. Do not introduce topics the article does not cover.`,
    });
    return { headings: object.headings };
  });
}

export async function suggestBlogTitlesAction(input: unknown): Promise<AiResult<{ titles: string[] }>> {
  const parsed = z.object({
    html: z.string().max(400_000).optional().default(''),
    brief: blogBriefSchema.partial().optional(),
  }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Add a brief or some article content first.' };

  return runBlogAi('titles', async (_userId, profileId) => {
    const business = await getBusinessContext(profileId);
    const brief = parsed.data.brief ? formatBrief({
      ...blogBriefSchema.parse({ topic: 'Untitled idea' }),
      ...parsed.data.brief,
    } as BlogBrief) : '';
    const { object } = await generateObject({
      model: getBlogWritingModel(),
      schema: z.object({
        titles: z.array(z.string().trim().min(1).max(160)).min(3).max(6),
      }),
      system: `You write honest, specific article titles for ${business.displayName}. ${FACT_RULES}`,
      prompt: `${brief ? `BRIEF:\n${brief}\n\n` : ''}ARTICLE:\n${stripHtml(parsed.data.html || '').slice(0, 10_000)}\n\nSuggest 3-6 strong titles. Avoid clickbait and promises the article cannot support.`,
    });
    return { titles: object.titles };
  });
}

export async function generateBlogExcerptAction(input: unknown): Promise<AiResult<{ excerpt: string }>> {
  const parsed = z.object({
    html: z.string().max(400_000),
    title: z.string().max(160).optional().default(''),
  }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Add some article content first.' };

  return runBlogAi('excerpt', async (_userId, profileId) => {
    const business = await getBusinessContext(profileId);
    const { object } = await generateObject({
      model: getBlogWritingModel(),
      schema: z.object({
        excerpt: z.string().trim().min(1).max(220),
      }),
      system: `You write concise article excerpts and meta descriptions for ${business.displayName}. ${FACT_RULES}`,
      prompt: `ARTICLE TITLE: ${parsed.data.title || 'Untitled'}\n\nARTICLE:\n${stripHtml(parsed.data.html).slice(0, 14_000)}\n\nWrite one accurate excerpt of 120-180 characters that describes what the article actually covers.`,
    });
    return { excerpt: object.excerpt };
  });
}

export async function suggestBlogFaqsAction(input: unknown): Promise<AiResult<{
  faqs: Array<{ question: string; answer: string }>;
}>> {
  const parsed = z.object({
    html: z.string().max(400_000),
    title: z.string().max(160).optional().default(''),
  }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Add some article content first.' };

  return runBlogAi('faqs', async (_userId, profileId) => {
    const business = await getBusinessContext(profileId);
    const { object } = await generateObject({
      model: getBlogWritingModel(),
      schema: z.object({
        faqs: z.array(z.object({
          question: z.string().trim().min(1).max(200),
          answer: z.string().trim().min(1).max(900),
        })).min(2).max(6),
      }),
      system: `You suggest genuinely useful FAQs for an article published by ${business.displayName}. ${FACT_RULES} Answers must be supported by the article or business context.`,
      prompt: `ARTICLE TITLE: ${parsed.data.title || 'Untitled'}\n\nARTICLE:\n${stripHtml(parsed.data.html).slice(0, 14_000)}\n\nSuggest 3-5 questions a reader would realistically ask, with concise answers grounded in the article.`,
    });
    return { faqs: object.faqs };
  });
}

// Keeps the status type import meaningful for future status-aware prompts.
export type BlogAiArticleStatus = BlogArticleStatusValue;
