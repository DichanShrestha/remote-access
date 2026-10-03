import { PageDocument } from './schemas';

// ═══════════════════════════════════════════════════════════════════
// CREATOR TEMPLATES
// ═══════════════════════════════════════════════════════════════════

/**
 * 1. Creator Profile
 * For influencers, YouTubers, TikTok creators, streamers, personal brands.
 * Hero: Minimal Profile — personal, editorial, image-focused.
 */
export const TEMPLATE_CREATOR_PROFILE: PageDocument = {
  version: 1,
  theme: {
    style: 'premium-minimal',
    primaryColor: '#171717',
    radius: 'medium',
    density: 'comfortable',
  },
  settings: { showFooterBranding: true },
  sections: [
    // 1. Hero — Minimal Profile
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'minimal',
      layout: 'center',
      isHidden: false,
      content: {
        title: 'Alex Carter',
        eyebrow: 'CREATOR · 180K FOLLOWERS',
        headline: 'I make the internet a little more useful.',
        subtitle: 'Tech, creativity, and the systems behind building online.',
        buttonText: 'Work with me',
        buttonUrl: '#lead-form',
        secondaryButtonText: 'Watch my latest',
        secondaryButtonUrl: '#video',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80',
        location: 'London',
      },
    },

    // 2. Social Links
    {
      id: 'social-1',
      type: 'social-links',
      variant: 'dock',
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

    // 3. Marquee
    {
      id: 'marquee-1',
      type: 'marquee',
      layout: 'left',
      isHidden: false,
      content: {
        text: 'TECH · CREATIVE · BUILDING ONLINE · TECH · CREATIVE · BUILDING ONLINE',
      },
    },

    // 4. Rich Text — About
    {
      id: 'richtext-1',
      type: 'rich-text',
      variant: 'default',
      isHidden: false,
      content: {
        text: '<h2>A little about me</h2><p>I started making videos from my bedroom three years ago. Today, I create content about technology, productivity systems, and the creative process behind building an audience online. My goal is to make complicated ideas feel simple — and help others build something meaningful on the internet.</p>',
      },
    },

    // 5. Video
    {
      id: 'video-1',
      type: 'video',
      isHidden: false,
      content: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'My latest video',
      },
    },

    // 6. URL Buttons
    {
      id: 'btn-1',
      type: 'url-button',
      layout: 'filled',
      isHidden: false,
      content: { label: 'Watch on YouTube', url: 'https://youtube.com', description: 'New videos every week' },
    },
    {
      id: 'btn-2',
      type: 'url-button',
      layout: 'outline',
      isHidden: false,
      content: { label: 'Follow on TikTok', url: 'https://tiktok.com' },
    },
    {
      id: 'btn-3',
      type: 'url-button',
      layout: 'outline',
      isHidden: false,
      content: { label: 'My recommended tools', url: '#' },
    },
    {
      id: 'btn-4',
      type: 'url-button',
      layout: 'ghost',
      isHidden: false,
      content: { label: 'Shop my gear', url: '#' },
    },

    // 7. Quote
    {
      id: 'quote-1',
      type: 'quote',
      isHidden: false,
      content: {
        text: 'Alex consistently turns complicated ideas into content people actually understand.',
        author: 'Sarah M., Brand Partner',
      },
    },

    // 8. Lead Form
    {
      id: 'lead-form-1',
      type: 'lead-form',
      isHidden: false,
      content: {
        title: 'Work with me',
        description: 'Interested in a sponsorship, collaboration, or project? Drop me a message.',
        buttonText: 'Send inquiry',
        successMessage: 'Thanks! I\'ll get back to you within 48 hours.',
      },
    },

  ],
};

/**
 * 2. Creator Portfolio
 * For designers, developers, photographers, videographers, freelancers.
 * Hero: Split — professional, structured, portfolio-focused.
 */
export const TEMPLATE_CREATOR_PORTFOLIO: PageDocument = {
  version: 1,
  theme: {
    style: 'premium-minimal',
    primaryColor: '#0f172a',
    radius: 'small',
    density: 'spacious',
  },
  settings: { showFooterBranding: true },
  sections: [
    // 1. Hero — Split
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'split',
      layout: 'split',
      isHidden: false,
      content: {
        eyebrow: 'DESIGNER & CREATIVE DEVELOPER',
        title: 'Maya Chen',
        headline: 'I design digital experiences people remember.',
        subtitle: 'Independent designer helping ambitious brands turn ideas into polished products.',
        buttonText: 'View my work',
        buttonUrl: '#carousel',
        secondaryButtonText: 'Let\'s work together',
        secondaryButtonUrl: '#lead-form',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
      },
    },

    // 2. Social Links
    {
      id: 'social-1',
      type: 'social-links',
      variant: 'default',
      layout: 'row',
      isHidden: false,
      content: {
        links: [
          { id: 'sl-1', platform: 'Instagram', url: 'https://instagram.com' },
          { id: 'sl-2', platform: 'Twitter', url: 'https://x.com' },
          { id: 'sl-3', platform: 'LinkedIn', url: 'https://linkedin.com' },
          { id: 'sl-4', platform: 'Dribbble', url: 'https://dribbble.com' },
        ],
      },
    },

    // 3. Rich Text — Selected work intro
    {
      id: 'richtext-1',
      type: 'rich-text',
      variant: 'split',
      isHidden: false,
      content: {
        text: '<h2>Selected work</h2><p>A curated selection of projects spanning brand identity, product design, and creative development. Each project represents a deep collaboration with founders and teams building something meaningful.</p>',
      },
    },

    // 4. Carousel — Portfolio pieces
    {
      id: 'carousel-1',
      type: 'carousel',
      variant: 'flex',
      isHidden: false,
      content: {
        images: [
          { id: 'c-1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', caption: 'Forma — Brand Identity' },
          { id: 'c-2', url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80', caption: 'Relay — Product Design' },
          { id: 'c-3', url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80', caption: 'Northside — Web Experience' },
          { id: 'c-4', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80', caption: 'Arc Studio — Creative Direction' },
          { id: 'c-5', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80', caption: 'Vessel — Mobile App' },
        ],
      },
    },

    // 5. Testimonials
    {
      id: 'testimonials-1',
      type: 'testimonials',
      isHidden: false,
      content: {
        title: 'Kind words',
        items: [
          { id: 't-1', quote: 'Maya took our rough concept and turned it into something we\'re genuinely proud of. Her attention to detail is unmatched.', author: 'James Wright', role: 'Founder, Relay' },
          { id: 't-2', quote: 'Working with Maya felt like having a design partner, not just a contractor. She understood our vision from day one.', author: 'Priya Sharma', role: 'CEO, Vessel' },
          { id: 't-3', quote: 'The final product exceeded every expectation. Maya is the real deal.', author: 'Tom Keller', role: 'Creative Director, Arc Studio' },
        ],
      },
    },

    // 6. Resume
    {
      id: 'resume-1',
      type: 'resume',
      variant: 'default',
      isHidden: false,
      content: {
        title: 'Experience',
        items: [
          { id: 'r-1', role: 'Independent Designer', company: 'Maya Chen Studio', period: '2022 — Present', description: 'Brand, product, and web design for startups and creative businesses.' },
          { id: 'r-2', role: 'Senior Product Designer', company: 'Figma', period: '2019 — 2022', description: 'Led design for collaboration features used by millions.' },
          { id: 'r-3', role: 'Designer', company: 'Stripe', period: '2017 — 2019', description: 'Designed payment experiences for the developer dashboard.' },
        ],
      },
    },

    // 7. File Button
    {
      id: 'file-btn-1',
      type: 'file-button',
      isHidden: false,
      content: {
        label: 'Download my portfolio',
        fileUrl: '#',
        fileName: 'maya-chen-portfolio.pdf',
      },
    },

    // 8. URL Buttons
    {
      id: 'btn-1',
      type: 'url-button',
      layout: 'filled',
      isHidden: false,
      content: { label: 'View Behance', url: 'https://behance.net' },
    },
    {
      id: 'btn-2',
      type: 'url-button',
      layout: 'outline',
      isHidden: false,
      content: { label: 'View Dribbble', url: 'https://dribbble.com' },
    },
    {
      id: 'btn-3',
      type: 'url-button',
      layout: 'outline',
      isHidden: false,
      content: { label: 'Book a project', url: '#lead-form' },
    },

    // 9. Lead Form
    {
      id: 'lead-form-1',
      type: 'lead-form',
      isHidden: false,
      content: {
        title: 'Have a project in mind?',
        description: 'Tell me about your project and I\'ll get back to you within a few days.',
        buttonText: 'Start a conversation',
        successMessage: 'Thanks! I\'ll review your project details and get back to you soon.',
      },
    },


  ],
};

/**
 * 3. Creator Newsletter
 * For writers, educators, podcasters, newsletter creators.
 * Hero: Editorial Center — knowledge-focused, authoritative.
 */
export const TEMPLATE_CREATOR_NEWSLETTER: PageDocument = {
  version: 1,
  theme: {
    style: 'premium-minimal',
    primaryColor: '#1e40af',
    radius: 'none',
    density: 'spacious',
  },
  settings: { showFooterBranding: true },
  sections: [
    // 1. Hero — Editorial Center
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'editorial-center',
      layout: 'center',
      isHidden: false,
      content: {
        eyebrow: 'THE WEEKLY NEWSLETTER',
        title: 'Daniel Brooks',
        headline: 'One useful idea every Sunday.',
        subtitle: 'Practical lessons on business, creativity, and building a better career.',
        buttonText: 'Subscribe free',
        buttonUrl: '#collect-emails',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      },
    },

    // 2. Social Links
    {
      id: 'social-1',
      type: 'social-links',
      variant: 'default',
      layout: 'row',
      isHidden: false,
      content: {
        links: [
          { id: 'sl-1', platform: 'Twitter', url: 'https://x.com' },
          { id: 'sl-2', platform: 'LinkedIn', url: 'https://linkedin.com' },
          { id: 'sl-3', platform: 'YouTube', url: 'https://youtube.com' },
        ],
      },
    },

    // 3. Marquee
    {
      id: 'marquee-1',
      type: 'marquee',
      layout: 'left',
      isHidden: false,
      content: {
        text: '10,000+ READERS · EVERY SUNDAY · NO FLUFF',
      },
    },

    // 4. Rich Text — What you'll get
    {
      id: 'richtext-1',
      type: 'rich-text',
      variant: 'default',
      isHidden: false,
      content: {
        text: '<h2>What you\'ll get</h2><p><strong>One actionable idea.</strong> Every issue distills a single concept from business, psychology, or creative strategy into something you can use the same week.</p><p><strong>No filler.</strong> Every edition is under 5 minutes. I respect your time — you\'ll get signal, not noise.</p><p><strong>Real examples.</strong> I share what\'s actually working in my own projects, businesses, and creative practice — not theory.</p>',
      },
    },

    // 5. Audio — Podcast episode
    {
      id: 'audio-1',
      type: 'audio',
      isHidden: false,
      content: {
        url: 'https://open.spotify.com/episode/example',
        title: 'Ep. 47: The Skill Nobody Teaches You',
        artist: 'Daniel Brooks',
      },
    },

    // 6. Video
    {
      id: 'video-1',
      type: 'video',
      isHidden: false,
      content: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Why most advice is wrong (and what to do instead)',
      },
    },

    // 7. URL Buttons
    {
      id: 'btn-1',
      type: 'url-button',
      layout: 'filled',
      isHidden: false,
      content: { label: 'Read the latest issue', url: '#' },
    },
    {
      id: 'btn-2',
      type: 'url-button',
      layout: 'outline',
      isHidden: false,
      content: { label: 'Browse the archive', url: '#' },
    },
    {
      id: 'btn-3',
      type: 'url-button',
      layout: 'ghost',
      isHidden: false,
      content: { label: 'Listen on Spotify', url: 'https://spotify.com' },
    },

    // 8. Collect Emails
    {
      id: 'collect-emails-1',
      type: 'collect-emails',
      isHidden: false,
      content: {
        title: 'Join 10,000+ readers',
        placeholder: 'your@email.com',
        buttonText: 'Subscribe',
        successMessage: 'You\'re in! Check your inbox this Sunday.',
      },
    },

    // 9. Testimonials
    {
      id: 'testimonials-1',
      type: 'testimonials',
      isHidden: false,
      content: {
        title: 'What readers say',
        items: [
          { id: 't-1', quote: 'The only newsletter I actually open every week. Daniel\'s writing is sharp and genuinely useful.', author: 'Rachel Kim', role: 'Product Manager' },
          { id: 't-2', quote: 'I\'ve tried dozens of newsletters. This is the one that sticks. Clear, actionable, zero fluff.', author: 'Marcus Patel', role: 'Founder' },
          { id: 't-3', quote: 'Daniel helped me rethink how I approach my career. Can\'t recommend enough.', author: 'Li Wei', role: 'Software Engineer' },
        ],
      },
    },


  ],
};


// ═══════════════════════════════════════════════════════════════════
// BUSINESS TEMPLATES
// ═══════════════════════════════════════════════════════════════════

/**
 * 4. Local Service
 * For tattoo shops, salons, barbers, clinics, restaurants, studios.
 * Hero: Split — trustworthy, location-focused, conversion-driven.
 */
export const TEMPLATE_LOCAL_SERVICE: PageDocument = {
  version: 1,
  theme: {
    style: 'bold',
    primaryColor: '#171717',
    radius: 'medium',
    density: 'comfortable',
  },
  settings: { showFooterBranding: true },
  sections: [
    // 1. Hero — Split
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'split',
      layout: 'split',
      isHidden: false,
      content: {
        eyebrow: 'KATHMANDU · SINCE 2018',
        title: 'Northside Tattoo',
        headline: 'Custom tattoos built around your story.',
        subtitle: 'Private studio specializing in fine-line, blackwork, and custom pieces.',
        buttonText: 'Book a consultation',
        buttonUrl: '#booking',
        secondaryButtonText: 'View our work',
        secondaryButtonUrl: '#gallery',
        imageUrl: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&q=80',
        location: 'Kathmandu, Nepal',
      },
    },

    // 2. Social Links
    {
      id: 'social-1',
      type: 'social-links',
      variant: 'default',
      layout: 'row',
      isHidden: false,
      content: {
        links: [
          { id: 'sl-1', platform: 'Instagram', url: 'https://instagram.com' },
          { id: 'sl-2', platform: 'Facebook', url: 'https://facebook.com' },
          { id: 'sl-3', platform: 'TikTok', url: 'https://tiktok.com' },
          { id: 'sl-4', platform: 'Google', url: 'https://maps.google.com' },
        ],
      },
    },

    // 3. Marquee
    {
      id: 'marquee-1',
      type: 'marquee',
      layout: 'left',
      isHidden: false,
      content: {
        text: 'OPEN TODAY · APPOINTMENTS AVAILABLE · CUSTOM WORK',
      },
    },

    // 4. Rich Text — About
    {
      id: 'richtext-1',
      type: 'rich-text',
      variant: 'default',
      isHidden: false,
      content: {
        text: '<h2>Made for you</h2><p>Every piece starts with a conversation. We take the time to understand your story, your references, and your vision — then design something completely original. No flash sheets, no compromises. Just thoughtful, custom tattoo art in a private, comfortable studio environment.</p>',
      },
    },

    // 5. Services
    {
      id: 'services-1',
      type: 'services',
      variant: 'spotlight',
      isHidden: false,
      content: {
        title: 'What we offer',
        items: [
          { id: 's-1', title: 'Fine Line', description: 'Delicate, detailed linework with precision and care.' },
          { id: 's-2', title: 'Blackwork', description: 'Bold, graphic pieces using solid black ink.' },
          { id: 's-3', title: 'Custom Design', description: 'Original artwork designed specifically for you.' },
          { id: 's-4', title: 'Cover Ups', description: 'Expert cover-up work to transform existing tattoos.' },
        ],
      },
    },

    // 6. Gallery
    {
      id: 'gallery-1',
      type: 'gallery',
      variant: 'masonry',
      layout: 'masonry',
      isHidden: false,
      content: {
        images: [
          { id: 'g-1', url: 'https://images.unsplash.com/photo-1590246814883-57c511c5c509?w=600&q=80', caption: 'Fine line floral' },
          { id: 'g-2', url: 'https://images.unsplash.com/photo-1542556398-95fb5b9f9304?w=600&q=80', caption: 'Geometric blackwork' },
          { id: 'g-3', url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=600&q=80', caption: 'Custom sleeve' },
          { id: 'g-4', url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&q=80', caption: 'Studio session' },
          { id: 'g-5', url: 'https://images.unsplash.com/photo-1598371839696-5c5bb1a5c4b2?w=600&q=80', caption: 'Minimal line art' },
          { id: 'g-6', url: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=600&q=80', caption: 'Detail work' },
        ],
      },
    },

    // 7. Testimonials
    {
      id: 'testimonials-1',
      type: 'testimonials',
      isHidden: false,
      content: {
        title: 'What our clients say',
        items: [
          { id: 't-1', quote: 'Best tattoo experience I\'ve ever had. The studio is clean, the team is professional, and my piece turned out even better than I imagined.', author: 'Rina S.', role: 'Kathmandu' },
          { id: 't-2', quote: 'They really listened to what I wanted. It felt like a true collaboration. I\'ll be coming back for sure.', author: 'David M.', role: 'Tourist from UK' },
          { id: 't-3', quote: 'The attention to detail is incredible. Worth every minute of the consultation process.', author: 'Anil K.', role: 'Kathmandu' },
        ],
      },
    },

    // 8. Booking CTA
    {
      id: 'booking-1',
      type: 'booking',
      isHidden: false,
      content: {
        title: 'Ready to start?',
        description: 'Book a free consultation to discuss your design, placement, and pricing.',
        provider: 'cal.com',
        link: 'https://cal.com',
      },
    },

    // 9. FAQ
    {
      id: 'faq-1',
      type: 'faq',
      isHidden: false,
      content: {
        title: 'Common questions',
        items: [
          { id: 'q-1', question: 'How much does a tattoo cost?', answer: 'Pricing depends on size, detail, and placement. Small pieces start around NPR 5,000. We provide exact quotes during the consultation.' },
          { id: 'q-2', question: 'How long does a session take?', answer: 'Small pieces take 1–2 hours. Larger custom work may require multiple sessions of 3–5 hours each.' },
          { id: 'q-3', question: 'Do you take walk-ins?', answer: 'We work by appointment only to give every client the time and attention they deserve. Book online or message us on Instagram.' },
          { id: 'q-4', question: 'How do I prepare for my appointment?', answer: 'Get a good night\'s sleep, eat a full meal, stay hydrated, and avoid alcohol 24 hours before your session.' },
          { id: 'q-5', question: 'What is your cancellation policy?', answer: 'We require 48 hours notice for cancellations. Late cancellations forfeit the deposit.' },
        ],
      },
    },

    // 10. Contact / Location
    {
      id: 'contact-1',
      type: 'contact',
      isHidden: false,
      content: {
        title: 'Visit us',
        email: 'hello@northsidetattoo.com',
        phone: '+977 9841-000-000',
        address: 'Thamel, Kathmandu 44600, Nepal',
      },
    },

  ],
};

/**
 * 5. Product Brand
 * For ecommerce, fashion, beauty, food brands, product launches.
 * Hero: Immersive — brand-focused, visual-heavy, conversion-driven.
 */
export const TEMPLATE_PRODUCT_BRAND: PageDocument = {
  version: 1,
  theme: {
    style: 'premium-minimal',
    primaryColor: '#1A1A1A',
    radius: 'small',
    density: 'spacious',
  },
  settings: { showFooterBranding: true },
  sections: [
    // 1. Hero — Split
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'split',
      layout: 'left',
      isHidden: false,
      content: {
        eyebrow: 'NEW COLLECTION',
        title: 'Forma',
        headline: 'Objects designed for everyday rituals.',
        subtitle: 'Minimal products made with better materials and fewer compromises.',
        buttonText: 'Shop the collection',
        buttonUrl: '#products',
        secondaryButtonText: 'Learn more',
        secondaryButtonUrl: '#richtext',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
      },
    },

    // 2. Marquee
    {
      id: 'marquee-1',
      type: 'marquee',
      layout: 'right',
      variant: 'premium',
      isHidden: false,
      content: {
        text: 'NEW DROP · LIMITED RUN · FREE SHIPPING',
      },
    },

    // 3. Products
    {
      id: 'products-1',
      type: 'products',
      variant: 'magic-card',
      isHidden: false,
      content: {
        title: 'The collection',
        items: [
          { id: 'p-1', title: 'Ritual Mug', description: 'Hand-finished ceramic mug. 12oz.', price: '$48', imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80' },
          { id: 'p-2', title: 'Desk Organizer', description: 'Solid oak desk tray with felt lining.', price: '$72', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80' },
          { id: 'p-3', title: 'Incense Holder', description: 'Concrete incense holder with brass detail.', price: '$36', imageUrl: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=500&q=80' },
          { id: 'p-4', title: 'Linen Notebook', description: 'Linen-bound notebook with 180gsm pages.', price: '$28', imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&q=80' },
        ],
      },
    },

    // 4. Video & Story - Asymmetric
    {
      id: 'video-1',
      type: 'video',
      variant: 'blur-fade',
      isHidden: false,
      content: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'The Forma Story',
      },
    },
    {
      id: 'richtext-1',
      type: 'rich-text',
      variant: 'asymmetric',
      isHidden: false,
      content: {
        text: '<h2 class="font-serif">Why Forma</h2><p>We started Forma because we were tired of choosing between things that look good and things that last. Every Forma product is designed to be used daily, built from materials that age well, and produced in small batches to minimize waste. No logos, no trends — just thoughtful design for everyday life.</p>',
      },
    },

    // 5. Testimonials
    {
      id: 'testimonials-1',
      type: 'testimonials',
      variant: 'magic-card',
      isHidden: false,
      content: {
        title: 'What people are saying',
        items: [
          { id: 't-1', quote: 'The quality is immediately obvious. These feel like objects you\'ll keep for years.', author: 'Emma L.', role: 'Verified Buyer' },
          { id: 't-2', quote: 'Finally, products that look as good in person as they do online. No tricks, just good design.', author: 'Jason Park', role: 'Verified Buyer' },
          { id: 't-3', quote: 'I bought the mug as a gift and ended up ordering one for myself the same week.', author: 'Sofia R.', role: 'Verified Buyer' },
        ],
      },
    },

    // 6. Collect Emails
    {
      id: 'collect-emails-1',
      type: 'collect-emails',
      variant: 'spacious',
      isHidden: false,
      content: {
        title: 'Get early access',
        placeholder: 'your@email.com',
        buttonText: 'Join the list',
        successMessage: 'You\'re on the list! We\'ll notify you before the next drop.',
      },
    },

    // 7. FAQ
    {
      id: 'faq-1',
      type: 'faq',
      variant: 'spacious',
      isHidden: false,
      content: {
        title: 'FAQ',
        items: [
          { id: 'q-1', question: 'How long does shipping take?', answer: 'Domestic orders ship within 2–3 business days. International orders take 7–14 business days.' },
          { id: 'q-2', question: 'What is your return policy?', answer: 'We accept returns within 30 days of delivery. Items must be unused and in original packaging.' },
          { id: 'q-3', question: 'What materials do you use?', answer: 'We use sustainably sourced oak, hand-finished ceramics, brass hardware, and natural linens. Full material details on each product page.' },
          { id: 'q-4', question: 'Do you offer custom sizing?', answer: 'Not at this time — but we\'re working on it. Sign up for updates.' },
          { id: 'q-5', question: 'How do I care for my products?', answer: 'Each order includes a care card. Generally: wipe with a damp cloth, avoid prolonged moisture, and let wood pieces breathe.' },
        ],
      },
    },
    
    // 8. Contact (Minimal Footer)
    {
      id: 'contact-1',
      type: 'contact',
      variant: 'minimal-footer',
      isHidden: false,
      content: {
        title: '',
        email: 'hello@formabrand.com',
        address: 'San Francisco, CA',
      },
    },
  ],
};

/**
 * 6. Professional Service
 * For agencies, consultants, coaches, B2B service providers.
 * Hero: Asymmetric — authoritative, structured, business-focused.
 */
export const TEMPLATE_PROFESSIONAL_SERVICE: PageDocument = {
  version: 1,
  theme: {
    style: 'premium-minimal',
    primaryColor: '#0f172a',
    radius: 'small',
    density: 'spacious',
  },
  settings: { showFooterBranding: true },
  sections: [
    // 1. Hero — Asymmetric
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'asymmetric',
      layout: 'center',
      isHidden: false,
      content: {
        eyebrow: 'STRATEGY · DESIGN · GROWTH',
        title: 'North & Co.',
        headline: 'We help ambitious companies turn ideas into growth.',
        subtitle: 'Strategy, branding, and digital execution for companies ready for their next stage.',
        buttonText: 'Book a consultation',
        buttonUrl: '#lead-form',
        secondaryButtonText: 'See our work',
        secondaryButtonUrl: '#carousel',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      },
    },

    // 2. Social Links
    {
      id: 'social-1',
      type: 'social-links',
      variant: 'default',
      layout: 'row',
      isHidden: false,
      content: {
        links: [
          { id: 'sl-1', platform: 'LinkedIn', url: 'https://linkedin.com' },
          { id: 'sl-2', platform: 'Twitter', url: 'https://x.com' },
          { id: 'sl-3', platform: 'Instagram', url: 'https://instagram.com' },
        ],
      },
    },

    // 3. Rich Text — What we do
    {
      id: 'richtext-1',
      type: 'rich-text',
      variant: 'split',
      isHidden: false,
      content: {
        text: '<h2>What we do</h2><p>We partner with founders and leadership teams to clarify their positioning, sharpen their brand, and build digital experiences that convert. From early-stage startups to established companies entering new markets — we help you move faster with more confidence.</p>',
      },
    },

    // 4. Services
    {
      id: 'services-1',
      type: 'services',
      variant: 'reflective',
      isHidden: false,
      content: {
        title: 'Our services',
        items: [
          { id: 's-1', title: 'Strategy', description: 'Market positioning, competitive analysis, and go-to-market planning.' },
          { id: 's-2', title: 'Brand', description: 'Visual identity, messaging, and brand systems that scale.' },
          { id: 's-3', title: 'Web Design', description: 'High-converting websites and landing pages built for growth.' },
          { id: 's-4', title: 'Growth', description: 'SEO, content strategy, and paid acquisition to drive qualified leads.' },
        ],
      },
    },

    // 5. Timeline — Process
    {
      id: 'timeline-1',
      type: 'timeline',
      isHidden: false,
      content: {
        title: 'How we work',
        items: [
          { id: 'tl-1', label: 'Discover', description: 'We start by understanding your business, goals, audience, and competitive landscape.' },
          { id: 'tl-2', label: 'Strategy', description: 'We define positioning, messaging, and a clear execution roadmap.' },
          { id: 'tl-3', label: 'Build', description: 'We design and develop your brand, website, and growth systems.' },
          { id: 'tl-4', label: 'Launch', description: 'We launch, measure, and iterate based on real data.' },
        ],
      },
    },

    // 6. Carousel — Case studies
    {
      id: 'carousel-1',
      type: 'carousel',
      variant: 'flex',
      isHidden: false,
      content: {
        images: [
          { id: 'c-1', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', caption: 'Relay — SaaS Rebrand' },
          { id: 'c-2', url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80', caption: 'Forma — Ecommerce Launch' },
          { id: 'c-3', url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80', caption: 'Arclight — Brand Identity' },
          { id: 'c-4', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', caption: 'Meridian — Website Redesign' },
        ],
      },
    },

    // 7. Testimonials
    {
      id: 'testimonials-1',
      type: 'testimonials',
      isHidden: false,
      content: {
        title: 'Client testimonials',
        items: [
          { id: 't-1', quote: 'North & Co. helped us go from an idea on a whiteboard to a fully launched brand in 8 weeks. Their process is incredibly efficient.', author: 'Lisa Park', role: 'CEO, Relay' },
          { id: 't-2', quote: 'They don\'t just make things look good — they think about the business behind every design decision. That\'s rare.', author: 'Omar Hassan', role: 'Founder, Meridian' },
          { id: 't-3', quote: 'Our conversion rate doubled within the first month after launch. The ROI speaks for itself.', author: 'Anna Chen', role: 'Head of Marketing, Arclight' },
        ],
      },
    },

    // 8. Lead Form
    {
      id: 'lead-form-1',
      type: 'lead-form',
      isHidden: false,
      content: {
        title: 'Let\'s talk',
        description: 'Tell us about your project and we\'ll schedule a free strategy call.',
        buttonText: 'Book a consultation',
        successMessage: 'Thanks! We\'ll be in touch within one business day.',
      },
    },

    // 9. FAQ
    {
      id: 'faq-1',
      type: 'faq',
      isHidden: false,
      content: {
        title: 'Common questions',
        items: [
          { id: 'q-1', question: 'How much do your services cost?', answer: 'Projects typically range from $10,000 to $50,000+ depending on scope. We provide a detailed proposal after our initial call.' },
          { id: 'q-2', question: 'How long does a typical project take?', answer: 'Most projects run 6–12 weeks from kickoff to launch. We\'ll give you a clear timeline during the strategy phase.' },
          { id: 'q-3', question: 'What does your process look like?', answer: 'Discovery → Strategy → Design → Build → Launch. We keep you involved at every stage with regular check-ins and reviews.' },
          { id: 'q-4', question: 'Do you work with early-stage startups?', answer: 'Yes — we work with companies at every stage. We have packages specifically designed for pre-launch and seed-stage companies.' },
          { id: 'q-5', question: 'Can we work together remotely?', answer: 'Absolutely. Most of our clients are remote. We use Notion, Figma, Slack, and regular video calls to stay aligned.' },
        ],
      },
    },

    // 10. Contact
    {
      id: 'contact-1',
      type: 'contact',
      isHidden: false,
      content: {
        title: 'Get in touch',
        email: 'hello@northandco.com',
        phone: '+1 (555) 000-0000',
        address: 'New York, NY',
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
