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
  hero: [
    { id: 'editorial-center', label: 'Editorial Center', previewNode: <PlaceholderSVG /> },
    { id: 'split', label: 'Split', previewNode: <PlaceholderSVG /> },
    { id: 'immersive', label: 'Immersive', previewNode: <PlaceholderSVG /> },
    { id: 'minimal', label: 'Minimal Profile', previewNode: <PlaceholderSVG /> },
    { id: 'asymmetric', label: 'Asymmetric', previewNode: <PlaceholderSVG /> },
  ],
  'rich-text': [
    { id: 'default', label: 'Standard', previewNode: <PlaceholderSVG /> },
    { id: 'split', label: 'Split Text', previewNode: <PlaceholderSVG /> },
    { id: 'blur', label: 'Blur Reveal', previewNode: <PlaceholderSVG /> },
    { id: 'shiny', label: 'Shiny Text', previewNode: <PlaceholderSVG /> },
    { id: 'typewriter', label: 'Typewriter', previewNode: <PlaceholderSVG /> },
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
  ],
  gallery: [
    { id: 'default', label: 'Grid', previewNode: <PlaceholderSVG /> },
    { id: 'masonry', label: 'Masonry', previewNode: <PlaceholderSVG /> },
    { id: 'chroma', label: 'Chroma Grid', previewNode: <PlaceholderSVG /> },
    { id: 'bounce', label: 'Bounce Cards', previewNode: <PlaceholderSVG /> },
  ],
  services: [
    { id: 'default', label: 'Standard Grid', previewNode: <PlaceholderSVG /> },
    { id: 'reflective', label: 'Reflective Cards', previewNode: <PlaceholderSVG /> },
    { id: 'spotlight', label: 'Spotlight Hover', previewNode: <PlaceholderSVG /> },
    { id: 'glow', label: 'Border Glow', previewNode: <PlaceholderSVG /> },
  ],
  products: [
    { id: 'default', label: 'Standard Grid', previewNode: <PlaceholderSVG /> },
    { id: 'glare', label: 'Glare Hover', previewNode: <PlaceholderSVG /> },
  ],
  image: [
    { id: 'default', label: 'Standard Image', previewNode: <PlaceholderSVG /> },
    { id: 'scroll-reveal', label: 'Scroll Reveal', previewNode: <PlaceholderSVG /> },
    { id: 'gradual-blur', label: 'Gradual Blur', previewNode: <PlaceholderSVG /> },
    { id: 'silk', label: 'Silk Effect', previewNode: <PlaceholderSVG /> },
    { id: 'gradient-blinds', label: 'Gradient Blinds', previewNode: <PlaceholderSVG /> },
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
};
