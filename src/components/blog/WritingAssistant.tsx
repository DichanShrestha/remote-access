'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ClipboardPaste,
  FileText,
  Loader2,
  PenLine,
  Sparkles,
  Upload,
  Wand2,
} from 'lucide-react';
import {
  editBlogWritingAction,
  generateBlogArticleAction,
  generateBlogExcerptAction,
  suggestBlogFaqsAction,
  suggestBlogInternalLinksAction,
  suggestBlogSearchAction,
  suggestBlogSeoAction,
} from '@/app/actions/blog-ai-actions';
import { importBlogDraftAction } from '@/app/actions/blog-actions';
import { addAiUsage, type AiUsageSummary } from '@/lib/ai/usage';
import { plainTextToBlogHtml } from '@/lib/blog-editor';
import type { BlogArticleDraft } from './types';
import type { RichTextEditorHandle } from './RichTextEditor';
import { ChangePreview } from './writing-studio/ChangePreview';
import { FinishingTools } from './writing-studio/FinishingTools';
import { SearchAssistant } from './writing-studio/SearchAssistant';
import { WriterBriefFields } from './writing-studio/WriterBriefFields';
import {
  StudioCard,
  UsageTotal,
  primaryButtonClass,
  secondaryButtonClass,
  studioInputClass,
} from './writing-studio/primitives';
import {
  EMPTY_BRIEF,
  EMPTY_USAGE,
  type ArticleFlag,
  type ChangeProposal,
  type EditMode,
  type FaqSuggestion,
  type FinishingState,
  type HeadingSuggestion,
  type SearchSuggestions,
  type SeoSuggestion,
  type WritingBrief,
} from './writing-studio/types';

type Stage = 'brief' | 'import' | 'writing';

const EDIT_MODES: Array<{ value: EditMode; label: string }> = [
  { value: 'rewrite', label: 'Rewrite' },
  { value: 'expand', label: 'Expand' },
  { value: 'shorten', label: 'Shorten' },
  { value: 'clarity', label: 'Clarify' },
  { value: 'grammar', label: 'Proofread' },
  { value: 'continue', label: 'Continue' },
  { value: 'tone', label: 'Change tone' },
  { value: 'headings', label: 'Improve headings' },
  { value: 'section', label: 'Write section' },
];

const EMPTY_FINISHING: FinishingState = { excerpt: null, faqs: null, seo: null, links: null };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildFaqsHtml(faqs: Array<{ question: string; answer: string }>): string {
  const items = faqs
    .filter((faq) => faq.question.trim() && faq.answer.trim())
    .map(
      (faq) =>
        `<h3>${escapeHtml(faq.question.trim())}</h3><p>${escapeHtml(faq.answer.trim())}</p>`,
    )
    .join('');
  return items ? `<h2>Frequently asked questions</h2>${items}` : '';
}

function extractDraftTitle(text: string): string {
  const first = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);
  if (!first) return '';
  const candidate = first.replace(/^#{1,6}\s+/, '').replace(/\*\*/g, '').trim();
  if (candidate.length < 3 || candidate.length > 140) return '';
  if (/[.!?]$/.test(candidate) && candidate.split(/\s+/).length > 12) return '';
  return candidate;
}

export function WritingAssistant({
  article,
  editorRef,
  onApplyHtml,
  onApplyExcerpt,
  onApplyTitle,
  onApplySeo,
  notify,
}: {
  article: BlogArticleDraft;
  editorRef: React.RefObject<RichTextEditorHandle | null>;
  onApplyHtml: (html: string, mode: 'replace' | 'insert') => void;
  onApplyExcerpt: (excerpt: string) => void;
  onApplyTitle: (title: string) => void;
  onApplySeo: (seo: { seoTitle: string; seoDescription: string }) => void;
  notify: (type: 'success' | 'error', message: string) => void;
}) {
  const [stage, setStage] = useState<Stage>(article.bodyHtml.trim() ? 'writing' : 'brief');
  const [brief, setBrief] = useState<WritingBrief>(EMPTY_BRIEF);
  const [proposal, setProposal] = useState<ChangeProposal | null>(null);
  const [pendingArticle, setPendingArticle] = useState<{ title: string; excerpt: string } | null>(null);
  const [verificationFlags, setVerificationFlags] = useState<ArticleFlag[]>([]);
  const [finishing, setFinishing] = useState<FinishingState>(EMPTY_FINISHING);
  const [search, setSearch] = useState<SearchSuggestions | null>(null);
  const [searchUsage, setSearchUsage] = useState<AiUsageSummary | null>(null);
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [usage, setUsage] = useState<AiUsageSummary>(EMPTY_USAGE);
  const [busy, setBusy] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('rewrite');
  const [editTone, setEditTone] = useState('');
  const [editInstruction, setEditInstruction] = useState('');
  const [hasSelection, setHasSelection] = useState(false);
  const [selectionLength, setSelectionLength] = useState(0);
  const [importedText, setImportedText] = useState('');
  const [importedFileName, setImportedFileName] = useState('');
  const [replaceImportConfirmed, setReplaceImportConfirmed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const proposalRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const updateSelection = () => {
      const selected = editorRef.current?.getSelectedText() || '';
      setHasSelection(Boolean(selected.trim()));
      setSelectionLength(selected.trim().length);
    };
    updateSelection();
    document.addEventListener('selectionchange', updateSelection);
    return () => document.removeEventListener('selectionchange', updateSelection);
  }, [editorRef]);

  useEffect(() => {
    if (!proposal) return;
    proposalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [proposal]);

  const hasBody = Boolean(article.bodyHtml.trim());

  const run = async (key: string, task: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(key);
    try {
      await task();
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };

  const recordUsage = (summary: AiUsageSummary | undefined | null) => {
    if (!summary) return;
    setUsage((current) => addAiUsage(current, summary));
  };

  const updateBrief = (patch: Partial<WritingBrief>) => {
    setBrief((current) => ({ ...current, ...patch }));
  };

  const generateArticle = () =>
    run('article', async () => {
      if (brief.topic.trim().length < 3) {
        notify('error', 'Describe what the article should be about first.');
        return;
      }
      const result = await generateBlogArticleAction({ brief });
      if (!result.ok) {
        notify('error', result.error);
        return;
      }
      setProposal({
        id: `article-${Date.now()}`,
        label: 'Generated article',
        description: hasBody
          ? 'Review the full draft and its verification flags before replacing the current article.'
          : 'Review the full draft and its verification flags before adding it to the editor.',
        html: result.data.html,
        mode: 'replace',
        flags: result.data.flags,
        usage: result.usage,
      });
      setPendingArticle({ title: result.data.title, excerpt: result.data.excerpt });
      recordUsage(result.usage);
      notify('success', 'Draft generated. Review it before applying.');
    });

  const runSearchAnalysis = () =>
    run('search', async () => {
      if (!hasBody) {
        notify('error', 'Write or generate an article first.');
        return;
      }
      const result = await suggestBlogSearchAction({
        title: article.title,
        html: article.bodyHtml,
      });
      if (!result.ok) {
        notify('error', result.error);
        return;
      }
      setSearch(result.data);
      setSearchUsage(result.usage);
      recordUsage(result.usage);
      notify('success', 'Search suggestions ready. Choose what fits.');
    });

  const usePrimaryKeyword = () => {
    if (!search) return;
    setPrimaryKeyword(search.primaryKeyword);
    notify('success', 'Primary keyword saved for SEO suggestions.');
  };

  const applyHeading = (suggestion: HeadingSuggestion) => {
    const applied = editorRef.current?.replaceHeading(suggestion.current, suggestion.suggested);
    if (!applied) {
      notify('error', 'That heading is no longer in the article. Refresh the analysis and try again.');
      return;
    }
    setSearch((current) =>
      current
        ? {
            ...current,
            headingSuggestions: current.headingSuggestions.filter(
              (entry) =>
                entry.current !== suggestion.current || entry.suggested !== suggestion.suggested,
            ),
          }
        : current,
    );
    notify('success', 'Heading updated.');
  };

  const runEdit = () =>
    run('edit', async () => {
      if (!hasBody) {
        notify('error', 'Write something first, then use the assistant to refine it.');
        return;
      }
      if (editMode === 'section' && editInstruction.trim().length < 3) {
        notify('error', 'Describe the section you want the assistant to write.');
        return;
      }
      const selectionApplies =
        hasSelection && editMode !== 'continue' && editMode !== 'headings' && editMode !== 'section';
      const selectedText = selectionApplies ? editorRef.current?.getSelectedText() || '' : '';
      const result = await editBlogWritingAction({
        mode: editMode,
        html: selectedText || article.bodyHtml,
        selectedText,
        tone: editTone,
        instruction: editInstruction,
        title: article.title,
      });
      if (!result.ok) {
        notify('error', result.error);
        return;
      }
      setProposal({
        id: `edit-${Date.now()}`,
        label: selectedText
          ? 'Selected passage'
          : editMode === 'headings'
            ? 'Improved headings'
            : editMode === 'continue'
              ? 'Continuation'
              : 'Article revision',
        description: selectedText
          ? 'Only the selected passage will be replaced when you apply this.'
          : editMode === 'continue'
            ? 'This will be added to the end of the article when you apply it.'
            : 'Review the revised article before applying it.',
        html: result.data.html,
        mode: selectedText ? 'selection' : editMode === 'continue' ? 'insert' : 'replace',
        selectionText: selectedText || undefined,
        usage: result.usage,
      });
      recordUsage(result.usage);
      setEditInstruction('');
      notify('success', 'Changes ready. Review them before applying.');
    });

  const applyProposal = () => {
    if (!proposal) return;
    if (proposal.mode === 'selection') {
      editorRef.current?.replaceSelection(proposal.html);
    } else {
      onApplyHtml(proposal.html, proposal.mode);
    }
    if (pendingArticle) {
      if (pendingArticle.title) onApplyTitle(pendingArticle.title);
      if (pendingArticle.excerpt) onApplyExcerpt(pendingArticle.excerpt);
      setVerificationFlags(proposal.flags ?? []);
      setSearch(null);
      setSearchUsage(null);
      setPrimaryKeyword('');
      setFinishing(EMPTY_FINISHING);
    }
    setProposal(null);
    setPendingArticle(null);
    setStage('writing');
    notify('success', proposal.mode === 'selection' ? 'Selected passage updated.' : 'Article updated.');
  };

  const discardProposal = () => {
    setProposal(null);
    setPendingArticle(null);
  };

  const generateExcerpt = () =>
    run('excerpt', async () => {
      const result = await generateBlogExcerptAction({ html: article.bodyHtml, title: article.title });
      if (!result.ok) {
        notify('error', result.error);
        return;
      }
      setFinishing((current) => ({
        ...current,
        excerpt: { text: result.data.excerpt, usage: result.usage },
      }));
      recordUsage(result.usage);
    });

  const generateFaqs = () =>
    run('faqs', async () => {
      const result = await suggestBlogFaqsAction({ html: article.bodyHtml, title: article.title });
      if (!result.ok) {
        notify('error', result.error);
        return;
      }
      setFinishing((current) => ({
        ...current,
        faqs: {
          faqs: result.data.faqs,
          html: buildFaqsHtml(result.data.faqs),
          usage: result.usage,
        },
      }));
      recordUsage(result.usage);
    });

  const generateSeo = () =>
    run('seo', async () => {
      const result = await suggestBlogSeoAction({
        html: article.bodyHtml,
        title: article.title,
        excerpt: article.excerpt,
        primaryKeyword,
      });
      if (!result.ok) {
        notify('error', result.error);
        return;
      }
      setFinishing((current) => ({
        ...current,
        seo: { seo: result.data, usage: result.usage },
      }));
      recordUsage(result.usage);
    });

  const suggestLinks = () =>
    run('links', async () => {
      const result = await suggestBlogInternalLinksAction({
        html: article.bodyHtml,
        title: article.title,
        currentSlug: article.publicSlug || article.slug,
      });
      if (!result.ok) {
        notify('error', result.error);
        return;
      }
      setFinishing((current) => ({
        ...current,
        links: {
          links: result.data.links,
          sectionHtml: result.data.sectionHtml,
          message: result.data.message,
          usage: result.usage,
        },
      }));
      recordUsage(result.usage);
    });

  const applySeo = (seo: SeoSuggestion) => {
    onApplySeo({ seoTitle: seo.seoTitle, seoDescription: seo.seoDescription });
    notify('success', 'SEO title and meta description applied.');
  };

  const insertFaq = (faq: FaqSuggestion) => {
    const html = `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`;
    onApplyHtml(html, 'insert');
    notify('success', 'FAQ added to the end of the article.');
  };

  const insertFaqs = (html: string) => {
    if (!html) return;
    onApplyHtml(html, 'insert');
    notify('success', 'FAQs added to the end of the article.');
  };

  const insertCta = (cta: string) => {
    const trimmed = cta.trim();
    if (!trimmed) return;
    onApplyHtml(`<p>${escapeHtml(trimmed)}</p>`, 'insert');
    notify('success', 'Call to action added to the end of the article.');
  };

  const insertLinks = (html: string) => {
    if (!html) return;
    onApplyHtml(html, 'insert');
    notify('success', 'Related reading section added.');
  };

  const handleImportFile = (file: File) =>
    run('import', async () => {
      const formData = new FormData();
      formData.set('file', file);
      const result = await importBlogDraftAction(formData);
      if (!result.success) {
        notify('error', result.error);
        return;
      }
      setImportedText(result.text);
      setImportedFileName(result.fileName);
      notify('success', 'Draft imported. Review it before using it.');
    });

  const useImportedDraft = () => {
    if (importedText.trim().length < 20) {
      notify('error', 'Paste or import a draft first.');
      return;
    }
    if (hasBody && !replaceImportConfirmed) {
      setReplaceImportConfirmed(true);
      return;
    }
    const html = plainTextToBlogHtml(importedText);
    onApplyHtml(html, 'replace');
    if (!article.title.trim()) {
      const title = extractDraftTitle(importedText);
      if (title) onApplyTitle(title);
    }
    setReplaceImportConfirmed(false);
    setStage('writing');
    setSearch(null);
    setSearchUsage(null);
    setPrimaryKeyword('');
    setFinishing(EMPTY_FINISHING);
    setVerificationFlags([]);
    notify('success', 'Your draft is in the editor. Use the tools below to improve it.');
  };

  const resetStudio = () => {
    setStage('brief');
    setBrief(EMPTY_BRIEF);
    setProposal(null);
    setPendingArticle(null);
    setSearch(null);
    setSearchUsage(null);
    setPrimaryKeyword('');
    setImportedText('');
    setImportedFileName('');
    setReplaceImportConfirmed(false);
    setFinishing(EMPTY_FINISHING);
    setVerificationFlags([]);
  };

  const documentLevelMode =
    editMode === 'continue' || editMode === 'headings' || editMode === 'section';

  const editContextLabel = useMemo(() => {
    if (article.bodyHtml.trim().length === 0) return 'No article text yet';
    if (documentLevelMode) return 'Full article';
    if (!hasSelection) return 'Full article';
    return `Selected passage · ${selectionLength.toLocaleString()} characters`;
  }, [article.bodyHtml, documentLevelMode, hasSelection, selectionLength]);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#e6e2d8] bg-[#fbfaf6] p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e9e6db] text-[#7c866f]">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[13px] font-semibold leading-5 text-[#2d2e28]">Writing studio</p>
              <p className="mt-0.5 text-xs leading-5 text-[#85867d]">
                Describe your idea, generate a draft, then edit and publish.
              </p>
            </div>
          </div>
          {stage === 'brief' && hasBody ? (
            <button
              type="button"
              onClick={() => setStage('writing')}
              className="shrink-0 rounded-md px-1.5 py-1 text-[11px] font-medium text-[#8a8b82] transition hover:bg-[#efede6] hover:text-[#2d2e28]"
            >
              Back to editor
            </button>
          ) : stage !== 'brief' ? (
            <button
              type="button"
              onClick={resetStudio}
              className="shrink-0 rounded-md px-1.5 py-1 text-[11px] font-medium text-[#8a8b82] transition hover:bg-[#efede6] hover:text-[#2d2e28]"
            >
              Start over
            </button>
          ) : null}
        </div>
      </div>

      {proposal && (
        <div ref={proposalRef}>
          <ChangePreview
            proposal={proposal}
            onApply={applyProposal}
            onDiscard={discardProposal}
            busy={busy !== null}
          />
        </div>
      )}

      {stage === 'brief' && (
        <div className="space-y-3">
          <WriterBriefFields
            brief={brief}
            onChange={updateBrief}
            onGenerate={generateArticle}
            busy={busy === 'article'}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <button
              type="button"
              onClick={() => {
                setStage('writing');
                window.setTimeout(() => editorRef.current?.focus(), 50);
              }}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#6d7a5e] hover:underline"
            >
              <PenLine className="h-3.5 w-3.5" /> Write it myself
            </button>
            <button
              type="button"
              onClick={() => setStage('import')}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#6d7a5e] hover:underline"
            >
              <ClipboardPaste className="h-3.5 w-3.5" /> Import an existing draft
            </button>
          </div>
          {hasBody && (
            <p className="px-1 text-[11px] leading-5 text-[#a2a398]">
              Generating a new article will replace the current draft after you review the change.
            </p>
          )}
        </div>
      )}

      {stage === 'import' && (
        <div className="space-y-3">
          <StudioCard
            icon={<ClipboardPaste className="h-3.5 w-3.5" />}
            title="Bring your existing draft"
            description="Paste your writing or import a PDF, DOCX, TXT or Markdown file. Your original meaning stays untouched until you ask for a change."
          >
            <textarea
              value={importedText}
              onChange={(event) => {
                setImportedText(event.target.value.slice(0, 120_000));
                setReplaceImportConfirmed(false);
              }}
              rows={8}
              placeholder="Paste your draft here…"
              className={`${studioInputClass} mt-3 resize-y font-mono text-[12px] leading-5`}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md,text/plain"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleImportFile(file);
                  event.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy !== null}
                className={secondaryButtonClass}
              >
                {busy === 'import' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Import file
              </button>
              {importedFileName && (
                <span className="truncate text-[10.5px] text-[#8a8b82]">{importedFileName}</span>
              )}
              <span className="ml-auto text-[10.5px] text-[#a2a398]">
                {importedText.length.toLocaleString()} characters
              </span>
            </div>

            {replaceImportConfirmed && (
              <div className="mt-3 rounded-lg border border-[#ead9c8] bg-[#fbf3ea] p-3 text-[11.5px] leading-5 text-[#8a5a33]">
                This will replace the current article body. Press the button again to confirm. You
                can undo the replacement with ⌘Z.
              </div>
            )}

            <button
              type="button"
              onClick={useImportedDraft}
              disabled={busy !== null || importedText.trim().length < 20}
              className={`${primaryButtonClass} mt-2.5`}
            >
              <FileText className="h-4 w-4" />
              Use this draft
            </button>
          </StudioCard>

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setStage('brief')} className={secondaryButtonClass}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              type="button"
              onClick={() => {
                setStage('writing');
                window.setTimeout(() => editorRef.current?.focus(), 50);
              }}
              className="text-[11.5px] font-medium text-[#6d7a5e] hover:underline"
            >
              Skip and write myself
            </button>
          </div>
        </div>
      )}

      {stage === 'writing' && (
        <div className="space-y-3">
          {verificationFlags.length > 0 && (
            <div className="rounded-xl border border-[#e8d9bd] bg-[#fdf8ee] p-3.5">
              <div className="flex items-start justify-between gap-2">
                <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#8a5a33]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Verify before publishing
                </p>
                <button
                  type="button"
                  onClick={() => setVerificationFlags([])}
                  className="shrink-0 text-[10.5px] font-medium text-[#8a5a33] hover:underline"
                >
                  Mark reviewed
                </button>
              </div>
              <ul className="mt-1.5 space-y-1.5">
                {verificationFlags.map((flag, index) => (
                  <li key={`${index}-${flag.claim}`} className="text-[11px] leading-5 text-[#7a6649]">
                    <span className="font-medium">“{flag.claim}”</span>
                    {flag.reason ? ` — ${flag.reason}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <StudioCard
            icon={<PenLine className="h-3.5 w-3.5" />}
            title="Refine the writing"
            description={
              documentLevelMode
                ? 'This action works on the full article, even if text is selected.'
                : hasSelection
                  ? 'A passage is selected. AI changes will replace only that passage.'
                  : 'Select a passage to refine only that text, or work on the full article.'
            }
            action={
              <span className="rounded-full bg-[#f3f1ea] px-2.5 py-1 text-[10.5px] font-medium text-[#6d7a5e]">
                {editContextLabel}
              </span>
            }
          >
            <div className="mt-4 grid grid-cols-3 gap-1.5">
              {EDIT_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setEditMode(mode.value)}
                  className={`rounded-md px-1.5 py-2 text-[11.5px] font-medium leading-4 transition ${
                    editMode === mode.value
                      ? 'bg-[#292a25] text-white'
                      : 'bg-[#f3f1ea] text-[#5f6058] hover:bg-[#eae7de]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {editMode === 'tone' && (
              <input
                value={editTone}
                onChange={(event) => setEditTone(event.target.value.slice(0, 120))}
                placeholder="Tone — e.g. warmer, more direct, more formal"
                className={`${studioInputClass} mt-2`}
              />
            )}

            <textarea
              value={editInstruction}
              onChange={(event) => setEditInstruction(event.target.value.slice(0, 2000))}
              rows={2}
              placeholder={
                editMode === 'section'
                  ? 'Describe the section you want — e.g. a checklist for first-time renters'
                  : 'Optional instruction — e.g. keep it under 120 words'
              }
              className={`${studioInputClass} mt-2.5 resize-y`}
            />

            <button
              type="button"
              onClick={runEdit}
              disabled={busy !== null || !hasBody}
              className={`${primaryButtonClass} mt-2`}
            >
              {busy === 'edit' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
              {hasSelection && !documentLevelMode
                ? 'Refine selection'
                : editMode === 'continue'
                  ? 'Continue article'
                  : editMode === 'headings'
                    ? 'Improve headings'
                    : editMode === 'section'
                      ? 'Write section'
                      : 'Refine article'}
            </button>
            <p className="mt-2 text-center text-[11px] leading-5 text-[#a2a398]">
              You will see the proposed change before anything is applied.
            </p>
          </StudioCard>

          <SearchAssistant
            suggestions={search}
            usage={searchUsage}
            busy={busy !== null}
            hasBody={hasBody}
            primaryKeyword={primaryKeyword}
            onSuggest={runSearchAnalysis}
            onUsePrimary={usePrimaryKeyword}
            onApplyHeading={applyHeading}
            faqs={finishing.faqs}
            faqBusy={busy === 'faqs'}
            onGenerateFaqs={generateFaqs}
            onInsertFaq={insertFaq}
            onInsertAllFaqs={insertFaqs}
          />

          <FinishingTools
            finishing={finishing}
            busyKey={busy}
            hasBody={hasBody}
            currentExcerpt={article.excerpt}
            onGenerateExcerpt={generateExcerpt}
            onGenerateSeo={generateSeo}
            onSuggestLinks={suggestLinks}
            onApplyExcerpt={onApplyExcerpt}
            onApplySeo={applySeo}
            onInsertCta={insertCta}
            onInsertLinks={insertLinks}
          />
        </div>
      )}

      <UsageTotal usage={usage} />
    </div>
  );
}
