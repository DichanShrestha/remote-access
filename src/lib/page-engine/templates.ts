import { PageDocument } from './schemas';

export const CREATOR_DEMO: PageDocument = {
  version: 1,
  theme: {
    style: 'premium-minimal',
    primaryColor: '#6366f1',
    radius: 'large',
    density: 'comfortable',
  },
  settings: { showFooterBranding: true },
  sections: [
    {
      id: 'hero-1', type: 'hero', isHidden: false, layout: 'center',
      content: {
        title: 'Sarah Chen',
        subtitle: 'Photographer · Visual Storyteller · Based in NYC',
        buttonText: 'View Portfolio',
        buttonUrl: '#gallery',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      },
    },
    {
      id: 'rich-1', type: 'rich-text', isHidden: false,
      content: { text: '<p>I capture moments that tell stories. With 8+ years behind the lens, I specialize in editorial, lifestyle, and brand photography that feels authentic and alive.</p>' },
    },
    {
      id: 'url-1', type: 'url-button', isHidden: false, layout: 'filled',
      content: { label: 'Shop My Presets', url: 'https://example.com/presets', description: 'Lightroom presets used on all my edits' },
    },
    {
      id: 'url-2', type: 'url-button', isHidden: false, layout: 'outline',
      content: { label: 'My Photography Course', url: 'https://example.com/course' },
    },
    {
      id: 'social-1', type: 'social-links', isHidden: false, layout: 'row',
      content: {
        links: [
          { id: 's1', platform: 'Instagram', url: 'https://instagram.com' },
          { id: 's2', platform: 'TikTok', url: 'https://tiktok.com' },
          { id: 's3', platform: 'YouTube', url: 'https://youtube.com' },
        ],
      },
    },
    {
      id: 'gallery-1', type: 'gallery', isHidden: false, layout: 'grid',
      content: {
        images: [
          { id: 'g1', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80', caption: 'Mountain Dawn' },
          { id: 'g2', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80', caption: 'Starry Night' },
          { id: 'g3', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80', caption: 'Lake Reflection' },
          { id: 'g4', url: 'https://images.unsplash.com/photo-1470071459604-3b5c5a7fc3a4?auto=format&fit=crop&w=600&q=80', caption: 'Forest Trail' },
          { id: 'g5', url: 'https://images.unsplash.com/photo-1518173946687-a8b9f9f2b8a5?auto=format&fit=crop&w=600&q=80', caption: 'Sunset Coast' },
          { id: 'g6', url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=600&q=80', caption: 'Wildflowers' },
        ],
      },
    },
    {
      id: 'video-1', type: 'video', isHidden: false,
      content: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Behind the Scenes' },
    },
    {
      id: 'resume-1', type: 'resume', isHidden: false,
      content: {
        title: 'Experience',
        items: [
          { id: 'r1', role: 'Lead Photographer', company: 'Vogue Italia', period: '2021–today', description: 'Editorial and fashion photography for print and digital.' },
          { id: 'r2', role: 'Freelance Photographer', company: 'Self-employed', period: '2018–2021', description: 'Built a client base of 200+ brands and individuals.' },
          { id: 'r3', role: 'Photo Assistant', company: 'Annie Leibovitz Studio', period: '2016–2018', description: 'Assisted on celebrity portraits and advertising campaigns.' },
        ],
      },
    },
    {
      id: 'services-1', type: 'services', isHidden: false,
      content: {
        title: 'What I Offer',
        items: [
          { id: 'sv1', title: 'Portrait Session', description: '1-hour outdoor or studio session with 20 edited images.', price: 'From $350' },
          { id: 'sv2', title: 'Brand Photography', description: 'Half-day shoot for your brand — products, lifestyle, team.', price: 'From $1,200' },
          { id: 'sv3', title: 'Event Coverage', description: 'Full event documentation with same-week delivery.', price: 'From $2,000' },
        ],
      },
    },
    {
      id: 'quote-1', type: 'quote', isHidden: false,
      content: { text: 'Every photograph is a story frozen in time.', author: 'Sarah Chen' },
    },
    {
      id: 'testimonials-1', type: 'testimonials', isHidden: false,
      content: {
        title: 'Kind Words',
        items: [
          { id: 't1', quote: 'Sarah made us feel so comfortable. The photos were beyond our expectations!', author: 'Emily & James', role: 'Wedding clients' },
          { id: 't2', quote: 'Our product shots elevated our entire brand. Working with Sarah was seamless.', author: 'Marcus Liu', role: 'Founder, Aura Skincare' },
        ],
      },
    },
    {
      id: 'collect-1', type: 'collect-emails', isHidden: false,
      content: { title: 'Join my newsletter', placeholder: 'your@email.com', buttonText: 'Subscribe', successMessage: 'Welcome aboard!' },
    },
    {
      id: 'booking-1', type: 'booking', isHidden: false,
      content: { title: 'Book a Session', description: 'Let\'s chat about your project.', provider: 'cal.com' as const, link: 'https://cal.com/sarahchen' },
    },
    {
      id: 'faq-1', type: 'faq', isHidden: false,
      content: {
        title: 'FAQ',
        items: [
          { id: 'f1', question: 'How far in advance should I book?', answer: '2-3 weeks minimum. For weddings, 6+ months.' },
          { id: 'f2', question: 'Do you travel?', answer: 'Yes! Travel fees apply outside the tri-state area.' },
        ],
      },
    },
    {
      id: 'contact-1', type: 'contact', isHidden: false,
      content: { title: 'Get in Touch', email: 'hello@sarahchen.photo', phone: '+1 (212) 555-0142' },
    },
  ],
};

export const BUSINESS_DEMO: PageDocument = {
  version: 1,
  theme: {
    style: 'bold',
    primaryColor: '#0ea5e9',
    radius: 'medium',
    density: 'comfortable',
  },
  settings: { showFooterBranding: true },
  sections: [
    {
      id: 'announce-1', type: 'announcement', isHidden: false,
      content: { text: '🎉 Now serving the greater Austin area!', url: '#booking', buttonText: 'Book Now' },
    },
    {
      id: 'hero-b1', type: 'hero', isHidden: false, layout: 'center',
      content: {
        title: 'Precision Home Renovations',
        subtitle: 'Award-winning kitchen, bath & full-home remodels in Austin, TX.',
        buttonText: 'Get a Free Quote',
        buttonUrl: '#lead-form',
      },
    },
    {
      id: 'marquee-b1', type: 'marquee', isHidden: false, layout: 'left',
      content: { text: 'TRUSTED BY 500+ HOMEOWNERS · LICENSED & BONDED · 15 YEARS EXPERIENCE' },
    },
    {
      id: 'timeline-b1', type: 'timeline', isHidden: false,
      content: {
        title: 'How It Works',
        items: [
          { id: 'tl1', label: 'Free Consultation', description: 'We visit your home and discuss your vision.' },
          { id: 'tl2', label: 'Design & Quote', description: 'Our team creates a detailed plan and transparent quote.' },
          { id: 'tl3', label: 'Build & Transform', description: 'We handle everything while you watch your home transform.' },
        ],
      },
    },
    {
      id: 'services-b1', type: 'services', isHidden: false,
      content: {
        title: 'Our Services',
        items: [
          { id: 'bs1', title: 'Kitchen Remodels', description: 'Custom cabinetry, countertops, and appliance installation.', price: 'From $15,000' },
          { id: 'bs2', title: 'Bathroom Renovations', description: 'Walk-in showers, vanities, and tile work.', price: 'From $8,000' },
          { id: 'bs3', title: 'Outdoor Living', description: 'Decks, patios, pergolas, and outdoor kitchens.', price: 'From $12,000' },
        ],
      },
    },
    {
      id: 'image-b1', type: 'image-button', isHidden: false,
      content: { imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80', label: 'View Our Latest Project', url: '#' },
    },
    {
      id: 'products-b1', type: 'products', isHidden: false,
      content: {
        title: 'Featured Projects',
        items: [
          { id: 'bp1', title: 'Modern Farmhouse Kitchen', description: 'Complete gut renovation.', price: '$42,000', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80' },
          { id: 'bp2', title: 'Spa Bathroom Suite', description: 'Luxury master bath.', price: '$28,000', imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=400&q=80' },
          { id: 'bp3', title: 'Backyard Oasis', description: 'Custom deck + kitchen.', price: '$35,000', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80' },
        ],
      },
    },
    {
      id: 'testimonials-b1', type: 'testimonials', isHidden: false,
      content: {
        title: 'What Our Clients Say',
        items: [
          { id: 'bt1', quote: 'They finished our kitchen on time and on budget. Incredible attention to detail.', author: 'David Torres', role: 'Austin, TX' },
          { id: 'bt2', quote: 'Professional and communicative. Recommended to all my neighbors.', author: 'Jennifer Park', role: 'Round Rock, TX' },
        ],
      },
    },
    {
      id: 'countdown-b1', type: 'countdown', isHidden: false,
      content: { title: 'Spring Sale Ends In', targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) },
    },
    {
      id: 'lead-b1', type: 'lead-form', isHidden: false,
      content: { title: 'Get Your Free Quote', description: 'Tell us about your project.', buttonText: 'Request Quote', successMessage: 'Thanks! We\'ll be in touch within 24 hours.' },
    },
    {
      id: 'faq-b1', type: 'faq', isHidden: false,
      content: {
        title: 'FAQ',
        items: [
          { id: 'bf1', question: 'How long does a kitchen remodel take?', answer: '6-10 weeks depending on scope.' },
          { id: 'bf2', question: 'Do you handle permits?', answer: 'Yes, all permits and inspections are included.' },
          { id: 'bf3', question: 'What is your warranty?', answer: '5-year workmanship warranty on all projects.' },
        ],
      },
    },
    {
      id: 'contact-b1', type: 'contact', isHidden: false,
      content: { title: 'Visit Us', email: 'info@precisionrenovations.com', phone: '(512) 555-0198', address: '2847 South Lamar Blvd, Suite 200, Austin, TX 78704' },
    },
  ],
};
