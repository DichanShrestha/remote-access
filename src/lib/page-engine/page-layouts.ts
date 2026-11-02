import { ComponentRegistry } from './registry';
import { PageDocument, PageSection, SectionType } from './schemas';
import { WebsiteConfig } from './site-config';
import { CreatablePageType, getPageTypeMeta, isPageLayoutForType } from './page-types';

type BuildPageInput = {
  type: CreatablePageType;
  layoutId: string;
  pageTitle: string;
  businessName: string;
  bio?: string | null;
  siteConfig: WebsiteConfig;
};

function newSectionId(type: string): string {
  return `${type}-${Math.random().toString(36).slice(2, 10)}`;
}

function section(type: SectionType, content: Record<string, unknown> = {}, extra: Record<string, unknown> = {}): PageSection {
  const base = ComponentRegistry[type].defaultData() as Record<string, unknown>;
  return {
    id: newSectionId(type),
    isHidden: false,
    ...base,
    ...extra,
    content: {
      ...((base.content as Record<string, unknown> | undefined) || {}),
      ...content,
    },
  } as PageSection;
}

function hero(content: Record<string, unknown>, layout: 'center' | 'left' | 'split' = 'center'): PageSection {
  return section('hero', {
    eyebrow: undefined,
    title: '',
    headline: undefined,
    subtitle: undefined,
    buttonText: undefined,
    buttonUrl: undefined,
    secondaryButtonText: undefined,
    secondaryButtonUrl: undefined,
    avatarUrl: undefined,
    imageUrl: undefined,
    location: undefined,
    badge: undefined,
    ...content,
  }, { layout, variant: layout === 'split' ? 'split' : 'editorial-center' });
}

function cta(businessName: string, title = 'Ready to take the next step?', text?: string): PageSection {
  return section('cta', {
    title,
    text: text || `Get in touch with ${businessName} to learn more.`,
    buttonText: 'Contact us',
    buttonUrl: '#top',
  });
}

function aboutSections(input: BuildPageInput): PageSection[] {
  const { businessName, bio, layoutId } = input;
  const intro = bio?.trim() || `${businessName} is built around thoughtful work, genuine care, and a clear point of view.`;

  if (layoutId === 'editorial') {
    return [
      hero({
        eyebrow: 'ABOUT US',
        title: `The story behind ${businessName}`,
        subtitle: intro,
      }, 'center'),
      section('timeline', {
        title: 'How we got here',
        description: 'A few moments that shaped the way we work today.',
        items: [
          { id: newSectionId('timeline'), label: 'The beginning', description: `The idea for ${businessName} started with a simple goal: do meaningful work, done well.` },
          { id: newSectionId('timeline'), label: 'Growing with purpose', description: 'We refined our approach by listening closely to the people we serve.' },
          { id: newSectionId('timeline'), label: 'Today', description: 'We continue to build with care, curiosity, and attention to the details that matter.' },
        ],
      }),
      section('rich-text', {
        text: `<h2>What we believe</h2><p>Good work starts with listening. We take the time to understand what matters to you, then build a thoughtful solution around it.</p><p>Replace this text with your own story, your team, or the values that make ${businessName} different.</p>`,
      }),
      cta(businessName),
    ];
  }

  return [
    hero({
      eyebrow: 'OUR STORY',
      title: `Meet ${businessName}`,
      subtitle: intro,
    }, 'left'),
    section('rich-text', {
      text: `<h2>Our story</h2><p>Tell visitors how ${businessName} began, what you do, and why you care about it. This section is a flexible place for your background, mission, and the people behind the work.</p><p>Keep it warm and specific. The details that feel ordinary to you are often the ones that help customers trust you.</p>`,
    }),
    section('value-cards', {
      title: 'What matters to us',
      description: 'The principles behind every project and every conversation.',
      cards: [
        { id: newSectionId('value'), metric: '01', label: 'Care', quote: 'We treat every project as if it were our own.', author: businessName },
        { id: newSectionId('value'), metric: '02', label: 'Clarity', quote: 'We keep the process simple, honest, and easy to follow.', author: businessName },
        { id: newSectionId('value'), metric: '03', label: 'Craft', quote: 'We pay attention to the details that make the difference.', author: businessName },
      ],
    }),
    cta(businessName),
  ];
}

function servicesSections(input: BuildPageInput): PageSection[] {
  const { businessName, layoutId } = input;
  const services = [
    { id: newSectionId('service'), title: 'Your first service', description: `Describe what this service includes, who it is for, and what makes ${businessName} the right choice.`, price: '' },
    { id: newSectionId('service'), title: 'Your second service', description: 'Add another service or package here. Keep the description short and easy to scan.', price: '' },
  ];

  if (layoutId === 'detailed') {
    return [
      hero({ eyebrow: 'WHAT WE DO', title: `Services from ${businessName}`, subtitle: 'Thoughtful support, clearly explained.' }, 'center'),
      section('services', { title: 'How we can help', subtitle: 'Choose the service that fits what you need.', items: services }),
      section('faq', {
        title: 'Common questions',
        items: [
          { id: newSectionId('faq'), question: 'How do I get started?', answer: 'Tell us a little about what you need. We will follow up with the next steps and a clear recommendation.' },
          { id: newSectionId('faq'), question: 'Can we create something custom?', answer: 'Yes. Share your goals and we will put together an approach that fits.' },
        ],
      }),
      cta(businessName, 'Not sure which service is right?', 'Tell us what you need and we will point you in the right direction.'),
    ];
  }

  return [
    hero({ eyebrow: 'SERVICES', title: 'What we can do for you', subtitle: `${businessName} offers focused services built around your goals.` }, 'left'),
    section('services', { title: 'Services', items: services }),
    cta(businessName),
  ];
}

function productsSections(input: BuildPageInput): PageSection[] {
  const { businessName, layoutId } = input;

  if (layoutId === 'menu') {
    return [
      hero({ eyebrow: 'OUR MENU', title: 'Explore what we offer', subtitle: `A selection of what ${businessName} is known for.` }, 'center'),
      section('products', {
        title: 'Menu',
        items: [
          { id: newSectionId('product'), category: 'Signature', title: 'Your first item', description: 'Describe the ingredients, materials, or details that make this special.', price: '—' },
          { id: newSectionId('product'), category: 'Signature', title: 'Your second item', description: 'Add another item to this category.', price: '—' },
          { id: newSectionId('product'), category: 'More to explore', title: 'Your third item', description: 'Keep the menu easy to scan and update as your offering changes.', price: '—' },
        ],
      }, { variant: 'restaurant-menu' }),
      cta(businessName, 'Have a question about our offering?', 'Reach out and we will be happy to help.'),
    ];
  }

  return [
    hero({ eyebrow: 'PRODUCTS', title: 'Made with care', subtitle: `Explore the products and offerings from ${businessName}.` }, 'left'),
    section('products', {
      title: 'Products',
      items: [
        { id: newSectionId('product'), title: 'Your first product', description: 'A short description of what it is, who it is for, and why people love it.', price: '—' },
        { id: newSectionId('product'), title: 'Your second product', description: 'Add a second product or remove this card until you are ready.', price: '—' },
      ],
    }),
    cta(businessName),
  ];
}

function contactSections(input: BuildPageInput): PageSection[] {
  const { businessName, layoutId } = input;
  const form = section('lead-form', {
    title: 'Send us a message',
    description: `Tell us a little about what you need and we will get back to you.`,
    buttonText: 'Send message',
    successMessage: 'Thanks! We will be in touch soon.',
    email: undefined,
    instagram: undefined,
    location: undefined,
  });
  const details = section('contact', {
    eyebrow: 'GET IN TOUCH',
    title: `Contact ${businessName}`,
    description: 'Add your email, phone number, address, or any other way you would like visitors to reach you.',
    email: undefined,
    phone: undefined,
    address: undefined,
  });

  if (layoutId === 'details') {
    return [
      hero({ eyebrow: 'CONTACT', title: 'Let’s talk', subtitle: `We would love to hear from you.` }, 'left'),
      details,
      form,
    ];
  }

  return [
    hero({ eyebrow: 'CONTACT', title: 'Get in touch', subtitle: `Questions, ideas, or a project in mind? Send ${businessName} a note.` }, 'center'),
    form,
    details,
  ];
}

function faqSections(input: BuildPageInput): PageSection[] {
  const { businessName, layoutId } = input;
  const faq = section('faq', {
    title: 'Frequently asked questions',
    description: 'A few answers to help you get started.',
    items: [
      { id: newSectionId('faq'), question: 'What should I expect when I get in touch?', answer: 'We will reply with a clear next step and any details we need from you.' },
      { id: newSectionId('faq'), question: 'Do you work with first-time customers?', answer: 'Absolutely. Tell us where you are starting from and we will guide you through the process.' },
      { id: newSectionId('faq'), question: 'How long does it take?', answer: 'Every project is different. Once we understand what you need, we will share a realistic timeline.' },
    ],
  });

  if (layoutId === 'grouped') {
    return [
      hero({ eyebrow: 'HELP & ANSWERS', title: 'Questions, answered', subtitle: `Everything you need to know before working with ${businessName}.` }, 'left'),
      section('rich-text', {
        text: '<h2>Before you get in touch</h2><p>These are the questions we hear most often. If yours is not here, send us a message and we will be glad to help.</p>',
      }),
      faq,
      cta(businessName, 'Still have a question?', 'We are happy to help. Reach out and we will get back to you.'),
    ];
  }

  return [
    hero({ eyebrow: 'FAQ', title: 'How can we help?', subtitle: 'Answers to the questions we hear most often.' }, 'center'),
    faq,
    cta(businessName),
  ];
}

function gallerySections(input: BuildPageInput): PageSection[] {
  const { businessName, layoutId } = input;
  return [
    hero({ eyebrow: 'GALLERY', title: 'A closer look', subtitle: `Selected work, products, and moments from ${businessName}.` }, layoutId === 'masonry' ? 'left' : 'center'),
    section('gallery', {
      title: 'Our gallery',
      description: 'Add images to tell your story visually.',
      images: [],
    }, { layout: layoutId === 'masonry' ? 'masonry' : 'grid', variant: layoutId === 'masonry' ? 'masonry' : undefined }),
    cta(businessName, 'Want to see more?', 'Get in touch and we will share more of our work.'),
  ];
}

function blogSections(input: BuildPageInput): PageSection[] {
  const { businessName, layoutId } = input;
  const posts = [
    { id: newSectionId('post'), category: 'News', date: 'Latest', title: 'Welcome to our blog', description: 'Use this space to share updates, helpful ideas, and stories from your work.', imageUrl: undefined, url: undefined },
    { id: newSectionId('post'), category: 'Guide', date: 'Latest', title: 'A useful guide for our customers', description: 'Replace this starter article with your own writing, news, or announcements.', imageUrl: undefined, url: undefined },
  ];

  if (layoutId === 'editorial') {
    return [
      hero({ eyebrow: 'JOURNAL', title: 'Ideas, updates, and stories', subtitle: `A place for the latest from ${businessName}.` }, 'split'),
      section('blog-list', {
        title: 'Latest articles',
        items: posts,
      }, { variant: 'image-cards' }),
      cta(businessName, 'Have a story to share?', 'We would love to hear from you.'),
    ];
  }

  return [
    hero({ eyebrow: 'BLOG', title: 'From the journal', subtitle: `Notes, guides, and updates from ${businessName}.` }, 'center'),
    section('blog-list', { title: 'Recent posts', items: posts }),
    cta(businessName),
  ];
}

function customSections(input: BuildPageInput): PageSection[] {
  const { businessName, layoutId } = input;

  if (layoutId === 'landing') {
    return [
      hero({ eyebrow: 'WELCOME', title: `Welcome to ${businessName}`, subtitle: 'A flexible page for a launch, campaign, or something completely new.' }, 'split'),
      section('value-cards', {
        title: 'Why people choose us',
        description: 'Replace these cards with the details that matter most.',
        cards: [
          { id: newSectionId('value'), metric: '01', label: 'Thoughtful', quote: 'A clear, considered approach from start to finish.', author: businessName },
          { id: newSectionId('value'), metric: '02', label: 'Reliable', quote: 'Clear communication and work you can count on.', author: businessName },
          { id: newSectionId('value'), metric: '03', label: 'Personal', quote: 'Everything is shaped around what you actually need.', author: businessName },
        ],
      }),
      cta(businessName),
    ];
  }

  return [
    hero({ eyebrow: 'NEW PAGE', title: 'Your new page', subtitle: 'Add your own content, or start by editing this introduction.' }, 'center'),
    section('rich-text', {
      text: '<h2>Start here</h2><p>This page is a blank canvas. Use the editor to add sections, images, products, questions, or anything else your visitors need.</p>',
    }),
  ];
}

export function buildPageDocument(input: BuildPageInput): PageDocument {
  const meta = getPageTypeMeta(input.type);
  const layoutId = isPageLayoutForType(input.type, input.layoutId) ? input.layoutId : meta.layouts[0]?.id || '';
  const resolved = { ...input, layoutId };

  const sectionsByType: Record<CreatablePageType, (value: BuildPageInput) => PageSection[]> = {
    ABOUT: aboutSections,
    SERVICES: servicesSections,
    PRODUCTS: productsSections,
    CONTACT: contactSections,
    FAQ: faqSections,
    GALLERY: gallerySections,
    BLOG: blogSections,
    CUSTOM: customSections,
  };

  const seoDescription = input.bio?.trim() || `${input.pageTitle} — ${input.businessName}.`;

  return {
    version: 1,
    theme: input.siteConfig.theme,
    settings: {
      showFooterBranding: input.siteConfig.settings.showFooterBranding,
      enableSmoothScrolling: input.siteConfig.settings.enableSmoothScrolling,
      seoTitle: `${input.pageTitle} | ${input.businessName}`,
      seoDescription,
    },
    sections: sectionsByType[input.type](resolved),
  };
}
