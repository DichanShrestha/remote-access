import { SectionType } from './schemas';

// Intent-based categories matching the UI design
export type ComponentCategory = 'popular' | 'share' | 'showcase' | 'story' | 'connect' | 'trust' | 'organize';

export type ComponentMetadata = {
  type: SectionType;
  label: string;
  category: ComponentCategory;
  categories: ComponentCategory[]; // can appear in multiple tabs
  defaultData: () => Partial<any>;
};

export const CATEGORY_INFO: Record<ComponentCategory, { label: string }> = {
  popular:  { label: 'Popular' },
  share:    { label: 'Share resources' },
  showcase: { label: 'Showcase my work' },
  story:    { label: 'Tell my story' },
  connect:  { label: 'Connect with visitors' },
  trust:    { label: 'Build trust' },
  organize: { label: 'Organize my page' },
};

export const ComponentRegistry: Record<SectionType, ComponentMetadata> = {
  // ── Popular / Core ──────────────────────────────────────────
  'hero': {
    type: 'hero', label: 'Hero / Profile', category: 'popular',
    categories: ['popular'],
    defaultData: () => ({
      type: 'hero',
      variant: 'editorial-center',
      layout: 'center',
      content: {
        eyebrow: 'Designer · Developer · Creator',
        title: 'Alex Morgan',
        headline: 'Building digital products that people love',
        subtitle: 'Product designer and creative developer based in San Francisco. Helping startups and brands craft meaningful digital experiences.',
        buttonText: 'Get in Touch',
        buttonUrl: '#contact',
        secondaryButtonText: 'View Work',
        secondaryButtonUrl: '#portfolio',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        location: 'San Francisco, CA',
        badge: 'Available for work',
      },
    }),
  },
  'url-button': {
    type: 'url-button', label: 'URL Button', category: 'popular',
    categories: ['popular', 'share'],
    defaultData: () => ({ type: 'url-button', layout: 'filled', content: { label: 'Visit my shop', url: 'https://example.com' } }),
  },
  'image-button': {
    type: 'image-button', label: 'Image Button', category: 'popular',
    categories: ['popular', 'showcase'],
    defaultData: () => ({ type: 'image-button', content: { imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=600', label: 'View Collection', url: '#' } }),
  },
  'video': {
    type: 'video', label: 'Video', category: 'popular',
    categories: ['popular', 'showcase'],
    defaultData: () => ({ type: 'video', content: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } }),
  },
  'rich-text': {
    type: 'rich-text', label: 'Text', category: 'popular',
    categories: ['popular', 'story'],
    defaultData: () => ({ type: 'rich-text', content: { text: '<p>A little about me and what I do. Share your story, your mission, or anything you want your visitors to know.</p>' } }),
  },
  'lead-form': {
    type: 'lead-form', label: 'Form', category: 'popular',
    categories: ['popular', 'connect'],
    defaultData: () => ({ type: 'lead-form', content: { title: 'Send me a message', buttonText: 'Send message', successMessage: 'Thanks! I\'ll get back to you soon.' } }),
  },
  'collect-emails': {
    type: 'collect-emails', label: 'Collect Emails', category: 'popular',
    categories: ['popular', 'connect'],
    defaultData: () => ({ type: 'collect-emails', content: { title: 'Stay in the loop', placeholder: 'Your email', buttonText: 'Subscribe', successMessage: 'You\'re subscribed!' } }),
  },

  // ── Share resources ─────────────────────────────────────────
  'email-button': {
    type: 'email-button', label: 'Email Button', category: 'share',
    categories: ['share'],
    defaultData: () => ({ type: 'email-button', content: { label: 'Email me', email: 'hello@example.com', subject: 'Hello!' } }),
  },
  'file-button': {
    type: 'file-button', label: 'File Button', category: 'share',
    categories: ['share'],
    defaultData: () => ({ type: 'file-button', content: { label: 'Download my guide', fileUrl: '#', fileName: 'guide.pdf' } }),
  },
  'link-list': {
    type: 'link-list', label: 'Link List', category: 'share',
    categories: ['share'],
    defaultData: () => ({ type: 'link-list', content: { links: [{ id: '1', label: 'My Website', url: 'https://example.com' }] } }),
  },

  // ── Showcase my work ────────────────────────────────────────
  'image': {
    type: 'image', label: 'Image', category: 'showcase',
    categories: ['showcase'],
    defaultData: () => ({ type: 'image', layout: 'contained', content: { url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1200' } }),
  },
  'gallery': {
    type: 'gallery', label: 'Gallery', category: 'showcase',
    categories: ['showcase'],
    defaultData: () => ({ type: 'gallery', layout: 'grid', content: { images: [] } }),
  },
  'carousel': {
    type: 'carousel', label: 'Carousel', category: 'showcase',
    categories: ['showcase'],
    defaultData: () => ({ type: 'carousel', content: { images: [] } }),
  },
  'audio': {
    type: 'audio', label: 'Audio', category: 'showcase',
    categories: ['showcase'],
    defaultData: () => ({ type: 'audio', content: { url: '', title: 'My Track', artist: 'Artist Name' } }),
  },
  'resume': {
    type: 'resume', label: 'Resume', category: 'showcase',
    categories: ['showcase'],
    defaultData: () => ({ type: 'resume', content: { title: 'Experience', items: [{ id: '1', role: 'Designer', company: 'Studio Co.', period: '2022–today', description: 'Led product design.' }] } }),
  },
  'products': {
    type: 'products', label: 'Products', category: 'showcase',
    categories: ['showcase', 'trust'],
    defaultData: () => ({ type: 'products', content: { title: 'Shop', items: [{ id: '1', title: 'Product', description: 'Great product.', price: '$99' }] } }),
  },

  // ── Tell my story ───────────────────────────────────────────
  'quote': {
    type: 'quote', label: 'Quote', category: 'story',
    categories: ['story'],
    defaultData: () => ({ type: 'quote', content: { text: 'So glad we worked together.', author: '' } }),
  },
  'marquee': {
    type: 'marquee', label: 'Marquee', category: 'story',
    categories: ['story', 'organize'],
    defaultData: () => ({ type: 'marquee', layout: 'left', content: { text: 'NEW COLLECTION · NEW COLLECTION · NEW COLLECTION' } }),
  },
  'timeline': {
    type: 'timeline', label: 'Timeline', category: 'story',
    categories: ['story'],
    defaultData: () => ({ type: 'timeline', content: { title: 'My Journey', items: [{ id: '1', label: 'Discover', description: 'Finding my passion.' }, { id: '2', label: 'Create', description: 'Building something new.' }, { id: '3', label: 'Launch', description: 'Sharing it with the world.' }] } }),
  },
  'announcement': {
    type: 'announcement', label: 'Announcement', category: 'story',
    categories: ['story', 'organize'],
    defaultData: () => ({ type: 'announcement', content: { text: '🎉 Big news! We just launched.' } }),
  },

  // ── Connect with visitors ───────────────────────────────────
  'social-links': {
    type: 'social-links', label: 'Follow', category: 'connect',
    categories: ['connect'],
    defaultData: () => ({ type: 'social-links', layout: 'row', content: { links: [{ id: '1', platform: 'Instagram', url: '#' }, { id: '2', platform: 'TikTok', url: '#' }, { id: '3', platform: 'Twitter', url: '#' }] } }),
  },
  'donate': {
    type: 'donate', label: 'Donate', category: 'connect',
    categories: ['connect'],
    defaultData: () => ({ type: 'donate', content: { title: 'Support my work', links: [{ id: '1', platform: 'PayPal', url: '#' }, { id: '2', platform: 'Venmo', url: '#' }] } }),
  },
  'countdown': {
    type: 'countdown', label: 'Countdown', category: 'connect',
    categories: ['connect'],
    defaultData: () => ({ type: 'countdown', content: { title: 'Launching soon', targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) } }),
  },
  'booking': {
    type: 'booking', label: 'Booking', category: 'connect',
    categories: ['connect'],
    defaultData: () => ({ type: 'booking', content: { title: 'Book a call', provider: 'cal.com', link: 'https://cal.com' } }),
  },
  'contact': {
    type: 'contact', label: 'Contact', category: 'connect',
    categories: ['connect'],
    defaultData: () => ({ type: 'contact', content: { title: 'Get in Touch', email: 'hello@example.com' } }),
  },

  // ── Build trust ─────────────────────────────────────────────
  'testimonials': {
    type: 'testimonials', label: 'Testimonials', category: 'trust',
    categories: ['trust'],
    defaultData: () => ({ type: 'testimonials', content: { title: 'What people say', items: [{ id: '1', quote: 'Amazing service!', author: 'Jane Doe' }] } }),
  },
  'faq': {
    type: 'faq', label: 'FAQ', category: 'trust',
    categories: ['trust'],
    defaultData: () => ({ type: 'faq', content: { title: 'Common Questions', items: [{ id: '1', question: 'What do you offer?', answer: 'We offer premium services.' }] } }),
  },
  'services': {
    type: 'services', label: 'Services', category: 'trust',
    categories: ['trust'],
    defaultData: () => ({ type: 'services', content: { title: 'Services', items: [{ id: '1', title: 'Consulting', description: 'Expert guidance.' }] } }),
  },
  'cta': {
    type: 'cta', label: 'CTA', category: 'trust',
    categories: ['trust', 'popular'],
    defaultData: () => ({ type: 'cta', content: { title: 'Ready to start?', buttonText: 'Get Started', buttonUrl: '#' } }),
  },
  'stats': {
    type: 'stats', label: 'Statistics', category: 'trust',
    categories: ['trust'],
    defaultData: () => ({
      type: 'stats',
      content: {
        title: 'Our Impact',
        items: [
          { id: '1', value: '1000', label: 'Users', suffix: '+' },
          { id: '2', value: '50', label: 'Projects', suffix: '+' },
        ]
      }
    })
  },

  // ── Organize my page ────────────────────────────────────────
  'divider': {
    type: 'divider', label: 'Divider', category: 'organize',
    categories: ['organize'],
    defaultData: () => ({ type: 'divider', layout: 'solid', content: {} }),
  },
  'spacer': {
    type: 'spacer', label: 'Spacer', category: 'organize',
    categories: ['organize'],
    defaultData: () => ({ type: 'spacer', layout: 'medium', content: {} }),
  },
};
