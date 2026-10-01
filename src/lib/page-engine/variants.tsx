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
    { 
      id: 'flex', 
      label: 'Flex Carousel',
      previewNode: (
        <div className="w-full h-full bg-slate-100 flex gap-0.5 items-center justify-center p-1">
          <div className="w-1/4 h-full bg-slate-300 rounded-sm"></div>
          <div className="w-1/2 h-full bg-blue-400 rounded-sm"></div>
          <div className="w-1/4 h-full bg-slate-300 rounded-sm"></div>
        </div>
      )
    },
    { 
      id: 'circular', 
      label: 'Circular Ring',
      previewNode: (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-slate-300 border-t-blue-400"></div>
        </div>
      )
    },
    { 
      id: 'depth', 
      label: '3D Depth',
      previewNode: (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center relative">
          <div className="absolute w-4 h-6 bg-slate-300 rounded-sm -translate-x-3 scale-75 opacity-50"></div>
          <div className="absolute w-4 h-6 bg-slate-300 rounded-sm translate-x-3 scale-75 opacity-50"></div>
          <div className="absolute w-5 h-7 bg-blue-400 rounded-sm shadow-lg z-10"></div>
        </div>
      )
    },
  ],
};
