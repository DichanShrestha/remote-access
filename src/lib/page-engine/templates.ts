import { PageDocument } from './schemas';

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
// 4. LOCAL SERVICE
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_LOCAL_SERVICE: PageDocument = {
  version: 1,
  theme: {
    style: 'premium-minimal',
    primaryColor: '#059669',
    radius: 'medium',
    density: 'compact',
  },
  settings: { showFooterBranding: true, enableSmoothScrolling: true },
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'asymmetric',
      layout: 'left',
      isHidden: false,
      content: {
        title: 'Acme Landscaping',
        eyebrow: 'SERVICING AUSTIN, TX',
        headline: 'Beautiful outdoor spaces, expertly maintained.',
        subtitle: 'Professional lawn care, landscaping, and hardscaping services for residential and commercial properties.',
        buttonText: 'Book a consultation',
        buttonUrl: '#booking',
        secondaryButtonText: 'Our Services',
        secondaryButtonUrl: '#services',
        imageUrl: 'https://images.unsplash.com/photo-1558904541-efa843a96f0f?w=1000&q=80',
        badge: 'Top Rated 2024',
      },
    },
    {
      id: 'services-1',
      type: 'services',
      variant: 'glass-dark',
      isHidden: false,
      content: {
        title: 'What we do',
        items: [
          { id: 's-1', title: 'Lawn Maintenance', description: 'Weekly mowing, edging, and trimming to keep your property pristine.' },
          { id: 's-2', title: 'Landscape Design', description: 'Custom designs featuring native plants and sustainable materials.' },
          { id: 's-3', title: 'Hardscaping', description: 'Patios, walkways, retaining walls, and outdoor living areas.' },
        ],
      },
    },
    {
      id: 'timeline-1',
      type: 'timeline',
      variant: 'stepper',
      isHidden: false,
      content: {
        title: 'Our Process',
        items: [
          { id: 't-1', label: 'Consultation', description: 'We visit your property to understand your vision.' },
          { id: 't-2', label: 'Design & Quote', description: 'Detailed proposal with timeline and costs.' },
          { id: 't-3', label: 'Installation', description: 'Expert execution by our certified team.' },
        ],
      },
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      variant: 'marquee',
      isHidden: false,
      content: {
        title: 'Happy Neighbors',
        items: [
          { id: 't-1', quote: 'Transformed our backyard completely. Highly recommend!', author: 'John D.' },
          { id: 't-2', quote: 'Reliable, professional, and affordable.', author: 'Sarah M.' },
          { id: 't-3', quote: 'Best landscaping crew in Austin.', author: 'Mike T.' },
        ],
      },
    },
    {
      id: 'booking-1',
      type: 'booking',
      variant: 'premium',
      isHidden: false,
      content: {
        title: 'Book a free estimate',
        description: 'Select a time that works for you, and we will come take a look.',
        provider: 'calendly',
        link: 'https://calendly.com',
      },
    },
    {
      id: 'contact-1',
      type: 'contact',
      variant: 'spacious',
      isHidden: false,
      content: {
        title: 'Contact Information',
        email: 'hello@acmelandscaping.com',
        phone: '(555) 123-4567',
        address: '123 Green St, Austin, TX',
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
// 6. PROFESSIONAL SERVICE
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_PROFESSIONAL_SERVICE: PageDocument = {
  version: 1,
  theme: {
    style: 'premium-minimal',
    primaryColor: '#0F172A',
    radius: 'none',
    density: 'spacious',
  },
  settings: { showFooterBranding: true, enableSmoothScrolling: true },
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'split',
      layout: 'split',
      isHidden: false,
      content: {
        title: 'North & Co.',
        eyebrow: 'STRATEGIC ADVISORY',
        headline: 'Clarity for complex business challenges.',
        subtitle: 'We advise enterprise leadership teams on digital transformation, operational efficiency, and market expansion.',
        buttonText: 'Schedule Consultation',
        buttonUrl: '#contact',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
      },
    },
    {
      id: 'social-1',
      type: 'social-links',
      variant: 'depth',
      layout: 'row',
      isHidden: false,
      content: {
        links: [
          { id: 'sl-1', platform: 'LinkedIn', url: 'https://linkedin.com' },
          { id: 'sl-2', platform: 'Twitter', url: 'https://x.com' },
        ],
      },
    },
    {
      id: 'richtext-1',
      type: 'rich-text',
      variant: 'typewriter',
      isHidden: false,
      content: {
        text: '<h2>Our Philosophy</h2><p>In a world of constant disruption, clarity is your ultimate competitive advantage. We help organizations cut through the noise to identify what actually matters, and execute with precision.</p>',
      },
    },
    {
      id: 'services-1',
      type: 'services',
      variant: 'minimal-border',
      isHidden: false,
      content: {
        title: 'Practice Areas',
        items: [
          { id: 's-1', title: 'Digital Strategy', description: 'Modernizing legacy systems and business models.' },
          { id: 's-2', title: 'Operations', description: 'Streamlining processes for maximum efficiency.' },
          { id: 's-3', title: 'M&A Advisory', description: 'Due diligence and post-merger integration.' },
        ],
      },
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      variant: 'glare',
      isHidden: false,
      content: {
        title: 'Client Outcomes',
        items: [
          { id: 't-1', quote: 'North & Co helped us navigate our hardest transition year with exceptional clarity.', author: 'James Wilson', role: 'CEO, Global Logistics' },
          { id: 't-2', quote: 'Their strategic framework completely reshaped how we evaluate new market opportunities.', author: 'Elena Rodriguez', role: 'VP Strategy, TechCorp' },
        ],
      },
    },
    {
      id: 'form-1',
      type: 'lead-form',
      variant: 'card-centered',
      isHidden: false,
      content: {
        title: 'Get in touch',
        description: 'Request a confidential briefing on our capabilities.',
        buttonText: 'Contact Us',
        successMessage: 'A partner will be in touch shortly.',
      },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE MAP — for lookup by ID
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATES_MAP: Record<string, PageDocument> = {
  'creator-profile': TEMPLATE_CREATOR_PROFILE,
  'creator-portfolio': TEMPLATE_CREATOR_PORTFOLIO,
  'creator-newsletter': TEMPLATE_CREATOR_NEWSLETTER,
  'local-service': TEMPLATE_LOCAL_SERVICE,
  'product-brand': TEMPLATE_PRODUCT_BRAND,
  'professional-service': TEMPLATE_PROFESSIONAL_SERVICE,
};
