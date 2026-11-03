'use client';

import { useRef, useState } from 'react';
import {
  AlertCircle,
  FileText,
  Globe2,
  Image as ImageIcon,
  Loader2,
  Search,
  Sparkles,
  Tags,
  Trash2,
  Upload,
  UserRound,
  X,
} from 'lucide-react';
import { formatEditorDate, isValidArticleSlug } from '@/lib/blog-editor';
import { TagInput } from './TagInput';
import { WritingAssistant } from './WritingAssistant';
import type { BlogArticleDraft, BlogArticlePatch } from './types';
import type { RichTextEditorHandle } from './RichTextEditor';

export type SettingsTab = 'post' | 'seo' | 'assistant';

type ArticleSettingsProps = {
  article: BlogArticleDraft;
  username: string;
  tab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  onChange: (patch: BlogArticlePatch) => void;
  onUploadImage: (file: File) => Promise<string>;
  onUnpublish: () => void;
  onDelete: () => void;
  onApplyHtml: (html: string, mode: 'replace' | 'insert') => void;
  onApplyExcerpt: (excerpt: string) => void;
  onApplyTitle: (title: string) => void;
  onApplySeo: (seo: { seoTitle: string; seoDescription: string }) => void;
  editorRef: React.RefObject<RichTextEditorHandle | null>;
  notify: (type: 'success' | 'error', message: string) => void;
  busy: boolean;
};

const inputClass =
  'w-full rounded-lg border border-[#e2dfd6] bg-white px-3 py-2.5 text-[13px] leading-5 text-[#2d2e28] outline-none transition placeholder:text-[#aaa79c] focus:border-[#292a25] focus:ring-2 focus:ring-[#292a25]/10';

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <span className="text-[11.5px] font-medium text-[#6f7067]">{children}</span>
      {hint && <span className="text-[10.5px] text-[#a2a398]">{hint}</span>}
    </div>
  );
}

function SectionCard({
  title,
  description,
  icon,
  action,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#e6e2d8] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f1efe8] text-[#7c866f]">
            {icon}
          </span>
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold leading-5 text-[#2d2e28]">{title}</h3>
            {description && (
              <p className="mt-0.5 text-xs leading-5 text-[#85867d]">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function MediaField({
  label,
  value,
  alt,
  altLabel = 'Alt text',
  hint,
  onChange,
  onAltChange,
  onUpload,
}: {
  label: string;
  value: string | null;
  alt?: string | null;
  altLabel?: string;
  hint?: string;
  onChange: (value: string | null) => void;
  onAltChange?: (value: string | null) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'The image could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      {value ? (
        <div className="group relative overflow-hidden rounded-lg border border-[#e2dfd6] bg-[#f7f5ee]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={alt || ''} className="aspect-[16/9] w-full object-cover" />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="rounded-md bg-white/95 px-2.5 py-1.5 text-[11px] font-medium text-[#3f403a] shadow-sm backdrop-blur hover:bg-white"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="grid h-7 w-7 place-items-center rounded-md bg-white/95 text-[#77786f] shadow-sm backdrop-blur hover:text-[#a33a2b]"
              aria-label={`Remove ${label.toLowerCase()}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={value || ''}
            onChange={(event) => onChange(event.target.value || null)}
            placeholder="https://… or upload"
            className={inputClass}
            aria-label={`${label} URL`}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e2dfd6] bg-white px-3 py-2.5 text-xs font-medium text-[#4e4f48] hover:border-[#c8c3b6] disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Upload
          </button>
        </div>
      )}
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = '';
        }}
      />
      {onAltChange && (
        <input
          value={alt || ''}
          onChange={(event) => onAltChange(event.target.value || null)}
          placeholder={altLabel}
          className={`${inputClass} mt-2`}
          aria-label={altLabel}
        />
      )}
      {error && <p className="mt-1.5 text-[11px] text-[#a33a2b]">{error}</p>}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const live = status === 'PUBLISHED';
  const scheduled = status === 'SCHEDULED';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] ${
        live
          ? 'bg-[#e8f0e2] text-[#5f7353]'
          : scheduled
            ? 'bg-[#f5ecd8] text-[#8a6a2f]'
            : 'bg-[#efede6] text-[#77786f]'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          live ? 'bg-[#7f916e]' : scheduled ? 'bg-[#b18b46]' : 'bg-[#a9a79c]'
        }`}
      />
      {live ? 'Published' : scheduled ? 'Scheduled' : 'Draft'}
    </span>
  );
}

export function ArticleSettings({
  article,
  username,
  tab,
  onTabChange,
  onChange,
  onUploadImage,
  onUnpublish,
  onDelete,
  onApplyHtml,
  onApplyExcerpt,
  onApplyTitle,
  onApplySeo,
  editorRef,
  notify,
  busy,
}: ArticleSettingsProps) {
  const [excerptBusy, setExcerptBusy] = useState(false);
  const slug = article.slug.trim();
  const slugError = slug && !isValidArticleSlug(slug) ? 'Use lowercase letters, numbers and single dashes.' : '';
  const publicPath = `/${username}/blog/${article.publicSlug || slug || '…'}`;
  const seoTitle = article.seoTitle?.trim() || article.title.trim() || 'Untitled article';
  const seoDescription =
    article.seoDescription?.trim() ||
    article.excerpt.trim() ||
    'Add a short description so readers know what this article is about.';

  const generateExcerpt = async () => {
    setExcerptBusy(true);
    try {
      const { generateBlogExcerptAction } = await import('@/app/actions/blog-ai-actions');
      const result = await generateBlogExcerptAction({
        html: article.bodyHtml,
        title: article.title,
      });
      if (!result.ok) notify('error', result.error);
      else {
        onApplyExcerpt(result.data.excerpt);
        notify('success', 'Excerpt generated.');
      }
    } finally {
      setExcerptBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-[#ece9e1] px-3 pt-3">
        <div className="flex gap-1" role="tablist" aria-label="Article settings">
          {(
            [
              ['post', 'Post', FileText],
              ['seo', 'SEO', Search],
              ['assistant', 'Assistant', Sparkles],
            ] as Array<[SettingsTab, string, typeof FileText]>
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => onTabChange(value)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-t-lg px-2 pb-2.5 pt-1 text-xs font-semibold transition ${
                tab === value
                  ? 'text-[#292a25]'
                  : 'text-[#94958b] hover:bg-[#f5f3ec] hover:text-[#5f6058]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {tab === value && (
                <span className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-[#292a25]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {tab === 'post' && (
          <div className="space-y-4">
            <SectionCard
              title="Publishing"
              description={article.status === 'PUBLISHED'
                ? `Live since ${formatEditorDate(article.publishedAt) || 'today'}.`
                : 'Only you can see this draft. Publish when it is ready.'}
              icon={<Globe2 className="h-3.5 w-3.5" />}
              action={article.status === 'PUBLISHED' ? (
                <button
                  type="button"
                  onClick={onUnpublish}
                  disabled={busy}
                  className="text-[11px] font-medium text-[#8a5a33] hover:underline disabled:opacity-50"
                >
                  Unpublish
                </button>
              ) : undefined}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusPill status={article.status} />
                {article.status === 'PUBLISHED' && (
                  <a
                    href={publicPath}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4e5f42] hover:underline"
                  >
                    <Globe2 className="h-3 w-3" />
                    View live article
                  </a>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Article details"
              description="The URL and short summary readers see before they open the article."
              icon={<FileText className="h-3.5 w-3.5" />}
            >
              <div className="space-y-4">
                <div>
                  <FieldLabel hint={slugError ? 'Invalid' : 'Lowercase'}>URL</FieldLabel>
                  <div
                    className={`flex items-center rounded-lg border bg-white px-3 focus-within:ring-2 ${
                      slugError
                        ? 'border-[#c98b7e] focus-within:border-[#a33a2b] focus-within:ring-[#a33a2b]/10'
                        : 'border-[#e2dfd6] focus-within:border-[#292a25] focus-within:ring-[#292a25]/10'
                    }`}
                  >
                    <span className="truncate text-[11px] text-[#9a9b92]">/{username}/blog/</span>
                    <input
                      value={article.slug}
                      onChange={(event) => onChange({ slug: event.target.value })}
                      placeholder="article-slug"
                      className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-[13px] text-[#2d2e28] outline-none"
                      aria-label="Article URL slug"
                    />
                  </div>
                  {slugError ? (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#a33a2b]">
                      <AlertCircle className="h-3 w-3" /> {slugError}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[10.5px] leading-4 text-[#a2a398]">
                      Changing this after publishing creates a redirect from the old URL.
                    </p>
                  )}
                </div>

                <div>
                  <FieldLabel hint={`${article.excerpt.length}/320`}>Excerpt</FieldLabel>
                  <textarea
                    value={article.excerpt}
                    onChange={(event) => onChange({ excerpt: event.target.value.slice(0, 320) })}
                    rows={3}
                    placeholder="A clear, specific summary for the listing and search results."
                    className={`${inputClass} resize-y`}
                  />
                  <button
                    type="button"
                    onClick={() => void generateExcerpt()}
                    disabled={busy || excerptBusy || !article.bodyHtml.trim()}
                    className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6d7a5e] hover:underline disabled:opacity-40"
                  >
                    {excerptBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    Generate from article
                  </button>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Featured image"
              description="Used in the article list, social previews and search results."
              icon={<ImageIcon className="h-3.5 w-3.5" />}
            >
              <MediaField
                label="Image"
                value={article.featuredImageUrl}
                alt={article.featuredImageAlt}
                altLabel="Describe the image for screen readers"
                hint="16:9"
                onChange={(value) => onChange({ featuredImageUrl: value })}
                onAltChange={(value) => onChange({ featuredImageAlt: value })}
                onUpload={onUploadImage}
              />
            </SectionCard>

            <SectionCard
              title="Byline"
              description="The author name and avatar shown with the article."
              icon={<UserRound className="h-3.5 w-3.5" />}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel>Author</FieldLabel>
                  <input
                    value={article.authorName}
                    onChange={(event) => onChange({ authorName: event.target.value })}
                    className={inputClass}
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <FieldLabel>Avatar</FieldLabel>
                  <input
                    value={article.authorAvatarUrl || ''}
                    onChange={(event) => onChange({ authorAvatarUrl: event.target.value || null })}
                    className={inputClass}
                    placeholder="Image URL"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Organise"
              description="Categories and tags help readers find related articles."
              icon={<Tags className="h-3.5 w-3.5" />}
            >
              <div className="space-y-4">
                <TagInput
                  label="Categories"
                  values={article.categories}
                  onChange={(values) => onChange({ categories: values })}
                  max={8}
                  hint="Up to 8"
                />
                <TagInput
                  label="Tags"
                  values={article.tags}
                  onChange={(values) => onChange({ tags: values })}
                  max={20}
                  hint="Up to 20"
                />
              </div>
            </SectionCard>

            <div className="rounded-xl border border-[#eeddd8] bg-[#fdf6f3] p-4">
              <p className="text-[12px] font-medium text-[#8a4a3c]">Delete article</p>
              <p className="mt-0.5 text-[11px] leading-4 text-[#a07a70]">
                Removes the draft and its published snapshot. This cannot be undone.
              </p>
              <button
                type="button"
                onClick={onDelete}
                disabled={busy}
                className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#a33a2b] hover:underline disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete article
              </button>
            </div>
          </div>
        )}

        {tab === 'seo' && (
          <div className="space-y-4">
            <SectionCard
              title="Search preview"
              description="A rough preview of how this article may appear in search results."
              icon={<Search className="h-3.5 w-3.5" />}
            >
              <div className="rounded-lg border border-[#e8e5dd] bg-[#fbfaf6] p-3.5">
                <p className="truncate text-[11px] text-[#4d6b3f]">
                  {`${username}.pageory.app › blog › ${slug || 'article'}`}
                </p>
                <p className="mt-1 line-clamp-2 text-[15px] font-medium leading-5 text-[#1a0dab]">
                  {seoTitle}
                </p>
                <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#545650]">
                  {seoDescription}
                </p>
              </div>
            </SectionCard>

            <SectionCard
              title="Search metadata"
              description="The title and description used by search engines."
              icon={<FileText className="h-3.5 w-3.5" />}
            >
              <div className="space-y-4">
                <div>
                  <FieldLabel hint={`${seoTitle.length}/60`}>SEO title</FieldLabel>
                  <input
                    value={article.seoTitle || ''}
                    onChange={(event) => onChange({ seoTitle: event.target.value || null })}
                    maxLength={120}
                    placeholder={article.title || 'Defaults to the article title'}
                    className={inputClass}
                  />
                  <p className={`mt-1.5 text-[10.5px] leading-4 ${seoTitle.length > 60 ? 'text-[#a33a2b]' : 'text-[#a2a398]'}`}>
                    {seoTitle.length > 60
                      ? 'Search engines may truncate this title.'
                      : 'Keep it under 60 characters for full display.'}
                  </p>
                </div>

                <div>
                  <FieldLabel hint={`${seoDescription.length}/160`}>Meta description</FieldLabel>
                  <textarea
                    value={article.seoDescription || ''}
                    onChange={(event) => onChange({ seoDescription: event.target.value || null })}
                    rows={3}
                    maxLength={320}
                    placeholder={article.excerpt || 'Defaults to the excerpt.'}
                    className={`${inputClass} resize-y`}
                  />
                  <p className={`mt-1.5 text-[10.5px] leading-4 ${seoDescription.length > 160 ? 'text-[#a33a2b]' : 'text-[#a2a398]'}`}>
                    {seoDescription.length > 160
                      ? 'Search engines may truncate this description.'
                      : 'Aim for 120–160 characters.'}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Indexing"
              description="Control how search engines treat this page."
              icon={<Globe2 className="h-3.5 w-3.5" />}
            >
              <div className="space-y-4">
                <div>
                  <FieldLabel>Canonical URL</FieldLabel>
                  <input
                    value={article.canonicalUrl || ''}
                    onChange={(event) => onChange({ canonicalUrl: event.target.value || null })}
                    placeholder={`https://${username}.pageory.app/blog/${slug || 'article'}`}
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-[10.5px] leading-4 text-[#a2a398]">
                    Only set this when the same article exists elsewhere.
                  </p>
                </div>

                <label className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-[#e8e5dd] bg-[#fbfaf6] p-3">
                  <span>
                    <span className="block text-[12px] font-medium text-[#2d2e28]">
                      Hide from search engines
                    </span>
                    <span className="mt-0.5 block text-[10.5px] leading-4 text-[#8a8b82]">
                      Adds a noindex directive. Useful for private or duplicate content.
                    </span>
                  </span>
                  <span
                    className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
                      article.noindex ? 'bg-[#292a25]' : 'bg-[#d8d4c9]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={article.noindex}
                      onChange={(event) => onChange({ noindex: event.target.checked })}
                      className="peer sr-only"
                    />
                    <span
                      className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow-sm transition ${
                        article.noindex ? 'left-[18px]' : 'left-[3px]'
                      }`}
                    />
                  </span>
                </label>
              </div>
            </SectionCard>

            <SectionCard
              title="Social sharing"
              description="The image shown when this article is shared on social media."
              icon={<ImageIcon className="h-3.5 w-3.5" />}
            >
              <MediaField
                label="Share image"
                value={article.ogImage}
                hint="1200 × 630"
                onChange={(value) => onChange({ ogImage: value })}
                onUpload={onUploadImage}
              />
            </SectionCard>
          </div>
        )}

        <div className={tab === 'assistant' ? '' : 'hidden'}>
          <WritingAssistant
            key={article.id}
            article={article}
            editorRef={editorRef}
            onApplyHtml={onApplyHtml}
            onApplyExcerpt={onApplyExcerpt}
            onApplyTitle={onApplyTitle}
            onApplySeo={onApplySeo}
            notify={notify}
          />
        </div>
      </div>
    </div>
  );
}
