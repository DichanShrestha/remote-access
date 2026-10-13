import React from 'react';
import { SectionType } from './schemas';

export type VariantMetadata = {
  id: string;
  label: string;
  previewNode?: React.ReactNode;
};

// Generic placeholder for visual previews
const PlaceholderSVG = () => (
  <svg className="w-full h-full text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
    <path d="M3 9h18" strokeWidth="1.5" />
    <path d="M9 21V9" strokeWidth="1.5" />
  </svg>
);

export const SECTION_VARIANTS: Partial<Record<SectionType, VariantMetadata[]>> = {
  'site-navbar': [
    { id: 'corporate', label: 'Corporate', previewNode: <PlaceholderSVG /> },
    { id: 'centered', label: 'Centered', previewNode: <PlaceholderSVG /> },
    { id: 'minimal', label: 'Minimal', previewNode: <PlaceholderSVG /> },
    { id: 'pill', label: 'Pill Navigation', previewNode: <PlaceholderSVG /> },
    { id: 'overlay', label: 'Overlay', previewNode: <PlaceholderSVG /> },
    { id: 'transparent-overlay', label: 'Transparent Overlay', previewNode: <PlaceholderSVG /> },
  ],
  'site-footer': [
    { id: 'columns', label: 'Link Columns', previewNode: <PlaceholderSVG /> },
    { id: 'compact', label: 'Compact', previewNode: <PlaceholderSVG /> },
    { id: 'classic-serif', label: 'Classic Serif', previewNode: <PlaceholderSVG /> },
  ],
  // Hero uses its own built-in variant picker in HeroInspector
  'rich-text': [
    { id: 'default', label: 'Standard', previewNode: <PlaceholderSVG /> },
    { id: 'split', label: 'Split Text', previewNode: <PlaceholderSVG /> },
    { id: 'blur', label: 'Blur Reveal', previewNode: <PlaceholderSVG /> },
    { id: 'shiny', label: 'Shiny Text', previewNode: <PlaceholderSVG /> },
    { id: 'typewriter', label: 'Typewriter', previewNode: <PlaceholderSVG /> },
  ],
  'link-list': [
    { id: 'default', label: 'Link Cards', previewNode: <PlaceholderSVG /> },
    { id: 'navigation', label: 'Navigation', previewNode: <PlaceholderSVG /> },
    { id: 'tabs', label: 'Section Tabs', previewNode: <PlaceholderSVG /> },
  ],
  stats: [
    { id: 'default', label: 'Stats Grid', previewNode: <PlaceholderSVG /> },
    { id: 'editorial-band', label: 'Editorial Band', previewNode: <PlaceholderSVG /> },
    { id: 'minimal-row', label: 'Minimal Band', previewNode: <PlaceholderSVG /> },
  ],
  'feature-split': [
    { id: 'default', label: 'Framed Image', previewNode: <PlaceholderSVG /> },
    { id: 'editorial', label: 'Editorial Split', previewNode: <PlaceholderSVG /> },
    { id: 'portfolio-about', label: 'Portfolio About', previewNode: <PlaceholderSVG /> },
    { id: 'story-split', label: 'Story Split', previewNode: <PlaceholderSVG /> },
    { id: 'arch', label: 'Arched Frame', previewNode: <PlaceholderSVG /> },
  ],
  carousel: [
    { 
      id: 'default', 
      label: 'Classic Slider',
      previewNode: (
        <div className="w-full h-full bg-slate-100 flex items-center justify-between px-1">
          <div className="w-2 h-2 rounded bg-slate-300"></div>
          <div className="w-6 h-6 rounded bg-slate-400"></div>
          <div className="w-2 h-2 rounded bg-slate-300"></div>
        </div>
      )
    },
    { id: 'react-bits', label: 'Smooth Carousel', previewNode: <PlaceholderSVG /> },
    { id: 'flex', label: 'Flex Carousel', previewNode: <PlaceholderSVG /> },
    { id: 'circular', label: 'Circular Ring', previewNode: <PlaceholderSVG /> },
    { id: 'depth', label: '3D Depth', previewNode: <PlaceholderSVG /> },
    { id: 'featured-focus', label: 'Featured Focus', previewNode: <PlaceholderSVG /> },
  ],
  gallery: [
    { id: 'default', label: 'Grid', previewNode: <PlaceholderSVG /> },
    { id: 'masonry', label: 'Masonry', previewNode: <PlaceholderSVG /> },
    { id: 'chroma', label: 'Chroma Grid', previewNode: <PlaceholderSVG /> },
    { id: 'bounce', label: 'Bounce Cards', previewNode: <PlaceholderSVG /> },
  ],
  services: [
    { id: 'portfolio-band', label: 'Portfolio Band', previewNode: <PlaceholderSVG /> },
    { id: 'architecture-accordion', label: 'Architecture Accordion', previewNode: <PlaceholderSVG /> },
    { id: 'minimal-border', label: 'Minimal Border', previewNode: <PlaceholderSVG /> },
    { id: 'glass-dark', label: 'Glass Dark', previewNode: <PlaceholderSVG /> },
    { id: 'asymmetric-bento', label: 'Asymmetric Bento', previewNode: <PlaceholderSVG /> },
    { id: 'staggered', label: 'Staggered Showcase', previewNode: <PlaceholderSVG /> },
  ],
  products: [
    { id: 'default', label: 'Standard Grid', previewNode: <PlaceholderSVG /> },
    { id: 'glare', label: 'Glare Hover', previewNode: <PlaceholderSVG /> },
    { id: 'categorized-menu', label: 'Categorized Menu', previewNode: <PlaceholderSVG /> },
  ],
  image: [
    { id: 'default', label: 'Standard Image', previewNode: <PlaceholderSVG /> },
    { id: 'scroll-reveal', label: 'Scroll Reveal', previewNode: <PlaceholderSVG /> },
    { id: 'gradual-blur', label: 'Gradual Blur', previewNode: <PlaceholderSVG /> },
    { id: 'silk', label: 'Silk Effect', previewNode: <PlaceholderSVG /> },
    { id: 'gradient-blinds', label: 'Gradient Blinds', previewNode: <PlaceholderSVG /> },
  ],
  testimonials: [
    { id: 'grid', label: 'Masonry Grid', previewNode: <PlaceholderSVG /> },
    { id: 'marquee', label: 'Infinite Marquee', previewNode: <PlaceholderSVG /> },
    { id: 'editorial-quotes', label: 'Editorial Quotes', previewNode: <PlaceholderSVG /> },
  ],
  'case-studies': [
    { id: 'default', label: 'Case Study Cards', previewNode: <PlaceholderSVG /> },
    { id: 'editorial-rows', label: 'Editorial Rows', previewNode: <PlaceholderSVG /> },
    { id: 'architecture-feature', label: 'Architecture Feature', previewNode: <PlaceholderSVG /> },
  ],
  'blog-list': [
    { id: 'default', label: 'Editorial List', previewNode: <PlaceholderSVG /> },
    { id: 'image-cards', label: 'Image Cards', previewNode: <PlaceholderSVG /> },
  ],
  booking: [
    { id: 'default', label: 'Booking Card', previewNode: <PlaceholderSVG /> },
    { id: 'multi-step', label: 'Multi-Step Flow', previewNode: <PlaceholderSVG /> },
  ],
  contact: [
    { id: 'card-centered', label: 'Card Centered', previewNode: <PlaceholderSVG /> },
    { id: 'split-layout', label: 'Split Layout', previewNode: <PlaceholderSVG /> },
    { id: 'editorial-panel', label: 'Editorial Panel', previewNode: <PlaceholderSVG /> },
    { id: 'minimal-footer', label: 'Minimal Footer', previewNode: <PlaceholderSVG /> },
    { id: 'contact-cards', label: 'Contact Cards', previewNode: <PlaceholderSVG /> },
  ],
  'lead-form': [
    { id: 'card-centered', label: 'Card Centered', previewNode: <PlaceholderSVG /> },
    { id: 'split-layout', label: 'Split Layout', previewNode: <PlaceholderSVG /> },
  ],
  'social-links': [
    { id: 'default', label: 'Standard Row', previewNode: <PlaceholderSVG /> },
    { id: 'dock', label: 'Mac OS Dock', previewNode: <PlaceholderSVG /> },
  ],
  countdown: [
    { id: 'default', label: 'Date Countdown', previewNode: <PlaceholderSVG /> },
    { id: 'count-up', label: 'Count Up Stats', previewNode: <PlaceholderSVG /> },
  ],
  resume: [
    { id: 'default', label: 'Standard List', previewNode: <PlaceholderSVG /> },
    { id: 'stepper', label: 'Interactive Stepper', previewNode: <PlaceholderSVG /> },
  ],
  timeline: [
    { id: 'vertical', label: 'Vertical Timeline', previewNode: <PlaceholderSVG /> },
    { id: 'chronology', label: 'Chronology', previewNode: <PlaceholderSVG /> },
  ],
  faq: [
    { id: 'default', label: 'Standard Accordion', previewNode: <PlaceholderSVG /> },
    { id: 'spacious', label: 'Spacious Split', previewNode: <PlaceholderSVG /> },
    { id: 'pill-accordion', label: 'Pill Accordion', previewNode: <PlaceholderSVG /> },
  ],
};
