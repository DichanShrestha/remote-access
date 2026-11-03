'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Check,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Globe2,
  HelpCircle,
  Home,
  Images,
  Info,
  Loader2,
  Mail,
  Newspaper,
  Pencil,
  Plus,
  Settings2,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  createWebsitePage,
  deleteWebsitePage,
  publishWebsitePage,
  reorderWebsitePages,
  unpublishWebsitePage,
  updateWebsitePage,
} from '@/app/actions/page-actions';
import {
  CREATABLE_PAGE_TYPES,
  PAGE_TYPE_META,
  getPageLayouts,
  slugifyPageTitle,
  type CreatablePageType,
  type WebsitePageType,
} from '@/lib/page-engine/page-types';
import { cn } from '@/lib/utils';

export type PageRow = {
  id: string;
  title: string;
  slug: string;
  pageType: WebsitePageType;
  isPublished: boolean;
  showInNavigation: boolean;
  navOrder: number;
  updatedAt: string;
  path: string;
};

const TYPE_ICONS: Record<WebsitePageType, LucideIcon> = {
  HOME: Home,
  ABOUT: Info,
  SERVICES: Briefcase,
  PRODUCTS: ShoppingBag,
  CONTACT: Mail,
  FAQ: HelpCircle,
  GALLERY: Images,
  BLOG: Newspaper,
  CUSTOM: FileText,
};

function isError(result: { error?: string }): result is { error: string } {
  return typeof result.error === 'string' && result.error.length > 0;
}

export type ArticleSummary = {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  updatedAt: string;
};

export function PagesClient({
  username,
  pages: initialPages,
  articles: initialArticles = [],
  homePageId,
}: {
  username: string;
  pages: PageRow[];
  articles?: ArticleSummary[];
  homePageId: string | null;
}) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [articles, setArticles] = useState<ArticleSummary[]>(initialArticles);
  const [blogExpanded, setBlogExpanded] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [settingsPageId, setSettingsPageId] = useState<string | null>(null);
  const [deletePageId, setDeletePageId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setPages(initialPages);
  }, [initialPages]);

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  // Real-time synchronization with Blog Studio
  useEffect(() => {
    const handleBlogSync = (event: Event) => {
      const custom = event as CustomEvent<{
        action: 'create' | 'delete' | 'rename' | 'status';
        article?: ArticleSummary;
        id?: string;
        title?: string;
        status?: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
      }>;
      if (!custom.detail) return;
      const { action, article, id, title, status } = custom.detail;

      setArticles((prev) => {
        if (action === 'create' && article) {
          if (prev.some((a) => a.id === article.id)) return prev;
          return [article, ...prev];
        }
        if (action === 'delete' && id) {
          return prev.filter((a) => a.id !== id);
        }
        if (action === 'rename' && id && title !== undefined) {
          return prev.map((a) => (a.id === id ? { ...a, title } : a));
        }
        if (action === 'status' && id && status) {
          return prev.map((a) => (a.id === id ? { ...a, status } : a));
        }
        return prev;
      });
    };

    window.addEventListener('pageory:blog-sync', handleBlogSync);
    return () => window.removeEventListener('pageory:blog-sync', handleBlogSync);
  }, []);

  const settingsPage = useMemo(
    () => pages.find((page) => page.id === settingsPageId) || null,
    [pages, settingsPageId],
  );
  const deletePage = useMemo(
    () => pages.find((page) => page.id === deletePageId) || null,
    [pages, deletePageId],
  );

  const homeIndex = pages.findIndex((page) => page.id === homePageId);

  function updatePage(next: PageRow) {
    setPages((current) => current.map((page) => (page.id === next.id ? next : page)));
  }

  function toggleNavigation(page: PageRow) {
    startTransition(async () => {
      const result = await updateWebsitePage({
        pageId: page.id,
        title: page.title,
        slug: page.slug,
        showInNavigation: !page.showInNavigation,
      });
      if (isError(result)) {
        toast.error(result.error);
        return;
      }
      updatePage({ ...page, showInNavigation: !page.showInNavigation });
      toast.success(page.showInNavigation ? 'Hidden from navigation.' : 'Added to navigation.');
      router.refresh();
    });
  }

  function togglePublished(page: PageRow) {
    startTransition(async () => {
      const result = page.isPublished
        ? await unpublishWebsitePage(page.id)
        : await publishWebsitePage(page.id);
      if (isError(result)) {
        toast.error(result.error);
        return;
      }
      updatePage({ ...page, isPublished: !page.isPublished });
      toast.success(page.isPublished ? 'Page moved to draft.' : 'Page published.');
      router.refresh();
    });
  }

  function movePage(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= pages.length) return;
    if (pages[index].id === homePageId) return;
    if (targetIndex === homeIndex) return;

    const next = [...pages];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    const reordered = next.map((page, order) => ({ ...page, navOrder: order }));
    setPages(reordered);

    startTransition(async () => {
      const result = await reorderWebsitePages(reordered.map((page) => page.id));
      if (isError(result)) {
        toast.error(result.error);
        setPages(initialPages);
        return;
      }
      toast.success('Navigation order updated.');
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deletePage) return;
    startTransition(async () => {
      const result = await deleteWebsitePage(deletePage.id);
      if (isError(result)) {
        toast.error(result.error);
        return;
      }
      setPages((current) => current.filter((page) => page.id !== deletePage.id));
      setDeletePageId(null);
      toast.success('Page deleted.');
      router.refresh();
    });
  }

  return (
    <div className="max-w-[1100px] mx-auto pb-20">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E8E5DF]">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-[#292A25] font-serif">Pages</h1>
          <p className="text-[#777970] text-[15px] mt-2">
            Add and manage every page on <span className="font-medium text-[#292A25]">/{username}</span>. Your header,
            footer, and design are shared automatically.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href={homePageId ? `/editor?page=${homePageId}` : '/editor'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E8E5DF] bg-white text-xs font-medium text-[#565850] hover:bg-[#FBF9F5] hover:text-[#171717] transition-colors"
          >
            <Settings2 size={14} /> Website design
          </Link>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-[#262626] transition-colors shadow-xs"
          >
            <Plus size={14} /> Add page
          </button>
        </div>
      </header>

      <div className="mt-8 rounded-2xl border border-[#E8E5DF] bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E8E5DF] bg-[#FBF9F5]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#777970]">
            {pages.length} page{pages.length === 1 ? '' : 's'}
          </p>
          <p className="text-[11px] text-[#8C8D85]">Published pages appear in your live navigation.</p>
        </div>

        {pages.length === 0 ? (
          <div className="p-12 text-center">
            <Globe2 className="mx-auto text-[#B8B5AD]" size={28} />
            <p className="mt-3 text-sm font-medium text-[#292A25]">Your website needs a homepage.</p>
            <p className="mt-1 text-xs text-[#777970]">Choose a template to get started.</p>
            <Link href="/onboarding/templates" className="mt-4 inline-flex rounded-xl bg-[#171717] px-4 py-2 text-xs font-medium text-white">
              Choose a template
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[#EFECE5]">
            {pages.map((page, index) => {
              const Icon = TYPE_ICONS[page.pageType] || FileText;
              const isHome = page.id === homePageId;
              const isBlog = page.pageType === 'BLOG' || page.slug === 'blog';
              return (
                <li key={page.id} className="flex flex-col">
                  <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-3.5">
                      {isBlog ? (
                        <button
                          type="button"
                          onClick={() => setBlogExpanded((prev) => !prev)}
                          className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#F2EFE9] text-[#565850] hover:bg-[#E8E5DF] transition-colors relative"
                          title={blogExpanded ? 'Collapse blog posts' : 'Expand blog posts'}
                        >
                          <Icon size={16} />
                          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white border border-[#E8E5DF] text-[#777970] shadow-2xs">
                            <ChevronRight size={10} className={cn('transition-transform duration-200', blogExpanded && 'rotate-90')} />
                          </span>
                        </button>
                      ) : (
                        <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#F2EFE9] text-[#565850]">
                          <Icon size={16} />
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-[#292A25]">{isHome ? 'Homepage' : page.title}</p>
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            page.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
                          )}>
                            {page.isPublished ? 'Published' : 'Draft'}
                          </span>
                          {isHome && (
                            <span className="rounded-full bg-[#F2EFE9] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#777970]">
                              Homepage
                            </span>
                          )}
                          {isBlog && (
                            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-700 border border-purple-200/60">
                              Blog Index
                            </span>
                          )}
                          {!page.showInNavigation && !isHome && (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-[#8C8D85]">
                              <EyeOff size={11} /> Hidden
                            </span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-xs text-[#777970]">
                          {page.path}
                          <span className="mx-1.5 text-[#C9C5BC]">·</span>
                          {PAGE_TYPE_META[page.pageType].label}
                          <span className="mx-1.5 text-[#C9C5BC]">·</span>
                          Updated {formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                      <div className="mr-1 flex items-center rounded-lg border border-[#E8E5DF]">
                        <button
                          onClick={() => movePage(index, -1)}
                          disabled={pending || isHome || index === 0 || index - 1 === homeIndex}
                          className="p-1.5 text-[#777970] hover:bg-[#F6F4EE] disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          onClick={() => movePage(index, 1)}
                          disabled={pending || isHome || index === pages.length - 1}
                          className="p-1.5 text-[#777970] hover:bg-[#F6F4EE] disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>

                      {!isHome && (
                        <button
                          onClick={() => toggleNavigation(page)}
                          disabled={pending}
                          className="rounded-lg border border-[#E8E5DF] p-2 text-[#777970] hover:bg-[#F6F4EE] disabled:opacity-40"
                          title={page.showInNavigation ? 'Hide from navigation' : 'Show in navigation'}
                        >
                          {page.showInNavigation ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      )}

                      <Link
                        href={`/editor?page=${page.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E5DF] px-3 py-2 text-xs font-medium text-[#565850] hover:bg-[#F6F4EE]"
                      >
                        <Pencil size={13} /> Edit
                      </Link>

                      <a
                        href={page.path}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-[#E8E5DF] p-2 text-[#777970] hover:bg-[#F6F4EE]"
                        title="View page"
                      >
                        <ExternalLink size={14} />
                      </a>

                      {!isHome && (
                        <>
                          <button
                            onClick={() => togglePublished(page)}
                            disabled={pending}
                            className={cn(
                              'rounded-lg border px-3 py-2 text-xs font-medium disabled:opacity-40',
                              page.isPublished
                                ? 'border-[#E8E5DF] text-[#565850] hover:bg-[#F6F4EE]'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                            )}
                          >
                            {page.isPublished ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => setSettingsPageId(page.id)}
                            className="rounded-lg border border-[#E8E5DF] p-2 text-[#777970] hover:bg-[#F6F4EE]"
                            title="Page settings"
                          >
                            <Settings2 size={14} />
                          </button>
                          {!isBlog && (
                            <button
                              onClick={() => setDeletePageId(page.id)}
                              className="rounded-lg border border-[#E8E5DF] p-2 text-[#A25A5A] hover:bg-[#FDF3F3]"
                              title="Delete page"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Nested Blog Posts under Blog */}
                  {isBlog && blogExpanded && (
                    <div className="bg-[#FAF8F5] border-t border-[#EFECE5] px-5 sm:px-8 py-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-[#8C8D85]" />
                          <h4 className="text-[11px] font-semibold text-[#565850] uppercase tracking-wider">
                            Blog Posts ({articles.length})
                          </h4>
                        </div>
                        <Link
                          href="/dashboard/blog"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E5DF] bg-white px-2.5 py-1 text-xs font-medium text-[#565850] hover:bg-[#F6F4EE] transition shadow-2xs"
                        >
                          <Plus size={12} /> New post
                        </Link>
                      </div>

                      {articles.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#E8E5DF] p-6 text-center bg-white/70">
                          <p className="text-xs text-[#777970]">No blog posts yet.</p>
                          <Link
                            href="/dashboard/blog"
                            className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-[#171717] underline hover:no-underline"
                          >
                            Write your first post in Blog Studio
                          </Link>
                        </div>
                      ) : (
                        <ul className="divide-y divide-[#EFECE5] rounded-xl border border-[#E8E5DF] bg-white overflow-hidden shadow-2xs">
                          {articles.map((article) => {
                            const isPub = article.status === 'PUBLISHED';
                            const isDraft = article.status === 'DRAFT';
                            return (
                              <li
                                key={article.id}
                                className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between hover:bg-[#FAF9F6] transition"
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#F2EFE9] text-[#777970]">
                                    <FileText size={13} />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="truncate text-xs font-medium text-[#292A25]" title={article.title || 'Untitled article'}>
                                        {article.title?.trim() || 'Untitled article'}
                                      </p>
                                      <span
                                        className={cn(
                                          'rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide leading-none',
                                          isPub ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                        )}
                                      >
                                        {isPub ? 'Published' : isDraft ? 'Draft' : 'Scheduled'}
                                      </span>
                                    </div>
                                    <p className="mt-0.5 text-[11px] text-[#8C8D85] truncate">
                                      /{username}/blog/{article.slug}
                                      <span className="mx-1 text-[#C9C5BC]">·</span>
                                      Updated {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 sm:justify-end flex-shrink-0">
                                  <Link
                                    href={`/dashboard/blog?articleId=${article.id}`}
                                    className="inline-flex items-center gap-1 rounded-md border border-[#E8E5DF] px-2.5 py-1 text-xs font-medium text-[#565850] hover:bg-[#F6F4EE]"
                                  >
                                    <Pencil size={11} /> Edit in Studio
                                  </Link>
                                  {isPub && (
                                    <a
                                      href={`/${username}/blog/${article.slug}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="rounded-md border border-[#E8E5DF] p-1 text-[#777970] hover:bg-[#F6F4EE]"
                                      title="View live post"
                                    >
                                      <ExternalLink size={12} />
                                    </a>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showCreate && (
        <CreatePageModal
          username={username}
          pending={pending}
          onClose={() => setShowCreate(false)}
          onCreate={(input) => {
            startTransition(async () => {
              const result = await createWebsitePage(input);
              if (isError(result)) {
                toast.error(result.error);
                return;
              }
              toast.success('Page created as a draft.');
              setShowCreate(false);
              router.push(`/editor?page=${result.pageId}`);
            });
          }}
        />
      )}

      {settingsPage && !deletePage && (
        <PageSettingsModal
          key={settingsPage.id}
          username={username}
          page={settingsPage}
          isHome={settingsPage.id === homePageId}
          pending={pending}
          onClose={() => setSettingsPageId(null)}
          onSave={(input) => {
            startTransition(async () => {
              const result = await updateWebsitePage({
                pageId: settingsPage.id,
                title: input.title,
                slug: input.slug,
                showInNavigation: input.showInNavigation,
              });
              if (isError(result)) {
                toast.error(result.error);
                return;
              }
              const isHomePage = settingsPage.id === homePageId;
              updatePage({
                ...settingsPage,
                title: input.title,
                slug: isHomePage ? '' : (result.slug ?? settingsPage.slug),
                showInNavigation: input.showInNavigation,
                path: isHomePage ? `/${username}` : `/${username}/${result.slug ?? settingsPage.slug}`,
              });
              setSettingsPageId(null);
              toast.success('Page settings saved.');
              router.refresh();
            });
          }}
        />
      )}

      {deletePage && (
        <ConfirmDeleteModal
          title={deletePage.title}
          pending={pending}
          onCancel={() => setDeletePageId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

function CreatePageModal({
  username,
  pending,
  onClose,
  onCreate,
}: {
  username: string;
  pending: boolean;
  onClose: () => void;
  onCreate: (input: { pageType: CreatablePageType; layoutId: string; title: string; slug: string }) => void;
}) {
  const [step, setStep] = useState<'type' | 'layout'>('type');
  const [pageType, setPageType] = useState<CreatablePageType | null>(null);
  const [layoutId, setLayoutId] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  const meta = pageType ? PAGE_TYPE_META[pageType] : null;
  const layouts = pageType ? getPageLayouts(pageType) : [];

  function chooseType(type: CreatablePageType) {
    const typeMeta = PAGE_TYPE_META[type];
    setPageType(type);
    setLayoutId(typeMeta.layouts[0]?.id || '');
    setTitle(typeMeta.defaultTitle);
    setSlug(typeMeta.defaultSlug);
    setStep('layout');
  }

  function submit() {
    if (!pageType || !layoutId || !title.trim()) {
      toast.error('Add a page title to continue.');
      return;
    }
    onCreate({ pageType, layoutId, title: title.trim(), slug: slug.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292A25]/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#E8E5DF] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#292A25]">
              {step === 'type' ? 'Add a page' : `New ${meta?.label || 'page'}`}
            </h2>
            <p className="mt-1 text-xs text-[#777970]">
              {step === 'type'
                ? 'Choose what this page is for. You can change the layout later.'
                : 'Pick a starting layout. You can edit every section afterwards.'}
            </p>
          </div>
          <button onClick={onClose} disabled={pending} className="rounded-lg p-2 text-[#777970] hover:bg-[#F6F4EE]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {step === 'type' ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {CREATABLE_PAGE_TYPES.map((type) => {
                const typeMeta = PAGE_TYPE_META[type];
                const Icon = TYPE_ICONS[type];
                return (
                  <button
                    key={type}
                    onClick={() => chooseType(type)}
                    className="group rounded-xl border border-[#E8E5DF] p-4 text-left transition-colors hover:border-[#B8B5AD] hover:bg-[#FBF9F5]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F2EFE9] text-[#565850] group-hover:bg-white">
                      <Icon size={16} />
                    </span>
                    <p className="mt-3 text-sm font-semibold text-[#292A25]">{typeMeta.label}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#777970]">{typeMeta.description}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {layouts.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => setLayoutId(layout.id)}
                    className={cn(
                      'rounded-xl border p-4 text-left transition-colors',
                      layoutId === layout.id
                        ? 'border-[#292A25] bg-[#FBF9F5] ring-1 ring-[#292A25]'
                        : 'border-[#E8E5DF] hover:border-[#B8B5AD]',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#292A25]">{layout.name}</p>
                      {layoutId === layout.id && <Check size={15} className="text-[#292A25]" />}
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#777970]">{layout.description}</p>
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium text-[#565850]">Page title</span>
                  <input
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                    }}
                    onBlur={() => {
                      if (!slug.trim()) setSlug(slugifyPageTitle(title));
                    }}
                    className="mt-1.5 w-full rounded-xl border border-[#E8E5DF] px-3 py-2.5 text-sm text-[#292A25] outline-none focus:border-[#B8B5AD]"
                    placeholder="About us"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-[#565850]">Page URL</span>
                  <div className="mt-1.5 flex items-center rounded-xl border border-[#E8E5DF] bg-white focus-within:border-[#B8B5AD]">
                    <span className="pl-3 text-xs text-[#8C8D85]">/{username}/</span>
                    <input
                      value={slug}
                      onChange={(event) => setSlug(event.target.value)}
                      className="w-full rounded-xl bg-transparent px-1 py-2.5 text-sm text-[#292A25] outline-none"
                      placeholder="about"
                    />
                  </div>
                  {slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim().toLowerCase()) && (
                    <p className="mt-1 text-[11px] text-[#A25A5A]">Use lowercase letters, numbers, and dashes.</p>
                  )}
                </label>
              </div>

              <p className="rounded-xl bg-[#FBF9F5] px-4 py-3 text-xs text-[#777970]">
                New pages start as drafts. Publish when you are ready for visitors to see them.
              </p>
            </div>
          )}
        </div>

        {step === 'layout' && (
          <div className="flex items-center justify-between border-t border-[#E8E5DF] px-6 py-4">
            <button
              onClick={() => setStep('type')}
              disabled={pending}
              className="rounded-xl border border-[#E8E5DF] px-4 py-2 text-xs font-medium text-[#565850] hover:bg-[#F6F4EE] disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={submit}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#171717] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#262626] disabled:opacity-50"
            >
              {pending && <Loader2 size={14} className="animate-spin" />}
              Create page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PageSettingsModal({
  username,
  page,
  isHome,
  pending,
  onClose,
  onSave,
}: {
  username: string;
  page: PageRow;
  isHome: boolean;
  pending: boolean;
  onClose: () => void;
  onSave: (input: { title: string; slug: string; showInNavigation: boolean }) => void;
}) {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [showInNavigation, setShowInNavigation] = useState(page.showInNavigation);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292A25]/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#E8E5DF] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#292A25]">Page settings</h2>
            <p className="mt-1 text-xs text-[#777970]">Rename the page or update its URL and navigation.</p>
          </div>
          <button onClick={onClose} disabled={pending} className="rounded-lg p-2 text-[#777970] hover:bg-[#F6F4EE]">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <label className="block">
            <span className="text-xs font-medium text-[#565850]">Page title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E8E5DF] px-3 py-2.5 text-sm text-[#292A25] outline-none focus:border-[#B8B5AD]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-[#565850]">Page URL</span>
            <div className={cn(
              'mt-1.5 flex items-center rounded-xl border border-[#E8E5DF] bg-white focus-within:border-[#B8B5AD]',
              isHome && 'bg-[#FBF9F5]',
            )}>
              <span className="pl-3 text-xs text-[#8C8D85]">/{username}/</span>
              <input
                value={isHome ? '' : slug}
                onChange={(event) => setSlug(event.target.value)}
                disabled={isHome}
                placeholder={isHome ? '' : 'about'}
                className="w-full rounded-xl bg-transparent px-1 py-2.5 text-sm text-[#292A25] outline-none disabled:text-[#8C8D85]"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[#8C8D85]">
              {isHome
                ? 'The homepage always lives at your main website address.'
                : 'Old links will redirect to the new URL automatically.'}
            </p>
          </label>

          {!isHome && (
            <label className="flex items-start gap-3 rounded-xl border border-[#E8E5DF] px-4 py-3">
              <input
                type="checkbox"
                checked={showInNavigation}
                onChange={(event) => setShowInNavigation(event.target.checked)}
                className="mt-0.5 rounded border-[#D6D2C8] text-[#171717] focus:ring-[#171717]"
              />
              <span>
                <span className="block text-sm font-medium text-[#292A25]">Show in navigation</span>
                <span className="mt-0.5 block text-[11px] text-[#777970]">
                  Include this page in your website&apos;s shared menu.
                </span>
              </span>
            </label>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#E8E5DF] px-6 py-4">
          <button
            onClick={onClose}
            disabled={pending}
            className="rounded-xl border border-[#E8E5DF] px-4 py-2 text-xs font-medium text-[#565850] hover:bg-[#F6F4EE] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!title.trim()) {
                toast.error('Enter a page title.');
                return;
              }
              onSave({ title: title.trim(), slug: isHome ? '' : slug.trim(), showInNavigation });
            }}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-[#171717] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#262626] disabled:opacity-50"
          >
            {pending && <Loader2 size={14} className="animate-spin" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({
  title,
  pending,
  onCancel,
  onConfirm,
}: {
  title: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292A25]/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF3F3] text-[#A25A5A]">
          <Trash2 size={18} />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-[#292A25]">Delete “{title}”?</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#777970]">
          This permanently removes the page, its content, and its links. This cannot be undone.
        </p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={pending}
            className="rounded-xl border border-[#E8E5DF] px-4 py-2 text-xs font-medium text-[#565850] hover:bg-[#F6F4EE] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-[#A25A5A] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#8d4b4b] disabled:opacity-50"
          >
            {pending && <Loader2 size={14} className="animate-spin" />}
            Delete page
          </button>
        </div>
      </div>
    </div>
  );
}
