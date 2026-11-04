import assert from 'node:assert/strict';
import test from 'node:test';
import { TEMPLATES_MAP } from './templates';
import { PageDocumentSchema, type PageDocument, type PageSection } from './schemas';
import { buildTemplatePages } from './template-pages';
import { extractWebsiteConfig, toPageContentDocument } from './site-config';
import {
  TemplateSwitchError,
  detectTemplateId,
  planTemplateSwitch,
  type TemplateSwitchPage,
} from './template-switch';

function homePage(templateId: string, overrides: Partial<TemplateSwitchPage> = {}): TemplateSwitchPage {
  const document = PageDocumentSchema.parse(TEMPLATES_MAP[templateId]);
  return {
    id: 'home',
    title: 'My business',
    slug: '',
    pageType: 'HOME',
    navOrder: 0,
    showInNavigation: true,
    draftDocument: toPageContentDocument(document),
    publishedDocument: null,
    ...overrides,
  };
}

function starterPages(templateId: string): TemplateSwitchPage[] {
  const document = PageDocumentSchema.parse(TEMPLATES_MAP[templateId]);
  return buildTemplatePages(templateId, document).starterPages.map((starter, index) => {
    const pageDocument = PageDocumentSchema.parse({ ...document, sections: starter.sections });
    return {
      id: `${templateId}-${starter.slug}`,
      title: starter.title,
      slug: starter.slug,
      pageType: starter.pageType,
      navOrder: index + 1,
      showInNavigation: true,
      draftDocument: toPageContentDocument(pageDocument),
      publishedDocument: null,
    };
  });
}

function customizeSection(
  document: PageDocument,
  id: string,
  update: (section: PageSection) => void,
): PageDocument {
  const copy = structuredClone(document);
  const section = copy.sections.find((node) => !('kind' in node) && node.id === id);
  assert.ok(section, `section ${id} exists`);
  update(section as PageSection);
  return copy;
}

function findSection(document: PageDocument, id: string): PageSection | undefined {
  return document.sections.find((node): node is PageSection => !('kind' in node) && node.id === id);
}

function sectionTitle(document: PageDocument, id: string): unknown {
  const section = findSection(document, id);
  assert.ok(section, `section ${id} exists`);
  return (section.content as Record<string, unknown>).title;
}

test('restaurant to corporate redesigns the homepage and every corresponding page', () => {
  const restaurantPages = starterPages('restaurant');
  const about = restaurantPages.find((page) => page.slug === 'about')!;
  about.title = 'Our story';
  about.draftDocument = customizeSection(about.draftDocument!, 'cucina', (section) => {
    section.content = { ...section.content, title: 'Our family kitchen' } as PageSection['content'];
  });

  const customPage: TemplateSwitchPage = {
    id: 'custom-secret',
    title: 'Secret menu',
    slug: 'secret-menu',
    pageType: 'CUSTOM',
    navOrder: 20,
    showInNavigation: false,
    draftDocument: PageDocumentSchema.parse({
      sections: [{ id: 'custom-hero', type: 'hero', content: { title: 'Secret menu' } }],
    }),
    publishedDocument: null,
  };
  const blogPage: TemplateSwitchPage = {
    id: 'blog',
    title: 'Blog',
    slug: 'blog',
    pageType: 'BLOG',
    navOrder: 21,
    showInNavigation: true,
    draftDocument: PageDocumentSchema.parse({
      sections: [{ id: 'blog-list', type: 'blog-list', content: { title: 'Blog', items: [] } }],
    }),
    publishedDocument: null,
  };

  const pages = [homePage('restaurant'), ...restaurantPages, customPage, blogPage];
  const plan = planTemplateSwitch({
    templateId: 'corporate-consulting',
    profileType: 'BUSINESS',
    currentTemplateId: 'restaurant',
    websiteConfig: extractWebsiteConfig(PageDocumentSchema.parse(TEMPLATES_MAP.restaurant), { templateId: 'restaurant' }),
    pages,
    homePageId: 'home',
  });

  const updatedIds = new Set(plan.updates.map((update) => update.pageId));
  assert.ok(updatedIds.has('home'), 'homepage is redesigned');
  assert.ok(updatedIds.has(about.id), 'About page is redesigned');
  assert.ok(updatedIds.has('restaurant-gallery'), 'Gallery/portfolio page is redesigned');
  assert.ok(updatedIds.has('restaurant-reservations'), 'Contact page is redesigned');
  assert.ok(!updatedIds.has('restaurant-menu'), 'restaurant-only menu page is preserved while it has no equivalent');
  assert.ok(plan.preservedPageIds.includes(customPage.id), 'customer custom page is preserved');
  assert.ok(plan.preservedPageIds.includes(blogPage.id), 'blog index is preserved when the new template has no blog');
  assert.ok(!plan.preservedPageIds.includes(about.id), 'managed About page is not preserved untouched');

  const redesignedAbout = plan.updates.find((update) => update.pageId === about.id)!.draftDocument;
  const approach = findSection(redesignedAbout, 'approach')!;
  assert.equal(approach.type, 'feature-split');
  assert.equal(approach.variant, 'editorial');
  assert.equal(approach.content.title, 'Our family kitchen', 'customer-edited copy is mapped into the new section');

  const services = findSection(redesignedAbout, 'how-we-work')!;
  assert.equal(services.variant, 'corporate-index', 'sections use the new template variants');

  assert.equal(
    plan.updates.find((update) => update.pageId === about.id)!.title,
    'Our story',
    'a customer-edited page title is kept',
  );

  const createdSlugs = plan.creates.map((page) => page.slug);
  assert.ok(createdSlugs.includes('services'), 'the target template Services page is created');
  assert.ok(createdSlugs.includes('faq'), 'the target template FAQ page is created');
  assert.equal(new Set([...createdSlugs, ...pages.map((page) => page.slug)]).size, createdSlugs.length + pages.length, 'no route is duplicated');
  assert.ok(!createdSlugs.includes('about'), 'no duplicate About page is created');

  assert.equal(plan.websiteConfig.templateId, 'corporate-consulting', 'template provenance is persisted');
  assert.equal(plan.websiteConfig.header?.content.logoText, 'Osteria\nSan Rocco', 'business logo text is preserved');
  assert.equal(plan.category, 'BUSINESS');
});

test('unedited template content is replaced with the target template defaults', () => {
  const pages = [homePage('restaurant'), ...starterPages('restaurant')];
  const plan = planTemplateSwitch({
    templateId: 'corporate-consulting',
    profileType: 'BUSINESS',
    currentTemplateId: 'restaurant',
    pages,
    homePageId: 'home',
  });

  const aboutId = pages.find((page) => page.slug === 'about')!.id;
  const aboutUpdate = plan.updates.find((update) => update.pageId === aboutId)!;
  const about = aboutUpdate.draftDocument;
  assert.equal(aboutUpdate.title, 'About us', 'unedited page title comes from the new template');
  assert.equal(sectionTitle(about, 'about-hero'), 'About Northstar');
  assert.equal(sectionTitle(about, 'approach'), 'Independent advice, built around your business');
  assert.ok(!findSection(about, 'cucina'), 'old template section ids are not copied blindly');
});

test('customer content survives a business to business switch and SEO settings stay intact', () => {
  const corporatePages = starterPages('corporate-consulting');
  const about = corporatePages.find((page) => page.slug === 'about')!;
  about.draftDocument = customizeSection(about.draftDocument!, 'approach', (section) => {
    section.content = {
      ...section.content,
      title: 'Advice built around our family business',
      description: 'A custom description our team wrote.',
    } as PageSection['content'];
  });
  about.draftDocument = {
    ...about.draftDocument!,
    settings: {
      ...about.draftDocument!.settings,
      seoTitle: 'Our custom About title',
      seoDescription: 'Custom SEO description',
      noindex: true,
    },
  };

  const plan = planTemplateSwitch({
    templateId: 'luxury-skincare',
    profileType: 'BUSINESS',
    currentTemplateId: 'corporate-consulting',
    pages: [homePage('corporate-consulting'), ...corporatePages],
    homePageId: 'home',
  });

  const updatedAbout = plan.updates.find((update) => update.pageId === about.id)!.draftDocument;
  assert.equal(updatedAbout.settings.seoTitle, 'Our custom About title');
  assert.equal(updatedAbout.settings.seoDescription, 'Custom SEO description');
  assert.equal(updatedAbout.settings.noindex, true);
  assert.equal(sectionTitle(updatedAbout, 'approach'), 'Advice built around our family business');
  assert.equal(updatedAbout.theme.primaryColor, TEMPLATES_MAP['luxury-skincare'].theme.primaryColor, 'theme comes from the new template');
});

test('a customer-created page keeps a route the new template would use', () => {
  const customServices: TemplateSwitchPage = {
    id: 'customer-services',
    title: 'My services',
    slug: 'services',
    pageType: 'CUSTOM',
    navOrder: 5,
    showInNavigation: true,
    draftDocument: PageDocumentSchema.parse({
      sections: [{ id: 'custom-services', type: 'services', content: { title: 'Custom services', items: [] } }],
    }),
    publishedDocument: null,
  };

  const plan = planTemplateSwitch({
    templateId: 'corporate-consulting',
    profileType: 'BUSINESS',
    currentTemplateId: 'restaurant',
    pages: [homePage('restaurant'), ...starterPages('restaurant'), customServices],
    homePageId: 'home',
  });

  assert.ok(plan.preservedPageIds.includes(customServices.id));
  assert.ok(plan.creates.some((page) => page.slug === 'services-2'), 'the new page gets a free URL instead of overwriting the custom page');
});

test('custom pages and blog posts are never deleted or overwritten', () => {
  const blogPage: TemplateSwitchPage = {
    id: 'journal',
    title: 'Journal',
    slug: 'journal',
    pageType: 'BLOG',
    navOrder: 10,
    showInNavigation: true,
    draftDocument: PageDocumentSchema.parse({
      sections: [{ id: 'journal-list', type: 'blog-list', content: { title: 'Journal', items: [] } }],
    }),
    publishedDocument: null,
  };
  const customPage: TemplateSwitchPage = {
    id: 'custom',
    title: 'Press',
    slug: 'press',
    pageType: 'CUSTOM',
    navOrder: 11,
    showInNavigation: true,
    draftDocument: PageDocumentSchema.parse({
      sections: [{ id: 'press', type: 'rich-text', content: { text: '<p>Press kit</p>' } }],
    }),
    publishedDocument: null,
  };

  const plan = planTemplateSwitch({
    templateId: 'creator-newsletter',
    profileType: 'CREATOR',
    currentTemplateId: 'creator-profile',
    pages: [homePage('creator-profile'), ...starterPages('creator-profile'), blogPage, customPage],
    homePageId: 'home',
  });

  assert.ok(plan.preservedPageIds.includes(blogPage.id));
  assert.ok(plan.preservedPageIds.includes(customPage.id));
  assert.ok(!plan.updates.some((update) => update.pageId === blogPage.id));
  assert.ok(!plan.updates.some((update) => update.pageId === customPage.id));
});

test('business and creator template structures cannot be mixed', () => {
  assert.throws(
    () => planTemplateSwitch({
      templateId: 'creator-newsletter',
      profileType: 'BUSINESS',
      currentTemplateId: 'restaurant',
      pages: [homePage('restaurant')],
      homePageId: 'home',
    }),
    (error: unknown) => error instanceof TemplateSwitchError && error.code === 'incompatible',
  );
});

test('legacy websites are detected and still receive a complete switch plan', () => {
  const pages = [homePage('restaurant'), ...starterPages('restaurant')];
  const detected = detectTemplateId(pages[0].draftDocument, pages);
  assert.equal(detected, 'restaurant');

  const plan = planTemplateSwitch({
    templateId: 'spa-salon',
    profileType: 'BUSINESS',
    currentTemplateId: detected,
    pages,
    homePageId: 'home',
  });

  assert.equal(plan.previousTemplateId, 'restaurant');
  assert.ok(plan.updates.length >= 4, 'homepage and existing corresponding pages are updated');
  assert.ok(plan.creates.length > 0, 'missing target pages are created');
});

test('published page designs are redesigned with the same preserved content', () => {
  const pages = starterPages('restaurant');
  const about = pages.find((page) => page.slug === 'about')!;
  about.draftDocument = customizeSection(about.draftDocument!, 'cucina', (section) => {
    section.content = { ...section.content, title: 'Family recipes' } as PageSection['content'];
  });
  about.publishedDocument = structuredClone(about.draftDocument);

  const plan = planTemplateSwitch({
    templateId: 'corporate-consulting',
    profileType: 'BUSINESS',
    currentTemplateId: 'restaurant',
    pages: [homePage('restaurant'), ...pages],
    homePageId: 'home',
  });

  const update = plan.updates.find((item) => item.pageId === about.id)!;
  assert.ok(update.publishedDocument, 'a published page keeps a redesigned published snapshot');
  assert.equal(sectionTitle(update.publishedDocument!, 'approach'), 'Family recipes');
});

function applySwitchPlan(
  pages: TemplateSwitchPage[],
  plan: ReturnType<typeof planTemplateSwitch>,
): TemplateSwitchPage[] {
  const updates = new Map(plan.updates.map((update) => [update.pageId, update]));
  const next = pages.map((page) => {
    const update = updates.get(page.id);
    if (!update) return page;
    return {
      ...page,
      title: update.title,
      pageType: update.pageType || page.pageType,
      draftDocument: update.draftDocument,
      publishedDocument: update.publishedDocument,
    };
  });
  for (const create of plan.creates) {
    next.push({
      id: `created-${create.slug}`,
      title: create.title,
      slug: create.slug,
      pageType: create.pageType,
      navOrder: create.navOrder,
      showInNavigation: true,
      draftDocument: create.draftDocument,
      publishedDocument: null,
    });
  }
  return next;
}

test('tattoo process page is managed and never duplicated across switches', () => {
  const tattooPages = starterPages('tattoo-artist');
  const process = tattooPages.find((page) => page.slug === 'process')!;
  assert.equal(process.pageType, 'SERVICES', 'Process uses a managed page type');

  const toCorporate = planTemplateSwitch({
    templateId: 'corporate-consulting',
    profileType: 'BUSINESS',
    currentTemplateId: 'tattoo-artist',
    pages: [homePage('tattoo-artist'), ...tattooPages],
    homePageId: 'home',
  });

  const processUpdate = toCorporate.updates.find((update) => update.pageId === process.id);
  assert.ok(processUpdate, 'the existing Process page is updated in place');
  assert.equal(processUpdate.pageType, 'SERVICES');
  assert.ok(!toCorporate.creates.some((page) => page.slug === 'process'), 'switching away does not create another Process page');
  assert.ok(!toCorporate.preservedPageIds.includes(process.id), 'the Process page is treated as template-managed');

  const corporatePages = applySwitchPlan([homePage('tattoo-artist'), ...tattooPages], toCorporate);
  const backToTattoo = planTemplateSwitch({
    templateId: 'tattoo-artist',
    profileType: 'BUSINESS',
    currentTemplateId: 'corporate-consulting',
    pages: corporatePages,
    homePageId: 'home',
  });

  const restored = backToTattoo.updates.find((update) => update.pageId === process.id);
  assert.ok(restored, 'the same row is restyled back into the Process page');
  assert.equal(restored.title, 'Process');
  assert.ok(!backToTattoo.creates.some((page) => page.slug === 'process'), 'the return switch does not create a duplicate route');
});

test('legacy tattoo custom process pages are migrated instead of duplicated', () => {
  const pages = starterPages('tattoo-artist');
  const generated = pages.find((page) => page.slug === 'process')!;
  const legacyProcess: TemplateSwitchPage = {
    ...generated,
    id: 'legacy-tattoo-process',
    pageType: 'CUSTOM',
  };
  legacyProcess.draftDocument = customizeSection(legacyProcess.draftDocument!, 'process', (section) => {
    section.content = { ...section.content, title: 'How my tattoo came together' } as PageSection['content'];
  });
  const legacyPages = pages.map((page) => (page.id === generated.id ? legacyProcess : page));

  const plan = planTemplateSwitch({
    templateId: 'tattoo-artist',
    profileType: 'BUSINESS',
    currentTemplateId: 'tattoo-artist',
    pages: [homePage('tattoo-artist'), ...legacyPages],
    homePageId: 'home',
  });

  const update = plan.updates.find((item) => item.pageId === legacyProcess.id);
  assert.ok(update, 'the generated CUSTOM Process page is claimed by the template');
  assert.equal(update.pageType, 'SERVICES', 'the legacy page adopts the managed page type');
  assert.equal(update.title, 'Process');
  assert.equal(sectionTitle(update.draftDocument, 'process'), 'How my tattoo came together');
  assert.ok(!plan.creates.some((page) => page.slug === 'process'), 'no duplicate Process route is created');
  assert.ok(!plan.preservedPageIds.includes(legacyProcess.id), 'the legacy page is not left behind as a custom page');
});

test('tattoo customer content survives switching away and back', () => {
  const tattooPages = starterPages('tattoo-artist');
  const about = tattooPages.find((page) => page.slug === 'about')!;
  const gallery = tattooPages.find((page) => page.slug === 'gallery')!;
  const faq = tattooPages.find((page) => page.slug === 'faq')!;
  const contact = tattooPages.find((page) => page.slug === 'contact')!;

  about.draftDocument = customizeSection(about.draftDocument!, 'artist', (section) => {
    section.content = { ...section.content, title: 'The artist behind the ink' } as PageSection['content'];
  });
  gallery.draftDocument = customizeSection(gallery.draftDocument!, 'board', (section) => {
    const content = section.content as { title?: string; images: Array<{ id: string; url: string; caption?: string; note?: string }> };
    section.content = {
      ...content,
      title: 'A custom flash title',
      images: content.images.map((image, index) => index === 0
        ? { ...image, caption: 'Healed blackwork, 2025' }
        : image),
    } as PageSection['content'];
  });
  faq.draftDocument = customizeSection(faq.draftDocument!, 'faq', (section) => {
    const content = section.content as { items: Array<{ id: string; question: string; answer: string }> };
    section.content = {
      ...content,
      items: content.items.map((item, index) => index === 0
        ? { ...item, answer: 'A custom answer from the studio.' }
        : item),
    } as PageSection['content'];
  });
  contact.draftDocument = customizeSection(contact.draftDocument!, 'contact', (section) => {
    section.content = {
      ...section.content,
      title: 'Tell us the idea you cannot stop thinking about.',
    } as PageSection['content'];
  });

  const start = [homePage('tattoo-artist'), ...tattooPages];
  const toCorporate = planTemplateSwitch({
    templateId: 'corporate-consulting',
    profileType: 'BUSINESS',
    currentTemplateId: 'tattoo-artist',
    pages: start,
    homePageId: 'home',
  });
  const corporatePages = applySwitchPlan(start, toCorporate);
  const backToTattoo = planTemplateSwitch({
    templateId: 'tattoo-artist',
    profileType: 'BUSINESS',
    currentTemplateId: 'corporate-consulting',
    pages: corporatePages,
    homePageId: 'home',
  });
  const finalPages = applySwitchPlan(corporatePages, backToTattoo);

  const finalAbout = finalPages.find((page) => page.id === about.id)!;
  const finalGallery = finalPages.find((page) => page.id === gallery.id)!;
  const finalFaq = finalPages.find((page) => page.id === faq.id)!;
  const finalContact = finalPages.find((page) => page.id === contact.id)!;

  assert.equal(sectionTitle(finalAbout.draftDocument!, 'artist'), 'The artist behind the ink');
  assert.equal(sectionTitle(finalGallery.draftDocument!, 'board'), 'A custom flash title');
  const finalBoard = findSection(finalGallery.draftDocument!, 'board')!;
  assert.equal((finalBoard.content as { images: Array<{ caption?: string }> }).images[0].caption, 'Healed blackwork, 2025');
  const finalFaqSection = findSection(finalFaq.draftDocument!, 'faq')!;
  assert.equal((finalFaqSection.content as { items: Array<{ answer: string }> }).items[0].answer, 'A custom answer from the studio.');
  assert.equal(
    sectionTitle(finalContact.draftDocument!, 'contact'),
    'Tell us the idea you cannot stop thinking about.',
  );

  assert.equal(new Set(finalPages.map((page) => page.slug)).size, finalPages.length, 'no child route is duplicated');
  assert.equal(finalPages.filter((page) => page.slug === 'process').length, 1, 'the Process route survives exactly once');
});
