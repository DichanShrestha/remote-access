import { z } from 'zod';

export const BaseSectionSchema = z.object({
  id: z.string(),
  isHidden: z.boolean().default(false),
  variant: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  sectionPadding: z.enum(['none', 'small', 'medium', 'large', 'custom']).optional(),
  customSectionPadding: z.number().min(0).max(160).optional(),
  contentWidth: z.enum(['narrow', 'standard', 'wide', 'full']).optional(),
  buttonColor: z.string().optional(),
  buttonTextColor: z.string().optional(),
});

export const ThemeConfigSchema = z.object({
  style: z.enum(['premium-minimal', 'bold', 'playful']),
  primaryColor: z.string(),
  radius: z.enum(['none', 'small', 'medium', 'large', 'full']),
  density: z.enum(['compact', 'comfortable', 'spacious']),
});
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

export const PageSettingsSchema = z.object({
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  noindex: z.boolean().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  showFooterBranding: z.boolean().default(true),
  enableSmoothScrolling: z.boolean().default(false),
});

// ─── Component Schemas ───────────────────────────────────────────

export const HeroSectionSchema = BaseSectionSchema.extend({
  type: z.literal('hero'),
  content: z.object({
    eyebrow: z.string().optional(),
    title: z.string(),
    headline: z.string().optional(),
    subtitle: z.string().optional(),
    buttonText: z.string().optional(),
    buttonUrl: z.string().optional(),
    secondaryButtonText: z.string().optional(),
    secondaryButtonUrl: z.string().optional(),
    imageUrl: z.string().optional(),
    galleryImages: z.array(z.object({ id: z.string(), url: z.string(), caption: z.string().optional() })).optional(),
    avatarUrl: z.string().optional(),
    secondaryImageUrl: z.string().optional(),
    location: z.string().optional(),
    badge: z.string().optional(),
    metric: z.string().optional(),
    metricLabel: z.string().optional(),
    socialLinks: z.array(z.object({
      id: z.string(),
      platform: z.string(),
      url: z.string(),
    })).optional(),
  }),
  layout: z.enum(['center', 'left', 'split']).default('center'),
  zoomReveal: z.boolean().optional(),
  zoomWord: z.string().optional(),
  textContrast: z.enum(['auto', 'light', 'dark']).optional(),
});

export const RichTextSectionSchema = BaseSectionSchema.extend({
  type: z.literal('rich-text'),
  content: z.object({ text: z.string() }),
});

export const CtaSectionSchema = BaseSectionSchema.extend({
  type: z.literal('cta'),
  content: z.object({
    title: z.string(),
    text: z.string().optional(),
    buttonText: z.string(),
    buttonUrl: z.string(),
  }),
});

export const UrlButtonSectionSchema = BaseSectionSchema.extend({
  type: z.literal('url-button'),
  content: z.object({
    label: z.string(),
    url: z.string(),
    description: z.string().optional(),
  }),
  layout: z.enum(['filled', 'outline', 'ghost']).default('filled'),
});

export const ImageButtonSectionSchema = BaseSectionSchema.extend({
  type: z.literal('image-button'),
  content: z.object({
    imageUrl: z.string(),
    label: z.string().optional(),
    url: z.string(),
  }),
});

export const EmailButtonSectionSchema = BaseSectionSchema.extend({
  type: z.literal('email-button'),
  content: z.object({
    label: z.string(),
    email: z.string(),
    subject: z.string().optional(),
  }),
});

export const FileButtonSectionSchema = BaseSectionSchema.extend({
  type: z.literal('file-button'),
  content: z.object({
    label: z.string(),
    fileUrl: z.string(),
    fileName: z.string().optional(),
  }),
});

export const SocialLinksSectionSchema = BaseSectionSchema.extend({
  type: z.literal('social-links'),
  content: z.object({
    links: z.array(z.object({
      id: z.string(),
      platform: z.string(),
      url: z.string(),
    })),
  }),
  layout: z.enum(['row', 'grid']).default('row'),
});

export const ImageSectionSchema = BaseSectionSchema.extend({
  type: z.literal('image'),
  content: z.object({
    url: z.string(),
    alt: z.string().optional(),
    caption: z.string().optional(),
  }),
  layout: z.enum(['full', 'contained', 'cover']).default('contained'),
});

export const GallerySectionSchema = BaseSectionSchema.extend({
  type: z.literal('gallery'),
  content: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    buttonText: z.string().optional(),
    buttonUrl: z.string().optional(),
    secondaryButtonText: z.string().optional(),
    secondaryButtonUrl: z.string().optional(),
    images: z.array(z.object({ id: z.string(), url: z.string(), caption: z.string().optional(), note: z.string().optional() })),
  }),
  layout: z.enum(['grid', 'masonry']).default('grid'),
});

export const CarouselSectionSchema = BaseSectionSchema.extend({
  type: z.literal('carousel'),
  content: z.object({
    images: z.array(z.object({ id: z.string(), url: z.string(), caption: z.string().optional() })),
  }),
});

export const VideoSectionSchema = BaseSectionSchema.extend({
  type: z.literal('video'),
  content: z.object({
    url: z.string(),
    title: z.string().optional(),
  }),
});

export const AudioSectionSchema = BaseSectionSchema.extend({
  type: z.literal('audio'),
  content: z.object({
    url: z.string(),
    title: z.string().optional(),
    artist: z.string().optional(),
  }),
});

export const ResumeSectionSchema = BaseSectionSchema.extend({
  type: z.literal('resume'),
  content: z.object({
    title: z.string().optional(),
    items: z.array(z.object({
      id: z.string(),
      role: z.string(),
      company: z.string(),
      period: z.string(),
      description: z.string().optional(),
    })),
  }),
});

export const ServicesSectionSchema = BaseSectionSchema.extend({
  type: z.literal('services'),
  content: z.object({
    title: z.string().optional(),
    eyebrow: z.string().optional(),
    subtitle: z.string().optional(),
    items: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      price: z.string().optional(),
      icon: z.string().optional(),
      imageUrl: z.string().optional(),
      tag: z.string().optional(),
      badge: z.string().optional(),
      duration: z.string().optional(),
      buttonText: z.string().optional(),
      buttonUrl: z.string().optional(),
    })),
    socialLinks: z.array(z.object({ id: z.string(), title: z.string(), url: z.string() })).optional(),
  }),
});

export const ProductsSectionSchema = BaseSectionSchema.extend({
  type: z.literal('products'),
  content: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    menuImageUrl: z.string().optional(),
    items: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      price: z.string(),
      imageUrl: z.string().optional(),
      url: z.string().optional(),
      category: z.string().optional(),
    })),
  }),
});

export const TestimonialsSectionSchema = BaseSectionSchema.extend({
  type: z.literal('testimonials'),
  content: z.object({
    title: z.string().optional(),
    items: z.array(z.object({
      id: z.string(),
      quote: z.string(),
      author: z.string(),
      role: z.string().optional(),
      avatarUrl: z.string().optional(),
    })),
  }),
});

export const CaseStudiesSectionSchema = BaseSectionSchema.extend({
  type: z.literal('case-studies'),
  content: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    actionText: z.string().optional(),
    actionUrl: z.string().optional(),
    items: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      imageUrl: z.string(),
      category: z.string().optional(),
      date: z.string().optional(),
      client: z.string().optional(),
      location: z.string().optional(),
      url: z.string().optional(),
      buttonText: z.string().optional(),
    })),
  }),
});

export const BlogListSectionSchema = BaseSectionSchema.extend({
  type: z.literal('blog-list'),
  content: z.object({
    title: z.string(),
    actionText: z.string().optional(),
    actionUrl: z.string().optional(),
    items: z.array(z.object({
      id: z.string(), category: z.string(), date: z.string(), title: z.string(), description: z.string(), imageUrl: z.string().optional(), url: z.string().optional(),
    })),
  }),
});

export const FaqSectionSchema = BaseSectionSchema.extend({
  type: z.literal('faq'),
  content: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    items: z.array(z.object({ id: z.string(), question: z.string(), answer: z.string() })),
  }),
});

export const AnnouncementSectionSchema = BaseSectionSchema.extend({
  type: z.literal('announcement'),
  content: z.object({
    text: z.string(),
    url: z.string().optional(),
    buttonText: z.string().optional(),
  }),
});

export const LeadFormSectionSchema = BaseSectionSchema.extend({
  type: z.literal('lead-form'),
  content: z.object({
    title: z.string(),
    description: z.string().optional(),
    buttonText: z.string().default('Submit'),
    successMessage: z.string().default('Thanks! We will be in touch.'),
    nameLabel: z.string().optional(),
    namePlaceholder: z.string().optional(),
    contactLabel: z.string().optional(),
    contactPlaceholder: z.string().optional(),
    messageLabel: z.string().optional(),
    messagePlaceholder: z.string().optional(),
    email: z.string().optional(),
    instagram: z.string().optional(),
    location: z.string().optional(),
  }),
});

export const CollectEmailsSectionSchema = BaseSectionSchema.extend({
  type: z.literal('collect-emails'),
  content: z.object({
    title: z.string().optional(),
    placeholder: z.string().default('Your email address'),
    buttonText: z.string().default('Subscribe'),
    successMessage: z.string().default('You\'re subscribed!'),
  }),
});

export const BookingSectionSchema = BaseSectionSchema.extend({
  type: z.literal('booking'),
  content: z.object({
    title: z.string(),
    description: z.string().optional(),
    provider: z.enum(['cal.com', 'calendly', 'custom']).default('cal.com'),
    link: z.string(),
    imageUrl: z.string().optional(),
  }),
});

export const LinkListSectionSchema = BaseSectionSchema.extend({
  type: z.literal('link-list'),
  content: z.object({
    links: z.array(z.object({ id: z.string(), label: z.string(), url: z.string(), badge: z.string().optional(), isActive: z.boolean().optional() })),
  }),
});

export const SiteNavbarSectionSchema = BaseSectionSchema.extend({
  type: z.literal('site-navbar'),
  content: z.object({
    logoText: z.string(),
    logoUrl: z.string().optional(),
    links: z.array(z.object({ id: z.string(), label: z.string(), url: z.string() })),
    primaryLabel: z.string().optional(),
    primaryUrl: z.string().optional(),
    secondaryLabel: z.string().optional(),
    secondaryUrl: z.string().optional(),
  }),
});

export const SiteFooterSectionSchema = BaseSectionSchema.extend({
  type: z.literal('site-footer'),
  content: z.object({
    logoText: z.string(),
    description: z.string(),
    links: z.array(z.object({ id: z.string(), group: z.string(), label: z.string(), url: z.string() })),
    socialLinks: z.array(z.object({ id: z.string(), label: z.string(), url: z.string() })),
    legalLinks: z.array(z.object({ id: z.string(), label: z.string(), url: z.string() })),
  }),
});



export const ContactSectionSchema = BaseSectionSchema.extend({
  type: z.literal('contact'),
  content: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    buttonText: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const QuoteSectionSchema = BaseSectionSchema.extend({
  type: z.literal('quote'),
  content: z.object({
    text: z.string(),
    author: z.string().optional(),
  }),
});

export const MarqueeSectionSchema = BaseSectionSchema.extend({
  type: z.literal('marquee'),
  content: z.object({
    text: z.string(),
  }),
  layout: z.enum(['left', 'right']).default('left'),
});

export const DonateSectionSchema = BaseSectionSchema.extend({
  type: z.literal('donate'),
  content: z.object({
    title: z.string().optional(),
    links: z.array(z.object({
      id: z.string(),
      platform: z.string(),
      url: z.string(),
    })),
  }),
});

export const CountdownSectionSchema = BaseSectionSchema.extend({
  type: z.literal('countdown'),
  content: z.object({
    title: z.string().optional(),
    targetDate: z.string(),
  }),
});

export const StatsSectionSchema = BaseSectionSchema.extend({
  type: z.literal('stats'),
  content: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    items: z.array(z.object({
      id: z.string(),
      value: z.string(),
      label: z.string(),
      prefix: z.string().optional(),
      suffix: z.string().optional(),
    })),
  }),
});

export const TimelineSectionSchema = BaseSectionSchema.extend({
  type: z.literal('timeline'),
  content: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    items: z.array(z.object({
      id: z.string(),
      label: z.string(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
    })),
  }),
  layout: z.enum(['vertical', 'horizontal-cards', 'restaurant-history']).default('vertical'),
});

export const DividerSectionSchema = BaseSectionSchema.extend({
  type: z.literal('divider'),
  content: z.object({}).optional(),
  layout: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
});

export const SpacerSectionSchema = BaseSectionSchema.extend({
  type: z.literal('spacer'),
  content: z.object({}).optional(),
  layout: z.enum(['small', 'medium', 'large', 'xl']).default('medium'),
});

export const FeatureSplitSectionSchema = BaseSectionSchema.extend({
  type: z.literal('feature-split'),
  content: z.object({
    eyebrow: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    checkpoints: z.array(z.object({
      id: z.string(),
      text: z.string(),
    })).default([]),
    imageUrl: z.string(),
    secondaryImageUrl: z.string().optional(),
    imageAlt: z.string().optional(),
    imageLabel: z.string().optional(),
    buttonText: z.string().optional(),
    buttonUrl: z.string().optional(),
  }),
  layout: z.enum(['image-left', 'image-right']).default('image-left'),
});

export const ValueCardsSectionSchema = BaseSectionSchema.extend({
  type: z.literal('value-cards'),
  content: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    cards: z.array(z.object({
      id: z.string(),
      metric: z.string(),
      label: z.string(),
      quote: z.string(),
      author: z.string(),
      role: z.string().optional(),
      avatarUrl: z.string().optional(),
    })).default([]),
  }),
});

// ─── Master Union ────────────────────────────────────────────────

export const PageSectionSchema = z.discriminatedUnion('type', [
  HeroSectionSchema,
  RichTextSectionSchema,
  CtaSectionSchema,
  UrlButtonSectionSchema,
  ImageButtonSectionSchema,
  EmailButtonSectionSchema,
  FileButtonSectionSchema,
  SocialLinksSectionSchema,
  ImageSectionSchema,
  GallerySectionSchema,
  CarouselSectionSchema,
  VideoSectionSchema,
  AudioSectionSchema,
  ResumeSectionSchema,
  ServicesSectionSchema,
  ProductsSectionSchema,
  TestimonialsSectionSchema,
  CaseStudiesSectionSchema,
  BlogListSectionSchema,
  FaqSectionSchema,
  AnnouncementSectionSchema,
  LeadFormSectionSchema,
  CollectEmailsSectionSchema,
  BookingSectionSchema,
  LinkListSectionSchema,
  SiteNavbarSectionSchema,
  SiteFooterSectionSchema,

  ContactSectionSchema,
  QuoteSectionSchema,
  MarqueeSectionSchema,
  DonateSectionSchema,
  CountdownSectionSchema,
  StatsSectionSchema,
  TimelineSectionSchema,
  DividerSectionSchema,
  SpacerSectionSchema,
  FeatureSplitSectionSchema,
  ValueCardsSectionSchema,
]);

export type PageSection = z.infer<typeof PageSectionSchema>;
export type SectionType = PageSection['type'];

export interface GroupNode {
  kind: 'group';
  id: string;
  name: string;
  backgroundColor?: string;
  textColor?: string;
  direction: 'row' | 'column';
  horizontalAlign: 'left' | 'center' | 'right' | 'space-between';
  verticalAlign: 'top' | 'center' | 'bottom';
  width: 'fit' | 'full' | 'custom';
  customWidth: number;
  gap: 'small' | 'medium' | 'large' | 'custom';
  customGap: number;
  padding: 'small' | 'medium' | 'large' | 'custom';
  customPadding: number;
  mobileDirection: 'row' | 'column';
  children: PageNode[];
}

export type PageNode = PageSection | GroupNode;

export const PageNodeSchema: z.ZodType<PageNode> = z.lazy(() => z.union([PageSectionSchema, GroupNodeSchema]));
export const GroupNodeSchema: z.ZodType<GroupNode> = z.lazy(() => z.object({
  kind: z.literal('group'),
  id: z.string(),
  name: z.string().default('Layout Group'),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  direction: z.enum(['row', 'column']).default('column'),
  horizontalAlign: z.enum(['left', 'center', 'right', 'space-between']).default('left'),
  verticalAlign: z.enum(['top', 'center', 'bottom']).default('top'),
  width: z.enum(['fit', 'full', 'custom']).default('full'),
  customWidth: z.number().min(10).max(100).default(100),
  gap: z.enum(['small', 'medium', 'large', 'custom']).default('medium'),
  customGap: z.number().min(0).max(96).default(24),
  padding: z.enum(['small', 'medium', 'large', 'custom']).default('medium'),
  customPadding: z.number().min(0).max(128).default(24),
  mobileDirection: z.enum(['row', 'column']).default('column'),
  children: z.array(PageNodeSchema).default([]),
}));

function hasSupportedGroupDepth(node: PageNode, depth = 0): boolean {
  if (!('kind' in node) || node.kind !== 'group') return true;
  const nextDepth = depth + 1;
  return nextDepth <= 4 && node.children.every(child => hasSupportedGroupDepth(child, nextDepth));
}

export const PageDocumentSchema = z.object({
  version: z.number().default(1),
  theme: ThemeConfigSchema.default({ style: 'premium-minimal', primaryColor: '#000000', radius: 'medium', density: 'comfortable' }),
  settings: PageSettingsSchema.default({ showFooterBranding: true, enableSmoothScrolling: false }),
  sections: z.array(z.any())
    .transform(items => {
      const nodes: PageNode[] = [];
      for (const item of items) {
        const parsed = PageNodeSchema.safeParse(item);
        if (parsed.success && hasSupportedGroupDepth(parsed.data)) nodes.push(parsed.data);
      }
      return nodes;
    })
    .default([]),
});

export type PageDocument = z.infer<typeof PageDocumentSchema>;
