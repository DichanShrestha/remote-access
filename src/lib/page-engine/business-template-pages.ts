import type { PageSection } from './schemas';
import type { CreatablePageType } from './page-types';

type BlueprintPage = {
  pageType: CreatablePageType;
  title: string;
  slug: string;
  sections: PageSection[];
};

const p = (section: PageSection): PageSection => section;

function page(
  pageType: CreatablePageType,
  title: string,
  slug: string,
  sections: PageSection[],
): BlueprintPage {
  return { pageType, title, slug, sections };
}

// ───────────────────────────────────────────────────────────────
// Restaurant — Osteria San Rocco
// ───────────────────────────────────────────────────────────────

const restaurantAbout = page('ABOUT', 'La nostra storia', 'about', [
  p({
    id: 'about-hero', type: 'hero', variant: 'restaurant-cover', layout: 'center', isHidden: false,
    content: {
      title: 'La nostra storia',
      buttonText: 'La nostra cucina',
      buttonUrl: '#cucina',
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1800&q=90',
    },
  }),
  p({
    id: 'cucina', type: 'feature-split', variant: 'restaurant-story', layout: 'image-left', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      eyebrow: 'La cucina',
      title: 'Una cucina di tradizione e passione',
      description: 'Ogni piatto nasce da ingredienti scelti con cura e da gesti che si tramandano da generazioni. La brace, la pasta fresca e la cantina sono il cuore della nostra tavola: una cucina semplice, fatta per essere condivisa.',
      imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=85',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=900&q=85',
      imageAlt: 'Bistecca appena grigliata',
      checkpoints: [],
    },
  }),
  p({
    id: 'valori', type: 'services', variant: 'restaurant-list', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      eyebrow: 'Quello che ci guida',
      title: 'I nostri valori',
      subtitle: 'Poche cose, fatte bene. È così che intendiamo la ristorazione.',
      items: [
        { id: 'valore-1', title: 'Ingredienti', description: 'Materie prime fresche, selezionate ogni giorno e trattate con rispetto.' },
        { id: 'valore-2', title: 'Tradizione', description: 'Ricette di famiglia e gesti tramandati, senza scorciatoie.' },
        { id: 'valore-3', title: 'Ospitalità', description: 'Un servizio attento, pensato perché ogni tavolo si senta a casa.' },
        { id: 'valore-4', title: 'Cantina', description: 'Etichette italiane scelte per accompagnare la cucina, dal bicchiere alla bottiglia.' },
      ],
    },
  }),
  p({
    id: 'cantina', type: 'feature-split', variant: 'restaurant-story', layout: 'image-right', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      eyebrow: 'La cantina',
      title: 'Il vino come parte del pasto',
      description: 'La nostra cantina riunisce etichette italiane selezionate, pensate per accompagnare la cucina di casa. Un bicchiere giusto può cambiare il ritmo di una cena.',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=85',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=85',
      imageAlt: 'Calici di vino in cantina',
      checkpoints: [],
    },
  }),
  p({
    id: 'about-quote', type: 'quote', variant: 'default', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      text: 'La semplicità degli ingredienti, la pazienza del tempo e l’ospitalità di casa: questa è la nostra cucina.',
      author: 'Osteria San Rocco',
    },
  }),
  p({
    id: 'booking', type: 'booking', variant: 'restaurant-reservation', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      title: 'Prenota un tavolo',
      description: 'Scegli il numero di ospiti, la data e l’orario.',
      provider: 'custom',
      link: 'mailto:info@osteriasanrocco.com',
      imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1100&q=85',
    },
  }),
]);

const restaurantMenu = page('PRODUCTS', 'Menu', 'menu', [
  p({
    id: 'menu-hero', type: 'hero', variant: 'restaurant-cover', layout: 'center', isHidden: false,
    content: {
      title: 'Menu',
      buttonText: 'Prenota un tavolo',
      buttonUrl: '#booking',
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1800&q=90',
    },
  }),
  p({
    id: 'menu-list', type: 'products', variant: 'restaurant-menu', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      title: 'Menu',
      menuImageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85',
      items: [
        { id: 'm1', category: 'Antipasti', title: 'Salumi misti e insalata russa', description: 'Selezione della casa con verdure fresche.', price: '€14' },
        { id: 'm2', category: 'Primi piatti', title: 'Tartare di limousin al coltello', description: 'Cipolla rossa caramellata e maionese.', price: '€15' },
        { id: 'm3', category: 'Primi piatti', title: 'Tortino di melanzane', description: 'Con pomodoro e salsa cremosa.', price: '€13' },
        { id: 'm4', category: 'Secondi piatti', title: 'Uovo poché con crema di patate', description: 'Al sentore di acciuga.', price: '€12' },
        { id: 'm5', category: 'Contorni', title: 'Acciughe del Mar Cantabrico', description: 'Con burro della Normandia e crostini.', price: '€15' },
      ],
    },
  }),
  p({
    id: 'menu-featured', type: 'carousel', variant: 'restaurant-featured', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      images: [
        { id: 'menu-dish-1', url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1500&q=85', caption: 'Gli antipasti' },
        { id: 'menu-dish-2', url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=85', caption: 'I secondi' },
        { id: 'menu-dish-3', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85', caption: 'I contorni' },
      ],
    },
  }),
  p({
    id: 'booking', type: 'booking', variant: 'restaurant-reservation', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      title: 'Prenota un tavolo',
      description: 'Scegli il numero di ospiti, la data e l’orario.',
      provider: 'custom',
      link: 'mailto:info@osteriasanrocco.com',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1100&q=85',
    },
  }),
]);

const restaurantReservations = page('CONTACT', 'Prenota un tavolo', 'reservations', [
  p({
    id: 'reservations-hero', type: 'hero', variant: 'restaurant-cover', layout: 'center', isHidden: false,
    content: {
      title: 'Prenota un tavolo',
      buttonText: 'Chiamaci',
      buttonUrl: 'tel:+39027659090',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=90',
    },
  }),
  p({
    id: 'booking', type: 'booking', variant: 'restaurant-reservation', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      title: 'Prenota un tavolo',
      description: 'Scegli il numero di ospiti, la data e l’orario. Vi risponderemo via email.',
      provider: 'custom',
      link: 'mailto:info@osteriasanrocco.com',
      imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1100&q=85',
    },
  }),
  p({
    id: 'sala', type: 'feature-split', variant: 'restaurant-story', layout: 'image-left', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      eyebrow: 'La sala',
      title: 'Un tavolo per ogni occasione',
      description: 'Dalla cena in due al tavolo più grande per una serata con amici: la sala è pensata per stare insieme, con il tempo giusto per assaporare ogni portata.',
      imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1200&q=85',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=85',
      imageAlt: 'La sala dell’osteria',
      checkpoints: [],
    },
  }),
  p({
    id: 'reservation-info', type: 'faq', variant: 'spacious', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      title: 'Buono a sapersi',
      items: [
        { id: 'info-1', question: 'Quando siete aperti?', answer: 'Mercoledì – Domenica: 12:30–14:30 e 19:00–23:30. Lunedì e Martedì siamo chiusi.' },
        { id: 'info-2', question: 'Dove vi troviamo?', answer: 'Via Roma 2, 20154 Milano. Per parlarci direttamente, chiamate il 02 765 9090.' },
        { id: 'info-3', question: 'Come funziona la prenotazione?', answer: 'Scegliete il numero di ospiti, la data e l’orario qui sopra. La richiesta viene inviata via email e vi confermiamo la disponibilità.' },
      ],
    },
  }),
]);

const restaurantGallery = page('GALLERY', 'Gallery', 'gallery', [
  p({
    id: 'gallery-hero', type: 'hero', variant: 'restaurant-cover', layout: 'center', isHidden: false,
    content: {
      title: 'Gallery',
      buttonText: 'Prenota un tavolo',
      buttonUrl: '#booking',
      imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1800&q=90',
    },
  }),
  p({
    id: 'gallery', type: 'gallery', variant: 'restaurant-gallery', layout: 'masonry', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      eyebrow: 'Uno sguardo',
      title: 'La sala, i piatti, i dettagli',
      description: 'Uno sguardo alla nostra tavola: la sala, la cucina e i piatti che arrivano in tavola ogni giorno.',
      images: [
        { id: 'g1', url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=85', caption: 'La sala' },
        { id: 'g2', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=85', caption: 'La pasta fresca' },
        { id: 'g3', url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1100&q=85', caption: 'La brace' },
        { id: 'g4', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1100&q=85', caption: 'La cantina' },
        { id: 'g5', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1100&q=85', caption: 'La cucina' },
        { id: 'g6', url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=900&q=85', caption: 'Il servizio' },
        { id: 'g7', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1100&q=85', caption: 'I dettagli' },
        { id: 'g8', url: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=900&q=85', caption: 'Le mani' },
      ],
    },
  }),
  p({
    id: 'booking', type: 'booking', variant: 'restaurant-reservation', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      title: 'Prenota un tavolo',
      description: 'Scegli il numero di ospiti, la data e l’orario.',
      provider: 'custom',
      link: 'mailto:info@osteriasanrocco.com',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1100&q=85',
    },
  }),
]);

// ───────────────────────────────────────────────────────────────
// Corporate consulting — Northstar Advisory
// ───────────────────────────────────────────────────────────────

const corporateAbout = page('ABOUT', 'About us', 'about', [
  p({
    id: 'about-hero', type: 'hero', variant: 'split', layout: 'split', isHidden: false,
    backgroundColor: '#f5f2f0',
    content: {
      eyebrow: 'About us',
      title: 'About Northstar',
      subtitle: 'Independent financial guidance for businesses building for the long term.',
      buttonText: 'Free consultation',
      buttonUrl: '#contact',
      secondaryButtonText: 'Our approach',
      secondaryButtonUrl: '#approach',
      imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=85&w=1400',
    },
  }),
  p({
    id: 'approach', type: 'feature-split', variant: 'editorial', layout: 'image-right', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      eyebrow: 'Our approach',
      title: 'Independent advice, built around your business',
      description: 'We work alongside founders and finance teams to make the next decision clearer. No generic playbooks: every engagement starts with your numbers, your market, and the outcome you are working toward.',
      checkpoints: [
        { id: 'approach-1', text: 'A clear view of the decision in front of you' },
        { id: 'approach-2', text: 'Practical recommendations your team can own' },
        { id: 'approach-3', text: 'Support through implementation, not just analysis' },
      ],
      buttonText: 'Talk to us',
      buttonUrl: '#contact',
      imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=85&w=1000',
      imageAlt: 'Consultants working through a financial plan',
    },
  }),
  p({
    id: 'how-we-work', type: 'services', variant: 'corporate-index', isHidden: false,
    backgroundColor: '#f5f2f0',
    content: {
      eyebrow: 'How we work',
      title: 'Three steps, one clear plan',
      subtitle: 'A focused process that keeps the work practical, measurable, and aligned with your team.',
      items: [
        { id: 'work-1', tag: 'Understand', title: 'Diagnose the decision', description: 'We start with the question that matters most, then map the financial and operational context around it.' },
        { id: 'work-2', tag: 'Design', title: 'Build the plan', description: 'Together we shape a clear set of options, with the trade-offs and assumptions written down.' },
        { id: 'work-3', tag: 'Deliver', title: 'Stay through implementation', description: 'We help your team put the plan into practice and adjust it as the business moves.' },
      ],
    },
  }),
  p({
    id: 'commitment', type: 'quote', variant: 'default', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      text: 'Good financial advice should leave your team more confident about the next decision, not more dependent on us.',
      author: 'Northstar Advisory',
    },
  }),
  p({
    id: 'contact', type: 'lead-form', variant: 'editorial-panel', isHidden: false,
    backgroundColor: '#062f26', textColor: '#ffffff', buttonColor: '#f5f2f0', buttonTextColor: '#093326',
    content: {
      title: 'Tell us where you want to go',
      description: 'Share the decision in front of you and the goals you are working toward. We will help you decide whether we are the right partner.',
      buttonText: 'Request a consultation',
      successMessage: 'Thank you. We will be in touch shortly.',
      nameLabel: 'Name',
      contactLabel: 'Work email',
      messageLabel: 'What are you working on?',
      messagePlaceholder: 'A short note about the decision or goal in front of you…',
    },
  }),
]);

const corporateServices = page('SERVICES', 'Services', 'services', [
  p({
    id: 'services-hero', type: 'hero', variant: 'split', layout: 'split', isHidden: false,
    backgroundColor: '#062f26', textContrast: 'light', buttonColor: '#f5f2f0', buttonTextColor: '#093326',
    content: {
      eyebrow: 'Services',
      title: 'Financial guidance for every stage',
      subtitle: 'Planning, analysis, and investment advice shaped around the realities of your business.',
      buttonText: 'Request a consultation',
      buttonUrl: '#contact',
      imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=85&w=1400',
    },
  }),
  p({
    id: 'services', type: 'services', variant: 'corporate-index', isHidden: false,
    backgroundColor: '#f5f2f0',
    content: {
      eyebrow: 'What we do',
      title: 'Three disciplines, one clear plan',
      subtitle: 'Each service can stand alone, or come together as an ongoing advisory relationship.',
      items: [
        {
          id: 'service-planning', tag: 'Financial planning', title: 'A roadmap for the next chapter',
          description: 'We turn your objectives into a practical plan for capital, cash flow, and the decisions ahead. Every assumption is written down, tested, and aligned with the way your business actually operates.',
          buttonText: 'Talk to us', buttonUrl: '#contact',
        },
        {
          id: 'service-analysis', tag: 'Performance analysis', title: 'A clear read on what is working',
          description: 'We look at the numbers behind margin, growth, and efficiency, then identify the few levers that will make the biggest difference. The output is a focused set of actions, not a dashboard to decipher.',
          buttonText: 'Talk to us', buttonUrl: '#contact',
        },
        {
          id: 'service-advisory', tag: 'Investment advisory', title: 'A considered view of risk and return',
          description: 'We help you weigh opportunity against downside, with a portfolio and timing approach that fits your priorities. The goal is durable progress, not unnecessary complexity.',
          buttonText: 'Talk to us', buttonUrl: '#contact',
        },
      ],
    },
  }),
  p({
    id: 'engagement', type: 'feature-split', variant: 'editorial', layout: 'image-left', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      eyebrow: 'How we work',
      title: 'A partnership, not a one-off report',
      description: 'Good advice is measured by what it changes. We stay close enough to see the plan through, and honest enough to tell you when the plan should change.',
      checkpoints: [
        { id: 'engagement-1', text: 'A focused conversation about the decision in front of you' },
        { id: 'engagement-2', text: 'Recommendations documented, practical, and owned with you' },
        { id: 'engagement-3', text: 'Support through implementation, not just the analysis' },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=85&w=1000',
      imageAlt: 'Advisor reviewing a plan with a client',
    },
  }),
  p({
    id: 'faq', type: 'faq', variant: 'corporate-list', isHidden: false,
    backgroundColor: '#f5f2f0',
    content: {
      eyebrow: 'FAQ',
      title: 'Questions before we begin',
      subtitle: 'A few practical answers about how an engagement works.',
      items: [
        { id: 'faq-1', question: 'How can financial consulting benefit my business?', answer: 'Our consulting optimizes strategies for sustainable growth and improved financial performance.' },
        { id: 'faq-2', question: 'What distinguishes your firm from others in the industry?', answer: 'We pair deep industry experience with tailored, practical financial guidance.' },
        { id: 'faq-3', question: 'Do you offer services tailored to specific industries?', answer: 'Yes. Our team adapts each engagement to your industry, goals, and operating context.' },
        { id: 'faq-4', question: 'How do you ensure confidentiality with client data?', answer: 'We use secure processes and clear governance to protect all client information.' },
        { id: 'faq-5', question: 'What does a first engagement look like?', answer: 'We begin with a focused conversation about your goals, constraints, and the decision in front of you. From there we agree on scope, timeline, and how progress will be measured.' },
        { id: 'faq-6', question: 'How do you work with our existing finance team?', answer: 'We work alongside your team, sharing analysis and recommendations so decisions stay aligned and implementation stays practical.' },
      ],
    },
  }),
  p({
    id: 'contact', type: 'lead-form', variant: 'editorial-panel', isHidden: false,
    backgroundColor: '#062f26', textColor: '#ffffff', buttonColor: '#f5f2f0', buttonTextColor: '#093326',
    content: {
      title: 'Request a consultation',
      description: 'A short conversation is usually enough to know whether we can help.',
      buttonText: 'Send request',
      successMessage: 'Thank you. We will be in touch shortly.',
      nameLabel: 'Name',
      contactLabel: 'Work email',
      messageLabel: 'What are you working on?',
      messagePlaceholder: 'A short note about the decision or goal in front of you…',
    },
  }),
]);

const corporateClientStories = page('GALLERY', 'Client stories', 'gallery', [
  p({
    id: 'stories-hero', type: 'hero', variant: 'split', layout: 'split', isHidden: false,
    backgroundColor: '#f5f2f0',
    content: {
      eyebrow: 'Client stories',
      title: 'Progress, in their words',
      subtitle: 'A closer look at the work behind the numbers.',
      buttonText: 'Start a conversation',
      buttonUrl: '#contact',
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=85&w=1400',
    },
  }),
  p({
    id: 'stories', type: 'case-studies', variant: 'editorial-rows', isHidden: false,
    backgroundColor: '#f5f2f0',
    content: {
      title: 'Selected client work',
      actionText: 'Start a conversation',
      actionUrl: '#contact',
      items: [
        {
          id: 'story-1', category: 'Growth', title: 'Identifying growth opportunities for Prosper',
          description: 'A structured review of pricing, cash flow, and the opportunities the team had not yet built into its plan.',
          imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=85&w=900',
          url: '#contact', buttonText: 'Talk to us',
        },
        {
          id: 'story-2', category: 'Compliance', title: 'Helping SummitEdge navigate regulatory change',
          description: 'Working alongside leadership to translate new requirements into a clear, workable operating plan.',
          imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=85&w=900',
          url: '#contact', buttonText: 'Talk to us',
        },
        {
          id: 'story-3', category: 'Efficiency', title: 'Improving EvolveVision’s operating rhythm',
          description: 'A closer look at reporting cadence and the decisions it supports, with a simpler path from data to action.',
          imageUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=85&w=900',
          url: '#contact', buttonText: 'Talk to us',
        },
      ],
    },
  }),
  p({
    id: 'contact', type: 'lead-form', variant: 'editorial-panel', isHidden: false,
    backgroundColor: '#062f26', textColor: '#ffffff', buttonColor: '#f5f2f0', buttonTextColor: '#093326',
    content: {
      title: 'Your story could be next',
      description: 'Tell us what you are building and where you want to take it.',
      buttonText: 'Start the conversation',
      successMessage: 'Thank you. We will be in touch shortly.',
      nameLabel: 'Name',
      contactLabel: 'Work email',
      messageLabel: 'What are you working on?',
      messagePlaceholder: 'A short note about the decision or goal in front of you…',
    },
  }),
]);

const corporateFaq = page('FAQ', 'FAQs', 'faq', [
  p({
    id: 'faq-hero', type: 'hero', variant: 'split', layout: 'split', isHidden: false,
    backgroundColor: '#f5f2f0',
    content: {
      eyebrow: 'FAQ',
      title: 'Clear answers, before you commit',
      subtitle: 'Practical notes on how we work, what to expect, and how to get started.',
      buttonText: 'Book a consultation',
      buttonUrl: '#contact',
      imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=85&w=1200',
    },
  }),
  p({
    id: 'faq', type: 'faq', variant: 'corporate-list', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      eyebrow: 'Questions',
      title: 'Got a question? Get your answer',
      subtitle: 'If yours is not here, a short conversation is the fastest way to get clarity.',
      items: [
        { id: 'faq-1', question: 'How can financial consulting benefit my business?', answer: 'Our consulting optimizes strategies for sustainable growth and improved financial performance.' },
        { id: 'faq-2', question: 'What distinguishes your firm from others in the industry?', answer: 'We pair deep industry experience with tailored, practical financial guidance.' },
        { id: 'faq-3', question: 'Do you offer services tailored to specific industries?', answer: 'Yes. Our team adapts each engagement to your industry, goals, and operating context.' },
        { id: 'faq-4', question: 'How do you ensure confidentiality with client data?', answer: 'We use secure processes and clear governance to protect all client information.' },
        { id: 'faq-5', question: 'What does a first engagement look like?', answer: 'We begin with a focused conversation about your goals, constraints, and the decision in front of you. From there we agree on scope, timeline, and how progress will be measured.' },
        { id: 'faq-6', question: 'How do you work with our existing finance team?', answer: 'We work alongside your team, sharing analysis and recommendations so decisions stay aligned and implementation stays practical.' },
      ],
    },
  }),
  p({
    id: 'contact', type: 'lead-form', variant: 'editorial-panel', isHidden: false,
    backgroundColor: '#062f26', textColor: '#ffffff', buttonColor: '#f5f2f0', buttonTextColor: '#093326',
    content: {
      title: 'Still deciding?',
      description: 'Bring the question. We will tell you honestly whether we can help.',
      buttonText: 'Book a consultation',
      successMessage: 'Thank you. We will be in touch shortly.',
      nameLabel: 'Name',
      contactLabel: 'Work email',
      messageLabel: 'Your question',
      messagePlaceholder: 'What would you like to understand better?',
    },
  }),
]);

const corporateContact = page('CONTACT', 'Contact', 'contact', [
  p({
    id: 'contact-hero', type: 'hero', variant: 'split', layout: 'split', isHidden: false,
    backgroundColor: '#f5f2f0',
    content: {
      eyebrow: 'Contact',
      title: 'Let’s talk about your next move',
      subtitle: 'Share the decision in front of you and the goals you are working toward.',
      buttonText: 'Email us',
      buttonUrl: 'mailto:hello@northstaradvisory.com',
      imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=85&w=1400',
    },
  }),
  p({
    id: 'details', type: 'contact', variant: 'corporate-details', isHidden: false,
    backgroundColor: '#062f26',
    content: {
      eyebrow: 'Contact',
      title: 'Start with a conversation',
      description: 'Tell us what you are working toward. We will respond with a clear next step, not a sales pitch.',
      email: 'hello@northstaradvisory.com',
      phone: '+1 (212) 555-0142',
    },
  }),
  p({
    id: 'contact', type: 'lead-form', variant: 'editorial-panel', isHidden: false,
    backgroundColor: '#f5f2f0',
    content: {
      title: 'Request a consultation',
      description: 'A short note is enough to start. We will come back to you with a time to talk.',
      buttonText: 'Send request',
      successMessage: 'Thank you. We will be in touch shortly.',
      nameLabel: 'Name',
      contactLabel: 'Work email',
      messageLabel: 'What are you working on?',
      messagePlaceholder: 'A short note about the decision or goal in front of you…',
    },
  }),
]);

// ───────────────────────────────────────────────────────────────
// Luxury skincare — LUXURY
// ───────────────────────────────────────────────────────────────

const luxuryAbout = page('ABOUT', 'About', 'about', [
  p({
    id: 'about-hero', type: 'hero', variant: 'split', layout: 'split', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      eyebrow: 'Our philosophy',
      title: 'Skincare, considered',
      subtitle: 'A focused collection built around a simple idea: healthy-looking skin does not need a complicated routine.',
      buttonText: 'Explore the collection',
      buttonUrl: '#ritual',
      imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1400&q=85',
    },
  }),
  p({
    id: 'approach', type: 'feature-split', variant: 'editorial', layout: 'image-left', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      eyebrow: 'Formulation',
      title: 'Effective, without excess',
      description: 'We create modern skincare essentials that combine effective active ingredients with gentle botanical extracts. Every formula is developed to support healthier-looking skin without compromising comfort.',
      checkpoints: [
        { id: 'approach-1', text: 'A focused approach to daily care' },
        { id: 'approach-2', text: 'Textures designed for comfort' },
        { id: 'approach-3', text: 'A routine that stays simple' },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=85',
      imageAlt: 'Skincare serum bottle',
    },
  }),
  p({
    id: 'ritual', type: 'feature-split', variant: 'editorial', layout: 'image-right', isHidden: false,
    backgroundColor: '#f5f5f5',
    content: {
      eyebrow: 'The ritual',
      title: 'Three steps, morning and night',
      description: 'Cleanse, hydrate, and protect. The order matters less than the consistency, and the best routine is the one you will actually keep.',
      checkpoints: [
        { id: 'ritual-1', text: 'Cleanse gently, without stripping' },
        { id: 'ritual-2', text: 'Hydrate while the skin is still damp' },
        { id: 'ritual-3', text: 'Protect and repeat every day' },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1000&q=85',
      imageAlt: 'Skincare products on a neutral surface',
    },
  }),
  p({
    id: 'about-quote', type: 'quote', variant: 'default', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      text: 'Good skincare should feel like a quiet part of the day, not another thing to manage.',
      author: 'LUXURY',
    },
  }),
  p({
    id: 'newsletter', type: 'collect-emails', variant: 'spacious', isHidden: false,
    backgroundColor: '#f5f5f5',
    content: {
      title: 'Notes on skin, delivered occasionally',
      placeholder: 'Your email address',
      buttonText: 'Join the list',
      successMessage: 'You’re on the list.',
    },
  }),
]);

const luxuryShop = page('PRODUCTS', 'Shop', 'products', [
  p({
    id: 'shop-hero', type: 'hero', variant: 'split', layout: 'split', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      eyebrow: 'The collection',
      title: 'Daily essentials',
      subtitle: 'A cleanser, a moisturizer, and a serum designed to work together.',
      buttonText: 'Find your routine',
      buttonUrl: '#ritual',
      imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1400&q=85',
    },
  }),
  p({
    id: 'products', type: 'products', variant: 'luxury-products', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      eyebrow: 'Shop',
      title: 'Three essentials, one considered routine',
      description: 'Each formula has a clear place in the routine. Start with one, or build the full set.',
      items: [
        {
          id: 'p1', title: 'Hydrating Cleanser', description: 'A gentle daily cleanse.', price: '$20',
          imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=85',
          url: '#ritual',
        },
        {
          id: 'p2', title: 'Daily Moisturizer', description: 'Comforting barrier support.', price: '$20',
          imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85',
          url: '#ritual',
        },
        {
          id: 'p3', title: 'Vitamin C Serum', description: 'A brightening daily serum.', price: '$24',
          imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85',
          url: '#ritual',
        },
      ],
    },
  }),
  p({
    id: 'ritual', type: 'feature-split', variant: 'editorial', layout: 'image-left', isHidden: false,
    backgroundColor: '#f5f5f5',
    content: {
      eyebrow: 'How to use',
      title: 'A simple order, every day',
      description: 'A short routine is easier to keep. These three steps are designed to layer without heaviness or guesswork.',
      checkpoints: [
        { id: 'use-1', text: 'Cleanse with lukewarm water' },
        { id: 'use-2', text: 'Press serum into damp skin' },
        { id: 'use-3', text: 'Seal with moisturizer' },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1000&q=85',
      imageAlt: 'Skincare routine',
    },
  }),
  p({
    id: 'newsletter', type: 'collect-emails', variant: 'spacious', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      title: 'Be first to know about new formulas',
      placeholder: 'Your email address',
      buttonText: 'Subscribe',
      successMessage: 'You’re subscribed.',
    },
  }),
]);

const luxuryJournal = page('BLOG', 'Journal', 'journal', [
  p({
    id: 'journal-hero', type: 'hero', variant: 'editorial-center', layout: 'center', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      eyebrow: 'Journal',
      title: 'Notes on skin',
      subtitle: 'Practical reading for a calmer, more considered routine.',
      buttonText: 'Read the latest',
      buttonUrl: '#stories',
    },
  }),
  p({
    id: 'stories', type: 'blog-list', variant: 'default', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      title: 'Latest notes',
      actionText: 'Join the list',
      actionUrl: '#newsletter',
      items: [
        {
          id: 'journal-1', category: 'Routine', date: '5 min read',
          title: 'How to build a routine you will actually keep',
          description: 'A short guide to starting with three steps and adding only what your skin needs.',
          imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85',
          url: '#newsletter',
        },
        {
          id: 'journal-2', category: 'Ingredients', date: '4 min read',
          title: 'Vitamin C, without the guesswork',
          description: 'Where it fits in a routine, how to introduce it slowly, and what to pair it with.',
          imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85',
          url: '#newsletter',
        },
        {
          id: 'journal-3', category: 'Barrier', date: '6 min read',
          title: 'A gentle case for doing less',
          description: 'Why a compromised barrier often needs fewer products, not more.',
          imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=85',
          url: '#newsletter',
        },
        {
          id: 'journal-4', category: 'Practice', date: '3 min read',
          title: 'The difference between dry and dehydrated skin',
          description: 'A simple way to think about what your skin is asking for.',
          imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85',
          url: '#newsletter',
        },
      ],
    },
  }),
  p({
    id: 'newsletter', type: 'collect-emails', variant: 'spacious', isHidden: false,
    backgroundColor: '#f5f5f5',
    content: {
      title: 'A note when there is something worth saying',
      placeholder: 'Your email address',
      buttonText: 'Subscribe',
      successMessage: 'You’re subscribed.',
    },
  }),
]);

const luxuryFaq = page('FAQ', 'FAQs', 'faq', [
  p({
    id: 'faq-hero', type: 'hero', variant: 'editorial-center', layout: 'center', isHidden: false,
    backgroundColor: '#f5f5f5',
    content: {
      eyebrow: 'Support',
      title: 'Questions, answered',
      subtitle: 'A few practical notes on routine, ingredients, and care.',
    },
  }),
  p({
    id: 'faq', type: 'faq', variant: 'spacious', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      title: 'Before you begin',
      items: [
        { id: 'faq-1', question: 'Are the products suitable for sensitive skin?', answer: 'Our formulas are designed to be gentle. Review the ingredient list and patch test before use.' },
        { id: 'faq-2', question: 'How should I start a skincare routine?', answer: 'Begin with cleanser, moisturizer, and sunscreen, then introduce active ingredients gradually.' },
        { id: 'faq-3', question: 'Can I use vitamin C every day?', answer: 'Yes, if your skin tolerates it. Start a few mornings a week and build up gradually.' },
        { id: 'faq-4', question: 'Do I need a separate eye cream?', answer: 'Not necessarily. A gentle moisturizer can be used around the eye area if it feels comfortable.' },
        { id: 'faq-5', question: 'How should I store my products?', answer: 'Keep them in a cool, dry place, away from direct sun, and follow the guidance on the packaging.' },
        { id: 'faq-6', question: 'What if a product irritates my skin?', answer: 'Stop using it and review the ingredient list. If irritation continues, speak with a dermatologist.' },
      ],
    },
  }),
  p({
    id: 'contact', type: 'lead-form', variant: 'editorial-panel', isHidden: false,
    backgroundColor: '#f5f5f5',
    content: {
      title: 'Still have a question?',
      description: 'Share your question and the best way to reach you. We will point you in the right direction.',
      buttonText: 'Send a note',
      successMessage: 'Thank you. We will be in touch.',
      nameLabel: 'Name',
      contactLabel: 'Email',
      messageLabel: 'Your question',
      messagePlaceholder: 'What would you like to know?',
    },
  }),
]);

const luxuryContact = page('CONTACT', 'Contact', 'contact', [
  p({
    id: 'contact-hero', type: 'hero', variant: 'split', layout: 'split', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      eyebrow: 'Contact',
      title: 'Talk to us',
      subtitle: 'Questions about a product or your routine? Send a note and we will point you in the right direction.',
      imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1400&q=85',
    },
  }),
  p({
    id: 'support', type: 'feature-split', variant: 'editorial', layout: 'image-right', isHidden: false,
    backgroundColor: '#f5f5f5',
    content: {
      eyebrow: 'Customer care',
      title: 'Here to help',
      description: 'Whether you are choosing your first product or refining a routine, a little guidance can make the decision simpler.',
      checkpoints: [
        { id: 'support-1', text: 'Product and routine questions' },
        { id: 'support-2', text: 'Order and delivery support' },
        { id: 'support-3', text: 'Wholesale and press enquiries' },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=85',
      imageAlt: 'Skincare serum',
    },
  }),
  p({
    id: 'contact', type: 'lead-form', variant: 'editorial-panel', isHidden: false,
    backgroundColor: '#ffffff',
    content: {
      title: 'Send a note',
      description: 'Share your question and the best way to reach you.',
      buttonText: 'Send message',
      successMessage: 'Thank you. We will be in touch.',
      nameLabel: 'Name',
      contactLabel: 'Email',
      messageLabel: 'Your message',
      messagePlaceholder: 'How can we help?',
    },
  }),
]);

// ───────────────────────────────────────────────────────────────
// Spa salon — Nue Studio
// ───────────────────────────────────────────────────────────────

const spaAbout = page('ABOUT', 'About Us', 'about', [
  p({
    id: 'about-hero', type: 'hero', variant: 'salon-arch', layout: 'split', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      eyebrow: 'About Nue Studio',
      title: 'A slower approach to nail care',
      subtitle: 'A calm studio for meticulous manicures, pedicures, and nail art, where the appointment has room to breathe.',
      buttonText: 'Book Now',
      buttonUrl: '#contact',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000',
    },
  }),
  p({
    id: 'philosophy', type: 'feature-split', variant: 'salon-arch', layout: 'image-left', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      eyebrow: 'Our philosophy',
      title: 'Care in the details',
      description: 'We believe nails are an art form and a reflection of your personality and style. Every appointment begins with listening, then moves at the pace your nails need.',
      checkpoints: [],
      imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=1000',
      imageAlt: 'Nail care in the studio',
    },
  }),
  p({
    id: 'care', type: 'feature-split', variant: 'salon-arch', layout: 'image-right', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      eyebrow: 'Our standard',
      title: 'A calm, considered appointment',
      description: 'From nail shaping and cuticle care to the final finish, the work is precise without feeling rushed. The result should look beautiful and feel right.',
      checkpoints: [],
      imageUrl: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?auto=format&fit=crop&q=80&w=1000',
      imageAlt: 'Pedicure treatment',
    },
  }),
  p({
    id: 'about-quote', type: 'quote', variant: 'default', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      text: 'Beautiful nails are the result of healthy habits, patient hands, and a little time for yourself.',
      author: 'Nue Studio',
    },
  }),
  p({
    id: 'contact', type: 'contact', variant: 'salon-cards', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      eyebrow: 'Ready when you are',
      title: 'Book your visit.',
      description: 'Contact us to book an appointment or make an inquiry.',
      email: 'hello@nuestudio.com',
      phone: '+1 (555) 234-5678',
      address: '77 Broadway, 7th Fl, New York, NY 10003',
    },
  }),
]);

const spaServices = page('SERVICES', 'Services', 'services', [
  p({
    id: 'services-hero', type: 'hero', variant: 'salon-arch', layout: 'split', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      eyebrow: 'Treatments',
      title: 'The treatment menu',
      subtitle: 'Manicures, pedicures, and nail art designed around the health of your natural nails.',
      buttonText: 'View the menu',
      buttonUrl: '#menu',
      imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=1000',
    },
  }),
  p({
    id: 'menu', type: 'services', variant: 'salon-menu', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      eyebrow: 'Signature services',
      title: 'Manicure, pedicure, and nail art',
      subtitle: 'Each service includes shaping, cuticle care, and a finish chosen with you.',
      items: [
        {
          id: 'service-1', tag: '★ Best gel manicure', title: 'Best Gel Manicure.',
          description: 'Long-lasting gel polish cured under UV/LED light. Includes nail shaping, cuticle care, hand massage, and high-shine or matte finish.',
          price: '1h 30min · $50',
          buttonText: 'Book Now', buttonUrl: '#contact',
          imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=1000',
        },
        {
          id: 'service-2', tag: 'Strength & length', title: 'Builder/Hard Gel Manicure',
          description: 'Ideal for strengthening natural nails or creating elegant extensions with durable builder gel that lasts up to 4 weeks with mirror-like shine.',
          price: '1h 40min · $70',
          buttonText: 'Book Now', buttonUrl: '#contact',
          imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=1000',
        },
        {
          id: 'service-3', tag: 'Relaxation', title: 'Pedicure Gel',
          description: 'Relaxing foot soak, gentle exfoliation, precision nail shaping, callus smoothing, and long-lasting gel color of your choice.',
          price: '1h 00min · $45',
          buttonText: 'Book Now', buttonUrl: '#contact',
          imageUrl: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?auto=format&fit=crop&q=80&w=1000',
        },
      ],
    },
  }),
  p({
    id: 'care', type: 'feature-split', variant: 'salon-arch', layout: 'image-left', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      eyebrow: 'Aftercare',
      title: 'Keeping your nails beautiful between visits',
      description: 'A little care at home makes the finish last. Keep nails hydrated, wear gloves for harsh cleaning, and book your next visit before the growth starts to show.',
      checkpoints: [],
      imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=1000',
      imageAlt: 'Finished manicure',
    },
  }),
  p({
    id: 'contact', type: 'contact', variant: 'salon-cards', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      eyebrow: 'Reserve your appointment',
      title: 'Reserve your appointment.',
      description: 'Tell us which treatment you have in mind and we will find a time that works.',
      email: 'hello@nuestudio.com',
      phone: '+1 (555) 234-5678',
      address: '77 Broadway, 7th Fl, New York, NY 10003',
    },
  }),
]);

const spaGallery = page('GALLERY', 'Gallery', 'gallery', [
  p({
    id: 'gallery-hero', type: 'hero', variant: 'salon-arch', layout: 'split', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      eyebrow: 'The studio',
      title: 'A look inside',
      subtitle: 'Recent work, quiet details, and the space where it all happens.',
      buttonText: 'Book a visit',
      buttonUrl: '#contact',
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1000',
    },
  }),
  p({
    id: 'gallery', type: 'gallery', variant: 'salon-gallery', layout: 'grid', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      eyebrow: 'Selected work',
      title: 'Nails, details, and the space',
      description: 'A small selection of finished sets and the atmosphere behind them.',
      buttonText: 'Book your visit',
      buttonUrl: '#contact',
      images: [
        { id: 'sg1', url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=1000', caption: 'Gel manicure' },
        { id: 'sg2', url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=1000', caption: 'Builder gel' },
        { id: 'sg3', url: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?auto=format&fit=crop&q=80&w=1000', caption: 'Pedicure' },
        { id: 'sg4', url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=1000', caption: 'Nail art' },
        { id: 'sg5', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000', caption: 'The studio' },
        { id: 'sg6', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1000', caption: 'Details' },
      ],
    },
  }),
  p({
    id: 'contact', type: 'contact', variant: 'salon-cards', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      eyebrow: 'Book your visit',
      title: 'Book your visit.',
      description: 'Appointments are available by phone, email, or in person.',
      email: 'hello@nuestudio.com',
      phone: '+1 (555) 234-5678',
      address: '77 Broadway, 7th Fl, New York, NY 10003',
    },
  }),
]);

const spaFaq = page('FAQ', 'FAQs', 'faq', [
  p({
    id: 'faq-hero', type: 'hero', variant: 'salon-arch', layout: 'split', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      eyebrow: 'FAQ',
      title: 'Before your visit',
      subtitle: 'A few things to know about treatments, timing, and looking after your nails.',
      buttonText: 'Book Now',
      buttonUrl: '#contact',
      imageUrl: 'https://images.unsplash.com/photo-1519735777090-ec97162dc266?auto=format&fit=crop&q=80&w=1000',
    },
  }),
  p({
    id: 'faq', type: 'faq', variant: 'salon-pill', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      title: 'Have questions?',
      subtitle: 'Find answers to our most commonly asked questions about our treatments and salon etiquette.',
      items: [
        { id: 'faq-1', question: 'What is a manicure?', answer: 'A manicure is a specialized beauty and care treatment for the fingernails and hands. It includes nail shaping, gentle cuticle care, hand exfoliation, a soothing massage, and high-quality polish application.' },
        { id: 'faq-2', question: 'What is the difference between normal gel and hard gel?', answer: 'Normal soft gel provides flexible, chip-free color for 2 to 3 weeks and is soaked off with acetone. Hard gel (or builder gel) is non-porous and cured for immense durability, allowing for nail extensions and lasting 3 to 4+ weeks.' },
        { id: 'faq-3', question: 'How long does pure gel polish last?', answer: 'Our pure gel polishes typically last 2 to 4 weeks with flawless shine, resisting chips and peeling throughout daily activities when properly maintained.' },
        { id: 'faq-4', question: 'How do I choose between gel and builder gel?', answer: 'Gel polish is a good fit for flexible, chip-free color. Builder gel adds strength and length, and is a better choice when you want extra durability.' },
        { id: 'faq-5', question: 'How should I prepare for my appointment?', answer: 'Come with clean, unpolished nails if possible, and let us know about any sensitivities or recent nail treatments.' },
        { id: 'faq-6', question: 'How long should I wait between appointments?', answer: 'Most clients return every two to four weeks, depending on nail growth and the service. We can advise on the right rhythm during your visit.' },
      ],
    },
  }),
  p({
    id: 'contact', type: 'contact', variant: 'salon-cards', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      eyebrow: 'Still deciding?',
      title: 'We are happy to help.',
      description: 'Tell us what you have in mind and we will recommend the right treatment.',
      email: 'hello@nuestudio.com',
      phone: '+1 (555) 234-5678',
      address: '77 Broadway, 7th Fl, New York, NY 10003',
    },
  }),
]);

const spaContact = page('CONTACT', 'Contact', 'contact', [
  p({
    id: 'contact-hero', type: 'hero', variant: 'salon-arch', layout: 'split', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      eyebrow: 'Contact',
      title: 'Come say hello',
      subtitle: 'Book an appointment, ask about a treatment, or simply tell us what you have in mind.',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000',
    },
  }),
  p({
    id: 'details', type: 'contact', variant: 'salon-cards', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      eyebrow: 'Contact us',
      title: 'Get in touch.',
      description: 'Contact us to book an appointment or make an inquiry.',
      email: 'hello@nuestudio.com',
      phone: '+1 (555) 234-5678',
      address: '77 Broadway, 7th Fl, New York, NY 10003',
    },
  }),
  p({
    id: 'contact', type: 'lead-form', variant: 'salon-inquiry', isHidden: false,
    backgroundColor: '#f6f4ee',
    content: {
      title: 'Send us a note',
      description: 'Tell us which treatment you are interested in and when you would like to visit. We will reply with availability.',
      buttonText: 'Send message',
      successMessage: 'Thank you. We will be in touch shortly.',
      nameLabel: 'Name',
      contactLabel: 'Email',
      messageLabel: 'Your message',
      messagePlaceholder: 'Which treatment are you interested in?',
      email: 'hello@nuestudio.com',
      location: '77 Broadway, 7th Fl, New York, NY 10003',
    },
  }),
]);

// ───────────────────────────────────────────────────────────────
// Tattoo artist — Rowan Black
// ───────────────────────────────────────────────────────────────

const tattooAbout = page('ABOUT', 'About', 'about', [
  p({
    id: 'about-hero', type: 'hero', variant: 'editorial-center', layout: 'center', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc', textContrast: 'light', buttonColor: '#e3e2d8', buttonTextColor: '#171715',
    content: {
      eyebrow: 'The artist',
      title: 'Rowan Black',
      subtitle: 'Toronto-based blackwork, drawn with intention and made to last.',
      buttonText: 'Book an appointment',
      buttonUrl: '#contact',
      secondaryButtonText: 'Meet the artist',
      secondaryButtonUrl: '#artist',
    },
  }),
  p({
    id: 'artist', type: 'feature-split', variant: 'bio-spotlight', layout: 'image-left', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      eyebrow: 'About Rowan',
      title: 'Blackwork with a quiet point of view',
      description: 'Rowan Black is a Toronto-based tattoo artist creating thoughtful, lasting blackwork. Each piece starts with a conversation and is drawn for the person who will wear it.',
      checkpoints: [
        { id: 'artist-note-1', text: 'Custom designs, drawn with you and made for you.' },
        { id: 'artist-note-2', text: 'A calm, thoughtful process from first message to healed work.' },
        { id: 'artist-note-3', text: 'Specialising in blackwork, fine line, and illustrative tattoos.' },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=800&q=80',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1603695985975-79e91a882da0?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Tattoo artist Rowan Black',
      imageLabel: 'Rowan',
    },
  }),
  p({
    id: 'styles', type: 'services', variant: 'portfolio-band', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      eyebrow: 'Signature styles',
      title: 'Styles',
      subtitle: 'Blackwork, fine line, and illustrative pieces, each drawn for the person who will wear it.',
      items: [
        { id: 'style-1', title: 'Blackwork', description: 'Bold, graphic work built from solid black and negative space.' },
        { id: 'style-2', title: 'Fine line', description: 'Delicate linework with a light, precise touch.' },
        { id: 'style-3', title: 'Illustrative', description: 'Custom imagery drawn to sit naturally on the body.' },
      ],
      socialLabel: 'Follow the studio',
      socialLinks: [{ id: 'instagram', title: 'Instagram', url: 'https://instagram.com/rowanblack' }],
    },
  }),
  p({
    id: 'about-stats', type: 'stats', variant: 'editorial-band', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      eyebrow: 'By the numbers',
      title: 'A practice built on repetition and care',
      description: 'A small studio with a focused output. Every piece is drawn, tattooed, and followed through to healing.',
      items: [
        { id: 'stat-years', value: '10', suffix: '+', label: 'Years tattooing' },
        { id: 'stat-pieces', value: '600', suffix: '+', label: 'Pieces healed' },
        { id: 'stat-styles', value: '3', label: 'Signature styles' },
      ],
    },
  }),
  p({
    id: 'about-quote', type: 'quote', variant: 'editorial-statement', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      text: 'Every tattoo starts with a conversation. The ink comes after.',
    },
  }),
  p({
    id: 'contact', type: 'lead-form', variant: 'split-inquiry', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      title: 'Start with a conversation.',
      description: 'Share the idea, placement, and approximate size. I’ll reply with next steps and availability.',
      buttonText: 'Submit information',
      successMessage: 'Thanks for reaching out. Rowan will be in touch soon.',
      nameLabel: 'Full Name',
      namePlaceholder: 'Your name',
      contactLabel: 'Phone Number',
      contactPlaceholder: 'Your phone number',
      messageLabel: 'Tattoo Idea',
      messagePlaceholder: 'Tell me what you have in mind…',
      email: 'hello@rowanblack.com',
      instagram: 'https://instagram.com/rowanblack',
      location: 'Private Studio · Queen Street West, Toronto, ON',
    },
  }),
]);

const tattooProcess = page('SERVICES', 'Process', 'process', [
  p({
    id: 'process-hero', type: 'hero', variant: 'editorial-center', layout: 'center', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc', textContrast: 'light', buttonColor: '#e3e2d8', buttonTextColor: '#171715',
    content: {
      eyebrow: 'The process',
      title: 'From idea to ink',
      subtitle: 'A clear path from the first message to a healed piece.',
      buttonText: 'Book an appointment',
      buttonUrl: '#contact',
    },
  }),
  p({
    id: 'process', type: 'timeline', variant: 'pinned-thread', layout: 'vertical', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      title: 'From Idea To Ink',
      description: 'Here’s how we bring your tattoo to life, guiding you through every step of the process from start to finish.',
      items: [
        { id: 'process-1', label: 'Share Your Idea', description: 'Tell us what you have in mind. We’ll talk through your vision, placement, and style so the design feels personal and right for you.' },
        { id: 'process-2', label: 'Bring It To Paper', description: 'Once we understand your idea, I create a one-of-a-kind design tailored to you. We’ll refine the composition, placement, and details together.' },
        { id: 'process-3', label: 'The Tattoo Session', description: 'On the day of your appointment, we confirm placement and work through the process at a comfortable pace, with breaks whenever you need them.' },
        { id: 'process-4', label: 'Keeping It Sharp', description: 'Your tattoo deserves good aftercare. You’ll leave with clear healing instructions and everything you need to care for your new piece.' },
      ],
    },
  }),
  p({
    id: 'prepare', type: 'feature-split', variant: 'bio-spotlight', layout: 'image-left', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      eyebrow: 'Before your session',
      title: 'A little preparation goes a long way',
      description: 'A calm session starts before you arrive. A few small things make the day easier for you and for the work.',
      checkpoints: [
        { id: 'prepare-1', text: 'Get a good night of sleep.' },
        { id: 'prepare-2', text: 'Eat beforehand and stay hydrated.' },
        { id: 'prepare-3', text: 'Wear clothing that gives easy access to the tattoo area.' },
        { id: 'prepare-4', text: 'Bring references and any questions you have.' },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=800&q=80',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1573806439793-82c5bbd4c06e?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Tattoo studio session',
      imageLabel: 'Studio',
    },
  }),
  p({
    id: 'contact', type: 'lead-form', variant: 'split-inquiry', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      title: 'Ready to begin?',
      description: 'Send a short note about your idea and I’ll come back with the next step.',
      buttonText: 'Submit information',
      successMessage: 'Thanks for reaching out. Rowan will be in touch soon.',
      nameLabel: 'Full Name',
      namePlaceholder: 'Your name',
      contactLabel: 'Phone Number',
      contactPlaceholder: 'Your phone number',
      messageLabel: 'Tattoo Idea',
      messagePlaceholder: 'Tell me what you have in mind…',
      email: 'hello@rowanblack.com',
      instagram: 'https://instagram.com/rowanblack',
      location: 'Private Studio · Queen Street West, Toronto, ON',
    },
  }),
]);

const tattooGallery = page('GALLERY', 'Flash board', 'gallery', [
  p({
    id: 'gallery-hero', type: 'hero', variant: 'editorial-center', layout: 'center', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc', textContrast: 'light', buttonColor: '#e3e2d8', buttonTextColor: '#171715',
    content: {
      eyebrow: 'Flash & custom',
      title: 'The flash board',
      subtitle: 'A selection of recent pieces, works in progress, and one-of-one designs.',
      buttonText: 'Book an appointment',
      buttonUrl: '#contact',
    },
  }),
  p({
    id: 'board', type: 'gallery', variant: 'tattoo-gallery', layout: 'grid', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      eyebrow: 'Selected work',
      title: 'Every piece is drawn for the person who will wear it',
      description: 'A rotating board of available flash and recent custom work.',
      buttonText: 'Book an appointment',
      buttonUrl: '#contact',
      images: [
        { id: 'board-1', url: 'https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?auto=format&fit=crop&w=800&q=80', caption: '09.02.2025' },
        { id: 'board-2', url: 'https://images.unsplash.com/photo-1590246814883-57c511e86e73?auto=format&fit=crop&w=800&q=80', caption: '20.10.2022', note: 'Let’s get a little more detail on this one' },
        { id: 'board-3', url: 'https://images.unsplash.com/photo-1598300188904-6287d497d332?auto=format&fit=crop&w=800&q=80', caption: '16.12.2023' },
        { id: 'board-4', url: 'https://images.unsplash.com/photo-1563721478-a8afbb2acae5?auto=format&fit=crop&w=800&q=80', caption: '01.02.2023' },
        { id: 'board-5', url: 'https://images.unsplash.com/photo-1611006671145-6e8b3c28e8d3?auto=format&fit=crop&w=800&q=80', caption: '29.06.2023', note: 'Artist’s pick' },
        { id: 'board-6', url: 'https://images.unsplash.com/photo-1580894914762-fcc9c72bbcf8?auto=format&fit=crop&w=800&q=80', caption: '03.08.2022' },
        { id: 'board-7', url: 'https://images.unsplash.com/photo-1614177599522-71b7ac1c3df3?auto=format&fit=crop&w=800&q=80', caption: '25.01.2025' },
        { id: 'board-8', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', caption: '25.10.2022' },
        { id: 'board-9', url: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=800&q=80', caption: '01.08.2022', note: 'Tiny flash, big meaning' },
      ],
    },
  }),
  p({
    id: 'gallery-quote', type: 'quote', variant: 'editorial-statement', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      text: 'A flash sheet is a starting point. The best pieces begin with a conversation.',
      author: 'Rowan Black',
    },
  }),
  p({
    id: 'contact', type: 'lead-form', variant: 'split-inquiry', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      title: 'Claim a design or start a custom piece.',
      description: 'Send a short note with the reference, placement, and approximate size.',
      buttonText: 'Submit information',
      successMessage: 'Thanks for reaching out. Rowan will be in touch soon.',
      nameLabel: 'Full Name',
      namePlaceholder: 'Your name',
      contactLabel: 'Phone Number',
      contactPlaceholder: 'Your phone number',
      messageLabel: 'Tattoo Idea',
      messagePlaceholder: 'Tell me what you have in mind…',
      email: 'hello@rowanblack.com',
      instagram: 'https://instagram.com/rowanblack',
      location: 'Private Studio · Queen Street West, Toronto, ON',
    },
  }),
]);

const tattooFaq = page('FAQ', 'FAQ', 'faq', [
  p({
    id: 'faq-hero', type: 'hero', variant: 'editorial-center', layout: 'center', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc', textContrast: 'light', buttonColor: '#e3e2d8', buttonTextColor: '#171715',
    content: {
      eyebrow: 'Before you book',
      title: 'Questions, answered',
      subtitle: 'A few things you might want to know before booking.',
      buttonText: 'Book an appointment',
      buttonUrl: '#contact',
    },
  }),
  p({
    id: 'faq', type: 'faq', variant: 'tattoo-list', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      title: 'Frequently Asked Questions',
      subtitle: 'A few things you might want to know before booking.',
      items: [
        { id: 'faq-1', question: 'How do I book an appointment?', answer: 'Use the booking form below with a short description of your idea, placement, and approximate size. I’ll reply with next steps.' },
        { id: 'faq-2', question: 'Do you require a deposit?', answer: 'A deposit is required to reserve your appointment and goes toward the cost of your tattoo.' },
        { id: 'faq-3', question: 'Can I see your designs before booking?', answer: 'We’ll discuss references and direction first. Custom drawings are shared with booked clients as the appointment approaches.' },
        { id: 'faq-4', question: 'Can I bring a friend to my session?', answer: 'Please ask when booking. Space is limited, but one quiet guest may be possible.' },
        { id: 'faq-5', question: 'Do you take walk-ins?', answer: 'All sessions are by appointment so every design gets the time and attention it deserves.' },
        { id: 'faq-6', question: 'How should I prepare for my appointment?', answer: 'Get a good night of sleep, eat beforehand, stay hydrated, and wear clothing that gives easy access to the tattoo area.' },
      ],
    },
  }),
  p({
    id: 'faq-quote', type: 'quote', variant: 'editorial-statement', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      text: 'If your question is not here, send it with your idea. The answer is usually a short conversation away.',
      author: 'Rowan Black',
    },
  }),
  p({
    id: 'contact', type: 'lead-form', variant: 'split-inquiry', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      title: 'Still have a question?',
      description: 'Send it along with your idea and I’ll get back to you.',
      buttonText: 'Submit information',
      successMessage: 'Thanks for reaching out. Rowan will be in touch soon.',
      nameLabel: 'Full Name',
      namePlaceholder: 'Your name',
      contactLabel: 'Phone Number',
      contactPlaceholder: 'Your phone number',
      messageLabel: 'Your Question',
      messagePlaceholder: 'What would you like to know?',
      email: 'hello@rowanblack.com',
      instagram: 'https://instagram.com/rowanblack',
      location: 'Private Studio · Queen Street West, Toronto, ON',
    },
  }),
]);

const tattooContact = page('CONTACT', 'Book an appointment', 'contact', [
  p({
    id: 'contact-hero', type: 'hero', variant: 'editorial-center', layout: 'center', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc', textContrast: 'light',
    content: {
      eyebrow: 'Bookings',
      title: 'Let’s make something permanent',
      subtitle: 'Custom tattoos are available by appointment only. Share your idea and I’ll create a design made to last a lifetime.',
    },
  }),
  p({
    id: 'studio-strip', type: 'gallery', variant: 'photo-strip', layout: 'grid', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      images: [
        { id: 'strip-1', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80', caption: 'Blackwork tattoo in progress' },
        { id: 'strip-2', url: 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=1200&q=80', caption: 'Custom linework' },
        { id: 'strip-3', url: 'https://images.unsplash.com/photo-1611241893603-3c359704e0ee?auto=format&fit=crop&w=1200&q=80', caption: 'Tattoo session' },
        { id: 'strip-4', url: 'https://images.unsplash.com/photo-1542561943-baca4dd0fc93?auto=format&fit=crop&w=1200&q=80', caption: 'Blackwork detail' },
        { id: 'strip-5', url: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=1200&q=80', caption: 'Tattoo work' },
        { id: 'strip-6', url: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1200&q=80', caption: 'Studio session' },
      ],
    },
  }),
  p({
    id: 'studio-details', type: 'feature-split', variant: 'bio-spotlight', layout: 'image-left', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      eyebrow: 'The studio',
      title: 'A private room on Queen West',
      description: 'Appointments happen in a quiet, private studio. There is time to talk through placement, look at references, and settle in before the machine comes out.',
      checkpoints: [
        { id: 'studio-note-1', text: 'Private Studio · Queen Street West, Toronto, ON' },
        { id: 'studio-note-2', text: 'Tuesday to Saturday, by appointment only.' },
        { id: 'studio-note-3', text: 'Send references, placement, and approximate size when you write.' },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=800&q=80',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1573806439793-82c5bbd4c06e?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'The private tattoo studio',
      secondaryImageAlt: 'Tattoo tools laid out in the studio',
      imageLabel: 'Studio',
    },
  }),
  p({
    id: 'contact', type: 'lead-form', variant: 'split-inquiry', isHidden: false,
    backgroundColor: '#0c0d0c', textColor: '#e9e7dc',
    content: {
      title: 'Tell me about your idea.',
      description: 'Share the concept, placement, and approximate size. I’ll reply with next steps and availability.',
      buttonText: 'Submit information',
      successMessage: 'Thanks for reaching out. Rowan will be in touch soon.',
      nameLabel: 'Full Name',
      namePlaceholder: 'Your name',
      contactLabel: 'Phone Number',
      contactPlaceholder: 'Your phone number',
      messageLabel: 'Tattoo Idea',
      messagePlaceholder: 'Tell me what you have in mind…',
      email: 'hello@rowanblack.com',
      instagram: 'https://instagram.com/rowanblack',
      location: 'Private Studio · Queen Street West, Toronto, ON',
    },
  }),
]);

const studioHero = (title: string, subtitle: string): PageSection => p({
  id: 'page-hero', type: 'hero', variant: 'framed-editorial', layout: 'center', isHidden: false,
  backgroundColor: '#090a0a', textColor: '#ffffff', textContrast: 'light',
  content: { eyebrow: 'INK 77 · BARNSLEY', headline: 'Tattoo Studio', title, subtitle, buttonText: 'Book an appointment', buttonUrl: '#contact' },
});

const studioContact: PageSection = p({
  id: 'contact', type: 'lead-form', variant: 'appointment-inquiry', isHidden: false,
  backgroundColor: '#ffffff', textColor: '#202020',
  content: {
    title: 'Book your session',
    description: 'Share your idea, placement, and approximate size. We will be in touch with the next steps.',
    buttonText: 'Request an appointment',
    successMessage: 'Thanks for your enquiry. The studio will be in touch soon.',
    nameLabel: 'Full name', namePlaceholder: 'Enter your full name',
    contactLabel: 'Email address', contactPlaceholder: 'you@example.com',
    messageLabel: 'Tattoo idea / description', messagePlaceholder: 'Describe your idea, placement, approximate size, and style…',
    email: 'flotattoos@yahoo.com', phone: '+44 7498 253918', openingHours: 'Tue – Sat: 10:00am – 04:00 pm', location: 'Shambles Street, Barnsley, United Kingdom, S70 2SH', mapQuery: 'Ink 77 Tattoo Studio, Shambles Street, Barnsley, UK',
  },
});

const studioAbout = page('ABOUT', 'About the studio', 'about', [
  studioHero('A studio built around your story', 'Meet the artists and the considered process behind every custom piece.'),
  p({ id: 'studio-story', type: 'feature-split', variant: 'torn-editorial', layout: 'image-left', isHidden: false, backgroundColor: '#ffffff', textColor: '#202020', content: { eyebrow: 'ABOUT INK 77', title: 'Creativity, precision, and respect', description: 'Ink 77 is a welcoming tattoo studio in Barnsley, creating custom work with care at every stage. From realism to fine line and black & grey, we work with you to make a design that feels personal and lasts a lifetime.', buttonText: 'Book an appointment', buttonUrl: '#contact', imageUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=1000&q=85', imageAlt: 'Tattoo artist working in the studio', checkpoints: [] } }),
  p({ id: 'studio-values', type: 'services', variant: 'minimal-border', isHidden: false, backgroundColor: '#101111', textColor: '#ffffff', content: { eyebrow: 'THE STUDIO', title: 'What matters to us', subtitle: 'Good work starts with listening and continues with care.', items: [{ id: 'value-1', title: 'Your idea', description: 'Every project begins with a conversation about what matters to you.' }, { id: 'value-2', title: 'Thoughtful craft', description: 'We give the design, placement, and details the attention they deserve.' }, { id: 'value-3', title: 'A comfortable session', description: 'We explain each step and make space for questions and breaks.' }] } }),
  p({ id: 'about-quote', type: 'quote', variant: 'editorial-statement', isHidden: false, backgroundColor: '#101111', textColor: '#ffffff', content: { text: 'A great tattoo should feel like it was always meant to be yours.', author: 'Ink 77 Tattoo Studio' } }),
  structuredClone(studioContact),
]);

const studioPortfolio = page('GALLERY', 'Portfolio', 'portfolio', [
  studioHero('Recent work', 'Explore custom tattoo work from the Ink 77 studio.'),
  p({ id: 'portfolio-gallery', type: 'gallery', variant: 'editorial-masonry', layout: 'grid', isHidden: false, backgroundColor: '#101111', textColor: '#ffffff', content: { eyebrow: 'SELECTED WORK', title: 'Ink with a story', description: 'Every piece starts with an idea and becomes something personal.', images: [
    { id: 'work-1', url: 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=900&q=85', caption: 'Blackwork portrait' },
    { id: 'work-2', url: 'https://images.unsplash.com/photo-1590246814883-57c511e86e73?auto=format&fit=crop&w=900&q=85', caption: 'Fine line study' },
    { id: 'work-3', url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=900&q=85', caption: 'Custom piece' },
    { id: 'work-4', url: 'https://images.unsplash.com/photo-1542561943-baca4dd0fc93?auto=format&fit=crop&w=900&q=85', caption: 'Black and grey detail' },
    { id: 'work-5', url: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=900&q=85', caption: 'Illustrative work' },
    { id: 'work-6', url: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=900&q=85', caption: 'Studio session' },
  ] } }),
  p({ id: 'portfolio-note', type: 'rich-text', variant: 'split', isHidden: false, backgroundColor: '#ffffff', textColor: '#202020', content: { text: '<h2>Your idea can start here</h2><p>Use the images as inspiration, then tell us what you would like to make your own. We will discuss style, placement, and scale together.</p>' } }),
  structuredClone(studioContact),
]);

const studioProcess = page('SERVICES', 'The process', 'process', [
  studioHero('From first idea to fresh ink', 'A clear, personal process helps you feel ready for your appointment.'),
  p({ id: 'process-steps', type: 'timeline', variant: 'numbered-panel', layout: 'vertical', isHidden: false, backgroundColor: '#101111', textColor: '#ffffff', content: { title: 'The process', description: 'We guide you through each step, from your first message to caring for your new tattoo.', imageUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=1000&q=85', buttonText: 'Book an appointment', buttonUrl: '#contact', items: [
    { id: 'step-1', label: 'Share your idea', description: 'Tell us about the design, placement, approximate size, and any reference images.' },
    { id: 'step-2', label: 'Plan the details', description: 'We discuss your vision, style, and practical details before confirming the session.' },
    { id: 'step-3', label: 'Get tattooed', description: 'We check the placement together and make sure you are comfortable throughout.' },
    { id: 'step-4', label: 'Care for your ink', description: 'Your artist will walk you through aftercare and answer questions about healing.' },
  ] } }),
  p({ id: 'process-prep', type: 'feature-split', variant: 'bio-spotlight', layout: 'image-right', isHidden: false, backgroundColor: '#ffffff', textColor: '#202020', content: { eyebrow: 'BEFORE YOU ARRIVE', title: 'A little preparation goes a long way', description: 'Rest well, eat before your session, stay hydrated, and wear comfortable clothing that makes the area easy to reach. If anything is unclear, ask us before your appointment.', imageUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=1000&q=85', imageAlt: 'Tattoo studio preparation', checkpoints: [] } }),
  structuredClone(studioContact),
]);

const studioTestimonials = page('CUSTOM', 'Testimonials', 'testimonials', [
  studioHero('Good people, good ink', 'A few words from people who have visited the studio.'),
  p({ id: 'client-stories', type: 'testimonials', variant: 'review-cards', isHidden: false, backgroundColor: '#ffffff', textColor: '#202020', content: { title: 'Client stories', items: [
    { id: 'story-1', quote: 'The whole experience felt welcoming and unhurried. I love how the design turned out.', author: 'Studio client', role: 'Custom tattoo' },
    { id: 'story-2', quote: 'A lovely studio, great communication, and beautiful attention to detail.', author: 'Studio client', role: 'Fine line piece' },
    { id: 'story-3', quote: 'They listened carefully to my idea and made it feel completely personal.', author: 'Studio client', role: 'Black and grey piece' },
  ] } }),
  p({ id: 'testimonial-quote', type: 'quote', variant: 'editorial-statement', isHidden: false, backgroundColor: '#101111', textColor: '#ffffff', content: { text: 'The best part is seeing someone leave with a piece that feels like their own.', author: 'Ink 77 Tattoo Studio' } }),
  structuredClone(studioContact),
]);

const studioFaq = page('FAQ', 'Frequently asked questions', 'faq', [
  studioHero('Questions, answered', 'A few helpful details before you book.'),
  p({ id: 'faq-list', type: 'faq', variant: 'photo-overlay', isHidden: false, backgroundColor: '#101111', textColor: '#ffffff', content: { title: 'Before your appointment', backgroundImageUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=1800&q=85', subtitle: 'If you need more information, send us a message with your idea.', items: [
    { id: 'question-1', question: 'How much do tattoos cost?', answer: 'Pricing depends on size, placement, detail, and session time. Share your idea and we can provide an estimate.' },
    { id: 'question-2', question: 'Do you accept walk-ins?', answer: 'Appointments are recommended so there is time to discuss your design. Ask us about current walk-in availability.' },
    { id: 'question-3', question: 'Can I bring my own design?', answer: 'Yes. Bring your references and we can discuss how to adapt them for your placement.' },
    { id: 'question-4', question: 'How should I prepare?', answer: 'Get a good night of sleep, eat beforehand, drink water, and wear clothing that makes the area easy to reach.' },
    { id: 'question-5', question: 'What about aftercare?', answer: 'Your artist will explain how to care for your new tattoo and what to expect as it heals.' },
  ] } }),
  p({ id: 'faq-note', type: 'feature-split', variant: 'bio-spotlight', layout: 'image-left', isHidden: false, backgroundColor: '#ffffff', textColor: '#202020', content: { eyebrow: 'NEED A HAND?', title: 'Talk through your idea with us', description: 'If your question is not covered here, include it with your enquiry. We will help you understand the next step.', imageUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=1000&q=85', imageAlt: 'Artist preparing for a tattoo session', checkpoints: [] } }),
  structuredClone(studioContact),
]);

const studioBooking = page('CONTACT', 'Book an appointment', 'contact', [
  studioHero('Book your session', 'Tell us about the tattoo you have in mind and we will get back to you.'),
  p({ id: 'booking-info', type: 'feature-split', variant: 'bio-spotlight', layout: 'image-left', isHidden: false, backgroundColor: '#101111', textColor: '#ffffff', content: { eyebrow: 'INK 77 TATTOO STUDIO', title: 'A personal appointment, from the first conversation', description: 'Share your idea, placement, approximate size, and any reference images. We will review the details and reply with availability and next steps.', imageUrl: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1000&q=85', imageAlt: 'Tattoo session at the studio', checkpoints: [{ id: 'booking-detail-1', text: 'Based in Barnsley, United Kingdom.' }, { id: 'booking-detail-2', text: 'Include reference images if you have them.' }] } }),
  structuredClone(studioContact),
]);

export const BUSINESS_TEMPLATE_PAGE_BLUEPRINTS: Record<string, BlueprintPage[]> = {
  restaurant: [restaurantAbout, restaurantMenu, restaurantReservations, restaurantGallery],
  'corporate-consulting': [corporateAbout, corporateServices, corporateClientStories, corporateFaq, corporateContact],
  'luxury-skincare': [luxuryAbout, luxuryShop, luxuryJournal, luxuryFaq, luxuryContact],
  'spa-salon': [spaAbout, spaServices, spaGallery, spaFaq, spaContact],
  'tattoo-artist': [tattooAbout, tattooProcess, tattooGallery, tattooFaq, tattooContact],
  'tattoo-studio': [studioAbout, studioPortfolio, studioProcess, studioTestimonials, studioFaq, studioBooking],
};
