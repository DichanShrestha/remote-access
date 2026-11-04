import type { GroupNode, PageDocument, PageNode, PageSection } from './schemas';
import type { CreatablePageType } from './page-types';
import { BUSINESS_TEMPLATE_PAGE_BLUEPRINTS } from './business-template-pages';

export type TemplateStarterPage = {
  pageType: CreatablePageType;
  title: string;
  slug: string;
  sections: PageSection[];
};

const SECTION_DESTINATIONS: Partial<Record<PageSection['type'], CreatablePageType>> = {
  'feature-split': 'ABOUT',
  'rich-text': 'ABOUT',
  timeline: 'ABOUT',
  quote: 'ABOUT',
  services: 'SERVICES',
  products: 'PRODUCTS',
  faq: 'FAQ',
  gallery: 'GALLERY',
  carousel: 'GALLERY',
  'case-studies': 'GALLERY',
  'blog-list': 'BLOG',
  cta: 'CONTACT',
  booking: 'CONTACT',
  contact: 'CONTACT',
  'lead-form': 'CONTACT',
};

function pageTitle(type: CreatablePageType, templateId: string, sections: PageSection[]): string {
  if (type === 'PRODUCTS') return templateId === 'restaurant' ? 'Menu' : 'Shop';
  if (type === 'BLOG') return 'Journal';
  if (type === 'GALLERY' && /portfolio|agency|architecture|tattoo|creator/.test(templateId)) return 'Portfolio';
  if (type === 'GALLERY' && templateId === 'restaurant') return 'Gallery';
  if (type === 'CONTACT' && sections.some((section) => section.type === 'booking')) return 'Reservations';
  const defaults: Record<CreatablePageType, string> = {
    ABOUT: 'About', SERVICES: 'Services', PRODUCTS: 'Shop', CONTACT: 'Contact',
    FAQ: 'FAQs', GALLERY: 'Gallery', BLOG: 'Journal', CUSTOM: 'Page',
  };
  return defaults[type];
}

/** Split meaningful sections from a chosen starter site into editable pages. */
export function buildTemplatePages(templateId: string, document: PageDocument) {
  const blueprints = BUSINESS_TEMPLATE_PAGE_BLUEPRINTS[templateId];
  if (blueprints) {
    return {
      // The chosen homepage is never modified. Business templates get
      // purpose-built subpages that match their homepage's visual identity.
      home: document,
      starterPages: structuredClone(blueprints),
    };
  }

  const buckets = new Map<CreatablePageType, PageSection[]>();
  const collectSections = (nodes: PageNode[]) => {
    for (const node of nodes) {
      if ('kind' in node) {
        collectSections((node as GroupNode).children);
        continue;
      }
      const section = node as PageSection;
      const destination = SECTION_DESTINATIONS[section.type];
      if (!destination || section.type === 'hero' || section.isHidden) continue;
      const current = buckets.get(destination) || [];
      current.push(structuredClone(section));
      buckets.set(destination, current);
    }
  };
  collectSections(document.sections);

  const starterPages = [...buckets.entries()].map(([type, sections]): TemplateStarterPage => {
    const title = pageTitle(type, templateId, sections);
    const slug = type === 'PRODUCTS' && title === 'Menu' ? 'menu'
      : type === 'CONTACT' && title === 'Reservations' ? 'reservations'
      : type.toLowerCase();
    const titleSection: PageSection = {
      id: `starter-${slug}-title`,
      type: 'hero',
      variant: 'editorial-center',
      layout: 'center',
      isHidden: false,
      content: { title },
    };
    return { pageType: type, title, slug, sections: [titleSection, ...sections] };
  });

  return {
    // Keep the complete original homepage intact. Subpages are curated copies
    // of relevant editable sections so applying a template never removes content.
    home: document,
    starterPages,
  };
}
