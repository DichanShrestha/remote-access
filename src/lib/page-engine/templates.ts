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
// 9. ARCHITECTURE STUDIO
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_ARCHITECTURE_STUDIO: PageDocument = {
  version: 1,
  theme: {
    style: 'premium-minimal',
    primaryColor: '#1B4D4A',
    radius: 'none',
    density: 'spacious',
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
      zoomWord: 'spaces',
      isHidden: false,
      content: {
        title: 'Point Architecture',
        headline: 'Spaces for a better life.',
        subtitle: 'Award-winning architecture studio specializing in residential, commercial, and urban design. We create environments that inspire.',
        buttonText: 'View Projects',
        buttonUrl: '#gallery',
        imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=80',
      },
    },
    {
      id: 'richtext-1',
      type: 'rich-text',
      variant: 'split',
      isHidden: false,
      content: {
        text: '<h2>About Us</h2><p>We are a design-led architecture practice specializing in innovative and sustainable design. With over two decades of experience, our team brings a multidisciplinary approach to every project — balancing aesthetics, function, and environmental responsibility.</p>',
      },
    },
    {
      id: 'stats-1',
      type: 'stats',
      variant: 'count-up',
      isHidden: false,
      content: {
        items: [
          { id: 'st-1', value: '180', label: 'Projects Completed', suffix: '+' },
          { id: 'st-2', value: '10', label: 'Design Awards', suffix: '+' },
          { id: 'st-3', value: '25', label: 'Years Experience', suffix: '+' },
          { id: 'st-4', value: '11', label: 'Team Members' },
        ],
      },
    },
    {
      id: 'services-1',
      type: 'services',
      variant: 'minimal-border',
      isHidden: false,
      content: {
        title: 'Our Services',
        items: [
          { id: 's-1', title: 'Residential Design', description: 'Bespoke homes that reflect how you live. From concept to completion, we design spaces that are uniquely yours.' },
          { id: 's-2', title: 'Commercial Architecture', description: 'Office, retail, and hospitality spaces that elevate brand identity and optimize workflow.' },
          { id: 's-3', title: 'Urban Planning', description: 'Master planning and urban design that builds thriving, sustainable communities.' },
          { id: 's-4', title: 'Interior Design', description: 'Curated interiors that complement the architecture — materials, lighting, and furnishings.' },
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
          { id: 'g-1', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80', caption: 'Sierra Plaza Tower' },
          { id: 'g-2', url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&q=80', caption: 'Harbor View Residence' },
          { id: 'g-3', url: 'https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=800&q=80', caption: 'Meridian Arts Center' },
          { id: 'g-4', url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80', caption: 'Greenview Campus' },
        ],
      },
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      variant: 'grid',
      isHidden: false,
      content: {
        title: 'Words from clients',
        items: [
          { id: 't-1', quote: 'Point Architecture transformed our vision into a building that exceeded every expectation. Their attention to detail is extraordinary.', author: 'David Clarke', role: 'CEO, Meridian Group' },
          { id: 't-2', quote: 'Collaborative, responsive, and genuinely brilliant. They designed our dream home and made the process enjoyable.', author: 'Naomi White', role: 'Homeowner' },
          { id: 't-3', quote: 'Our new headquarters has become a recruitment tool — every candidate who visits wants to work here.', author: 'Hiroshi Yamamoto', role: 'Director, TechVentures' },
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
        description: 'Have a project in mind? Tell us about your vision and we will schedule a consultation.',
        buttonText: 'Send Inquiry',
        successMessage: 'Thank you. Our team will be in touch within 48 hours.',
      },
    },
    {
      id: 'contact-1',
      type: 'contact',
      variant: 'minimal-footer',
      isHidden: false,
      content: {
        title: 'Contact',
        email: 'studio@pointarchitecture.com',
        phone: '+1 (415) 555-0192',
        address: '42 Design District, San Francisco, CA',
      },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// 10. RESTAURANT
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_RESTAURANT: PageDocument = {
  version: 1,
  theme: {
    style: 'premium-minimal',
    primaryColor: '#B8944E',
    radius: 'small',
    density: 'spacious',
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
      zoomWord: 'Osteria',
      isHidden: false,
      content: {
        title: 'Osteria San Marco',
        headline: 'Authentic Italian, crafted with soul.',
        subtitle: 'A seasonal menu celebrating the finest Italian traditions. Every dish tells a story of heritage, quality ingredients, and culinary passion.',
        buttonText: 'Reserve a Table',
        buttonUrl: '#booking',
        secondaryButtonText: 'View Menu',
        secondaryButtonUrl: '#menu',
        imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80',
      },
    },
    {
      id: 'richtext-1',
      type: 'rich-text',
      variant: 'split',
      isHidden: false,
      content: {
        text: '<h2>Our Philosophy</h2><p>At Osteria San Marco, we believe great food starts with exceptional ingredients. Every morning, our chef sources the freshest produce from local farms and imports specialty items directly from Italy. Our pasta is made by hand, our sauces are slow-simmered, and our desserts are baked in-house. This is not just a restaurant — it is a celebration of the Italian table.</p>',
      },
    },
    {
      id: 'products-1',
      type: 'products',
      variant: 'blur-fade',
      isHidden: false,
      content: {
        title: 'Signature Dishes',
        items: [
          { id: 'p-1', title: 'Risotto ai Funghi Porcini', description: 'Arborio rice slow-cooked with wild porcini mushrooms, finished with aged Parmigiano.', price: '$32', imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500&q=80', url: '#' },
          { id: 'p-2', title: 'Bistecca alla Fiorentina', description: 'Prime T-bone steak, charcoal-grilled, served with rosemary potatoes and seasonal greens.', price: '$58', imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80', url: '#' },
          { id: 'p-3', title: 'Tagliatelle al Ragù', description: 'Hand-rolled pasta with our signature Bolognese, slow-braised for eight hours.', price: '$26', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80', url: '#' },
        ],
      },
    },
    {
      id: 'carousel-1',
      type: 'carousel',
      variant: 'flex',
      isHidden: false,
      content: {
        images: [
          { id: 'c-1', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80', caption: 'The Dining Room' },
          { id: 'c-2', url: 'https://images.unsplash.com/photo-1428515613728-6b4607e44363?w=1000&q=80', caption: 'Our Kitchen' },
          { id: 'c-3', url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1000&q=80', caption: 'Wine Cellar' },
          { id: 'c-4', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&q=80', caption: 'Garden Terrace' },
        ],
      },
    },
    {
      id: 'booking-1',
      type: 'booking',
      variant: 'premium',
      isHidden: false,
      content: {
        title: 'Reserve a Table',
        description: 'Book your table online. We recommend reserving at least 48 hours in advance for weekend dining.',
        provider: 'calendly',
        link: 'https://calendly.com',
      },
    },
    {
      id: 'timeline-1',
      type: 'timeline',
      variant: 'stepper',
      isHidden: false,
      content: {
        title: 'Our Story',
        items: [
          { id: 't-1', label: '1999', description: 'Chef Marco Rossi opens the first Osteria in a converted farmhouse in Tuscany.' },
          { id: 't-2', label: '2008', description: 'Awarded our first Michelin star. Expanded to a second location in the city center.' },
          { id: 't-3', label: '2019', description: 'Opened our flagship New York location, bringing authentic Tuscan cuisine across the Atlantic.' },
        ],
      },
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      variant: 'marquee',
      isHidden: false,
      content: {
        title: 'Guest Reviews',
        items: [
          { id: 'r-1', quote: 'The best Italian food outside of Italy. Every visit feels like a journey to Tuscany.', author: 'The New York Times' },
          { id: 'r-2', quote: 'Impeccable service, extraordinary food, and a wine list that makes you weep with joy.', author: 'Food & Wine Magazine' },
          { id: 'r-3', quote: 'We celebrated our anniversary here and it was absolute perfection from start to finish.', author: 'Sarah & Tom K.' },
        ],
      },
    },
    {
      id: 'contact-1',
      type: 'contact',
      variant: 'spacious',
      isHidden: false,
      content: {
        title: 'Visit Us',
        email: 'reservations@osteriasanmarco.com',
        phone: '+1 (212) 555-0147',
        address: '87 Prince Street, SoHo, New York, NY 10012',
      },
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// 11. CORPORATE ADVISORY
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATE_CORPORATE_ADVISORY: PageDocument = {
  version: 1,
  theme: {
    style: 'premium-minimal',
    primaryColor: '#1A3D34',
    radius: 'small',
    density: 'spacious',
  },
  settings: { showFooterBranding: true, enableSmoothScrolling: true },
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'split',
      layout: 'split',
      zoomReveal: true,
      zoomWord: 'future',
      isHidden: false,
      content: {
        title: 'Evergreen Capital',
        eyebrow: 'STRATEGIC ADVISORY',
        headline: 'Build a sustainable future for your company.',
        subtitle: 'We partner with leadership teams to drive growth, optimize operations, and navigate complex transitions with clarity and confidence.',
        buttonText: 'Schedule Consultation',
        buttonUrl: '#contact',
        secondaryButtonText: 'Our Approach',
        secondaryButtonUrl: '#services',
        imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1200&q=80',
      },
    },
    {
      id: 'stats-1',
      type: 'stats',
      variant: 'count-up',
      isHidden: false,
      content: {
        title: 'Your business goals are our top priority',
        items: [
          { id: 'st-1', value: '264', label: 'Companies Advised' },
          { id: 'st-2', value: '255', label: 'Strategies Deployed' },
          { id: 'st-3', value: '440', label: 'Million in Value Created', prefix: '$', suffix: 'M' },
        ],
      },
    },
    {
      id: 'services-1',
      type: 'services',
      variant: 'glass-dark',
      isHidden: false,
      content: {
        title: 'What We Offer',
        items: [
          { id: 's-1', title: 'Strategic Planning', description: 'Long-term growth roadmaps grounded in market analysis and competitive intelligence.' },
          { id: 's-2', title: 'Financial Advisory', description: 'In-depth performance analysis, capital allocation strategy, and financial restructuring.' },
          { id: 's-3', title: 'M&A Advisory', description: 'Expert guidance through mergers, acquisitions, and post-deal integration.' },
          { id: 's-4', title: 'Operational Excellence', description: 'Streamlining processes and technology to maximize efficiency and reduce waste.' },
        ],
      },
    },
    {
      id: 'image-1',
      type: 'image',
      variant: 'scroll-reveal',
      layout: 'full',
      isHidden: false,
      content: {
        url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80',
        alt: 'Team collaboration',
      },
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      variant: 'grid',
      isHidden: false,
      content: {
        title: 'Client Success Stories',
        items: [
          { id: 't-1', quote: 'Evergreen helped us navigate a $200M acquisition with extraordinary precision and care.', author: 'Catherine Hayes', role: 'CEO, Meridian Industries' },
          { id: 't-2', quote: 'Their strategic framework completely reshaped how we evaluate market opportunities.', author: 'Michael Torres', role: 'VP Strategy, NovaTech' },
          { id: 't-3', quote: 'The ROI on their engagement was clear within the first quarter. Exceptional advisory team.', author: 'Robert Kim', role: 'CFO, Atlas Group' },
        ],
      },
    },
    {
      id: 'faq-1',
      type: 'faq',
      isHidden: false,
      content: {
        title: 'Got a question? Get your answer.',
        items: [
          { id: 'f-1', question: 'What size companies do you work with?', answer: 'We primarily work with mid-market and enterprise companies with annual revenue between $10M and $500M.' },
          { id: 'f-2', question: 'How long is a typical engagement?', answer: 'Most strategic engagements run 3–6 months, though we offer ongoing advisory retainers for long-term partnerships.' },
          { id: 'f-3', question: 'Do you work across industries?', answer: 'Yes. Our team has deep expertise in technology, healthcare, financial services, manufacturing, and consumer goods.' },
          { id: 'f-4', question: 'What does the initial consultation include?', answer: 'A complimentary 60-minute session where we assess your challenges, identify quick wins, and outline a potential engagement scope.' },
        ],
      },
    },
    {
      id: 'form-1',
      type: 'lead-form',
      variant: 'split-layout',
      isHidden: false,
      content: {
        title: 'We\'re here to help',
        description: 'Ready to accelerate your business? Tell us about your challenges and we will schedule a confidential briefing.',
        buttonText: 'Get Started',
        successMessage: 'A senior advisor will contact you within 24 hours.',
      },
    },
    {
      id: 'social-1',
      type: 'social-links',
      variant: 'dock',
      layout: 'row',
      isHidden: false,
      content: {
        links: [
          { id: 'sl-1', platform: 'LinkedIn', url: 'https://linkedin.com' },
          { id: 'sl-2', platform: 'Twitter', url: 'https://x.com' },
        ],
      },
    },
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
    { id: 'service-tabs', type: 'link-list', variant: 'tabs', isHidden: false, content: { links: [
      { id: 'tab-planning', label: 'Financial planning', badge: 'New', isActive: false, url: '#financial-planning' },
      { id: 'tab-analysis', label: 'Performance analysis', badge: 'New', isActive: false, url: '#performance-analysis' },
      { id: 'tab-advisory', label: 'Investment advisory', badge: 'New', isActive: true, url: '#investment-advisory' },
    ] } },
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
      content: { title: 'Got a question? Get your answer', items: [
        { id: '1', question: 'How can financial consulting benefit my business?', answer: 'Our consulting optimizes strategies for sustainable growth and improved financial performance.' },
        { id: '2', question: 'What distinguishes your firm from others in the industry?', answer: 'We pair deep industry experience with tailored, practical financial guidance.' },
        { id: '3', question: 'Do you offer services tailored to specific industries?', answer: 'Yes. Our team adapts each engagement to your industry, goals, and operating context.' },
        { id: '4', question: 'How do you ensure confidentiality with client data?', answer: 'We use secure processes and clear governance to protect all client information.' },
      ] },
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
// TEMPLATE MAP — for lookup by ID
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATES_MAP: Record<string, PageDocument> = {
  'creator-profile': TEMPLATE_CREATOR_PROFILE,
  'creator-portfolio': TEMPLATE_CREATOR_PORTFOLIO,
  'creator-newsletter': TEMPLATE_CREATOR_NEWSLETTER,
  'local-service': TEMPLATE_LOCAL_SERVICE,
  'product-brand': TEMPLATE_PRODUCT_BRAND,
  'professional-service': TEMPLATE_PROFESSIONAL_SERVICE,
  'developer-portfolio': TEMPLATE_DEVELOPER_PORTFOLIO,
  'beauty-brand': TEMPLATE_BEAUTY_BRAND,
  'architecture-studio': TEMPLATE_ARCHITECTURE_STUDIO,
  'restaurant': TEMPLATE_RESTAURANT,
  'corporate-advisory': TEMPLATE_CORPORATE_ADVISORY,
  'corporate-consulting': TEMPLATE_CORPORATE_CONSULTING,
};
