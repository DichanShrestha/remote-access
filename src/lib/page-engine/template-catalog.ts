import { TEMPLATES_MAP } from './templates';

export type TemplateCategory = 'CREATOR' | 'BUSINESS';

type TemplateDetails = {
  name: string;
  description: string;
  category: TemplateCategory;
  mood: string;
};

// Editorial metadata for the templates that currently exist in the renderer.
// The library itself is built by intersecting this catalog with TEMPLATES_MAP,
// so templates are never shown before their renderer document is available.
const details: Record<string, TemplateDetails> = {
  'creator-profile': { name: 'Creator Profile', description: 'A warm introduction, your best work, and a clear way to reach you.', category: 'CREATOR', mood: 'Personal · Editorial' },
  'creator-portfolio': { name: 'Creator Portfolio', description: 'A considered home for your portfolio, services, and next collaboration.', category: 'CREATOR', mood: 'Studio · Portfolio' },
  'creator-newsletter': { name: 'Creator Newsletter', description: 'Turn a passing visit into a reader who comes back each week.', category: 'CREATOR', mood: 'Writing · Community' },
  'editorial-portfolio': { name: 'Editorial Portfolio', description: 'A quiet, image-led portfolio made for independent creative work.', category: 'CREATOR', mood: 'Editorial · Artful' },
  'creator-fashion': { name: 'Fashion Creator', description: 'A personal style journal for outfit stories, travel notes, and favourite finds.', category: 'CREATOR', mood: 'Fashion · Editorial' },
  'creator-speaker': { name: 'Speaker & Author', description: 'Bring your talks, writing, audience stories, and booking details together.', category: 'CREATOR', mood: 'Ideas · Speaking' },
  'product-brand': { name: 'Product Brand', description: 'Bring your products, story, and launch links into a cohesive storefront.', category: 'BUSINESS', mood: 'Product · Modern' },
  'beauty-brand': { name: 'Beauty & Skincare', description: 'Showcase your routine, products, and customer love with clarity.', category: 'BUSINESS', mood: 'Beauty · Soft' },
  'luxury-skincare': { name: 'Luxury Skincare', description: 'A polished product story for premium skincare and daily rituals.', category: 'BUSINESS', mood: 'Beauty · Premium' },
  'restaurant': { name: 'Restaurant', description: 'Your menu, atmosphere, and booking details, ready to share.', category: 'BUSINESS', mood: 'Hospitality · Warm' },
  'corporate-consulting': { name: 'Corporate Consulting', description: 'Make your expertise, approach, and results easy to understand.', category: 'BUSINESS', mood: 'Consulting · Refined' },
  'point-architecture': { name: 'Point+ Architecture', description: 'A portfolio-led studio page for projects, services, and inquiries.', category: 'BUSINESS', mood: 'Architecture · Gallery' },
  'spa-salon': { name: 'Spa & Nail Salon', description: 'An editorial sanctuary template for luxury nail salons, wellness spas, and beauty studios.', category: 'BUSINESS', mood: 'Salon · Editorial' },
  'tattoo-artist': { name: 'Tattoo Artist', description: 'A dark editorial portfolio for custom tattoo work, the artist’s process, and appointment inquiries.', category: 'BUSINESS', mood: 'Blackwork · Editorial' },
};

export function getAvailableTemplates(category?: TemplateCategory) {
  return Object.entries(TEMPLATES_MAP)
    .filter(([id]) => Boolean(details[id]))
    .map(([id, document]) => ({ id, document, ...details[id] }))
    .filter((template) => !category || template.category === category);
}

export function getTemplateDetails(id: string) {
  if (!TEMPLATES_MAP[id] || !details[id]) return null;
  return { id, document: TEMPLATES_MAP[id], ...details[id] };
}
