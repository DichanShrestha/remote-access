'use client';

import {
  ArrowRight,
  Heading2,
  HelpCircle,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Tags,
} from 'lucide-react';
import {
  StudioCard,
  StudioDisclosure,
  UsageNote,
  primaryButtonClass,
  secondaryButtonClass,
} from './primitives';
import type { AiUsageSummary } from '@/lib/ai/usage';
import type {
  FaqSuggestion,
  FinishingState,
  HeadingSuggestion,
  SearchSuggestions,
} from './types';

const intentLabel = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Not set';

export function SearchAssistant({
  suggestions,
  usage,
  busy,
  hasBody,
  primaryKeyword,
  onSuggest,
  onUsePrimary,
  onApplyHeading,
  faqs,
  faqBusy,
  onGenerateFaqs,
  onInsertFaq,
  onInsertAllFaqs,
}: {
  suggestions: SearchSuggestions | null;
  usage?: AiUsageSummary | null;
  busy: boolean;
  hasBody: boolean;
  primaryKeyword: string;
  onSuggest: () => void;
  onUsePrimary: () => void;
  onApplyHeading: (suggestion: HeadingSuggestion) => void;
  faqs: FinishingState['faqs'];
  faqBusy: boolean;
  onGenerateFaqs: () => void;
  onInsertFaq: (faq: FaqSuggestion) => void;
  onInsertAllFaqs: (html: string) => void;
}) {
  const primaryActive =
    Boolean(primaryKeyword.trim()) &&
    primaryKeyword.trim().toLowerCase() === suggestions?.primaryKeyword.trim().toLowerCase();

  return (
    <StudioCard
      icon={<Search className="h-3.5 w-3.5" />}
      title="Improve for search"
      description="Optional, after the draft exists. Get keyword ideas, search intent, heading suggestions and reader FAQs without rewriting the article."
      action={
        suggestions ? (
          <button
            type="button"
            onClick={onSuggest}
            disabled={busy}
            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#6d7a5e] hover:underline disabled:opacity-40"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </button>
        ) : undefined
      }
    >
      {!suggestions && (
        <>
          <button
            type="button"
            onClick={onSuggest}
            disabled={busy || !hasBody}
            className={`${primaryButtonClass} mt-4`}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Analyze article for search
          </button>
          {!hasBody && (
            <p className="mt-2 text-center text-[11px] text-[#a2a398]">
              Write or generate an article first.
            </p>
          )}
          <p className="mt-3 border-t border-[#ece9e1] pt-3 text-[11px] leading-5 text-[#8a8b82]">
            Suggestions are AI ideas, not measured search volume, difficulty or competition data.
            Nothing changes until you choose a suggestion.
          </p>
        </>
      )}

      {suggestions && (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-[#f7f5ee] px-3.5 py-3">
            <p className="text-[11px] font-medium text-[#7c7d74]">Search intent</p>
            <p className="mt-1 text-[13px] font-medium text-[#2d2e28]">
              {intentLabel(suggestions.searchIntent)}
            </p>
            <p className="mt-1 text-xs leading-5 text-[#6f7067]">
              {suggestions.searchIntentNotes}
            </p>
          </div>

          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11.5px] font-medium text-[#6f7067]">Primary keyword</p>
                <p className="mt-1 text-[13px] font-medium leading-5 text-[#2d2e28]">
                  {suggestions.primaryKeyword}
                </p>
              </div>
              <button
                type="button"
                onClick={onUsePrimary}
                disabled={busy || primaryActive}
                className="shrink-0 text-[11.5px] font-medium text-[#6d7a5e] hover:underline disabled:text-[#a2a398] disabled:no-underline"
              >
                {primaryActive ? 'Used for SEO' : 'Use for SEO'}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] leading-5 text-[#a2a398]">
              Saved for SEO title and meta suggestions. It is never inserted into the article
              automatically.
            </p>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[11.5px] font-medium text-[#6f7067]">
              <Tags className="h-3.5 w-3.5 text-[#8a8b82]" /> Related keywords
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.relatedKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-[#e2dfd6] bg-white px-2.5 py-1.5 text-[11.5px] leading-4 text-[#5f6058]"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <StudioDisclosure summary={`Search queries (${suggestions.searchQueries.length})`}>
            <ul className="space-y-1.5">
              {suggestions.searchQueries.map((query) => (
                <li key={query} className="text-xs leading-5 text-[#5f6058]">
                  “{query}”
                </li>
              ))}
            </ul>
          </StudioDisclosure>

          <StudioDisclosure
            summary={`Questions readers may ask (${suggestions.readerQuestions.length})`}
          >
            <ul className="space-y-2">
              {suggestions.readerQuestions.map((question) => (
                <li key={question} className="flex gap-2 text-xs leading-5 text-[#5f6058]">
                  <HelpCircle className="mt-1 h-3.5 w-3.5 shrink-0 text-[#a2a398]" />
                  {question}
                </li>
              ))}
            </ul>
          </StudioDisclosure>

          <div className="border-t border-[#ece9e1] pt-4">
            <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#6f7067]">
              <Heading2 className="h-3.5 w-3.5 text-[#8a8b82]" /> Heading opportunities
            </p>
            {suggestions.headingSuggestions.length === 0 ? (
              <p className="mt-2 text-xs leading-5 text-[#8a8b82]">
                No heading changes suggested. The current structure already reads clearly.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {suggestions.headingSuggestions.map((heading) => (
                  <li
                    key={`${heading.current}-${heading.suggested}`}
                    className="rounded-lg bg-[#fbfaf6] px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] leading-4 text-[#a2a398] line-through">
                          {heading.current}
                        </p>
                        <p className="mt-0.5 flex items-start gap-1 text-xs font-medium leading-5 text-[#2d2e28]">
                          <ArrowRight className="mt-1 h-3 w-3 shrink-0 text-[#7c866f]" />
                          {heading.suggested}
                        </p>
                        {heading.reason && (
                          <p className="mt-1 text-[11px] leading-4 text-[#8a8b82]">
                            {heading.reason}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onApplyHeading(heading)}
                        disabled={busy}
                        className="shrink-0 text-[11.5px] font-medium text-[#6d7a5e] hover:underline disabled:opacity-40"
                      >
                        Apply
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-[#ece9e1] pt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#6f7067]">
                  <HelpCircle className="h-3.5 w-3.5 text-[#8a8b82]" /> Reader FAQs
                </p>
                <p className="mt-1 text-[11px] leading-4 text-[#8a8b82]">
                  Questions drawn from this article, each with an answer you can review.
                </p>
              </div>
              <button
                type="button"
                onClick={onGenerateFaqs}
                disabled={busy || faqBusy || !hasBody}
                className={`${secondaryButtonClass} shrink-0`}
              >
                {faqBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {faqs ? 'Regenerate' : 'Suggest'}
              </button>
            </div>

            {faqs && (
              <div className="mt-3 border-l-2 border-[#dfe5d7] pl-3">
                <ul className="space-y-3">
                  {faqs.faqs.map((faq, index) => (
                    <li key={`${faq.question}-${index}`} className="text-xs leading-5">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-medium text-[#2d2e28]">{faq.question}</span>
                        <button
                          type="button"
                          onClick={() => onInsertFaq(faq)}
                          disabled={busy}
                          className="shrink-0 text-[11px] font-medium text-[#6d7a5e] hover:underline disabled:opacity-40"
                        >
                          Add
                        </button>
                      </div>
                      <span className="mt-0.5 block text-[#6f7067]">{faq.answer}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <button
                    type="button"
                    onClick={() => onInsertAllFaqs(faqs.html)}
                    disabled={busy}
                    className="text-[11.5px] font-medium text-[#6d7a5e] hover:underline disabled:opacity-40"
                  >
                    Add all FAQs
                  </button>
                  <UsageNote usage={faqs.usage} label="FAQs" />
                </div>
              </div>
            )}
          </div>

          <UsageNote usage={usage} label="Search analysis" />

          <p className="border-t border-[#ece9e1] pt-3 text-[11px] leading-5 text-[#8a8b82]">
            AI suggestions only. Pageory does not measure or invent search volume, difficulty or
            competition metrics.
          </p>
        </div>
      )}
    </StudioCard>
  );
}
