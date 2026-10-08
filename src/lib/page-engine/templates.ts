import { GroupNode, PageDocument, PageNode } from './schemas';

function consultingGroup(id: string, name: string, direction: GroupNode['direction'], children: PageNode[], options: Partial<GroupNode> = {}): GroupNode {
  return {
    kind: 'group', id, name, direction,
    horizontalAlign: 'left', verticalAlign: 'center',
    width: 'full', customWidth: 100, gap: 'medium', customGap: 16,
    padding: 'custom', customPadding: 0, mobileDirection: 'column',
    children, ...options,
  };
}

// ═══════════════════════════════════════════════════════════════════
// 1. CREATOR PROFILE
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_CREATOR_PROFILE: PageDocument = {
  version: 1,
  theme: {
    style: 'premium-minimal',
    primaryColor: '#171717',
    radius: 'medium',
    density: 'comfortable',
  },
  settings: { showFooterBranding: true, enableSmoothScrolling: true },
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'minimal',
      layout: 'center',
      zoomReveal: true,
      zoomWord: 'Alex',
      isHidden: false,
      content: {
        title: 'Alex Carter',
        eyebrow: 'CREATOR · 180K FOLLOWERS',
        headline: 'I make the internet a little more useful.',
        subtitle: 'Tech, creativity, and the systems behind building online.',
        buttonText: 'Work with me',
        buttonUrl: '#lead-form',
        secondaryButtonText: 'Watch latest',
        secondaryButtonUrl: '#video',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80',
        location: 'London',
      },
    },
    {
      id: 'social-1',
      type: 'social-links',
      variant: 'react-bits',
      layout: 'row',
      isHidden: false,
      content: {
        links: [
          { id: 'sl-1', platform: 'Instagram', url: 'https://instagram.com' },
          { id: 'sl-2', platform: 'TikTok', url: 'https://tiktok.com' },
          { id: 'sl-3', platform: 'YouTube', url: 'https://youtube.com' },
          { id: 'sl-4', platform: 'Twitter', url: 'https://x.com' },
        ],
      },
    },
    {
      id: 'marquee-1',
      type: 'marquee',
      layout: 'left',
      isHidden: false,
      content: { text: 'TECH · CREATIVE · BUILDING ONLINE · TECH · CREATIVE · BUILDING ONLINE' },
    },
    {
      id: 'richtext-1',
      type: 'rich-text',
      variant: 'split',
      isHidden: false,
      content: {
        text: '<h2>A little about me</h2><p>I started making videos from my bedroom three years ago. Today, I create content about technology, productivity systems, and the creative process behind building an audience online. My goal is to make complicated ideas feel simple — and help others build something meaningful on the internet.</p>',
      },
    },
    {
      id: 'video-1',
      type: 'video',
      isHidden: false,
      content: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'My latest video',
      },
    },
    {
      id: 'gallery-1',
      type: 'gallery',
      variant: 'masonry',
      layout: 'masonry',
      isHidden: false,
      content: {
        images: [
          { id: 'g-1', url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', caption: 'Setup tour' },
          { id: 'g-2', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', caption: 'Editing workflow' },
          { id: 'g-3', url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80', caption: 'Code' },
          { id: 'g-4', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', caption: 'MacBook' },
        ],
      },
    },
    {
      id: 'form-1',
      type: 'lead-form',
      variant: 'card-centered',
      isHidden: false,
      content: {
        title: 'Work with me',
        description: 'Interested in sponsoring a video or partnering on a project? Leave your details below.',
        buttonText: 'Send Inquiry',
        successMessage: 'Thanks! I will get back to you soon.',
      },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// 2. CREATOR PORTFOLIO
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_CREATOR_PORTFOLIO: PageDocument = {
  version: 1,
  theme: {
    style: 'bold',
    primaryColor: '#4F46E5',
    radius: 'large',
    density: 'comfortable',
  },
  settings: { showFooterBranding: true, enableSmoothScrolling: true },
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'split',
      layout: 'split',
      zoomReveal: true,
      zoomWord: 'Design',
      isHidden: false,
      content: {
        title: 'Jordan Lee',
        eyebrow: 'PRODUCT DESIGNER',
        headline: 'I design digital products that people actually want to use.',
        subtitle: 'Currently designing the future of work at Stripe. Previously at Figma and Airbnb.',
        buttonText: 'View my work',
        buttonUrl: '#services',
        secondaryButtonText: 'Download Resume',
        secondaryButtonUrl: '#resume',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1000&q=80',
      },
    },
    {
      id: 'image-1',
      type: 'image',
      variant: 'scroll-reveal',
      layout: 'full',
      isHidden: false,
      content: {
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1600&q=80',
        alt: 'Portfolio showcase',
      },
    },
    {
      id: 'services-1',
      type: 'services',
      variant: 'asymmetric-bento',
      isHidden: false,
      content: {
        title: 'My Expertise',
        items: [
          { id: 's-1', title: 'Product Design', description: 'End-to-end design from research to high-fidelity prototyping.' },
          { id: 's-2', title: 'Design Systems', description: 'Building scalable components and guidelines.' },
          { id: 's-3', title: 'User Research', description: 'Usability testing, interviews, and data-driven insights.' },
        ],
      },
    },
    {
      id: 'carousel-1',
      type: 'carousel',
      variant: 'bounce',
      isHidden: false,
      content: {
        images: [
          { id: 'c-1', url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1000&q=80', caption: 'Fintech App' },
          { id: 'c-2', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&q=80', caption: 'Data Dashboard' },
          { id: 'c-3', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1000&q=80', caption: 'Mobile UI' },
        ],
      },
    },
    {
      id: 'resume-1',
      type: 'resume',
      isHidden: false,
      content: {
        title: 'Experience',
        items: [
          { id: 'r-1', role: 'Senior Product Designer', company: 'Stripe', period: '2022 - Present', description: 'Leading design for core payment flows.' },
          { id: 'r-2', role: 'Product Designer', company: 'Figma', period: '2019 - 2022', description: 'Designed collaboration features.' },
          { id: 'r-3', role: 'UI/UX Designer', company: 'Airbnb', period: '2017 - 2019', description: 'Guest experience team.' },
        ],
      },
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      variant: 'magic-card',
      isHidden: false,
      content: {
        title: 'What people say',
        items: [
          { id: 't-1', quote: "Jordan is one of the most thoughtful designers I've ever worked with.", author: 'Sarah Chen', role: 'VP Product' },
          { id: 't-2', quote: "An absolute powerhouse when it comes to system design and prototyping.", author: 'Mike Ross', role: 'Engineering Lead' },
        ],
      },
    },
    {
      id: 'form-1',
      type: 'lead-form',
      variant: 'split-layout',
      isHidden: false,
      content: {
        title: 'Let\'s collaborate',
        description: 'Currently accepting freelance projects for Q3. Reach out to discuss your next big idea.',
        buttonText: 'Send Message',
        successMessage: 'Thanks! I will reply within 24 hours.',
      },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// 3. CREATOR NEWSLETTER
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_CREATOR_NEWSLETTER: PageDocument = {
  version: 1,
  theme: {
    style: 'playful',
    primaryColor: '#EC4899',
    radius: 'full',
    density: 'compact',
  },
  settings: { showFooterBranding: true, enableSmoothScrolling: false },
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'editorial-center',
      layout: 'center',
      isHidden: false,
      content: {
        title: 'The Sunday Signal',
        eyebrow: 'NEWSLETTER',
        headline: 'Signals amidst the noise.',
        subtitle: 'Join 50,000+ readers getting one weekly email on strategy, culture, and the internet.',
        buttonText: 'Read latest issue',
        buttonUrl: '#latest',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      },
    },
    {
      id: 'stats-1',
      type: 'stats',
      variant: 'count-up',
      isHidden: false,
      content: {
        items: [
          { id: 'st-1', value: '50000', label: 'Subscribers', suffix: '+' },
          { id: 'st-2', value: '45', label: 'Open Rate', suffix: '%' },
          { id: 'st-3', value: '156', label: 'Issues Published' },
        ],
      },
    },
    {
      id: 'email-1',
      type: 'collect-emails',
      variant: 'card-centered',
      isHidden: false,
      content: {
        title: 'Get the next issue',
        placeholder: 'Enter your best email',
        buttonText: 'Subscribe for free',
        successMessage: 'You are in! Check your inbox to confirm.',
      },
    },
    {
      id: 'richtext-1',
      type: 'rich-text',
      variant: 'shiny',
      isHidden: false,
      content: {
        text: '<h2>Why subscribe?</h2><p>Every Sunday, I break down one big idea from the world of business and culture. No fluff, no jargon. Just clear thinking and actionable insights that you can read in under 5 minutes.</p>',
      },
    },
    {
      id: 'audio-1',
      type: 'audio',
      isHidden: false,
      content: {
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        title: 'Listen to the podcast version',
        artist: 'The Sunday Signal',
      },
    },
    {
      id: 'social-1',
      type: 'social-links',
      variant: 'circular',
      layout: 'row',
      isHidden: false,
      content: {
        links: [
          { id: 'sl-1', platform: 'Twitter', url: 'https://x.com' },
          { id: 'sl-2', platform: 'LinkedIn', url: 'https://linkedin.com' },
        ],
      },
    },
  ],
};



// ═══════════════════════════════════════════════════════════════════
// 5. PRODUCT BRAND
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_PRODUCT_BRAND: PageDocument = {
  version: 1,
  theme: {
    style: 'bold',
    primaryColor: '#F59E0B',
    radius: 'small',
    density: 'comfortable',
  },
  settings: { showFooterBranding: true, enableSmoothScrolling: true },
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'immersive',
      layout: 'center',
      textContrast: 'light',
      zoomReveal: true,
      zoomWord: 'Brew',
      isHidden: false,
      content: {
        title: 'Lumina Coffee',
        headline: 'Exceptional coffee, roasted to order.',
        subtitle: 'Single-origin beans ethically sourced from around the world. Roasted in Brooklyn.',
        buttonText: 'Shop Now',
        buttonUrl: '#shop',
        imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1600&q=80',
      },
    },
    {
      id: 'marquee-1',
      type: 'marquee',
      layout: 'left',
      isHidden: false,
      content: {
        text: 'FREE SHIPPING ON ORDERS OVER $50 • ETHICALLY SOURCED • ROASTED DAILY',
      },
    },
    {
      id: 'products-1',
      type: 'products',
      variant: 'blur-fade',
      isHidden: false,
      content: {
        title: 'Featured Roasts',
        items: [
          { id: 'p-1', title: 'Ethiopia Yirgacheffe', description: 'Floral, citrus, light roast.', price: '$22', imageUrl: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80', url: '#' },
          { id: 'p-2', title: 'Colombia Supremo', description: 'Chocolate, caramel, medium roast.', price: '$20', imageUrl: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80', url: '#' },
          { id: 'p-3', title: 'Sumatra Mandheling', description: 'Earthy, bold, dark roast.', price: '$24', imageUrl: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80', url: '#' },
        ],
      },
    },
    {
      id: 'carousel-1',
      type: 'carousel',
      variant: 'chroma',
      isHidden: false,
      content: {
        images: [
          { id: 'c-1', url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1000&q=80' },
          { id: 'c-2', url: 'https://images.unsplash.com/photo-1495474472201-4467008f526b?w=1000&q=80' },
          { id: 'c-3', url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1000&q=80' },
        ],
      },
    },
    {
      id: 'email-1',
      type: 'collect-emails',
      variant: 'split-layout',
      isHidden: false,
      content: {
        title: 'Join the Coffee Club',
        placeholder: 'Email address',
        buttonText: 'Get 10% Off',
        successMessage: 'Check your email for your discount code!',
      },
    },
  ],
};



// ═══════════════════════════════════════════════════════════════════
// 7. DEVELOPER PORTFOLIO
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_DEVELOPER_PORTFOLIO: PageDocument = {
  version: 1,
  theme: {
    style: 'bold',
    primaryColor: '#171717',
    radius: 'small',
    density: 'spacious',
  },
  settings: { showFooterBranding: true, enableSmoothScrolling: true },
  sections: [
    { id: 'site-header', type: 'site-navbar', variant: 'minimal', isHidden: false, backgroundColor: '#171717', textColor: '#f4f4f5', content: { logoText: 'solo', links: [{ id: 'n1', label: 'About', url: '#about' }, { id: 'n2', label: 'Blog', url: '#blogs' }, { id: 'n3', label: 'Projects', url: '#gallery-1' }, { id: 'n4', label: 'Resume', url: '#resume-1' }] } },
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'split',
      layout: 'split',
      zoomReveal: true,
      zoomWord: 'Build',
      isHidden: false,
      content: {
        title: 'Ren Nakamura',
        eyebrow: 'FULL-STACK DEVELOPER & DESIGNER',
        headline: 'I build useful things for the web.',
        subtitle: 'Full-stack developer based in Tokyo. Specializing in React, TypeScript, and design systems. Currently freelancing and open to new projects.',
        buttonText: 'See my work',
        buttonUrl: '#services',
        secondaryButtonText: 'Get in touch',
        secondaryButtonUrl: '#contact',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&q=80',
        badge: 'Available for work',
        socialLinks: [
          { id: 'sl-1', platform: 'GitHub', url: 'https://github.com' },
          { id: 'sl-2', platform: 'Twitter', url: 'https://x.com' },
          { id: 'sl-3', platform: 'LinkedIn', url: 'https://linkedin.com' },
        ],
      },
    },
    {
      id: 'services-1',
      type: 'services',
      variant: 'asymmetric-bento',
      isHidden: false,
      content: {
        title: 'What I can offer',
        items: [
          { id: 's-1', title: 'Frontend Development', description: 'Pixel-perfect interfaces with React, Next.js, and TypeScript. Obsessed with performance and accessibility.', icon: '💻' },
          { id: 's-2', title: 'Backend & APIs', description: 'Scalable server architecture with Node.js, PostgreSQL, and cloud infrastructure.', icon: '⚡' },
          { id: 's-3', title: 'Design Systems', description: 'Component libraries and design tokens that keep teams moving fast without sacrificing consistency.', icon: '🎨' },
          { id: 's-4', title: 'Technical Consulting', description: 'Architecture reviews, code audits, and hands-on guidance for engineering teams.', icon: '🧠' },
        ],
      },
    },
    {
      id: 'stats-1',
      type: 'stats',
      variant: 'count-up',
      isHidden: false,
      content: {
        items: [
          { id: 'st-1', value: '8', label: 'Years Experience', suffix: '+' },
          { id: 'st-2', value: '40', label: 'Projects Shipped', suffix: '+' },
          { id: 'st-3', value: '15', label: 'Happy Clients' },
          { id: 'st-4', value: '99', label: 'Uptime SLA', suffix: '%' },
        ],
      },
    },
    {
      id: 'gallery-1',
      type: 'gallery',
      variant: 'masonry',
      layout: 'masonry',
      isHidden: false,
      content: {
        images: [
          { id: 'g-1', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', caption: 'Analytics Dashboard' },
          { id: 'g-2', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80', caption: 'Mobile Banking App' },
          { id: 'g-3', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', caption: 'E-commerce Platform' },
          { id: 'g-4', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80', caption: 'Code Architecture' },
        ],
      },
    },
    {
      id: 'richtext-1',
      type: 'rich-text',
      variant: 'split',
      isHidden: false,
      content: {
        text: '<h2>About me</h2><p>I started coding at 16, building ugly websites that somehow worked. Today, I architect production systems that serve millions of users. My approach is simple: understand the problem deeply, build the simplest solution that works, then iterate. I believe the best software is invisible — users should never think about the technology, only the experience.</p>',
      },
    },
    {
      id: 'resume-1',
      type: 'resume',
      variant: 'stepper',
      isHidden: false,
      content: {
        title: 'Experience',
        items: [
          { id: 'r-1', role: 'Senior Frontend Engineer', company: 'Vercel', period: '2022 – Present', description: 'Building next-generation deployment tooling and developer experience.' },
          { id: 'r-2', role: 'Full-Stack Developer', company: 'Stripe', period: '2019 – 2022', description: 'Core payments team — built internal tools used by 500+ engineers.' },
          { id: 'r-3', role: 'Frontend Developer', company: 'Shopify', period: '2017 – 2019', description: 'Merchant admin redesign, improving onboarding conversion by 23%.' },
        ],
      },
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      variant: 'marquee',
      isHidden: false,
      content: {
        title: 'What clients say',
        items: [
          { id: 't-1', quote: 'Ren delivered a production-ready app in 3 weeks that our internal team estimated would take 3 months.', author: 'David Park', role: 'CTO, Luminary AI' },
          { id: 't-2', quote: 'The cleanest codebase I have ever inherited. Documentation was impeccable.', author: 'Maria Santos', role: 'Lead Engineer, Fintech Co' },
          { id: 't-3', quote: 'A rare combination of deep technical skill and genuine design sensibility.', author: 'James Liu', role: 'Founder, DevStudio' },
        ],
      },
    },
    {
      id: 'form-1',
      type: 'lead-form',
      variant: 'split-layout',
      isHidden: false,
      content: {
        title: 'Let\'s work together',
        description: 'Have a project in mind? Drop me a line and I will get back to you within 24 hours.',
        buttonText: 'Send Message',
        successMessage: 'Thanks! I will reply soon.',
      },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// 8. BEAUTY BRAND
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_BEAUTY_BRAND: PageDocument = {
  version: 1,
  theme: {
    style: 'premium-minimal',
    primaryColor: '#5C6E4E',
    radius: 'medium',
    density: 'spacious',
  },
  settings: { showFooterBranding: true, enableSmoothScrolling: true },
  sections: [
    { id: 'site-header', type: 'site-navbar', variant: 'corporate', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { logoText: 'Glowdia', links: [{ id: 'n1', label: 'Home', url: '#top' }, { id: 'n2', label: 'Shop', url: '#products-1' }, { id: 'n3', label: 'Trending', url: '#products-1' }, { id: 'n4', label: 'About', url: '#richtext-1' }, { id: 'n5', label: 'Contact', url: '#email-1' }] } },
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'split',
      layout: 'split',
      isHidden: false,
      content: {
        title: 'Glowdia',
        eyebrow: 'FROM EARTH, WITH CARE',
        headline: 'Pure ingredients for radiant skin, everyday.',
        subtitle: 'Discover dermatologist-approved skincare products made with gentle, effective ingredients. Whether you\'re fighting acne, dryness, or dullness — we\'ve got what your skin needs.',
        buttonText: 'Shop Now',
        buttonUrl: '#products',
        secondaryButtonText: 'Our Story',
        secondaryButtonUrl: '#about',
        imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1000&q=80',
      },
    },
    {
      id: 'marquee-1',
      type: 'marquee',
      layout: 'left',
      isHidden: false,
      content: { text: 'CLEAN BEAUTY · CRUELTY FREE · DERMATOLOGIST TESTED · SUSTAINABLE PACKAGING' },
    },
    {
      id: 'products-1',
      type: 'products',
      variant: 'blur-fade',
      isHidden: false,
      content: {
        title: 'Daily Essentials Your Skin Will Love',
        items: [
          { id: 'p-1', title: 'Hydrating Cleanser', description: 'Gentle foam cleanser with hyaluronic acid.', price: '$28', imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&q=80', url: '#' },
          { id: 'p-2', title: 'Vitamin C Serum', description: 'Brightening serum with 15% L-ascorbic acid.', price: '$45', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80', url: '#' },
          { id: 'p-3', title: 'Barrier Repair Cream', description: 'Rich moisturizer with ceramides and peptides.', price: '$38', imageUrl: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=500&q=80', url: '#' },
        ],
      },
    },
    {
      id: 'richtext-1',
      type: 'rich-text',
      variant: 'split',
      isHidden: false,
      content: {
        text: '<h2>Why trust us?</h2><p>At Glowdia, we believe skincare should be simple, effective, and kind — to your skin and the planet. Founded with a passion for clean beauty, we offer a curated selection of dermatologist-tested, cruelty-free products made from safe, skin-loving ingredients. Every formula is backed by science, never by hype.</p>',
      },
    },
    {
      id: 'stats-1',
      type: 'stats',
      variant: 'count-up',
      isHidden: false,
      content: {
        title: 'Proven Results',
        items: [
          { id: 'st-1', value: '10000', label: 'Happy Customers', suffix: '+' },
          { id: 'st-2', value: '98', label: 'Would Recommend', suffix: '%' },
          { id: 'st-3', value: '50', label: 'Less Irritation', suffix: '%' },
        ],
      },
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      variant: 'marquee',
      isHidden: false,
      content: {
        title: 'What our customers say',
        items: [
          { id: 't-1', quote: 'My skin has never looked better. The Vitamin C serum is pure magic.', author: 'Emma R.', role: 'Verified Buyer' },
          { id: 't-2', quote: 'Finally a brand that actually delivers on its promises. No irritation, just glow.', author: 'Priya K.', role: 'Verified Buyer' },
          { id: 't-3', quote: 'I replaced my entire routine with Glowdia. Simpler, better, cheaper.', author: 'Sophie L.', role: 'Verified Buyer' },
        ],
      },
    },
    {
      id: 'faq-1',
      type: 'faq',
      isHidden: false,
      content: {
        title: 'Frequently Asked Questions',
        items: [
          { id: 'f-1', question: 'What is Glowdia?', answer: 'Glowdia is a clean skincare brand focused on simple, effective formulas for all skin types — including dry, oily, sensitive, and combination skin.' },
          { id: 'f-2', question: 'Are your products cruelty-free?', answer: 'Yes. We are certified cruelty-free and never test on animals. All our ingredients are ethically sourced.' },
          { id: 'f-3', question: 'How do I track my order?', answer: 'Once your order ships, you will receive an email with a tracking link. You can also check your order status in your account dashboard.' },
          { id: 'f-4', question: 'What makes Glowdia unique?', answer: 'Every product is formulated with dermatologists, uses clinical-grade ingredients at effective concentrations, and skips the fillers and fragrances.' },
        ],
      },
    },
    {
      id: 'email-1',
      type: 'collect-emails',
      variant: 'split-layout',
      isHidden: false,
      content: {
        title: 'Get 15% off your first order',
        placeholder: 'Enter your email',
        buttonText: 'Subscribe',
        successMessage: 'Check your email for your discount code!',
      },
    },
  ],
};



// ═══════════════════════════════════════════════════════════════════
// 10. RESTAURANT
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_RESTAURANT: PageDocument = {
  version: 1,
  theme: { style: 'premium-minimal', primaryColor: '#c6a66b', radius: 'none', density: 'spacious' },
  settings: { showFooterBranding: false, enableSmoothScrolling: true },
  sections: [
    { id: 'site-header', type: 'site-navbar', variant: 'restaurant-overlay', isHidden: false, textColor: '#ffffff', content: { logoText: 'Osteria\nSan Rocco', primaryLabel: 'Prenotazioni', primaryUrl: '#booking', links: [{ id: 'n1', label: 'La cucina', url: '#story' }, { id: 'n2', label: 'Menu', url: '#menu' }, { id: 'n3', label: 'Prenota un tavolo', url: '#booking' }, { id: 'n4', label: 'La nostra storia', url: '#history' }] } },
    { id: 'hero-1', type: 'hero', variant: 'restaurant-cover', layout: 'center', textContrast: 'light', isHidden: false, content: { title: 'Osteria San Rocco', headline: '', buttonText: 'Scopri le specialità', buttonUrl: '#story', imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1800&q=90' } },
    { id: 'story', type: 'feature-split', variant: 'restaurant-story', layout: 'image-left', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { eyebrow: 'Ingredienti scelti con cura', title: 'Una cucina di tradizione e passione', description: 'Con amore e maestria, selezioniamo i migliori tagli di carne e verdure fresche, che vengono delicatamente grigliati per offrire un’esperienza di gusto in ogni boccone. Dalla succulenta bistecca alla fiorentina alle verdure alla griglia, ogni piatto è preparato con cura e passione per garantire un’esperienza gastronomica indimenticabile.', imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1100&q=85', secondaryImageUrl: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=85', imageAlt: 'Bistecca appena grigliata', checkpoints: [] } },
    { id: 'menu', type: 'products', variant: 'restaurant-menu', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { title: 'Menu', menuImageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85', items: [{ id: 'm1', category: 'Antipasti', title: 'Salumi misti e insalata russa', description: 'Selezione della casa con verdure fresche.', price: '€14' }, { id: 'm2', category: 'Primi piatti', title: 'Tartare di limousin al coltello', description: 'Cipolla rossa caramellata e maionese.', price: '€15' }, { id: 'm3', category: 'Primi piatti', title: 'Tortino di melanzane', description: 'Con pomodoro e salsa cremosa.', price: '€13' }, { id: 'm4', category: 'Secondi piatti', title: 'Uovo poché con crema di patate', description: 'Al sentore di acciuga.', price: '€12' }, { id: 'm5', category: 'Contorni', title: 'Acciughe del Mar Cantabrico', description: 'Con burro della Normandia e crostini.', price: '€15' }] } },
    { id: 'pasta-story', type: 'feature-split', variant: 'restaurant-story', layout: 'image-right', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { eyebrow: 'Fatto a mano ogni giorno', title: 'La semplicità degli ingredienti', description: 'Usiamo soltanto i migliori ingredienti e tecniche tradizionali per creare piatti unici e irresistibili, capaci di soddisfare i palati più esigenti. La nostra pasta fresca fatta a mano è un’esperienza di gusto autentica.', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1100&q=85', secondaryImageUrl: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=800&q=85', imageAlt: 'Pasta fresca preparata a mano', checkpoints: [] } },
    { id: 'booking', type: 'booking', variant: 'restaurant-reservation', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { title: 'Prenota un tavolo', description: 'Scegli il numero di ospiti, la data e l’orario.', provider: 'custom', link: 'mailto:info@osteriasanrocco.com', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1100&q=85' } },
    { id: 'history', type: 'timeline', layout: 'restaurant-history', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { title: 'La nostra storia', items: [{ id: 't1', label: '1999', description: 'L’Osteria San Rocco nasce nel cuore della città: una cucina di famiglia, fatta di gesti semplici e ingredienti sinceri.', imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=85' }, { id: 't2', label: '2002', description: 'La cantina si amplia e accoglie etichette italiane selezionate, diventando un punto di incontro per gli amanti del buon vino.', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=85' }, { id: 't3', label: '2010', description: 'Una nuova generazione rinnova la tradizione, portando in tavola ricette autentiche con uno sguardo contemporaneo.', imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=85' }] } },
    { id: 'featured-dish', type: 'carousel', variant: 'restaurant-featured', isHidden: false, content: { images: [{ id: 'd1', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1500&q=85', caption: 'La pasta fresca' }, { id: 'd2', url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=85', caption: 'Il risotto' }, { id: 'd3', url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=85', caption: 'La bistecca' }] } },
    { id: 'footer', type: 'site-footer', variant: 'restaurant', isHidden: false, backgroundColor: '#c8ad78', textColor: '#ffffff', content: { logoText: 'Osteria\nSan Rocco', description: 'Via Roma 2, 20154 Milano\n02 765 9090\ninfo@osteriasanrocco.it\n\nLunedì e Martedì: chiuso\nMercoledì – Domenica: 12:30–14:30 · 19:00–23:30', links: [{ id: 'f1', group: 'Menu', label: 'La cucina', url: '#menu' }, { id: 'f2', group: 'Menu', label: 'Carta dei vini', url: '#menu' }, { id: 'f3', group: 'Menu', label: 'Prenotazioni', url: '#booking' }, { id: 'f4', group: 'Menu', label: 'La nostra storia', url: '#history' }, { id: 'f5', group: 'Contatti', label: 'Via Roma 2, Milano', url: '#contact' }, { id: 'f6', group: 'Contatti', label: 'info@osteriasanrocco.it', url: 'mailto:info@osteriasanrocco.it' }], socialLinks: [{ id: 's1', label: 'Instagram', url: '#' }, { id: 's2', label: 'Facebook', url: '#' }], legalLinks: [{ id: 'legal1', label: '© 2025 Osteria San Rocco · P.IVA 112233445566', url: '#' }, { id: 'legal2', label: 'Privacy policy', url: '#' }, { id: 'legal3', label: 'Cookie policy', url: '#' }] } },
  ],
};



// ═══════════════════════════════════════════════════════════════════
// 12. CORPORATE CONSULTING
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_CORPORATE_CONSULTING: PageDocument = {
  version: 1,
  theme: { style: 'premium-minimal', primaryColor: '#093326', radius: 'none', density: 'spacious' },
  settings: { showFooterBranding: false, enableSmoothScrolling: true },
  sections: [
    {
      id: 'site-header', type: 'site-navbar', variant: 'corporate', isHidden: false,
      backgroundColor: '#ffffff', textColor: '#151515', buttonColor: '#101010',
      content: {
        logoText: 'LOGO',
        links: [
          { id: 'nav-about', label: 'About us', url: '#hero' }, { id: 'nav-services', label: 'Services', url: '#service-tabs' }, { id: 'nav-pricing', label: 'Pricing', url: '#value-cards' }, { id: 'nav-news', label: 'News', url: '#success-stories' }, { id: 'nav-contact', label: 'Contact', url: '#contact' },
        ],
        secondaryLabel: 'Free consultation', secondaryUrl: '#contact', primaryLabel: 'Get started', primaryUrl: '#contact',
      },
    },
    {
      id: 'hero', isHidden: false, type: 'hero', variant: 'split-wide', layout: 'split',
      backgroundColor: '#f5f2f0', textColor: '#171717',
      content: {
        eyebrow: 'Financial services', title: 'Build a sustainable future for your company', headline: '',
        subtitle: 'Unlock success with tailored financial consulting solutions for your business growth.',
        buttonText: 'Free consultation', buttonUrl: '#contact', secondaryButtonText: 'Watch video', secondaryButtonUrl: '#service-tabs',
        imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=85&w=1400',
      },
    },
    {
      id: 'stats', isHidden: false, type: 'stats', variant: 'editorial-band', backgroundColor: '#062f26', textColor: '#ffffff',
      content: {
        title: 'Your business goals are our top priority',
        description: 'We embody unwavering expertise, powered through years of industry mastery. Our teams embrace knowledge and fresh ideas across diverse sectors, fostering trust and delivering excellence.',
        items: [
          { id: '1', value: '14', suffix: '+', label: 'Years of industry experience' },
          { id: '2', value: '244', label: 'Digital projects completed' },
          { id: '3', value: '293', label: 'Data transferred monthly' },
          { id: '4', value: '440', suffix: '+', label: 'Certified financial advisors' },
        ],
      },
    },
    {
      id: 'service-tabs', type: 'link-list', variant: 'tabs', isHidden: false, content: {
        links: [
          { id: 'tab-planning', label: 'Financial planning', badge: 'New', isActive: false, url: '#financial-planning' },
          { id: 'tab-analysis', label: 'Performance analysis', badge: 'New', isActive: false, url: '#performance-analysis' },
          { id: 'tab-advisory', label: 'Investment advisory', badge: 'New', isActive: true, url: '#investment-advisory' },
        ]
      }
    },
    {
      id: 'financial-planning', isHidden: false, type: 'feature-split', variant: 'editorial', layout: 'image-right',
      content: {
        eyebrow: 'Financial planning', title: 'Strategic planning for optimal growth',
        description: 'Crafting precise financial roadmaps aligned with your business objectives.',
        checkpoints: [{ id: '1', text: 'Optimize resource allocation' }, { id: '2', text: 'Adapt to market changes' }, { id: '3', text: 'Achieve long-term goals' }],
        buttonText: 'Learn more', buttonUrl: '#financial-planning',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=85&w=1000',
      },
    },
    {
      id: 'performance-analysis', isHidden: false, type: 'feature-split', variant: 'editorial', layout: 'image-left',
      content: {
        eyebrow: 'Performance analysis', title: 'In-depth financial performance analysis',
        description: 'Analyze and enhance financial performance for sustained growth.',
        checkpoints: [{ id: '1', text: 'Identify strengths and weaknesses' }, { id: '2', text: 'Optimize operational efficiency' }, { id: '3', text: 'Increase revenue streams' }],
        buttonText: 'Learn more', buttonUrl: '#performance-analysis',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=85&w=1000',
      },
    },
    {
      id: 'investment-advisory', isHidden: false, type: 'feature-split', variant: 'editorial', layout: 'image-right',
      content: {
        eyebrow: 'Investment advisory', title: 'Expert advisory tailored for maximum returns',
        description: 'Tailored investment strategies for optimal returns and risk management.',
        checkpoints: [{ id: '1', text: 'Capitalize on market opportunities' }, { id: '2', text: 'Minimize investment risks' }, { id: '3', text: 'Realize growth potential' }],
        buttonText: 'Learn more', buttonUrl: '#investment-advisory',
        imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=85&w=1000',
      },
    },
    {
      id: 'success-stories', isHidden: false, type: 'case-studies', backgroundColor: '#062f26', textColor: '#ffffff',
      content: {
        title: 'Our customer success stories',
        description: 'Discover how businesses like yours transformed with our expertise. Real stories of growth, innovation, and success.', actionText: 'View case studies', actionUrl: '#contact',
        items: [
          { id: '1', title: 'Identifying growth opportunities for Prosper: financial strategies', description: 'Discover how our consulting empowered Prosper to identify growth opportunities, optimize financial operations and achieve a 120% revenue surge within a year.', imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=85&w=900', url: '#', buttonText: 'Read more' },
          { id: '2', title: 'Helping SummitEdge navigate challenges: regulatory compliance', description: 'Explore our partnership with SummitEdge, navigating complex regulations and enabling efficient operations, cost savings, and sustained growth.', imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=85&w=900', url: '#', buttonText: 'Read more' },
          { id: '3', title: 'Improving EvolveVision efficiency: streamlining processes', description: 'Witness how our consulting streamlined processes for EvolveVision, improving operational efficiency and driving sustainable growth.', imageUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=85&w=900', url: '#', buttonText: 'Read more' },
        ],
      },
    },
    {
      id: 'value-cards', isHidden: false, type: 'value-cards', backgroundColor: '#f5f2f0', textColor: '#171717',
      content: {
        title: 'Tangible results shared here',
        description: 'Discover how our financial expertise transformed businesses like yours, delivering exceptional results and growth.',
        cards: [
          { id: '1', author: 'Frederic Hill', role: 'Founder & CEO', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80', quote: 'Helped navigate regulatory challenges. Valued advisors for strategic financial decisions.', metric: '+ 120 %', label: 'Increase in customer growth rate' },
          { id: '2', author: 'Fatima Sampson', role: 'Account Executive', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80', quote: 'Stellar support in navigating market complexities. Trusted partners for financial growth.', metric: '$ 250 k', label: 'Saved in operational costs' },
          { id: '3', author: 'Brendan Buck', role: 'Business Manager', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80', quote: 'Innovative solutions tailored to our needs. A reliable partner for our financial excellence.', metric: '+ 25 %', label: 'Increase in company revenue' },
        ],
      },
    },
    {
      id: 'faq', isHidden: false, type: 'faq', variant: 'default',
      content: {
        title: 'Got a question? Get your answer', items: [
          { id: '1', question: 'How can financial consulting benefit my business?', answer: 'Our consulting optimizes strategies for sustainable growth and improved financial performance.' },
          { id: '2', question: 'What distinguishes your firm from others in the industry?', answer: 'We pair deep industry experience with tailored, practical financial guidance.' },
          { id: '3', question: 'Do you offer services tailored to specific industries?', answer: 'Yes. Our team adapts each engagement to your industry, goals, and operating context.' },
          { id: '4', question: 'How do you ensure confidentiality with client data?', answer: 'We use secure processes and clear governance to protect all client information.' },
        ]
      },
    },
    consultingGroup('contact', 'Contact and image', 'row', [
      consultingGroup('contact-card', 'Contact form', 'column', [{
        id: 'contact-form', isHidden: false, type: 'contact', variant: 'editorial-panel',
        content: { title: 'We’re here to help', description: 'Need help with a project, have a question about our work? We’re here.', buttonText: 'Submit', email: 'hello@consulting.com', phone: '+1 (555) 000-0000' },
      }], { width: 'custom', customWidth: 52, backgroundColor: '#f5f2f0', textColor: '#171717', padding: 'medium', customPadding: 24 }),
      consultingGroup('contact-photo', 'Contact photo', 'column', [{
        id: 'contact-image', type: 'image', layout: 'cover', isHidden: false,
        content: { url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=85&w=1000', alt: 'Financial consultant ready to help' },
      }], { width: 'custom', customWidth: 48, backgroundColor: '#f5f2f0', padding: 'custom', customPadding: 0 }),
    ], { backgroundColor: '#062f26', textColor: '#ffffff', gap: 'custom', customGap: 0, padding: 'custom', customPadding: 0, mobileDirection: 'column' }),
    {
      id: 'site-footer', type: 'site-footer', variant: 'columns', isHidden: false,
      backgroundColor: '#062f26', textColor: '#ffffff',
      content: {
        logoText: 'LOGO',
        description: 'Our primary goal is to empower business owners, agencies, and freelancers with maximum creative freedom.',
        links: [
          { id: 'builder-themes', group: 'Page builder', label: 'Theme options', url: '#services' },
          { id: 'builder-builder', group: 'Page builder', label: 'Theme builder', url: '#services' },
          { id: 'builder-templates', group: 'Page builder', label: 'Template library', url: '#services' },
          { id: 'support-docs', group: 'Support center', label: 'Documentation', url: '#faq' },
          { id: 'support-community', group: 'Support center', label: 'Community', url: '#contact' },
          { id: 'support-hosting', group: 'Support center', label: 'Hosting', url: '#contact' },
        ],
        socialLinks: [
          { id: 'social-facebook', label: 'f', url: 'https://facebook.com' },
          { id: 'social-twitter', label: '𝕏', url: 'https://x.com' },
          { id: 'social-linkedin', label: 'in', url: 'https://linkedin.com' },
        ],
        legalLinks: [
          { id: 'terms', label: 'Terms & Conditions', url: '#terms' },
          { id: 'privacy', label: 'Privacy Policy', url: '#privacy' },
        ],
      },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// 13. EDITORIAL DESIGNER PORTFOLIO (reference: Nandini Jaryal)
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_EDITORIAL_PORTFOLIO: PageDocument = {
  version: 1,
  theme: { style: 'premium-minimal', primaryColor: '#171717', radius: 'small', density: 'spacious' },
  settings: { showFooterBranding: false, enableSmoothScrolling: true },
  sections: [
    { id: 'site-header', type: 'site-navbar', variant: 'pill', isHidden: false, backgroundColor: '#f4f4f6', textColor: '#171717', content: { logoText: '', links: [{ id: 'nav-projects', label: 'Projects', url: '#projects' }, { id: 'nav-about', label: 'About', url: '#about' }, { id: 'nav-blogs', label: 'Blogs', url: '#blogs' }, { id: 'nav-contact', label: 'Contact', url: '#contact' }] } },
    { id: 'hero', type: 'hero', variant: 'portfolio-editorial', layout: 'split', isHidden: false, backgroundColor: '#f4f4f6', textColor: '#171717', content: { title: 'Nandini Jaryal', eyebrow: 'INDEPENDENT DESIGNER', headline: 'Web Developer and Digital Designer', subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Est aerat aperiam quibusdam.', buttonText: 'Contact me', buttonUrl: '#contact' } },
    { id: 'services', type: 'services', variant: 'portfolio-band', isHidden: false, backgroundColor: '#171717', textColor: '#ffffff', content: { title: 'Services', items: [{ id: 's1', title: 'Web Design', description: '' }, { id: 's2', title: 'Product Design', description: '' }, { id: 's3', title: 'UI/UX Design', description: '' }, { id: 's4', title: 'Graphic Design', description: '' }, { id: 's5', title: 'Art Direction', description: '' }, { id: 's6', title: 'Brand Design', description: '' }], socialLinks: [{ id: 'so1', title: 'Facebook', url: '#' }, { id: 'so2', title: 'Twitter', url: '#' }, { id: 'so3', title: 'Instagram', url: '#' }] } },
    { id: 'projects', type: 'case-studies', variant: 'editorial-rows', isHidden: false, backgroundColor: '#f4f4f6', textColor: '#171717', content: { title: 'Projects', items: [{ id: 'p1', title: 'Project 1 Web App', category: 'Selected work', date: 'MAR 2025', description: 'A considered product experience for a growing digital service.', imageUrl: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=85', url: '#', buttonText: 'View live' }, { id: 'p2', title: 'Project 2 Mobile App', category: 'Selected work', date: 'DEC 2025', description: 'A mobile-first experience with a bold, confident visual identity.', imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=85', url: '#', buttonText: 'View live' }, { id: 'p3', title: 'Project 3 Mobile App', category: 'Selected work', date: 'AUG 2025', description: 'A campaign designed to make everyday actions feel simple.', imageUrl: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=85', url: '#', buttonText: 'View live' }], actionText: 'Browse all projects', actionUrl: '#projects' } },
    { id: 'about', type: 'feature-split', variant: 'portfolio-about', layout: 'image-left', isHidden: false, backgroundColor: '#f4f4f6', textColor: '#171717', content: { eyebrow: 'ABOUT ME', title: 'About me', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Elit purus nisl turpis mi pharetra eros curabitur pellentesque. Pulvinar sed vulputate eget non, convallis elit leo fringilla pharetra. Mollis quis nibh cursus pellentesque quam facilisis nisi.', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85', imageAlt: 'Portrait of the designer', checkpoints: [], buttonText: 'More about me', buttonUrl: '#contact' } },
    { id: 'blogs', type: 'blog-list', isHidden: false, backgroundColor: '#f4f4f6', textColor: '#171717', content: { title: 'Blogs', actionText: 'Browse blogs', actionUrl: '#blogs', items: [{ id: 'b1', category: 'Web Design', date: 'November 19, 2025', title: 'Click here to — Read Blog number one', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sit lacus nisi, erat sed porta. Sem bibendum eu dui convallis. Et id.' }, { id: 'b2', category: 'Web Design', date: 'November 18, 2025', title: 'Blogs vs Articles — What is the difference? How to write both?', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sit lacus nisi, erat sed porta. Sem bibendum eu dui convallis. Et id.' }, { id: 'b3', category: 'Web Design', date: 'November 19, 2025', title: 'This is the third and last example of blogs section', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sit lacus nisi, erat sed porta. Sem bibendum eu dui convallis. Et id.' }] } },
    { id: 'contact', type: 'cta', variant: 'portfolio-footer', isHidden: false, backgroundColor: '#171717', textColor: '#ffffff', content: { title: 'Get in touch to work together', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sit lacus nisi, erat sed porta. Sem bibendum eu dui convallis.', buttonText: 'Send me a message', buttonUrl: 'mailto:hello@example.com' } },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// 14. LUXURY SKINCARE (reference: Luxury Sci-Care)
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_LUXURY_SKINCARE: PageDocument = {
  version: 1,
  theme: { style: 'premium-minimal', primaryColor: '#171717', radius: 'none', density: 'spacious' },
  settings: { showFooterBranding: false, enableSmoothScrolling: true },
  sections: [
    { id: 'site-header', type: 'site-navbar', variant: 'centered', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { logoText: 'LUXURY', links: [{ id: 'n1', label: 'Home', url: '#top' }, { id: 'n2', label: 'About', url: '#about' }, { id: 'n3', label: 'Shop', url: '#products' }, { id: 'n4', label: 'Journal', url: '#journal' }, { id: 'n5', label: 'Contact', url: '#contact' }] } },
    { id: 'hero', type: 'hero', variant: 'split', layout: 'split', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { title: 'Luxury Sci-Care', eyebrow: 'CLINICALLY INSPIRED SKINCARE', headline: 'Thoughtful care, backed by science.', subtitle: 'Experience clinically inspired skincare powered by advanced collagen technology and naturally active ingredients.', buttonText: 'Explore all products', buttonUrl: '#products', imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1600&q=85' } },
    { id: 'about', type: 'rich-text', variant: 'split', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { text: '<h2>Thoughtfully crafted skincare for every skin type</h2><p>We create modern skincare essentials that combine effective active ingredients with gentle botanical extracts. Every formula is developed to support healthier-looking skin without compromising comfort.</p>' } },
    { id: 'products', type: 'products', variant: 'default', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { title: 'Daily essentials your skin will love', items: [{ id: 'p1', title: 'Hydrating Cleanser', description: 'A gentle daily cleanse.', price: '$20', imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=700&q=85' }, { id: 'p2', title: 'Daily Moisturizer', description: 'Comforting barrier support.', price: '$20', imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=85' }, { id: 'p3', title: 'Vitamin C Serum', description: 'A brightening daily serum.', price: '$24', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=700&q=85' }] } },
    { id: 'stats', type: 'stats', variant: 'editorial-band', isHidden: false, backgroundColor: '#f5f5f5', textColor: '#171717', content: { title: 'Proven results', items: [{ id: 'st1', value: '10K+', label: 'Satisfied customers' }, { id: 'st2', value: '26%', label: 'Reported softer skin' }, { id: 'st3', value: '50%', label: 'Would recommend us' }] } },
    { id: 'benefits', type: 'services', variant: 'minimal-border', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { title: 'Why choose us', items: [{ id: 's1', title: 'Gentle formula', description: 'Suitable for all skin types, including sensitive skin.' }, { id: 's2', title: 'Deep hydration', description: 'Helps maintain healthy moisture levels throughout the day.' }, { id: 's3', title: 'Skin barrier support', description: 'Strengthens and protects against environmental stress.' }, { id: 's4', title: 'Dermatologist tested', description: 'Developed with skin safety and effectiveness in mind.' }] } },
    { id: 'testimonials', type: 'testimonials', variant: 'grid', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { title: 'Real results with scientific skincare', items: [{ id: 't1', quote: 'My skin has never felt this soft. The cleanser and moisturizer have completely changed my morning routine.', author: 'Sophia Lee', role: 'Verified customer' }, { id: 't2', quote: 'The Vitamin C serum made my skin look brighter in just a few weeks.', author: 'Michael Smith', role: 'Verified customer' }] } },
    { id: 'offer', type: 'feature-split', variant: 'editorial', layout: 'image-left', isHidden: false, backgroundColor: '#f5f5f5', textColor: '#171717', content: { eyebrow: 'EXCLUSIVE OFFER', title: 'Enjoy 20% off your first order', description: 'Join our skincare community and receive a welcome discount.', imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1000&q=85', imageAlt: 'Skincare essentials', checkpoints: [], buttonText: 'Claim your discount', buttonUrl: '#subscribe' } },
    { id: 'faq', type: 'faq', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { title: 'Frequently asked questions', items: [{ id: 'f1', question: 'Are the products suitable for sensitive skin?', answer: 'Our formulas are designed to be gentle. Review the ingredient list and patch test before use.' }, { id: 'f2', question: 'How should I start a skincare routine?', answer: 'Begin with cleanser, moisturizer, and sunscreen, then introduce active ingredients gradually.' }] } },
    { id: 'footer', type: 'site-footer', variant: 'columns', isHidden: false, backgroundColor: '#f5f5f5', textColor: '#171717', content: { logoText: 'LUXURY', description: 'Beauty and wellness, backed by science.', links: [{ id: 'l1', group: 'Shop', label: 'Marine Collagen', url: '#products' }, { id: 'l2', group: 'Shop', label: 'Beauty Collection', url: '#products' }, { id: 'l3', group: 'Company', label: 'About Us', url: '#about' }, { id: 'l4', group: 'Support', label: 'FAQs', url: '#faq' }], socialLinks: [], legalLinks: [{ id: 'legal1', label: 'Privacy Policy', url: '#privacy' }, { id: 'legal2', label: 'Terms', url: '#terms' }] } },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// 15. POINT+ ARCHITECTURE (reference: ref 6.png)
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_POINT_ARCHITECTURE: PageDocument = {
  version: 1,
  theme: { style: 'premium-minimal', primaryColor: '#0b4039', radius: 'small', density: 'spacious' },
  settings: { showFooterBranding: false, enableSmoothScrolling: true },
  sections: [
    { id: 'site-header', type: 'site-navbar', variant: 'overlay', isHidden: false, textColor: '#ffffff', content: { logoText: 'POINT+', links: [{ id: 'n1', label: 'About us', url: '#about' }, { id: 'n2', label: 'Services', url: '#services' }, { id: 'n3', label: 'Projects', url: '#projects' }, { id: 'n4', label: 'Blog', url: '#news' }, { id: 'n5', label: 'Contact', url: '#contact' }] } },
    { id: 'hero', type: 'hero', variant: 'immersive', layout: 'center', textContrast: 'light', isHidden: false, backgroundColor: '#344d5d', content: { title: 'POINT+', headline: 'Spaces for better life', subtitle: 'Architecture shaped around people, place, and possibility.', buttonText: 'See more', buttonUrl: '#about', imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1800&q=85' } },
    consultingGroup('about-impact', 'About and impact', 'row', [
      consultingGroup('about-copy', 'About us', 'column', [{ id: 'about', type: 'rich-text', variant: 'architecture-about', isHidden: false, content: { text: '<h2>We are specializing in innovative and sustainable design.</h2><p>We listen closely to your needs, study the nuances of each site, and combine these insights with creative ingenuity to deliver extraordinary results.</p><p>We are dedicated to leaving a meaningful impact on communities and lives. At the heart of what we do is a passion for creating spaces that enrich experiences and stand the test of time.</p>' } }], { width: 'custom', customWidth: 35, padding: 'custom', customPadding: 0 }),
      consultingGroup('studio-metrics', 'Studio facts', 'column', [{ id: 'stats', type: 'stats', variant: 'default', isHidden: false, content: { items: [{ id: 'st1', value: '160+', label: 'Projects delivered' }, { id: 'st2', value: '10+', label: 'Years of experience' }, { id: 'st3', value: '25+', label: 'Awards won' }, { id: 'st4', value: '11', label: 'Countries reached' }] } }], { width: 'custom', customWidth: 60, padding: 'custom', customPadding: 0 }),
    ], { backgroundColor: '#ffffff', textColor: '#123b38', direction: 'row', gap: 'large', customGap: 40, padding: 'large', customPadding: 56, mobileDirection: 'column', verticalAlign: 'top' }),
    { id: 'services', type: 'services', variant: 'architecture-accordion', isHidden: false, backgroundColor: '#ffffff', textColor: '#123b38', content: { title: 'Our services', items: [{ id: 's1', title: 'Residential', description: 'Homes shaped around the rituals of everyday life, from concept planning through construction.', imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=500&q=80' }, { id: 's2', title: 'Commercial', description: 'From retail stores to office complexes, we design commercial spaces that are both inviting and productive. Our solutions align with branding and operational goals to maximize impact and usability.', imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=500&q=80' }, { id: 's3', title: 'Urban planning', description: 'Places and public realms planned for long-term community value and connection.' }, { id: 's4', title: 'Interior', description: 'Material, light, and detail combine to make each interior feel purposeful and lasting.' }] } },
    { id: 'projects', type: 'case-studies', variant: 'architecture-feature', isHidden: false, backgroundColor: '#ffffff', textColor: '#123b38', content: { title: 'Curated works we’re proud of', actionText: 'See more', actionUrl: '#projects', items: [{ id: 'p1', title: 'Metro Plaza', description: 'A commercial hub designed for productivity and style.', client: 'Metro Group', location: 'Tokyo, Japan', imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85', url: '#projects' }, { id: 'p2', title: 'Harbor House', description: 'A calm residence connected to its coastal landscape.', client: 'Private client', location: 'Kanagawa, Japan', imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85', url: '#projects' }, { id: 'p3', title: 'Civic Arts Hall', description: 'A welcoming cultural destination for the whole city.', client: 'City Arts Council', location: 'Kyoto, Japan', imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=800&q=85', url: '#projects' }] } },
    { id: 'testimonials', type: 'testimonials', variant: 'grid', isHidden: false, backgroundColor: '#ffffff', textColor: '#123b38', content: { title: 'Words from clients', items: [{ id: 't1', quote: 'The interior design for our office has completely transformed the way our team works. Point+ Agency created a space that is both functional and inspiring.', author: 'David Stone', role: 'Corporate client' }, { id: 't2', quote: 'Our commercial building project was handled with exceptional professionalism by Point+ Agency. They understood our requirements perfectly.', author: 'Hiroshi Yamamoto', role: 'Business owner' }, { id: 't3', quote: 'Point+ Agency brought our dream home to life. They listened carefully to what we wanted and created a design that exceeded expectations.', author: 'Naoko Ishida', role: 'Homeowner' }, { id: 't4', quote: 'Their interior design work elevated our retail store to a whole new level.', author: 'Rika Sato', role: 'Retail business owner' }] } },
    { id: 'news', type: 'blog-list', variant: 'image-cards', isHidden: false, backgroundColor: '#ffffff', textColor: '#123b38', content: { title: 'Latest news and insight', actionText: 'More articles', actionUrl: '#news', items: [{ id: 'b1', category: 'Urban planning', date: 'December 20', title: 'Why Urban Planning Matters', description: 'New perspectives on places designed for thriving communities.', imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=85', url: '#news' }, { id: 'b2', category: 'Architecture', date: 'December 18', title: 'The Art of Blending Elements', description: 'How materials and landscape shape a memorable building.', imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=900&q=85', url: '#news' }, { id: 'b3', category: 'Design', date: 'December 16', title: 'Key Considerations When Designing for Place', description: 'A few questions we return to on every project.', imageUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=85', url: '#news' }] } },
    { id: 'contact', type: 'lead-form', variant: 'editorial-panel', isHidden: false, backgroundColor: '#0b4039', textColor: '#ffffff', buttonColor: '#c4d8e9', buttonTextColor: '#123b38', content: { title: 'Get in touch', description: 'Have a project in mind? Tell us what you are imagining.', buttonText: 'Send message', successMessage: 'Thank you. We will be in touch soon.' } },
    { id: 'footer', type: 'site-footer', variant: 'compact', isHidden: false, backgroundColor: '#0b4039', textColor: '#ffffff', content: { logoText: 'POINT+', description: 'Spaces for better life. Architecture, interiors, and urban planning.', links: [{ id: 'f1', group: 'Explore', label: 'About us', url: '#about' }, { id: 'f2', group: 'Explore', label: 'Services', url: '#services' }, { id: 'f3', group: 'Explore', label: 'Projects', url: '#projects' }, { id: 'f4', group: 'Explore', label: 'Journal', url: '#news' }, { id: 'f5', group: 'Contact', label: 'pointplus@info.com', url: 'mailto:pointplus@info.com' }, { id: 'f6', group: 'Contact', label: '+81 877 8990', url: 'tel:+818778990' }], socialLinks: [{ id: 'social1', label: 'Instagram', url: '#' }, { id: 'social2', label: 'Behance', url: '#' }], legalLinks: [{ id: 'legal1', label: '© 2025 Point+ Agency. All Rights Reserved.', url: '#' }, { id: 'legal2', label: 'Back to top', url: '#top' }] } },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// 16. FASHION CREATOR / PERSONAL STYLE JOURNAL
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_CREATOR_FASHION: PageDocument = {
  version: 1,
  theme: { style: 'premium-minimal', primaryColor: '#171717', radius: 'none', density: 'spacious' },
  settings: { showFooterBranding: false, enableSmoothScrolling: true },
  sections: [
    { id: 'site-header', type: 'site-navbar', variant: 'minimal', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { logoText: 'LEONIE HANNE', links: [{ id: 'nav-press', label: 'Press', url: '#press' }, { id: 'nav-studio', label: 'LA Studio', url: '#studio' }, { id: 'nav-shop', label: 'Shop', url: '#favorites' }, { id: 'nav-journal', label: 'Journal', url: '#journal' }] } },
    { id: 'hero', type: 'hero', variant: 'fashion-editorial', layout: 'split', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { title: 'Leonie Hanne', eyebrow: 'LONDON · FASHION · TRAVEL', headline: 'Hi, I’m Leonie. A German-born fashion blogger.', subtitle: 'A daily edit of personal style, special places, and the little details that make a life feel beautiful.', buttonText: 'See my outfits', buttonUrl: '#outfits', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85', avatarUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85', secondaryImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=85', location: 'London' } },
    { id: 'outfits', type: 'carousel', variant: 'fashion-strip', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { images: [
      { id: 'look-1', url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85', caption: 'Style snapshots · Velvet & sparkles' },
      { id: 'look-2', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85', caption: 'London style · Coat season' },
      { id: 'look-3', url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85', caption: 'The look · Prada in London' },
      { id: 'look-4', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85', caption: 'Everyday dressing' },
    ] } },
    { id: 'about', type: 'feature-split', variant: 'editorial', layout: 'image-left', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { eyebrow: 'A NOTE FROM LEONIE', title: 'London style, wherever I go.', description: 'I share the pieces I reach for, the places I return to, and the people who make every trip memorable. Consider this your personal invitation to come along.', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85', imageAlt: 'Street style in London', checkpoints: [], buttonText: 'A little more about me', buttonUrl: '#studio' } },
    { id: 'journal', type: 'blog-list', variant: 'image-cards', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { title: 'From the journal', actionText: 'All stories', actionUrl: '#journal', items: [
      { id: 'story-1', category: 'Outfit', date: 'London', title: 'The soft layers I wear on repeat', description: 'A few favorite textures for the in-between days.', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85', url: '#outfits' },
      { id: 'story-2', category: 'Travel', date: 'Paris', title: 'A weekend made for wandering', description: 'Slow mornings, little cafés, and a very good coat.', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85', url: '#journal' },
      { id: 'story-3', category: 'Beauty', date: 'The edit', title: 'What’s in my everyday bag', description: 'The things I keep close from morning to evening.', imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85', url: '#journal' },
    ] } },
    { id: 'favorites', type: 'products', variant: 'default', isHidden: false, backgroundColor: '#f6f5f2', textColor: '#171717', content: { title: 'My favourites', items: [
      { id: 'fav-1', title: 'The everyday coat', description: 'A forever layer for city days.', price: 'Shop the look', imageUrl: 'https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&w=700&q=85', url: '#favorites', category: 'Style' },
      { id: 'fav-2', title: 'The little black bag', description: 'The piece that goes everywhere.', price: 'Shop the look', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=85', url: '#favorites', category: 'Accessories' },
      { id: 'fav-3', title: 'A golden detail', description: 'A little something to keep.', price: 'Shop the look', imageUrl: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=85', url: '#favorites', category: 'Jewellery' },
    ] } },
    { id: 'studio', type: 'feature-split', variant: 'editorial', layout: 'image-right', isHidden: false, backgroundColor: '#1c1c1c', textColor: '#ffffff', content: { eyebrow: 'BEHIND THE LENS', title: 'LA Studio, a creative home.', description: 'A small creative studio for big ideas, thoughtful collaborations, and stories worth telling. For partnerships and press, I would love to hear from you.', imageUrl: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1100&q=85', imageAlt: 'Fashion event and creative studio', checkpoints: [], buttonText: 'Get in touch', buttonUrl: '#contact' } },
    { id: 'gallery', type: 'gallery', variant: 'default', layout: 'grid', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { images: [
      { id: 'life-1', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=700&q=85', caption: 'At the table' },
      { id: 'life-2', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85', caption: 'On the way' },
      { id: 'life-3', url: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=700&q=85', caption: 'A little celebration' },
      { id: 'life-4', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=85', caption: 'Somewhere lovely' },
    ] } },
    { id: 'social', type: 'social-links', variant: 'react-bits', layout: 'row', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { links: [{ id: 'social-instagram', platform: 'Instagram', url: 'https://instagram.com' }, { id: 'social-tiktok', platform: 'TikTok', url: 'https://tiktok.com' }, { id: 'social-pinterest', platform: 'Pinterest', url: 'https://pinterest.com' }] } },
    { id: 'footer', type: 'site-footer', variant: 'compact', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { logoText: 'LEONIE HANNE', description: 'Fashion, travel, and the beautiful in-between.', links: [{ id: 'footer-about', group: 'Explore', label: 'About', url: '#about' }, { id: 'footer-journal', group: 'Explore', label: 'Journal', url: '#journal' }, { id: 'footer-favorites', group: 'Explore', label: 'My favourites', url: '#favorites' }, { id: 'footer-contact', group: 'Say hello', label: 'Contact', url: '#contact' }], socialLinks: [{ id: 'footer-instagram', label: 'Instagram', url: 'https://instagram.com' }, { id: 'footer-tiktok', label: 'TikTok', url: 'https://tiktok.com' }], legalLinks: [{ id: 'footer-copy', label: '© 2026 Leonie Hanne', url: '#top' }, { id: 'footer-privacy', label: 'Privacy', url: '#privacy' }] } },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// 17. SPEAKER, AUTHOR & THOUGHT LEADER
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_CREATOR_SPEAKER: PageDocument = {
  version: 1,
  theme: { style: 'bold', primaryColor: '#ff654f', radius: 'small', density: 'comfortable' },
  settings: { showFooterBranding: false, enableSmoothScrolling: true },
  sections: [
    { id: 'site-header', type: 'site-navbar', variant: 'corporate', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', buttonColor: '#ff654f', content: { logoText: 'JORDAN REEVES', links: [{ id: 'nav-home', label: 'Home', url: '#top' }, { id: 'nav-speaking', label: 'Speaking', url: '#events' }, { id: 'nav-writing', label: 'Writing', url: '#resources' }, { id: 'nav-about', label: 'About me', url: '#about' }], primaryLabel: 'Book an event', primaryUrl: '#booking' } },
    { id: 'hero', type: 'hero', variant: 'speaker-editorial', layout: 'split', isHidden: false, content: { title: 'Jordan Reeves', eyebrow: 'AUTHOR · SPEAKER · THINKER', headline: 'Speak. Inspire. Change.', subtitle: 'A globally recognized speaker on leadership, resilience, and the habits that help us do meaningful work.', buttonText: 'Subscribe to my newsletter', buttonUrl: '#newsletter', secondaryButtonText: 'Book a talk', secondaryButtonUrl: '#booking', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=85' } },
    { id: 'newsletter', type: 'collect-emails', variant: 'split-layout', isHidden: false, backgroundColor: '#fff7f3', textColor: '#171717', content: { title: 'A useful note for your inbox', placeholder: 'Your email address', buttonText: 'Subscribe', successMessage: 'You’re on the list. Look out for the next note.' } },
    { id: 'about', type: 'feature-split', variant: 'editorial', layout: 'image-left', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { eyebrow: 'THE WORK', title: 'Stories with practical strategies.', description: 'Jordan brings timeless ideas into the present, helping teams and individuals build courage, focus, and a stronger sense of purpose. His books and talks turn big questions into useful next steps.', imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=85', imageAlt: 'Speaker addressing an audience', checkpoints: [], buttonText: 'Explore the work', buttonUrl: '#resources' } },
    { id: 'impact', type: 'stats', variant: 'editorial-band', isHidden: false, backgroundColor: '#171717', textColor: '#ffffff', content: { title: 'Ideas that travel', description: 'A growing body of work shared with readers, teams, and curious people around the world.', items: [{ id: 'stat-books', value: '12', label: 'Books published' }, { id: 'stat-readers', value: '1M+', label: 'Readers reached' }, { id: 'stat-talks', value: '250+', label: 'Talks & events' }, { id: 'stat-years', value: '20', label: 'Years of practice' }] } },
    { id: 'events', type: 'case-studies', variant: 'speaker-events', isHidden: false, content: { title: 'Seminars & lectures', description: 'Live conversations on leadership, creative practice, and doing the work that matters.', actionText: 'All events', actionUrl: '#booking', items: [
      { id: 'event-1', title: 'The courage to begin', category: 'MAY', date: '18', client: 'Leadership Forum · New York', description: 'A practical talk about starting before you feel ready.', imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=85', url: '#booking', buttonText: 'Reserve a seat' },
      { id: 'event-2', title: 'Making space for deep work', category: 'JUN', date: '06', client: 'Ideas Summit · Chicago', description: 'How to protect attention and make room for better thinking.', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=85', url: '#booking', buttonText: 'Reserve a seat' },
      { id: 'event-3', title: 'A more resilient team', category: 'JUL', date: '21', client: 'People & Purpose · Online', description: 'Small habits that help teams navigate change together.', imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=85', url: '#booking', buttonText: 'Reserve a seat' },
    ] } },
    { id: 'bridge', type: 'feature-split', variant: 'editorial', layout: 'image-right', isHidden: false, backgroundColor: '#fff7f3', textColor: '#171717', content: { eyebrow: 'FOR YOUR ORGANIZATION', title: 'Bridge your professional and personal life.', description: 'A meaningful career and a full life can strengthen each other. Jordan’s workshops help teams reconnect with their values, make room for what matters, and move forward with intention.', imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=85', imageAlt: 'People sharing a conversation', checkpoints: [], buttonText: 'Explore workshops', buttonUrl: '#booking' } },
    { id: 'resources', type: 'blog-list', variant: 'image-cards', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { title: 'Blog & resources', actionText: 'Read more articles', actionUrl: '#resources', items: [
      { id: 'article-1', category: 'Leadership', date: 'Field notes', title: 'The synergy equation: unlocking your team’s collective power', description: 'A practical guide to better collaboration.', imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85', url: '#resources' },
      { id: 'article-2', category: 'Work', date: 'Ideas', title: 'The art of alignment: how great teams achieve goals', description: 'Bring purpose and everyday work closer together.', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=85', url: '#resources' },
      { id: 'article-3', category: 'Culture', date: 'Reading list', title: 'Building bridges between disciplines', description: 'Why our best answers often come from elsewhere.', imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=85', url: '#resources' },
    ] } },
    { id: 'audience', type: 'testimonials', variant: 'marquee', isHidden: false, backgroundColor: '#ff715c', textColor: '#171717', content: { title: 'A word from the audience', items: [
      { id: 'quote-1', quote: 'Jordan has a rare gift for making a room feel both thoughtful and energized.', author: 'Lisa Mitchell', role: 'Conference Director', avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80' },
      { id: 'quote-2', quote: 'The ideas stayed with our team long after the event ended.', author: 'Robert Finns', role: 'People & Culture Lead', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80' },
      { id: 'quote-3', quote: 'A clear, warm, and genuinely useful conversation about doing better work.', author: 'Maya Chen', role: 'Author', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
      { id: 'quote-4', quote: 'Our audience left inspired and with practical steps they could use the next morning.', author: 'Daniel Brooks', role: 'Event Producer', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
    ] } },
    { id: 'partners', type: 'marquee', layout: 'left', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { text: 'GOOGLE · NETFLIX · AMAZON · SLACK · JOTFORM · GOOGLE · NETFLIX · AMAZON · SLACK · JOTFORM' } },
    { id: 'booking', type: 'booking', isHidden: false, backgroundColor: '#ffffff', textColor: '#171717', content: { title: 'Book a speaking engagement', description: 'Tell us about your event, audience, and the ideas you want to explore together.', provider: 'custom', link: 'mailto:hello@example.com' } },
    { id: 'footer', type: 'site-footer', variant: 'compact', isHidden: false, backgroundColor: '#171717', textColor: '#ffffff', content: { logoText: 'JORDAN REEVES', description: 'Author and speaker on resilience, leadership, and a life of purpose.', links: [{ id: 'footer-home', group: 'Explore', label: 'Home', url: '#top' }, { id: 'footer-events', group: 'Explore', label: 'Speaking', url: '#events' }, { id: 'footer-resources', group: 'Explore', label: 'Writing', url: '#resources' }, { id: 'footer-about', group: 'Explore', label: 'About', url: '#about' }, { id: 'footer-contact', group: 'Contact', label: 'Book an event', url: '#booking' }], socialLinks: [{ id: 'footer-instagram', label: 'Instagram', url: 'https://instagram.com' }, { id: 'footer-youtube', label: 'YouTube', url: 'https://youtube.com' }, { id: 'footer-linkedin', label: 'LinkedIn', url: 'https://linkedin.com' }], legalLinks: [{ id: 'footer-copy', label: '© 2026 Jordan Reeves', url: '#top' }, { id: 'footer-privacy', label: 'Privacy', url: '#privacy' }] } },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE MAP — for lookup by ID
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATES_MAP: Record<string, PageDocument> = {
  'creator-profile': TEMPLATE_CREATOR_PROFILE,
  'creator-portfolio': TEMPLATE_CREATOR_PORTFOLIO,
  'creator-newsletter': TEMPLATE_CREATOR_NEWSLETTER,
  'product-brand': TEMPLATE_PRODUCT_BRAND,
  'developer-portfolio': TEMPLATE_DEVELOPER_PORTFOLIO,
  'beauty-brand': TEMPLATE_BEAUTY_BRAND,
  'restaurant': TEMPLATE_RESTAURANT,
  'corporate-consulting': TEMPLATE_CORPORATE_CONSULTING,
  'editorial-portfolio': TEMPLATE_EDITORIAL_PORTFOLIO,
  'luxury-skincare': TEMPLATE_LUXURY_SKINCARE,
  'point-architecture': TEMPLATE_POINT_ARCHITECTURE,
  'creator-fashion': TEMPLATE_CREATOR_FASHION,
  'creator-speaker': TEMPLATE_CREATOR_SPEAKER,
};
