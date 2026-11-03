import type { AiUsageSummary } from '@/lib/ai/usage';

export type WritingBrief = {
  topic: string;
  audience: string;
  purpose: string;
  experience: string;
  keyPoints: string;
  tone: string;
  businessInfo: string;
  cta: string;
};

export const EMPTY_BRIEF: WritingBrief = {
  topic: '',
  audience: '',
  purpose: '',
  experience: '',
  keyPoints: '',
  tone: '',
  businessInfo: '',
  cta: '',
};

export const EMPTY_USAGE: AiUsageSummary = {
  inputTokens: null,
  outputTokens: null,
  totalTokens: null,
  estimatedCostUsd: null,
};

export type HeadingSuggestion = {
  current: string;
  suggested: string;
  reason: string;
};

export type SearchSuggestions = {
  primaryKeyword: string;
  relatedKeywords: string[];
  searchQueries: string[];
  readerQuestions: string[];
  searchIntent: string;
  searchIntentNotes: string;
  headingSuggestions: HeadingSuggestion[];
};

export type EditMode =
  | 'rewrite'
  | 'expand'
  | 'shorten'
  | 'clarity'
  | 'grammar'
  | 'continue'
  | 'tone'
  | 'headings'
  | 'section';

export type ArticleFlag = {
  claim: string;
  reason: string;
  suggestion: string;
};

export type ChangeProposal = {
  id: string;
  label: string;
  description: string;
  html: string;
  mode: 'replace' | 'insert' | 'selection';
  selectionText?: string;
  flags?: ArticleFlag[];
  usage?: AiUsageSummary | null;
};

export type SeoSuggestion = {
  seoTitle: string;
  seoDescription: string;
  cta: string;
};

export type FaqSuggestion = {
  question: string;
  answer: string;
};

export type InternalLinkSuggestion = {
  title: string;
  url: string;
  anchorText: string;
  reason: string;
};

export type FinishingState = {
  excerpt: { text: string; usage: AiUsageSummary } | null;
  faqs: { faqs: FaqSuggestion[]; html: string; usage: AiUsageSummary } | null;
  seo: { seo: SeoSuggestion; usage: AiUsageSummary } | null;
  links: {
    links: InternalLinkSuggestion[];
    sectionHtml: string;
    message: string;
    usage: AiUsageSummary;
  } | null;
};
