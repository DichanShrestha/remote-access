import type {
  PageDocument,
  PageNode,
  PageSection,
} from './schemas';
import { PageDocumentSchema } from './schemas';
import { isGroup } from './operations';
import { TEMPLATES_MAP } from './templates';
import {
  getTemplateDetails,
  type TemplateCategory,
} from './template-catalog';
import { buildTemplatePages, type TemplateStarterPage } from './template-pages';
import {
  WebsiteConfig,
  extractWebsiteConfig,
  toPageContentDocument,
} from './site-config';

export type TemplateSwitchPage = {
  id: string;
  title: string;
  slug: string;
  pageType: string;
  navOrder: number;
  showInNavigation: boolean;
  draftDocument: PageDocument | null;
  publishedDocument?: PageDocument | null;
};

export type TemplateSwitchInput = {
  templateId: string;
  /** The category the website is allowed to switch within. */
  profileType: TemplateCategory;
  /** Persisted template provenance, when the website has one. */
  currentTemplateId?: string | null;
  websiteConfig?: WebsiteConfig | null;
  pages: TemplateSwitchPage[];
  homePageId?: string | null;
};

export type TemplatePageUpdate = {
  pageId: string;
  title: string;
  draftDocument: PageDocument;
  publishedDocument: PageDocument | null;
};

export type TemplatePageCreate = {
  pageType: string;
  title: string;
  slug: string;
  navOrder: number;
  draftDocument: PageDocument;
};

export type TemplateSwitchPlan = {
  templateId: string;
  templateName: string;
  category: TemplateCategory;
  previousTemplateId: string | null;
  previousTemplateName: string | null;
  websiteConfig: WebsiteConfig;
  updates: TemplatePageUpdate[];
  creates: TemplatePageCreate[];
  preservedPageIds: string[];
  homePageId: string | null;
};

export class TemplateSwitchError extends Error {
  code: 'not-found' | 'incompatible' | 'no-home';

  constructor(code: TemplateSwitchError['code'], message: string) {
    super(message);
    this.name = 'TemplateSwitchError';
    this.code = code;
  }
}

function flattenSections(nodes: PageNode[]): PageSection[] {
  return nodes.flatMap((node) => (isGroup(node) ? flattenSections(node.children) : [node]));
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, stableValue(entry)]),
    );
  }
  return value;
}

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b));
}

function contentOf(section: PageSection | undefined): Record<string, unknown> {
  if (!section?.content || typeof section.content !== 'object') return {};
  return section.content as Record<string, unknown>;
}

function sectionIds(nodes: PageNode[]): string[] {
  return flattenSections(nodes).map((section) => section.id).sort();
}

function hasSameSectionIds(a: PageDocument, b: PageDocument): boolean {
  const left = sectionIds(a.sections);
  const right = sectionIds(b.sections);
  return left.length > 0 && left.length === right.length && left.every((id, index) => id === right[index]);
}

const BUSINESS_TEMPLATE_IDS = Object.keys(TEMPLATES_MAP);

function templatesForCategory(category: TemplateCategory): string[] {
  return BUSINESS_TEMPLATE_IDS.filter((id) => getTemplateDetails(id)?.category === category);
}

/**
 * Older websites have no persisted template id. Their homepage and page
 * signatures still contain the template's section ids, so score every known
 * template and pick the closest match.
 */
export function detectTemplateId(
  homeDocument: PageDocument | null,
  pages: Array<Pick<TemplateSwitchPage, 'slug' | 'pageType' | 'draftDocument'>> = [],
): string | null {
  let bestId: string | null = null;
  let bestScore = 0;

  for (const templateId of BUSINESS_TEMPLATE_IDS) {
    const details = getTemplateDetails(templateId);
    if (!details) continue;
    const { home, starterPages } = buildTemplatePages(templateId, details.document);
    let score = 0;

    if (homeDocument) {
      const oldSections = flattenSections(homeDocument.sections);
      const templateSections = flattenSections(toPageContentDocument(home).sections);
      for (const oldSection of oldSections) {
        if (templateSections.some((section) => section.id === oldSection.id && section.type === oldSection.type)) {
          score += 4;
        } else if (templateSections.some((section) => section.type === oldSection.type)) {
          score += 1;
        }
      }
      if (
        oldSections.length > 0 &&
        sameValue(
          oldSections.map((section) => `${section.id}:${section.type}`),
          templateSections.map((section) => `${section.id}:${section.type}`),
        )
      ) {
        score += 10;
      }
    }

    for (const page of pages) {
      if (page.pageType === 'HOME' || page.slug === '') continue;
      const exact = starterPages.find((starter) => starter.slug === page.slug && starter.pageType === page.pageType);
      if (exact) {
        score += 5;
        if (page.draftDocument && hasSameSectionIds(page.draftDocument, { ...details.document, sections: exact.sections })) {
          score += 9;
        }
      } else if (starterPages.some((starter) => starter.pageType === page.pageType)) {
        score += 2;
      } else if (starterPages.some((starter) => starter.slug === page.slug)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestId = templateId;
    }
  }

  return bestScore >= 5 ? bestId : null;
}

type DefaultPageMatch = {
  templateId: string;
  page: TemplateStarterPage | PageDocument;
  title: string;
};

function findDefaultPageInTemplate(
  templateId: string,
  page: Pick<TemplateSwitchPage, 'slug' | 'pageType' | 'draftDocument'>,
): DefaultPageMatch | null {
  const details = getTemplateDetails(templateId);
  if (!details) return null;
  const { home, starterPages } = buildTemplatePages(templateId, details.document);

  if (page.pageType === 'HOME' || page.slug === '') {
    return { templateId, page: home, title: '' };
  }

  const bySlug = starterPages.find(
    (starter) => starter.slug === page.slug && starter.pageType === page.pageType,
  );
  if (bySlug) return { templateId, page: bySlug, title: bySlug.title };

  const byType = starterPages.find((starter) => starter.pageType === page.pageType);
  if (byType && page.draftDocument && hasSameSectionIds(page.draftDocument, { ...details.document, sections: byType.sections })) {
    return { templateId, page: byType, title: byType.title };
  }

  const byRoute = starterPages.find((starter) => starter.slug === page.slug);
  if (byRoute && byRoute.pageType === page.pageType) {
    return { templateId, page: byRoute, title: byRoute.title };
  }

  return null;
}

function findDefaultPage(
  page: Pick<TemplateSwitchPage, 'slug' | 'pageType' | 'draftDocument'>,
  preferredTemplateId?: string | null,
): DefaultPageMatch | null {
  if (preferredTemplateId) {
    const preferred = findDefaultPageInTemplate(preferredTemplateId, page);
    if (preferred) return preferred;
  }
  for (const templateId of BUSINESS_TEMPLATE_IDS) {
    if (templateId === preferredTemplateId) continue;
    const match = findDefaultPageInTemplate(templateId, page);
    if (match) return match;
  }
  return null;
}

function isTemplateManaged(page: TemplateSwitchPage, currentTemplateId?: string | null): boolean {
  if (page.pageType === 'HOME' || page.slug === '') return true;
  // A blog index is always safe to restyle: its articles are separate rows and
  // the page content is merged, never replaced with placeholder posts.
  if (page.pageType === 'BLOG') return true;
  // Custom pages belong to the customer. They are never rewritten.
  if (page.pageType === 'CUSTOM') return false;
  return Boolean(findDefaultPage(page, currentTemplateId));
}

function defaultSections(defaultMatch: DefaultPageMatch | null): PageSection[] {
  if (!defaultMatch) return [];
  if ('theme' in defaultMatch.page) {
    return flattenSections(toPageContentDocument(defaultMatch.page as PageDocument).sections);
  }
  const document = PageDocumentSchema.parse({
    ...TEMPLATES_MAP[defaultMatch.templateId],
    sections: defaultMatch.page.sections,
  });
  return flattenSections(toPageContentDocument(document).sections);
}

type SectionDonor = {
  section: PageSection;
  defaultSection: PageSection | undefined;
  used: boolean;
};

function findExactDonor(
  target: PageSection,
  donors: SectionDonor[],
  previousIndex: number,
): SectionDonor | undefined {
  const byId = donors.find((donor) => !donor.used && donor.section.id === target.id && donor.section.type === target.type);
  if (byId) return byId;

  const sameType = donors.filter((donor) => !donor.used && donor.section.type === target.type);
  if (!sameType.length) return undefined;
  return sameType.reduce((closest, donor) => {
    const donorIndex = donors.indexOf(donor);
    const closestIndex = donors.indexOf(closest);
    return Math.abs(donorIndex - previousIndex) < Math.abs(closestIndex - previousIndex) ? donor : closest;
  }, sameType[0]);
}

const SEMANTIC_DONORS: Partial<Record<PageSection['type'], Array<PageSection['type']>>> = {
  'lead-form': ['contact', 'booking', 'cta'],
  contact: ['lead-form', 'booking'],
  booking: ['contact', 'lead-form'],
  cta: ['lead-form', 'contact'],
  gallery: ['carousel', 'case-studies'],
  carousel: ['gallery'],
  'case-studies': ['gallery', 'carousel'],
  products: ['services'],
  services: ['products'],
  'rich-text': ['feature-split', 'quote'],
};

function emailFromLink(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const match = value.match(/^mailto:([^?]+)/i);
  return match?.[1];
}

function mapGalleryToCaseStudies(content: Record<string, unknown>): Record<string, unknown> | null {
  const images = content.images;
  if (!Array.isArray(images) || !images.length) return null;
  return {
    items: images.map((image, index) => {
      const record = (image ?? {}) as Record<string, unknown>;
      return {
        id: typeof record.id === 'string' ? record.id : `story-${index + 1}`,
        title: typeof record.caption === 'string' && record.caption.trim() ? record.caption : `Project ${index + 1}`,
        description: '',
        imageUrl: typeof record.url === 'string' ? record.url : '',
      };
    }),
  };
}

function mapCaseStudiesToGallery(content: Record<string, unknown>): Record<string, unknown> | null {
  const items = content.items;
  if (!Array.isArray(items) || !items.length) return null;
  return {
    images: items.map((item, index) => {
      const record = (item ?? {}) as Record<string, unknown>;
      return {
        id: typeof record.id === 'string' ? record.id : `image-${index + 1}`,
        url: typeof record.imageUrl === 'string' ? record.imageUrl : '',
        caption: typeof record.title === 'string' ? record.title : undefined,
      };
    }).filter((image) => image.url),
  };
}

function mapServiceOrProductItems(
  items: unknown,
  target: 'services' | 'products',
): unknown {
  if (!Array.isArray(items)) return items;
  return items.map((item, index) => {
    const record = (item ?? {}) as Record<string, unknown>;
    const mapped: Record<string, unknown> = {
      id: typeof record.id === 'string' ? record.id : `${target}-${index + 1}`,
      title: typeof record.title === 'string' ? record.title : `${target === 'products' ? 'Product' : 'Service'} ${index + 1}`,
      description: typeof record.description === 'string' ? record.description : '',
    };
    if (record.price !== undefined) mapped.price = record.price;
    if (target === 'products' && mapped.price === undefined) mapped.price = '';
    if (record.imageUrl !== undefined) mapped.imageUrl = record.imageUrl;
    if (record.url !== undefined) mapped.url = record.url;
    if (record.icon !== undefined) mapped.icon = record.icon;
    if (record.tag !== undefined) mapped.tag = record.tag;
    if (record.duration !== undefined) mapped.duration = record.duration;
    if (record.buttonText !== undefined) mapped.buttonText = record.buttonText;
    if (record.buttonUrl !== undefined) mapped.buttonUrl = record.buttonUrl;
    return mapped;
  });
}

function mapRichText(content: Record<string, unknown>): string | null {
  const text = typeof content.text === 'string' && content.text.trim() ? content.text : '';
  if (text) return text;
  const title = typeof content.title === 'string' ? content.title : '';
  const description = typeof content.description === 'string' ? content.description : '';
  if (!title && !description) return null;
  return `${title ? `<h2>${title}</h2>` : ''}${description ? `<p>${description}</p>` : ''}`;
}

function mergeContent(
  target: PageSection,
  donor: SectionDonor | undefined,
  crossType: boolean,
): Record<string, unknown> {
  const targetContent = structuredClone(contentOf(target));
  if (!donor) return targetContent;

  const oldContent = contentOf(donor.section);
  const oldDefault = contentOf(donor.defaultSection);
  const merged = { ...targetContent };

  for (const key of Object.keys(targetContent)) {
    if (!(key in oldContent)) continue;
    const customerChanged = !donor.defaultSection || !sameValue(oldContent[key], oldDefault[key]);
    if (!customerChanged) continue;

    if (crossType && (key === 'items' || key === 'images' || key === 'checkpoints')) {
      continue;
    }
    merged[key] = structuredClone(oldContent[key]);
  }

  if (!crossType) return merged;

  // Contact-like sections exchange the details that mean the same thing even
  // though the component/variant changed.
  const details = donor.section.content as Record<string, unknown>;
  if (target.type === 'lead-form' || target.type === 'contact' || target.type === 'booking') {
    if (!merged.email) {
      const email = typeof details.email === 'string' ? details.email : emailFromLink(details.link);
      if (email) merged.email = email;
    }
    if ('location' in targetContent && !merged.location && typeof details.address === 'string') {
      merged.location = details.address;
    }
    if ('address' in targetContent && !merged.address && typeof details.address === 'string') {
      merged.address = details.address;
    }
    if ('phone' in targetContent && !merged.phone && typeof details.phone === 'string') {
      merged.phone = details.phone;
    }
    if ('instagram' in targetContent && !merged.instagram && typeof details.instagram === 'string') {
      merged.instagram = details.instagram;
    }
    if (target.type === 'booking' && !merged.link) {
      const email = typeof details.email === 'string' ? details.email : emailFromLink(details.link);
      if (email) merged.link = `mailto:${email}`;
    }
  }

  if (target.type === 'case-studies' && (donor.section.type === 'gallery' || donor.section.type === 'carousel')) {
    const mapped = mapGalleryToCaseStudies(oldContent);
    if (mapped) Object.assign(merged, mapped);
  }

  if ((target.type === 'gallery' || target.type === 'carousel') && donor.section.type === 'case-studies') {
    const mapped = mapCaseStudiesToGallery(oldContent);
    if (mapped) Object.assign(merged, mapped);
  }

  if (target.type === 'products' && donor.section.type === 'services') {
    merged.items = mapServiceOrProductItems(oldContent.items, 'products');
  }
  if (target.type === 'services' && donor.section.type === 'products') {
    merged.items = mapServiceOrProductItems(oldContent.items, 'services');
  }

  if (target.type === 'rich-text' && !merged.text) {
    const mapped = mapRichText(oldContent);
    if (mapped) merged.text = mapped;
  }

  return merged;
}

function mergeSection(target: PageSection, donor: SectionDonor | undefined): PageSection {
  const crossType = Boolean(donor && donor.section.type !== target.type);
  const content = mergeContent(target, donor, crossType);
  const merged = { ...target, content } as PageSection;

  // Hiding a section is the customer's decision, not part of the visual design.
  if (donor) {
    const oldHidden = donor.section.isHidden;
    const defaultHidden = donor.defaultSection?.isHidden;
    if (!donor.defaultSection || oldHidden !== defaultHidden) merged.isHidden = oldHidden;
  }

  return merged;
}

function mergeSections(
  targetNodes: PageNode[],
  oldSections: PageSection[],
  oldDefaults: PageSection[],
): PageNode[] {
  const donors: SectionDonor[] = oldSections.map((section) => ({
    section,
    defaultSection: oldDefaults.find((candidate) => candidate.id === section.id && candidate.type === section.type),
    used: false,
  }));
  let previousIndex = 0;

  const resolved: boolean[] = [];
  const firstPass = targetNodes.map((node, index) => {
    if (isGroup(node)) {
      resolved[index] = true;
      return {
        ...node,
        children: mergeSections(node.children, oldSections, oldDefaults),
      };
    }
    const donor = findExactDonor(node, donors, previousIndex);
    if (donor) {
      donor.used = true;
      previousIndex = donors.indexOf(donor);
      resolved[index] = true;
    } else {
      resolved[index] = false;
    }
    return mergeSection(node, donor);
  });

  return firstPass.map((node, index) => {
    if (resolved[index] || isGroup(node)) return node;
    const target = targetNodes[index] as PageSection;
    const compatibleTypes = SEMANTIC_DONORS[target.type] || [];
    const semanticDonor = donors.find(
      (donor) => !donor.used && compatibleTypes.includes(donor.section.type),
    );
    if (!semanticDonor) return node;
    semanticDonor.used = true;
    return mergeSection(target, semanticDonor);
  });
}

function mergeSettings(target: PageDocument, old: PageDocument | null): PageDocument['settings'] {
  if (!old) return target.settings;
  return {
    ...target.settings,
    ...Object.fromEntries(
      Object.entries(old.settings).filter(([, value]) => value !== undefined),
    ),
  } as PageDocument['settings'];
}

function mergeDocument(
  target: PageDocument,
  old: PageDocument | null,
  oldDefaultSections: PageSection[],
): PageDocument {
  if (!old) return structuredClone(target);
  const oldSections = flattenSections(old.sections);
  return {
    ...structuredClone(target),
    settings: mergeSettings(target, old),
    sections: mergeSections(structuredClone(target.sections), oldSections, oldDefaultSections),
  };
}

function defaultTitleFor(pageType: string, match: DefaultPageMatch | null): string | null {
  if (!match) return null;
  if ('title' in match.page && typeof match.page.title === 'string') return match.page.title;
  return null;
}

function sameTitle(a: string, b: string | null): boolean {
  if (!b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function mergeWebsiteIdentity(
  target: WebsiteConfig,
  current: WebsiteConfig | null | undefined,
): WebsiteConfig {
  if (!current) return target;
  const header = target.header;
  const currentHeader = current.header;
  const footer = target.footer;
  const currentFooter = current.footer;

  const mergedHeader = header && currentHeader
    ? {
        ...header,
        content: {
          logoText: currentHeader.content.logoText || header.content.logoText,
          links: header.content.links,
          ...(currentHeader.content.logoUrl ?? header.content.logoUrl
            ? { logoUrl: currentHeader.content.logoUrl ?? header.content.logoUrl }
            : {}),
          ...(header.content.primaryLabel ? { primaryLabel: header.content.primaryLabel } : {}),
          ...(header.content.primaryUrl ? { primaryUrl: header.content.primaryUrl } : {}),
          ...(header.content.secondaryLabel ? { secondaryLabel: header.content.secondaryLabel } : {}),
          ...(header.content.secondaryUrl ? { secondaryUrl: header.content.secondaryUrl } : {}),
        },
      }
    : header;

  const mergedFooter = footer && currentFooter
    ? {
        ...footer,
        content: {
          logoText: currentFooter.content.logoText || footer.content.logoText,
          description: currentFooter.content.description || footer.content.description,
          links: footer.content.links,
          socialLinks: currentFooter.content.socialLinks?.length
            ? currentFooter.content.socialLinks
            : footer.content.socialLinks,
          legalLinks: currentFooter.content.legalLinks?.length
            ? currentFooter.content.legalLinks
            : footer.content.legalLinks,
        },
      }
    : footer;

  return {
    ...target,
    header: mergedHeader,
    footer: mergedFooter,
  };
}

function pageDocumentFor(
  template: PageDocument,
  starter: TemplateStarterPage,
): PageDocument {
  return PageDocumentSchema.parse({ ...template, sections: starter.sections });
}

function allocateSlug(preferred: string, used: Set<string>): string {
  if (!used.has(preferred)) {
    used.add(preferred);
    return preferred;
  }
  let attempt = 2;
  while (used.has(`${preferred}-${attempt}`)) attempt += 1;
  const slug = `${preferred}-${attempt}`;
  used.add(slug);
  return slug;
}

/**
 * Build a complete, deterministic switch plan without touching the database.
 * This is the single source of truth used by the server action and by tests.
 */
export function planTemplateSwitch(input: TemplateSwitchInput): TemplateSwitchPlan {
  const target = getTemplateDetails(input.templateId);
  if (!target) {
    throw new TemplateSwitchError('not-found', 'That template is not available.');
  }

  const currentTemplate =
    input.currentTemplateId && getTemplateDetails(input.currentTemplateId)
      ? getTemplateDetails(input.currentTemplateId)
      : null;
  const effectiveCategory = currentTemplate?.category || input.profileType;

  if (target.category !== effectiveCategory || target.category !== input.profileType) {
    throw new TemplateSwitchError(
      'incompatible',
      target.category === 'BUSINESS'
        ? 'Business templates cannot be mixed with a creator website.'
        : 'Creator templates cannot be mixed with a business website.',
    );
  }

  const homePage = input.pages.find(
    (page) => page.id === input.homePageId || page.pageType === 'HOME' || page.slug === '',
  );
  if (!homePage) {
    throw new TemplateSwitchError('no-home', 'Your website does not have a homepage yet.');
  }

  const homeDefault = findDefaultPage(homePage, input.currentTemplateId);
  const homeDefaultSections = defaultSections(homeDefault);
  const targetHome = buildTemplatePages(input.templateId, target.document).home;
  const mergedHome = mergeDocument(targetHome, homePage.draftDocument, homeDefaultSections);
  const mergedPublishedHome = homePage.publishedDocument
    ? mergeDocument(targetHome, homePage.publishedDocument, homeDefaultSections)
    : null;

  const updates: TemplatePageUpdate[] = [{
    pageId: homePage.id,
    title: homePage.title,
    draftDocument: toPageContentDocument(mergedHome),
    publishedDocument: mergedPublishedHome ? toPageContentDocument(mergedPublishedHome) : null,
  }];

  const managedPages = input.pages.filter((page) => isTemplateManaged(page, input.currentTemplateId));
  const usedPageIds = new Set<string>([homePage.id]);
  const usedSlugs = new Set(input.pages.map((page) => page.slug));
  const preservedPageIds: string[] = [];
  const creates: TemplatePageCreate[] = [];
  const starterPages = buildTemplatePages(input.templateId, target.document).starterPages;
  let nextNavOrder = Math.max(-1, ...input.pages.map((page) => page.navOrder)) + 1;

  for (const starter of starterPages) {
    const existing = starter.pageType === 'CUSTOM'
      ? undefined
      : managedPages.find(
          (page) =>
            !usedPageIds.has(page.id) &&
            page.pageType === starter.pageType &&
            page.slug === starter.slug,
        )
        || managedPages.find(
          (page) =>
            !usedPageIds.has(page.id) &&
            page.pageType === starter.pageType,
        )
        || managedPages.find(
          (page) =>
            !usedPageIds.has(page.id) &&
            page.slug === starter.slug,
        );

    if (existing) {
      usedPageIds.add(existing.id);
      const oldDefault = findDefaultPage(existing, input.currentTemplateId);
      const oldDefaultSections = defaultSections(oldDefault);
      const targetPage = pageDocumentFor(target.document, starter);
      const mergedDraft = mergeDocument(targetPage, existing.draftDocument, oldDefaultSections);
      const mergedPublished = existing.publishedDocument
        ? mergeDocument(targetPage, existing.publishedDocument, oldDefaultSections)
        : null;
      const oldTitle = defaultTitleFor(existing.pageType, oldDefault) || defaultTitleFor(existing.pageType, findDefaultPage(existing));

      updates.push({
        pageId: existing.id,
        title: existing.title && !sameTitle(existing.title, oldTitle) ? existing.title : starter.title,
        draftDocument: toPageContentDocument(mergedDraft),
        publishedDocument: mergedPublished ? toPageContentDocument(mergedPublished) : null,
      });
      continue;
    }

    // Custom pages are never claimed. If a customer already owns the route we
    // keep their page and move the template's new page to a unique URL.
    const slug = allocateSlug(starter.slug, usedSlugs);
    creates.push({
      pageType: starter.pageType,
      title: starter.title,
      slug,
      navOrder: nextNavOrder++,
      draftDocument: toPageContentDocument(pageDocumentFor(target.document, starter)),
    });
  }

  for (const page of input.pages) {
    if (!usedPageIds.has(page.id)) preservedPageIds.push(page.id);
  }

  const targetWebsite = extractWebsiteConfig(target.document, { templateId: input.templateId });
  const websiteConfig = mergeWebsiteIdentity(targetWebsite, input.websiteConfig);

  return {
    templateId: input.templateId,
    templateName: target.name,
    category: target.category,
    previousTemplateId: currentTemplate ? currentTemplate.id : null,
    previousTemplateName: currentTemplate ? currentTemplate.name : null,
    websiteConfig,
    updates,
    creates,
    preservedPageIds,
    homePageId: homePage.id,
  };
}

export function templateCategoryForProfile(type: string | null | undefined): TemplateCategory {
  return String(type).toUpperCase() === 'BUSINESS' ? 'BUSINESS' : 'CREATOR';
}

export function templatesCompatibleWith(category: TemplateCategory): string[] {
  return templatesForCategory(category);
}
