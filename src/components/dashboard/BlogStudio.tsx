'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  ChevronRight,
  Cloud,
  CloudOff,
  Eye,
  FilePlus2,
  Focus,
  Loader2,
  PanelRight,
  PenLine,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createBlogArticleAction,
  deleteBlogArticleAction,
  publishBlogArticleAction,
  saveBlogArticleAction,
  unpublishBlogArticleAction,
} from '@/app/actions/blog-actions';
import { uploadPageMedia } from '@/app/editor/actions';
import {
  describeSaveState,
  formatEditorDate,
  getEditorWordCount,
  slugifyArticleTitle,
} from '@/lib/blog-editor';
import { RichTextEditor, type RichTextEditorHandle } from '@/components/blog/RichTextEditor';
import { ArticlePreview } from '@/components/blog/ArticlePreview';
import { ArticleSettings, type SettingsTab } from '@/components/blog/ArticleSettings';
import { ConfirmDialog } from '@/components/blog/ConfirmDialog';
import type { ArticleStatusFilter, BlogArticleDraft } from '@/components/blog/types';

type SaveState = 'saved' | 'unsaved' | 'saving' | 'error';

export function BlogStudio({
  initialArticles,
  username,
  isGrowth,
  growthPostCount,
}: {
  initialArticles: BlogArticleDraft[];
  username: string;
  isGrowth: boolean;
  growthPostCount: number;
}) {
  const router = useRouter();
  const [articles, setArticles] = useState<BlogArticleDraft[]>(initialArticles);
  const [workspacePostCount, setWorkspacePostCount] = useState(growthPostCount);
  const [selectedId, setSelectedId] = useState<string | null>(initialArticles[0]?.id ?? null);
  const [draft, setDraft] = useState<BlogArticleDraft | null>(initialArticles[0] ?? null);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [preview, setPreview] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('post');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ArticleStatusFilter>('ALL');
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const editorRef = useRef<RichTextEditorHandle | null>(null);
  const draftRef = useRef<BlogArticleDraft | null>(draft);
  const articlesRef = useRef<BlogArticleDraft[]>(articles);
  const dirtyRef = useRef(false);
  const versionRef = useRef(0);
  const inFlightRef = useRef<Promise<boolean> | null>(null);
  const slugTouchedRef = useRef(true);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    articlesRef.current = articles;
  }, [articles]);

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    if (type === 'success') toast.success(message);
    else toast.error(message);
  }, []);

  const patchDraft = useCallback((patch: Partial<BlogArticleDraft>) => {
    const current = draftRef.current;
    if (!current) return;
    const next = { ...current, ...patch };
    draftRef.current = next;
    versionRef.current += 1;
    dirtyRef.current = true;
    setDraft(next);
    setArticles((previous) =>
      previous.map((article) => (article.id === next.id ? { ...article, ...patch } : article)),
    );
    setSaveState('unsaved');
  }, []);

  const persist = useCallback(async (silent = true): Promise<boolean> => {
    if (inFlightRef.current) {
      try {
        await inFlightRef.current;
      } catch {
        // The queued attempt below decides whether another save is needed.
      }
    }

    const current = draftRef.current;
    if (!current || !dirtyRef.current) return true;

    const version = versionRef.current;
    setSaveState('saving');

    const attempt = (async () => {
      const result = await saveBlogArticleAction({
        articleId: current.id,
        title: current.title,
        slug: current.slug,
        excerpt: current.excerpt,
        bodyHtml: current.bodyHtml,
        featuredImageUrl: current.featuredImageUrl,
        featuredImageAlt: current.featuredImageAlt,
        categories: current.categories,
        tags: current.tags,
        authorName: current.authorName,
        authorAvatarUrl: current.authorAvatarUrl,
        seoTitle: current.seoTitle,
        seoDescription: current.seoDescription,
        canonicalUrl: current.canonicalUrl,
        ogImage: current.ogImage,
        noindex: current.noindex,
      });

      if (!result.success) {
        setSaveState('error');
        if (!silent) toast.error(result.error || 'The article could not be saved.');
        return false;
      }

      if (result.slug && result.slug !== draftRef.current?.slug) {
        const active = draftRef.current;
        if (active) {
          const next = { ...active, slug: result.slug };
          draftRef.current = next;
          setDraft(next);
          setArticles((previous) =>
            previous.map((article) =>
              article.id === next.id ? { ...article, slug: result.slug } : article,
            ),
          );
        }
      }

      if (version === versionRef.current) {
        dirtyRef.current = false;
        setSaveState('saved');
        setLastSavedAt(result.updatedAt ? new Date(result.updatedAt) : new Date());
      } else {
        setSaveState('unsaved');
      }
      return true;
    })();

    inFlightRef.current = attempt;
    try {
      return await attempt;
    } finally {
      if (inFlightRef.current === attempt) inFlightRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!draft || preview) return;
    if (!dirtyRef.current) return;
    const timer = window.setTimeout(() => {
      void persist(true);
    }, 1300);
    return () => window.clearTimeout(timer);
  }, [draft, preview, persist]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  useEffect(() => {
    if (!listOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setListOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [listOpen]);

  const loadArticle = useCallback(
    (article: BlogArticleDraft) => {
      draftRef.current = article;
      setDraft(article);
      setSelectedId(article.id);
      setPreview(false);
      setListOpen(false);
      setSettingsOpen(false);
      setSettingsTab('post');
      dirtyRef.current = false;
      setSaveState('saved');
      setLastSavedAt(article.updatedAt ? new Date(article.updatedAt) : null);
      slugTouchedRef.current = true;
    },
    [],
  );

  const selectArticle = useCallback(
    async (id: string) => {
      if (id === selectedId) {
        setListOpen(false);
        return;
      }
      const saved = await persist(false);
      if (!saved) return;
      const next = articlesRef.current.find((article) => article.id === id);
      if (next) loadArticle(next);
    },
    [loadArticle, persist, selectedId],
  );

  const createArticle = useCallback(async () => {
    if (busy) return;
    const saved = await persist(false);
    if (!saved) return;
    setBusy('create');
    try {
      const result = await createBlogArticleAction();
      if ('error' in result || !result.article) {
        toast.error(result.error || 'The article could not be created.');
        return;
      }
      if (result.warning) toast.warning(result.warning);
      if (typeof result.articleCount === 'number') setWorkspacePostCount(result.articleCount);
      const article = result.article as BlogArticleDraft;
      articlesRef.current = [article, ...articlesRef.current];
      setArticles(articlesRef.current);
      draftRef.current = article;
      setDraft(article);
      setSelectedId(article.id);
      setPreview(false);
      setListOpen(false);
      setSettingsOpen(false);
      setSettingsTab('assistant');
      dirtyRef.current = false;
      setSaveState('saved');
      setLastSavedAt(new Date(article.updatedAt));
      slugTouchedRef.current = false;
      toast.success('New draft created');
      router.refresh();
    } finally {
      setBusy(null);
    }
  }, [busy, persist, router]);

  const publish = useCallback(async () => {
    const current = draftRef.current;
    if (!current || busy) return;
    if (!current.title.trim()) {
      toast.error('Add a title before publishing.');
      setSettingsOpen(true);
      setSettingsTab('post');
      return;
    }
    setBusy('publish');
    try {
      const saved = await persist(false);
      const latest = draftRef.current;
      if (!saved || !latest) return;
      const result = await publishBlogArticleAction(latest.id);
      if (!result.success) {
        toast.error(result.error || 'The article could not be published.');
        return;
      }
      const patch = {
        status: result.status || 'PUBLISHED',
        publicSlug: result.publicSlug || latest.slug,
        publishedAt: result.publishedAt,
      };
      const next = { ...latest, ...patch };
      draftRef.current = next;
      setDraft(next);
      setArticles((previous) =>
        previous.map((article) => (article.id === next.id ? { ...article, ...patch } : article)),
      );
      dirtyRef.current = false;
      setSaveState('saved');
      toast.success('Article published');
      router.refresh();
    } finally {
      setBusy(null);
    }
  }, [busy, persist, router]);

  const unpublish = useCallback(async () => {
    const current = draftRef.current;
    if (!current || busy) return;
    setBusy('unpublish');
    try {
      const result = await unpublishBlogArticleAction(current.id);
      if (!result.success) {
        toast.error(result.error || 'The article could not be unpublished.');
        return;
      }
      const next = { ...current, status: 'DRAFT', publicSlug: null };
      draftRef.current = next;
      setDraft(next);
      setArticles((previous) =>
        previous.map((article) =>
          article.id === next.id ? { ...article, status: 'DRAFT', publicSlug: null } : article,
        ),
      );
      toast.success('Article moved back to drafts');
      router.refresh();
    } finally {
      setBusy(null);
    }
  }, [busy, router]);

  const removeArticle = useCallback(async () => {
    const current = draftRef.current;
    if (!current) return;
    setBusy('delete');
    try {
      const result = await deleteBlogArticleAction(current.id);
      if (!result.success) {
        toast.error(result.error || 'The article could not be deleted.');
        return;
      }
      const remaining = articlesRef.current.filter((article) => article.id !== current.id);
      articlesRef.current = remaining;
      setArticles(remaining);
      setConfirmDelete(false);
      if (remaining[0]) loadArticle(remaining[0]);
      else {
        draftRef.current = null;
        setDraft(null);
        setSelectedId(null);
        setSaveState('saved');
      }
      toast.success('Article deleted');
      router.refresh();
    } finally {
      setBusy(null);
    }
  }, [loadArticle, router]);

  const uploadImage = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.set('file', file);
    const uploaded = await uploadPageMedia(formData);
    return uploaded.publicUrl;
  }, []);

  const changeTitle = useCallback(
    (title: string) => {
      const patch: Partial<BlogArticleDraft> = { title };
      if (!slugTouchedRef.current) patch.slug = slugifyArticleTitle(title);
      patchDraft(patch);
    },
    [patchDraft],
  );

  const applyHtml = useCallback(
    (html: string, mode: 'replace' | 'insert') => {
      const editor = editorRef.current;
      if (editor) {
        if (mode === 'replace') editor.replaceAll(html);
        else editor.appendHTML(html);
      } else if (mode === 'replace') {
        // The editor is unmounted in preview mode; apply straight to the draft.
        patchDraft({ bodyHtml: html });
      } else if (draftRef.current) {
        patchDraft({ bodyHtml: `${draftRef.current.bodyHtml}${html}` });
      }
      setPreview(false);
    },
    [patchDraft],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return articles.filter((article) => {
      if (filter === 'DRAFT' && article.status !== 'DRAFT') return false;
      if (filter === 'PUBLISHED' && article.status !== 'PUBLISHED') return false;
      if (!needle) return true;
      return (
        article.title.toLowerCase().includes(needle) ||
        article.excerpt.toLowerCase().includes(needle) ||
        article.slug.toLowerCase().includes(needle)
      );
    });
  }, [articles, filter, query]);

  const saveLabel = describeSaveState(saveState, lastSavedAt);
  const selectedIsPublished = draft?.status === 'PUBLISHED';

  return (
    <div className="flex h-[calc(100dvh-5rem)] min-h-[620px] flex-col lg:h-[calc(100dvh-7rem)]">
      {isGrowth && workspacePostCount >= 16 && <div role="status" className="mx-4 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 lg:mx-0">{workspacePostCount >= 20 ? 'You have reached the 20 post limit. Delete a post to create another.' : `You have ${workspacePostCount} of 20 Growth blog posts. Delete a post to free a slot.`}</div>}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a0a196]">
            <span>Content</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#6d7a5e]">Blog studio</span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="truncate font-serif text-[clamp(1.6rem,3vw,2.1rem)] leading-none tracking-[-0.03em] text-[#1f201b]">
              {draft?.title.trim() || 'Blog studio'}
            </h1>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                saveState === 'error'
                  ? 'border-[#e2c4ba] bg-[#f9efeb] text-[#a33a2b]'
                  : saveState === 'unsaved'
                    ? 'border-[#e8ddc6] bg-[#fbf5e9] text-[#8a6a2f]'
                    : 'border-[#e2dfd6] bg-white/70 text-[#77786f]'
              }`}
            >
              {saveState === 'saving' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : saveState === 'error' ? (
                <CloudOff className="h-3 w-3" />
              ) : saveState === 'unsaved' ? (
                <PenLine className="h-3 w-3" />
              ) : (
                <Cloud className="h-3 w-3" />
              )}
              {saveLabel}
            </span>
            {saveState === 'error' && (
              <button
                type="button"
                onClick={() => void persist(false)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#a33a2b] hover:underline"
              >
                <RotateCcw className="h-3 w-3" /> Retry
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {!focusMode && (
            <button
              type="button"
              onClick={() => setListOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e2dfd6] bg-white px-2.5 text-xs font-medium text-[#5f6058] hover:border-[#c8c3b6] lg:hidden"
            >
              Articles
            </button>
          )}
          <button
            type="button"
            onClick={() => setPreview((value) => !value)}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition ${
              preview
                ? 'border-[#292a25] bg-[#292a25] text-white'
                : 'border-[#e2dfd6] bg-white text-[#5f6058] hover:border-[#c8c3b6]'
            }`}
          >
            {preview ? <PenLine className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {preview ? 'Write' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={() => {
              const next = !focusMode;
              setFocusMode(next);
              if (next) {
                setListOpen(false);
                setSettingsOpen(false);
              }
            }}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition ${
              focusMode
                ? 'border-[#292a25] bg-[#292a25] text-white'
                : 'border-[#e2dfd6] bg-white text-[#5f6058] hover:border-[#c8c3b6]'
            }`}
            title={focusMode ? 'Exit focus mode' : 'Focus mode'}
          >
            <Focus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Focus</span>
          </button>
          {!focusMode && (
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e2dfd6] bg-white px-2.5 text-xs font-medium text-[#5f6058] hover:border-[#c8c3b6] xl:hidden"
            >
              <PanelRight className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          )}

          {selectedIsPublished ? (
            <>
              <Link
                href={`/${username}/blog/${draft?.publicSlug || draft?.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e2dfd6] bg-white px-2.5 text-xs font-medium text-[#5f6058] hover:border-[#c8c3b6]"
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View live</span>
              </Link>
              <button
                type="button"
                onClick={() => void publish()}
                disabled={busy !== null}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#292a25] px-3 text-xs font-medium text-white transition hover:bg-[#42433c] disabled:opacity-50"
              >
                {busy === 'publish' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Update live
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => void publish()}
              disabled={!draft || busy !== null}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#292a25] px-3.5 text-xs font-medium text-white transition hover:bg-[#42433c] disabled:opacity-40"
            >
              {busy === 'publish' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Publish
            </button>
          )}
        </div>
      </header>

      <div className="relative mt-4 flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#e4e1d8] bg-[#fffefb] shadow-[0_18px_50px_rgba(40,39,33,0.06)]">
        {!focusMode && (
          <aside
            className={`absolute inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] shrink-0 flex-col border-r border-[#ece9e1] bg-[#fbfaf6] transition-transform duration-200 lg:static lg:z-auto lg:w-[248px] lg:max-w-none lg:translate-x-0 ${
              listOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#ece9e1] px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8b82]">
                Articles <span className="font-normal text-[#aaa79c]">{articles.length}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => void createArticle()}
                  disabled={busy !== null}
                  className="inline-flex h-7 items-center gap-1 rounded-md bg-[#292a25] px-2.5 text-[11px] font-medium text-white hover:bg-[#42433c] disabled:opacity-50"
                >
                  {busy === 'create' ? <Loader2 className="h-3 w-3 animate-spin" /> : <FilePlus2 className="h-3 w-3" />}
                  New
                </button>
                <button
                  type="button"
                  onClick={() => setListOpen(false)}
                  className="grid h-7 w-7 place-items-center rounded-md text-[#8a8b82] hover:bg-[#efede6] lg:hidden"
                  aria-label="Close article list"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 px-3 py-2.5">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a9a79c]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search articles"
                  className="h-9 w-full rounded-md border border-[#e2dfd6] bg-white pl-8 pr-2.5 text-xs text-[#2d2e28] outline-none placeholder:text-[#aaa79c] focus:border-[#292a25]"
                />
              </label>
              <div className="flex rounded-md bg-[#f0ede6] p-0.5 text-[11px] font-medium">
                {(
                  [
                    ['ALL', 'All'],
                    ['DRAFT', 'Drafts'],
                    ['PUBLISHED', 'Live'],
                  ] as Array<[ArticleStatusFilter, string]>
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`flex-1 rounded px-1.5 py-1 transition ${
                      filter === value
                        ? 'bg-white text-[#292a25] shadow-sm'
                        : 'text-[#8a8b82] hover:text-[#5f6058]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
              {filtered.length === 0 ? (
                <div className="px-2 py-8 text-center">
                  <p className="text-xs font-medium text-[#5f6058]">
                    {articles.length ? 'No matching articles' : 'No articles yet'}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#9a9b92]">
                    {articles.length
                      ? 'Try a different search or filter.'
                      : 'Start with a draft and shape it in the studio.'}
                  </p>
                </div>
              ) : (
                filtered.map((article) => {
                  const active = article.id === selectedId;
                  return (
                    <button
                      key={article.id}
                      type="button"
                      onClick={() => void selectArticle(article.id)}
                      className={`group mb-1 w-full rounded-lg px-2.5 py-2 text-left transition ${
                        active
                          ? 'bg-[#eeece4] text-[#292a25]'
                          : 'text-[#4e4f48] hover:bg-[#f3f1ea]'
                      }`}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="line-clamp-2 text-xs font-medium leading-5">
                          {article.title.trim() || 'Untitled article'}
                        </span>
                        <span
                          className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                            article.status === 'PUBLISHED'
                              ? 'bg-[#7f916e]'
                              : article.status === 'SCHEDULED'
                                ? 'bg-[#b18b46]'
                                : 'bg-[#c9c5ba]'
                          }`}
                          aria-label={article.status.toLowerCase()}
                        />
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[10.5px] text-[#9a9b92]">
                        <span>{formatEditorDate(article.updatedAt) || 'Just now'}</span>
                        <span className="h-0.5 w-0.5 rounded-full bg-[#c9c5ba]" />
                        <span>{getEditorWordCount(article.bodyHtml)} words</span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-[#ece9e1] px-3 py-2.5">
              <p className="text-[11px] leading-4 text-[#a2a398]">
                Autosave keeps drafts safe. Published articles update only when you press update.
              </p>
            </div>
          </aside>
        )}

        {listOpen && !focusMode && (
          <button
            type="button"
            className="absolute inset-0 z-40 bg-[#1b1c17]/35 lg:hidden"
            aria-label="Close article list"
            onClick={() => setListOpen(false)}
          />
        )}

        <main className="flex min-w-0 flex-1 flex-col">
          {draft ? (
            preview ? (
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#fffefb]">
                <ArticlePreview article={draft} />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="shrink-0 border-b border-[#ece9e1] px-5 pb-3 pt-4 sm:px-7">
                  <input
                    value={draft.title}
                    onChange={(event) => changeTitle(event.target.value)}
                    placeholder="Article title"
                    aria-label="Article title"
                    className="w-full border-0 bg-transparent font-serif text-[clamp(1.8rem,3.6vw,2.7rem)] leading-[1.08] tracking-[-0.035em] text-[#1b1c17] outline-none placeholder:text-[#c3c0b5]"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[#9a9b92]">
                    {draft.status === 'PUBLISHED' ? (
                      <span className="inline-flex items-center gap-1 font-medium text-[#718162]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#7f916e]" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-[#8a8b82]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c9c5ba]" />
                        Draft
                      </span>
                    )}
                    <span className="h-0.5 w-0.5 rounded-full bg-[#c9c5ba]" />
                    <span>{getEditorWordCount(draft.bodyHtml)} words</span>
                    <span className="h-0.5 w-0.5 rounded-full bg-[#c9c5ba]" />
                    <span>Last edit {formatEditorDate(draft.updatedAt) || 'just now'}</span>
                  </div>
                </div>
                <RichTextEditor
                  ref={editorRef}
                  documentId={draft.id}
                  initialHtml={draft.bodyHtml}
                  onChange={(html) => patchDraft({ bodyHtml: html })}
                  onSaveShortcut={() => void persist(false)}
                  onUploadImage={uploadImage}
                  className="min-h-0 flex-1"
                />
              </div>
            )
          ) : (
            <div className="grid flex-1 place-items-center px-6 py-12">
              <div className="max-w-sm text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f1efe8] text-[#7c866f]">
                  <PenLine className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-serif text-3xl tracking-[-0.03em] text-[#1f201b]">
                  A blank page, done properly.
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#85867d]">
                  Create a draft and write it yourself, or start from an idea with the writing
                  assistant. You can preview and publish whenever it feels ready.
                </p>
                <div className="mt-5 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => void createArticle()}
                    disabled={busy !== null}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#292a25] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#42433c] disabled:opacity-50"
                  >
                    {busy === 'create' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
                    New article
                  </button>
                  <button
                    type="button"
                    onClick={() => setListOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2dfd6] px-3.5 py-2 text-sm font-medium text-[#5f6058] hover:border-[#c8c3b6]"
                  >
                    Browse articles
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {!focusMode && draft && (
          <aside
            className={`absolute inset-y-0 right-0 z-50 flex w-[380px] max-w-[94vw] shrink-0 flex-col border-l border-[#ece9e1] bg-[#fbfaf6] transition-transform duration-200 xl:static xl:z-auto xl:w-[380px] xl:max-w-none xl:translate-x-0 ${
              settingsOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#ece9e1] px-4 py-3 xl:hidden">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8b82]">
                Article settings
              </p>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-md text-[#8a8b82] hover:bg-[#efede6]"
                aria-label="Close settings"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <ArticleSettings
              article={draft}
              username={username}
              tab={settingsTab}
              onTabChange={setSettingsTab}
              onChange={patchDraft}
              onUploadImage={uploadImage}
              onUnpublish={() => void unpublish()}
              onDelete={() => setConfirmDelete(true)}
              onApplyHtml={applyHtml}
              onApplyExcerpt={(excerpt) => patchDraft({ excerpt })}
              onApplyTitle={changeTitle}
              onApplySeo={(seo) =>
                patchDraft({ seoTitle: seo.seoTitle, seoDescription: seo.seoDescription })
              }
              editorRef={editorRef}
              notify={notify}
              busy={busy !== null}
            />
          </aside>
        )}

        {settingsOpen && draft && !focusMode && (
          <div className="absolute inset-0 z-40 xl:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-[#1b1c17]/35"
              aria-label="Close settings"
              onClick={() => setSettingsOpen(false)}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this article?"
        description="The draft and its published snapshot will be removed. Any old URLs will stop working. This cannot be undone."
        confirmLabel="Delete article"
        busy={busy === 'delete'}
        onConfirm={() => void removeArticle()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
