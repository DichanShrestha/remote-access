export type WebsitePageType =
  | 'HOME'
  | 'ABOUT'
  | 'SERVICES'
  | 'PRODUCTS'
  | 'CONTACT'
  | 'FAQ'
  | 'GALLERY'
  | 'BLOG'
  | 'CUSTOM';

export type CreatablePageType = Exclude<WebsitePageType, 'HOME'>;

export type PageLayoutOption = {
  id: string;
  name: string;
  description: string;
};

export type PageTypeMeta = {
  label: string;
  description: string;
  defaultTitle: string;
  defaultSlug: string;
  layouts: PageLayoutOption[];
};

export const CREATABLE_PAGE_TYPES: CreatablePageType[] = [
  'ABOUT',
  'SERVICES',
  'PRODUCTS',
  'CONTACT',
  'FAQ',
  'GALLERY',
  'BLOG',
  'CUSTOM',
];

export const PAGE_TYPE_META: Record<WebsitePageType, PageTypeMeta> = {
  HOME: {
    label: 'Homepage',
    description: 'The main entry point for your website.',
    defaultTitle: 'Home',
    defaultSlug: '',
    layouts: [],
  },
  ABOUT: {
    label: 'About',
    description: 'Share your story, values, and the people behind the business.',
    defaultTitle: 'About',
    defaultSlug: 'about',
    layouts: [
      { id: 'story', name: 'Story-led', description: 'A personal introduction, your story, and the values that guide you.' },
      { id: 'editorial', name: 'Editorial', description: 'A refined, text-led page with a timeline and a closing call to action.' },
    ],
  },
  SERVICES: {
    label: 'Services',
    description: 'Explain what you offer and how customers can work with you.',
    defaultTitle: 'Services',
    defaultSlug: 'services',
    layouts: [
      { id: 'showcase', name: 'Service list', description: 'A clear list of services followed by a simple call to action.' },
      { id: 'detailed', name: 'Detailed', description: 'A richer page with services, common questions, and a final invitation.' },
    ],
  },
  PRODUCTS: {
    label: 'Products / Menu',
    description: 'Show products, dishes, or a catalogue of what you sell.',
    defaultTitle: 'Products',
    defaultSlug: 'products',
    layouts: [
      { id: 'grid', name: 'Product grid', description: 'A visual grid of products with prices and descriptions.' },
      { id: 'menu', name: 'Menu', description: 'A structured menu layout for food, drinks, or grouped offerings.' },
    ],
  },
  CONTACT: {
    label: 'Contact',
    description: 'Give visitors a direct way to get in touch.',
    defaultTitle: 'Contact',
    defaultSlug: 'contact',
    layouts: [
      { id: 'form', name: 'Form first', description: 'A welcoming header followed by an inquiry form and contact details.' },
      { id: 'details', name: 'Details first', description: 'Lead with your contact details, then invite a message.' },
    ],
  },
  FAQ: {
    label: 'FAQ',
    description: 'Answer the questions customers ask most often.',
    defaultTitle: 'FAQ',
    defaultSlug: 'faq',
    layouts: [
      { id: 'simple', name: 'Simple FAQ', description: 'A focused list of questions and answers.' },
      { id: 'grouped', name: 'Grouped FAQ', description: 'Questions paired with a short introduction and next steps.' },
    ],
  },
  GALLERY: {
    label: 'Gallery',
    description: 'Let your work, space, or products speak for themselves.',
    defaultTitle: 'Gallery',
    defaultSlug: 'gallery',
    layouts: [
      { id: 'grid', name: 'Image grid', description: 'A balanced grid for photos and visuals.' },
      { id: 'masonry', name: 'Masonry', description: 'An editorial masonry layout for images of different shapes.' },
    ],
  },
  BLOG: {
    label: 'Blog',
    description: 'Share news, stories, guides, and updates.',
    defaultTitle: 'Blog',
    defaultSlug: 'blog',
    layouts: [
      { id: 'list', name: 'Article list', description: 'A clean list of recent articles.' },
      { id: 'editorial', name: 'Editorial cards', description: 'Image-led article cards for a magazine-style blog.' },
    ],
  },
  CUSTOM: {
    label: 'Custom Page',
    description: 'Start with a flexible page and build exactly what you need.',
    defaultTitle: 'New Page',
    defaultSlug: 'page',
    layouts: [
      { id: 'blank', name: 'Blank canvas', description: 'A header and a text section to start from scratch.' },
      { id: 'landing', name: 'Landing page', description: 'A hero, feature cards, and a closing call to action.' },
    ],
  },
};

export function getPageTypeMeta(type: WebsitePageType): PageTypeMeta {
  return PAGE_TYPE_META[type] ?? PAGE_TYPE_META.CUSTOM;
}

export function isCreatablePageType(value: string): value is CreatablePageType {
  return (CREATABLE_PAGE_TYPES as string[]).includes(value);
}

export function getPageLayouts(type: WebsitePageType): PageLayoutOption[] {
  return getPageTypeMeta(type).layouts;
}

export function isPageLayoutForType(type: WebsitePageType, layoutId: string): boolean {
  return getPageLayouts(type).some((layout) => layout.id === layoutId);
}

export const RESERVED_PAGE_SLUGS = new Set(['home', 'index']);

export function normalizePageSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 64)
    .replace(/-+$/g, '');
}

export function validatePageSlug(input: string, { allowEmpty = false }: { allowEmpty?: boolean } = {}): { valid: boolean; slug: string; error?: string } {
  if (input === '' && allowEmpty) return { valid: true, slug: '' };
  const slug = normalizePageSlug(input);
  if (!slug) return { valid: false, slug, error: 'Enter a page URL.' };
  if (slug !== input.trim().toLowerCase()) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.trim().toLowerCase())) {
      return { valid: false, slug, error: 'Use lowercase letters, numbers, and single dashes.' };
    }
  }
  if (RESERVED_PAGE_SLUGS.has(slug)) return { valid: false, slug, error: 'That URL is reserved for the homepage.' };
  return { valid: true, slug };
}

export function slugifyPageTitle(title: string): string {
  return normalizePageSlug(title) || 'page';
}

export function buildPagePath(username: string, slug: string): string {
  return slug ? `/${username}/${slug}` : `/${username}`;
}

export const MANAGED_NAVIGATION_PREFIX = 'managed-page-';
