'use server';

import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import db from '@/lib/prisma';
import { authService } from '@/services/auth';
import { requireAIEntitlement } from '@/lib/billing/entitlements';
import { GrowthQuotaError, reserveGrowthAI } from '@/lib/billing/growth-quotas';
import { rateLimit } from '@/lib/rate-limit';
import { getBlogWritingModel } from '@/lib/ai/providers';
import { readAiUsage, type AiUsageSummary } from '@/lib/ai/usage';
import {
  blogArticlePath,
  createBlogExcerpt,
  escapeHtmlText,
  sanitizeBlogHtml,
  sanitizeBlogInlineHtml,
} from '@/lib/blog';
import { extractArticleHeadings } from '@/lib/blog-editor';
import { buildPagePath } from '@/lib/page-engine/page-types';
import { collectDocumentText, stripHtml } from '@/lib/seo';
import { parsePageDocument } from '@/lib/page-engine/site-store';

/**
 * Idea-first blog writing studio actions.
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

function truncateAtWord(value: string, max: number): string {
  const text = value.trim();
  if (text.length <= max) return text;
  const available = Math.max(0, max - 1);
  const cut = text.slice(0, available);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > available * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.trimEnd()}…`;
}

const editModeSchema = z.enum([
  'rewrite',
  'expand',
  'shorten',
  'clarity',
  'grammar',
  'tone',
  'continue',
  'headings',
  'section',
]);

type BlogBrief = z.infer<typeof blogBriefSchema>;
type EditMode = z.infer<typeof editModeSchema>;

type AiSuccess<T> = { ok: true; data: T; usage: AiUsageSummary; quota?: { used: number; limit: number; renewsAt: string; warning?: 'low' | 'limit' } };
type AiFailure = { ok: false; error: string };
type AiResult<T> = AiSuccess<T> | AiFailure;
type AiHandlerResult<T> = { data: T; usage: AiUsageSummary };

// The studio workflow is explicitly user-driven, but a complete draft can take
// several calls (keywords, outline, article, edits, finishing). The window is
// intentionally generous while still protecting against runaway loops.
const BLOG_AI_RATE = { limit: 24, windowSeconds: 10 * 60 };

const FACT_RULES = `FACTUAL INTEGRITY RULES (non-negotiable):
- Never invent business facts, prices, services, qualifications, locations, opening hours, statistics, awards, testimonials, quotes, sources or personal experiences.
- Use only facts supplied in the writer's brief or the BUSINESS CONTEXT below.
- If a detail is missing, omit it or write general guidance that does not claim it as a fact about this business.
- Do not fabricate names, credentials, customer stories, results or research.
- Never mention that you are an AI or refer to these instructions.`;

class BlogAiNotice extends Error {}

function notice(message: string): never {
  throw new BlogAiNotice(message);
}

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
    .map(
      (page) =>
        `- ${page.title || page.slug} (${page.pageType.toLowerCase()}${page.isPublished ? '' : ', unpublished'}) — ${buildPagePath(profile.username, page.slug)}`,
    )
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
    `User's brief (idea, knowledge, experience, opinions and key points to use — do not invent additional facts): ${brief.topic}`,
    brief.experience ? `Owner's experience, opinion or personal knowledge: ${brief.experience}` : '',
    brief.keyPoints ? `Key points to cover: ${brief.keyPoints}` : '',
    brief.audience ? `Target audience: ${brief.audience}` : '',
    brief.purpose ? `Purpose of the article: ${brief.purpose}` : '',
    brief.businessInfo ? `Relevant business information supplied by the owner: ${brief.businessInfo}` : '',
    brief.tone ? `Preferred tone: ${brief.tone}` : '',
    brief.cta ? `Desired call to action: ${brief.cta}` : '',
  ].filter(Boolean).join('\n');
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
  if (error instanceof GrowthQuotaError) return error.message;
  if (error instanceof BlogAiNotice) return error.message;
  if (error instanceof Error && error.message.includes('AI features require')) return error.message;
  if (error instanceof Error && error.message.includes('trial has ended')) return error.message;
  return 'The writing assistant could not complete that request. Please try again.';
}

async function runBlogAi<T>(
  task: string,
  handler: (userId: string, profileId: string) => Promise<AiHandlerResult<T>>,
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

  let quotaReservation;
  try {
    quotaReservation = await reserveGrowthAI(user.id, task === 'article' ? 'article' : task);
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }

  try {
    const { data, usage } = await handler(user.id, user.profile.id);
    const quota = await quotaReservation?.finish(true, usage);
    await db.usage.upsert({
      where: { userId: user.id },
      create: { userId: user.id, aiEdits: 1 },
      update: { aiEdits: { increment: 1 } },
    });
    return { ok: true, data, usage, ...(quota ? { quota: { ...quota, renewsAt: quota.renewsAt.toISOString() } } : {}) };
  } catch (error) {
    await quotaReservation?.finish(false).catch((releaseError) => console.error('Could not release blog AI quota reservation:', releaseError));
    console.error(`Blog AI ${task} error:`, error);
    return { ok: false, error: errorMessage(error) };
  }
}

/* -------------------------------------------------------------------------- */
/* Optional post-generation search assistance                                 */
/* -------------------------------------------------------------------------- */

export async function suggestBlogSearchAction(input: unknown): Promise<AiResult<{
  primaryKeyword: string;
  relatedKeywords: string[];
  searchQueries: string[];
  readerQuestions: string[];
  searchIntent: string;
  searchIntentNotes: string;
  headingSuggestions: Array<{ current: string; suggested: string; reason: string }>;
}>> {
  const parsed = z.object({
    title: z.string().max(160).optional().default(''),
    html: z.string().min(50, 'Write an article first, then improve it for search.').max(400_000),
  }).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || 'Write an article first, then improve it for search.' };
  }

  const { title, html } = parsed.data;
  const articleText = stripHtml(html).slice(0, 12_000);
  const headings = extractArticleHeadings(html)
    .map((heading) => heading.text.trim())
    .filter(Boolean)
    .slice(0, 12);
  const headingList = headings.length
    ? headings.map((heading) => `- ${heading}`).join('\n')
    : '- (no headings yet)';

  return runBlogAi('search', async (_userId, profileId) => {
    const business = await getBusinessContext(profileId);
    const { object, usage, providerMetadata } = await generateObject({
      model: getBlogWritingModel(),
      schema: z.object({
        primaryKeyword: z.string().trim().min(1).max(120),
        relatedKeywords: z.array(z.string().trim().min(1).max(120)).min(2).max(12),
        searchQueries: z.array(z.string().trim().min(1).max(200)).min(2).max(10),
        readerQuestions: z.array(z.string().trim().min(1).max(240)).min(2).max(10),
        searchIntent: z.enum(['informational', 'commercial', 'transactional', 'navigational']),
        searchIntentNotes: z.string().max(600),
        headingSuggestions: z.array(z.object({
          current: z.string().trim().max(160),
          suggested: z.string().trim().max(160),
          reason: z.string().trim().max(240),
        })).max(8),
      }),
      system: `You are an SEO editor helping ${business.displayName} improve an already written article.

${FACT_RULES}

This is optional, post-writing assistance. Never rewrite the article, never insert keywords automatically, and never claim the article must use a keyword.
Suggest search ideas a real reader would use. These are ideas, not measured data:
- NEVER invent or state search volume, keyword difficulty, competition scores, CPC or ranking estimates.
- Prefer specific, human phrases over generic marketing terms.
- Only suggest keyword changes that would genuinely help a reader.
- For headingSuggestions, use only headings from the CURRENT HEADINGS list. The "current" value must match one exactly. Suggest a clearer or more search-friendly version only when it improves the article; return an empty array when no change is worthwhile.

BUSINESS CONTEXT:
${business.context}`,
      prompt: `ARTICLE TITLE\n${title || '(untitled)'}\n\nCURRENT HEADINGS\n${headingList}\n\nARTICLE TEXT\n${articleText}\n\nSuggest one primary keyword, related keywords, realistic search queries, questions readers may ask, the dominant search intent with a short note, and optional heading improvements.`,
      maxOutputTokens: 1800,
    });

    const allowedHeadings = new Set(headings);
    return {
      data: {
        primaryKeyword: truncateAtWord(object.primaryKeyword, 120),
        relatedKeywords: object.relatedKeywords,
        searchQueries: object.searchQueries,
        readerQuestions: object.readerQuestions,
        searchIntent: object.searchIntent,
        searchIntentNotes: object.searchIntentNotes,
        headingSuggestions: object.headingSuggestions.filter(
          (heading) =>
            allowedHeadings.has(heading.current) &&
            heading.suggested.length > 0 &&
            heading.suggested !== heading.current,
        ),
      },
      usage: readAiUsage(usage, providerMetadata),
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Complete article                                                           */
/* -------------------------------------------------------------------------- */

export async function generateBlogArticleAction(input: unknown): Promise<AiResult<{
  title: string;
  html: string;
  excerpt: string;
  flags: Array<{ claim: string; reason: string; suggestion: string }>;
}>> {
  const parsed = z.object({
    brief: blogBriefSchema,
  }).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || 'Describe what the article should be about.' };
  }
  const { brief } = parsed.data;

  return runBlogAi('article', async (_userId, profileId) => {
    const business = await getBusinessContext(profileId);
    const { object, usage, providerMetadata, finishReason } = await generateObject({
      model: getBlogWritingModel(),
      schema: z.object({
        title: z.string().trim().min(1).max(160),
        html: z.string().min(200).max(400_000),
        excerpt: z.string().max(320),
        flags: z.array(z.object({
          claim: z.string().max(500),
          reason: z.string().max(500),
          suggestion: z.string().max(500),
        })).max(12),
      }),
      system: `You are a senior long-form writer producing an article for ${business.displayName}.

${FACT_RULES}

PRESERVE THE OWNER'S VOICE
- The owner's supplied knowledge, opinions, experiences and examples are the source of truth. Keep their meaning and point of view.
- Do not add invented anecdotes, client stories, results, statistics, prices, credentials or quotes.
- If a sentence needs a fact the brief does not provide, either omit it or phrase it as general guidance.
- Collect any claim that a reader might check into the "flags" array so the owner can verify it before publishing. An empty array is correct when nothing needs verification.

PLAN THE ARTICLE INTERNALLY
- Choose a specific, honest title and a logical structure before writing. Do not expose the plan or return an outline.
- Write a complete article with an introduction, useful sections, a conclusion and a relevant call to action when the brief supplies one.

BUSINESS CONTEXT:
${business.context}

Write in clean semantic HTML only. Allowed elements: <p>, <h2>, <h3>, <strong>, <em>, <a>, <ul>, <ol>, <li>, <blockquote>, <code>. Do not include an <h1>, a byline, an excerpt, markdown fences, inline styles, scripts or images. Start directly with the first paragraph and use descriptive H2 and H3 headings.`,
      prompt: `WRITER'S BRIEF\n${formatBrief(brief)}\n\nWrite the complete article. Aim for 900-1600 words unless the brief clearly calls for a different length. If the owner supplied a call to action, end with it naturally.\n\nReturn the article title, article HTML, a 120-180 character excerpt, and any factual claims that need verification.`,
      maxOutputTokens: 7000,
    });

    if (object.html.trim().length === 0) notice('The assistant returned an empty article. Please try again.');
    if (finishReason === 'length') {
      notice('The assistant ran out of room before finishing the article. Try a shorter brief.');
    }
    if (stripHtml(object.html).length < 200) {
      notice('The assistant returned an article that was too short. Please try again.');
    }

    const html = cleanArticleHtml(object.html);
    if (stripHtml(html).length < 200) {
      notice('The assistant returned an article that could not be used. Please try again.');
    }

    return {
      data: {
        title: object.title.trim() || 'Untitled article',
        html,
        excerpt: object.excerpt.trim() || createBlogExcerpt(html, 170),
        flags: object.flags.filter((flag) => flag.claim.trim()),
      },
      usage: readAiUsage(usage, providerMetadata),
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Editing the existing article                                               */
/* -------------------------------------------------------------------------- */

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
    if (!stripHtml(source).trim()) notice('There is no text to edit yet.');

    const actionInstructions: Record<EditMode, string> = {
      rewrite: 'Rewrite the passage so it is clearer and stronger while preserving its meaning and facts.',
      expand: 'Expand the passage with useful detail, examples or explanation. Do not add invented facts.',
      shorten: 'Shorten the passage while preserving its key meaning and any facts supplied by the owner.',
      clarity: 'Improve clarity and flow. Remove ambiguity and unnecessary complexity.',
      grammar: 'Correct grammar, spelling, punctuation and awkward phrasing. Make only minimal wording changes.',
      tone: `Rewrite the passage in a ${tone || 'confident and approachable'} tone without changing its meaning or facts.`,
      continue: 'Continue the article naturally from where it ends. Write 2-4 new paragraphs or a new section.',
      headings: 'Improve the existing section headings so they are clearer and more useful to readers. Change only the heading text; preserve every paragraph, fact and formatting mark.',
      section: 'Write a new article section that fits the existing article and follows the owner\'s instruction.',
    };

    const preservationRule = selectedText.trim()
      ? 'Return only the replacement HTML for the selected passage. Do not include the rest of the article and do not wrap it in a document. Keep the replacement inline (strong, em, a, code, br are allowed).'
      : mode === 'headings'
        ? 'Return the complete updated article HTML, changing only the heading elements. Preserve everything else exactly.'
        : mode === 'continue'
          ? 'Return only the new continuation HTML (2-4 paragraphs or one new section). Do not repeat the existing article.'
          : mode === 'section'
            ? 'Insert the new section into the article in a sensible place and return the complete updated article HTML. Preserve every other paragraph and fact exactly.'
            : 'Return the complete updated article HTML. Preserve everything that the request does not explicitly ask you to change.';

    const maxOutputTokens = selectedText.trim()
      ? 2200
      : mode === 'headings'
        ? 2200
        : mode === 'continue'
          ? 3000
          : 6000;

    const { text, usage, providerMetadata, finishReason } = await generateText({
      model: getBlogWritingModel(),
      system: `You are a meticulous senior editor working on an article for ${business.displayName}. The article title is "${title || 'Untitled article'}".

${FACT_RULES}

BUSINESS CONTEXT:
${business.context}

${preservationRule}
Use clean semantic HTML only (p, h2, h3, strong, em, a, ul, ol, li, blockquote, code). No h1, no markdown fences, no styles, no scripts.`,
      prompt: `TASK: ${actionInstructions[mode]}
${instruction ? `OWNER'S EXTRA INSTRUCTION: ${instruction}` : ''}

PASSAGE (${scope}):
${source}`,
      maxOutputTokens,
    });

    if (text.trim().length === 0) notice('The assistant returned an empty edit. Please try again.');
    if (finishReason === 'length') {
      notice('The assistant ran out of room before finishing that edit. Try selecting a smaller passage.');
    }
    const cleaned = selectedText.trim()
      ? sanitizeBlogInlineHtml(stripCodeFence(text))
      : cleanArticleHtml(text);
    if (!stripHtml(cleaned).trim()) notice('The assistant returned an empty edit. Please try again.');

    return { data: { html: cleaned }, usage: readAiUsage(usage, providerMetadata) };
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
    const { object, usage, providerMetadata } = await generateObject({
      model: getBlogWritingModel(),
      schema: z.object({
        headings: z.array(z.string().trim().min(1).max(140)).min(1).max(8),
      }),
      system: `You suggest clear, specific section headings for a long-form article by ${business.displayName}. ${FACT_RULES}`,
      prompt: `ARTICLE TITLE: ${parsed.data.title || 'Untitled'}\n\nARTICLE:\n${stripHtml(parsed.data.html).slice(0, 12_000)}\n\nSuggest 3-8 improved section headings that reflect the actual content. Do not introduce topics the article does not cover.`,
      maxOutputTokens: 1200,
    });
    return { data: { headings: object.headings }, usage: readAiUsage(usage, providerMetadata) };
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
    const { object, usage, providerMetadata } = await generateObject({
      model: getBlogWritingModel(),
      schema: z.object({
        titles: z.array(z.string().trim().min(1).max(160)).min(3).max(6),
      }),
      system: `You write honest, specific article titles for ${business.displayName}. ${FACT_RULES}`,
      prompt: `${brief ? `BRIEF:\n${brief}\n\n` : ''}ARTICLE:\n${stripHtml(parsed.data.html || '').slice(0, 10_000)}\n\nSuggest 3-6 strong titles. Avoid clickbait and promises the article cannot support.`,
      maxOutputTokens: 800,
    });
    return { data: { titles: object.titles }, usage: readAiUsage(usage, providerMetadata) };
  });
}

/* -------------------------------------------------------------------------- */
/* Finishing tools                                                            */
/* -------------------------------------------------------------------------- */

export async function generateBlogExcerptAction(input: unknown): Promise<AiResult<{ excerpt: string }>> {
  const parsed = z.object({
    html: z.string().max(400_000),
    title: z.string().max(160).optional().default(''),
  }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Add some article content first.' };

  return runBlogAi('excerpt', async (_userId, profileId) => {
    const business = await getBusinessContext(profileId);
    const { object, usage, providerMetadata } = await generateObject({
      model: getBlogWritingModel(),
      schema: z.object({
        excerpt: z.string().trim().min(1).max(220),
      }),
      system: `You write concise article excerpts and meta descriptions for ${business.displayName}. ${FACT_RULES}`,
      prompt: `ARTICLE TITLE: ${parsed.data.title || 'Untitled'}\n\nARTICLE:\n${stripHtml(parsed.data.html).slice(0, 14_000)}\n\nWrite one accurate excerpt of 120-180 characters that describes what the article actually covers.`,
      maxOutputTokens: 400,
    });
    return { data: { excerpt: object.excerpt }, usage: readAiUsage(usage, providerMetadata) };
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
    const { object, usage, providerMetadata } = await generateObject({
      model: getBlogWritingModel(),
      schema: z.object({
        faqs: z.array(z.object({
          question: z.string().trim().min(1).max(200),
          answer: z.string().trim().min(1).max(900),
        })).min(2).max(6),
      }),
      system: `You suggest genuinely useful FAQs for an article published by ${business.displayName}. ${FACT_RULES} Answers must be supported by the article or business context.`,
      prompt: `ARTICLE TITLE: ${parsed.data.title || 'Untitled'}\n\nARTICLE:\n${stripHtml(parsed.data.html).slice(0, 14_000)}\n\nSuggest 3-5 questions a reader would realistically ask, with concise answers grounded in the article.`,
      maxOutputTokens: 1600,
    });
    return { data: { faqs: object.faqs }, usage: readAiUsage(usage, providerMetadata) };
  });
}

export async function suggestBlogSeoAction(input: unknown): Promise<AiResult<{
  seoTitle: string;
  seoDescription: string;
  cta: string;
}>> {
  const parsed = z.object({
    html: z.string().max(400_000),
    title: z.string().max(160).optional().default(''),
    excerpt: z.string().max(320).optional().default(''),
    primaryKeyword: z.string().max(120).optional().default(''),
  }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Add some article content first.' };

  return runBlogAi('seo', async (_userId, profileId) => {
    const business = await getBusinessContext(profileId);
    const { object, usage, providerMetadata } = await generateObject({
      model: getBlogWritingModel(),
      schema: z.object({
        seoTitle: z.string().trim().min(1).max(90),
        seoDescription: z.string().trim().min(1).max(200),
        cta: z.string().trim().min(1).max(300),
      }),
      system: `You write accurate search metadata and calls to action for ${business.displayName}. ${FACT_RULES}`,
      prompt: `ARTICLE TITLE: ${parsed.data.title || 'Untitled'}
${parsed.data.primaryKeyword ? `TARGET KEYWORD: ${parsed.data.primaryKeyword}` : ''}
${parsed.data.excerpt ? `CURRENT EXCERPT: ${parsed.data.excerpt}` : ''}

ARTICLE:
${stripHtml(parsed.data.html).slice(0, 14_000)}

Return:
- an SEO title of 50-60 characters that accurately describes the article,
- a meta description of 120-160 characters,
- one short call to action that fits the article and the business without inventing offers.`,
      maxOutputTokens: 600,
    });
    return {
      data: { seoTitle: object.seoTitle, seoDescription: object.seoDescription, cta: object.cta },
      usage: readAiUsage(usage, providerMetadata),
    };
  });
}

type InternalLinkTarget = { title: string; url: string };

async function getInternalLinkTargets(profileId: string, currentSlug?: string): Promise<{
  displayName: string;
  targets: InternalLinkTarget[];
}> {
  const profile = await db.profile.findUnique({
    where: { id: profileId },
    select: {
      displayName: true,
      username: true,
      pages: {
        where: { isPublished: true },
        select: { title: true, slug: true, pageType: true },
        orderBy: { navOrder: 'asc' },
      },
      blogArticles: {
        where: { status: 'PUBLISHED' },
        select: { title: true, slug: true, publicSlug: true },
        orderBy: { publishedAt: 'desc' },
        take: 30,
      },
    },
  });

  if (!profile) throw new Error('Profile not found');

  const targets: InternalLinkTarget[] = [];
  const home = profile.pages.find((page) => page.pageType === 'HOME' || page.slug === '');
  if (home) {
    targets.push({ title: profile.displayName, url: buildPagePath(profile.username, '') });
  }

  for (const page of profile.pages) {
    if (page === home) continue;
    targets.push({ title: page.title || page.slug, url: buildPagePath(profile.username, page.slug) });
  }

  for (const article of profile.blogArticles) {
    const slug = article.publicSlug || article.slug;
    if (!slug) continue;
    if (currentSlug && (slug === currentSlug || article.slug === currentSlug)) continue;
    targets.push({ title: article.title || slug, url: blogArticlePath(profile.username, slug) });
  }

  const seen = new Set<string>();
  return {
    displayName: profile.displayName,
    targets: targets.filter((target) => {
      if (seen.has(target.url)) return false;
      seen.add(target.url);
      return true;
    }),
  };
}

export async function suggestBlogInternalLinksAction(input: unknown): Promise<AiResult<{
  links: Array<{ title: string; url: string; anchorText: string; reason: string }>;
  sectionHtml: string;
  message: string;
}>> {
  const parsed = z.object({
    html: z.string().max(400_000),
    title: z.string().max(160).optional().default(''),
    currentSlug: z.string().max(120).optional().default(''),
  }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Add some article content first.' };

  return runBlogAi('internal-links', async (_userId, profileId) => {
    const { displayName, targets } = await getInternalLinkTargets(profileId, parsed.data.currentSlug);
    if (targets.length === 0) {
      return {
        data: {
          links: [],
          sectionHtml: '',
          message: 'Publish at least one website page or article before linking to related content.',
        },
        usage: readAiUsage(null),
      };
    }

    const { object, usage, providerMetadata } = await generateObject({
      model: getBlogWritingModel(),
      schema: z.object({
        links: z.array(z.object({
          url: z.string().max(2000),
          anchorText: z.string().trim().min(1).max(160),
          reason: z.string().max(400),
        })).max(5),
      }),
      system: `You suggest internal links for an article published by ${displayName}. ${FACT_RULES}
Only choose destinations from the PROVIDED PUBLISHED PAGES list. Never invent a URL. Only suggest a link when it genuinely helps the reader.`,
      prompt: `ARTICLE TITLE: ${parsed.data.title || 'Untitled'}

PUBLISHED PAGES AND ARTICLES (choose only these URLs):
${targets.map((target) => `- ${target.title} — ${target.url}`).join('\n')}

ARTICLE:
${stripHtml(parsed.data.html).slice(0, 12_000)}

Suggest up to 5 relevant internal links. Use the exact URL from the list, a natural anchor phrase, and a short reason.`,
      maxOutputTokens: 900,
    });

    const normalizeUrl = (value: string) => value.trim().replace(/\/+$/, '') || '/';
    const byUrl = new Map(targets.map((target) => [normalizeUrl(target.url), target]));
    const links = object.links.flatMap((link) => {
      const target = byUrl.get(normalizeUrl(link.url));
      if (!target) return [];
      return [{
        title: target.title,
        url: target.url,
        anchorText: link.anchorText,
        reason: link.reason,
      }];
    });

    const sectionHtml = links.length
      ? `<h2>Related reading</h2><ul>${links
        .map((link) => `<li><a href="${escapeHtmlText(link.url)}">${escapeHtmlText(link.anchorText)}</a></li>`)
        .join('')}</ul>`
      : '';

    return {
      data: {
        links,
        sectionHtml,
        message: links.length
          ? ''
          : 'No relevant published pages were found for this article.',
      },
      usage: readAiUsage(usage, providerMetadata),
    };
  });
}
