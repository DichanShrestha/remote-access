export type BlogArticleDraft = {
  id: string;
  title: string;
  slug: string;
  publicSlug: string | null;
  excerpt: string;
  bodyHtml: string;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  categories: string[];
  tags: string[];
  authorName: string;
  authorAvatarUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  noindex: boolean;
  status: string;
  publishedAt: string | null;
  scheduledFor: string | null;
  updatedAt: string;
};

export type BlogArticlePatch = Partial<BlogArticleDraft>;

export type ArticleStatusFilter = 'ALL' | 'DRAFT' | 'PUBLISHED';
