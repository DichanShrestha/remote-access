'use client';

import {
  ArrowUpRight,
  FileText,
  Link2,
  Loader2,
  Quote,
  Search,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { UsageNote, secondaryButtonClass } from './primitives';
import type { FinishingState, SeoSuggestion } from './types';
import type { AiUsageSummary } from '@/lib/ai/usage';

const sectionTitleClass = 'text-[13px] font-semibold leading-5 text-[#2d2e28]';
const sectionDescriptionClass = 'mt-0.5 text-xs leading-5 text-[#85867d]';
const toolResultClass = 'mt-2.5 border-l-2 border-[#dfe5d7] pl-3';
const resultLabelClass = 'text-[11px] font-medium text-[#8a8b82]';
const resultTextClass = 'mt-1 text-xs leading-5 text-[#4e4f48]';
const applyButtonClass = 'mt-2 text-[11.5px] font-medium text-[#6d7a5e] hover:underline';

function ToolRow({
  icon,
  title,
  description,
  action,
  actionLabel,
  busy,
  disabled,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: () => void;
  actionLabel: string;
  busy: boolean;
  disabled: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-[#3f403a]">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f1efe8] text-[#7c866f]">
            {icon}
          </span>
          {title}
        </span>
        <button
          type="button"
          onClick={action}
          disabled={disabled || busy}
          className={`${secondaryButtonClass} shrink-0`}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
          {actionLabel}
        </button>
      </div>
      {!children && <p className={sectionDescriptionClass}>{description}</p>}
      {children}
    </div>
  );
}

function ToolResult({ usage, label, children }: { usage?: AiUsageSummary | null; label: string; children: React.ReactNode }) {
  return (
    <div className={toolResultClass}>
      {children}
      <UsageNote usage={usage} label={label} />
    </div>
  );
}

export function FinishingTools({
  finishing,
  busyKey,
  hasBody,
  currentExcerpt,
  onGenerateExcerpt,
  onGenerateSeo,
  onSuggestLinks,
  onApplyExcerpt,
  onApplySeo,
  onInsertCta,
  onInsertLinks,
}: {
  finishing: FinishingState;
  busyKey: string | null;
  hasBody: boolean;
  currentExcerpt: string;
  onGenerateExcerpt: () => void;
  onGenerateSeo: () => void;
  onSuggestLinks: () => void;
  onApplyExcerpt: (text: string) => void;
  onApplySeo: (seo: SeoSuggestion) => void;
  onInsertCta: (cta: string) => void;
  onInsertLinks: (html: string) => void;
}) {
  const disabled = !hasBody;

  return (
    <section className="rounded-xl border border-[#e6e2d8] bg-white">
      <div className="flex items-start gap-2.5 p-4">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#eef0e8] text-[#6d7a5e]">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <h3 className={sectionTitleClass}>Finishing touches</h3>
          <p className={sectionDescriptionClass}>
            Optional extras. Generate only what the article needs — nothing here is required to publish.
          </p>
        </div>
      </div>

      <div className="divide-y divide-[#ece9e1] border-t border-[#ece9e1]">
        {/* Excerpt */}
        <ToolRow
          icon={<Quote className="h-3.5 w-3.5" />}
          title="Excerpt"
          description="A short, accurate summary for listings and search results."
          action={onGenerateExcerpt}
          actionLabel="Generate"
          busy={busyKey === 'excerpt'}
          disabled={disabled || busyKey !== null}
        >
          {finishing.excerpt ? (
            <ToolResult usage={finishing.excerpt.usage} label="Excerpt">
              {currentExcerpt.trim() === finishing.excerpt.text.trim() ? (
                <p className="text-xs font-medium text-[#6d7a5e]">Applied to the excerpt field.</p>
              ) : (
                <>
                  <p className={resultTextClass}>{finishing.excerpt.text}</p>
                  <button
                    type="button"
                    onClick={() => onApplyExcerpt(finishing.excerpt!.text)}
                    className={applyButtonClass}
                  >
                    Apply this excerpt
                  </button>
                </>
              )}
            </ToolResult>
          ) : null}
        </ToolRow>

        {/* SEO + CTA */}
        <ToolRow
          icon={<Search className="h-3.5 w-3.5" />}
          title="SEO title & meta"
          description="An accurate search title, meta description and a fitting call to action."
          action={onGenerateSeo}
          actionLabel="Suggest"
          busy={busyKey === 'seo'}
          disabled={disabled || busyKey !== null}
        >
          {finishing.seo ? (
            <ToolResult usage={finishing.seo.usage} label="SEO suggestions">
              <div className="space-y-3">
                <div>
                  <p className={resultLabelClass}>
                    SEO title · {finishing.seo.seo.seoTitle.length}
                  </p>
                  <p className={resultTextClass}>{finishing.seo.seo.seoTitle}</p>
                </div>
                <div>
                  <p className={resultLabelClass}>
                    Meta description · {finishing.seo.seo.seoDescription.length}
                  </p>
                  <p className={resultTextClass}>{finishing.seo.seo.seoDescription}</p>
                </div>
                <div>
                  <p className={resultLabelClass}>Suggested call to action</p>
                  <p className={resultTextClass}>{finishing.seo.seo.cta}</p>
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <button
                  type="button"
                  onClick={() => onApplySeo(finishing.seo!.seo)}
                  className="text-[11.5px] font-medium text-[#6d7a5e] hover:underline"
                >
                  Apply SEO fields
                </button>
                <button
                  type="button"
                  onClick={() => onInsertCta(finishing.seo!.seo.cta)}
                  className="text-[11.5px] font-medium text-[#6d7a5e] hover:underline"
                >
                  Insert CTA at the end
                </button>
              </div>
            </ToolResult>
          ) : null}
        </ToolRow>

        {/* Internal links */}
        <ToolRow
          icon={<Link2 className="h-3.5 w-3.5" />}
          title="Internal links"
          description="Real links to pages you have already published. No URLs are invented."
          action={onSuggestLinks}
          actionLabel="Suggest"
          busy={busyKey === 'links'}
          disabled={disabled || busyKey !== null}
        >
          {finishing.links ? (
            <ToolResult usage={finishing.links.usage} label="Internal links">
              {finishing.links.links.length > 0 ? (
                <>
                  <ul className="space-y-2.5">
                    {finishing.links.links.map((link) => (
                      <li key={link.url} className="text-xs leading-5">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-[#4e5f42] hover:underline"
                        >
                          {link.title}
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                        <span className="mt-0.5 block text-[#6f7067]">
                          {link.anchorText} — {link.reason}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => onInsertLinks(finishing.links!.sectionHtml)}
                    className={applyButtonClass}
                  >
                    Insert “Related reading” section
                  </button>
                </>
              ) : (
                <p className="text-xs leading-5 text-[#8a8b82]">
                  {finishing.links.message || 'No relevant published pages found yet.'}
                </p>
              )}
            </ToolResult>
          ) : null}
        </ToolRow>
      </div>

      <p className="flex items-center gap-1.5 border-t border-[#ece9e1] px-4 py-3 text-[11px] leading-4 text-[#8a8b82]">
        <FileText className="h-3.5 w-3.5 shrink-0" />
        Finishing tools never publish or overwrite the article on their own.
      </p>
    </section>
  );
}
