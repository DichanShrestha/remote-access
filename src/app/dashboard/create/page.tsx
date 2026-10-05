"use client";

import React, { useState, useCallback } from 'react';
import { useTemplate } from '../actions';
import { Check, User, Palette, Mail, MapPin, ShoppingBag, Briefcase, X, Eye, Monitor, Smartphone } from 'lucide-react';

type TemplateCategory = 'All' | 'Creator' | 'Business';

interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: 'Creator' | 'Business';
  icon: typeof User;
  previewUrl: string;
  heroVariant: string;
  sections: string[];
}

const TEMPLATES: TemplateInfo[] = [
  // ── Creator ──────────────────────────────────────────────────
  {
    id: 'creator-profile',
    name: 'Creator Profile',
    description: 'For influencers, YouTubers, TikTok creators, and personal brands.',
    category: 'Creator',
    icon: User,
    previewUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80',
    heroVariant: 'Minimal + Zoom Reveal',
    sections: ['Social Links', 'Marquee', 'Gallery', 'Video', 'Lead Form'],
  },
  {
    id: 'creator-portfolio',
    name: 'Creator Portfolio',
    description: 'For designers, developers, photographers, and freelancers.',
    category: 'Creator',
    icon: Palette,
    previewUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    heroVariant: 'Split + Zoom Reveal',
    sections: ['Carousel', 'Services', 'Resume', 'Testimonials', 'Lead Form'],
  },
  {
    id: 'creator-newsletter',
    name: 'Creator Newsletter',
    description: 'For writers, educators, podcasters, and newsletter creators.',
    category: 'Creator',
    icon: Mail,
    previewUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    heroVariant: 'Editorial Center',
    sections: ['Stats', 'Email Collection', 'Audio', 'Social Links'],
  },

  // ── Business ─────────────────────────────────────────────────
  {
    id: 'local-service',
    name: 'Local Service',
    description: 'For tattoo shops, salons, restaurants, clinics, and studios.',
    category: 'Business',
    icon: MapPin,
    previewUrl: 'https://images.unsplash.com/photo-1558904541-efa843a96f0f?w=800&q=80',
    heroVariant: 'Asymmetric',
    sections: ['Services', 'Timeline', 'Testimonials', 'Booking', 'Contact'],
  },
  {
    id: 'product-brand',
    name: 'Product Brand',
    description: 'For ecommerce, fashion, beauty, food brands, and product launches.',
    category: 'Business',
    icon: ShoppingBag,
    previewUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80',
    heroVariant: 'Immersive + Zoom Reveal',
    sections: ['Marquee', 'Products', 'Carousel', 'Email Collection'],
  },
  {
    id: 'professional-service',
    name: 'Professional Service',
    description: 'For agencies, consultants, coaches, and B2B service providers.',
    category: 'Business',
    icon: Briefcase,
    previewUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    heroVariant: 'Split',
    sections: ['Services', 'Testimonials', 'Lead Form', 'Social Links'],
  },
];

// ─── Preview Modal ─────────────────────────────────────────────
function TemplatePreviewModal({
  templateId,
  templateName,
  onClose,
  onUse,
  isCreating,
}: {
  templateId: string;
  templateName: string;
  onClose: () => void;
  onUse: () => void;
  isCreating: boolean;
}) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-[95vw] h-[92vh] max-w-7xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Eye className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{templateName}</h3>
              <p className="text-xs text-slate-500">Live Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Device toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-0.5">
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'desktop'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mobile
              </button>
            </div>

            {/* Use template */}
            <button
              onClick={onUse}
              disabled={isCreating}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Use this template'}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Preview content — iframe gives the page its own viewport so scroll-based effects (zoom reveal) work */}
        <div className="flex-1 overflow-hidden bg-slate-100 flex justify-center">
          <div
            className={`transition-all duration-300 bg-white shadow-lg h-full ${
              viewMode === 'mobile'
                ? 'w-[390px] my-6 rounded-2xl border border-slate-200 overflow-hidden'
                : 'w-full'
            }`}
          >
            <iframe
              src={`/template-preview?id=${templateId}`}
              className="w-full h-full border-0"
              title={`Preview: ${templateName}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function TemplateGallery() {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredTemplates = TEMPLATES.filter(
    t => selectedCategory === 'All' || t.category === selectedCategory
  );

  const handleUseTemplate = useCallback(async (templateId: string) => {
    setIsCreating(true);
    try {
      await useTemplate(templateId);
    } catch (e) {
      console.error(e);
      setIsCreating(false);
    }
  }, []);

  const previewInfo = previewTemplate
    ? TEMPLATES.find(t => t.id === previewTemplate)
    : null;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-3">Choose a template</h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          Each template gives you a complete page with realistic content. You can change everything — layout, sections, text, images, and theme — in the editor.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-10">
        {(['All', 'Creator', 'Business'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Category headings + grid */}
      {(['Creator', 'Business'] as const)
        .filter(cat => selectedCategory === 'All' || selectedCategory === cat)
        .map(cat => {
          const catTemplates = filteredTemplates.filter(t => t.category === cat);
          if (catTemplates.length === 0) return null;
          return (
            <div key={cat} className="mb-14">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">{cat}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catTemplates.map(template => {
                  const Icon = template.icon;
                  const isSelected = selectedTemplate === template.id;
                  return (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`group flex flex-col bg-white border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      {/* Preview image */}
                      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                        <img
                          src={template.previewUrl}
                          alt={template.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-5">
                          <div className="w-full flex gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setPreviewTemplate(template.id); }}
                              className="flex-1 bg-white/90 backdrop-blur-sm text-slate-900 font-semibold py-2.5 rounded-lg shadow-md hover:bg-white transition-colors text-sm flex items-center justify-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Preview
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUseTemplate(template.id); }}
                              disabled={isCreating}
                              className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition-colors text-sm"
                            >
                              Use template
                            </button>
                          </div>
                        </div>
                        {/* Hero variant badge */}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-slate-700 px-2.5 py-1 rounded-md shadow-sm">
                          {template.heroVariant}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <h3 className="text-base font-bold text-slate-900">{template.name}</h3>
                        </div>
                        <p className="text-slate-500 text-sm mb-4 flex-1 leading-relaxed">{template.description}</p>

                        {/* Included sections */}
                        <div className="flex flex-wrap gap-1.5">
                          {template.sections.map((section, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded"
                            >
                              <Check className="w-3 h-3 text-emerald-500" />
                              {section}
                            </span>
                          ))}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 mt-5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setPreviewTemplate(template.id); }}
                            className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Preview
                          </button>
                          <button
                            disabled={isCreating}
                            onClick={(e) => { e.stopPropagation(); handleUseTemplate(template.id); }}
                            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow hover:bg-blue-700'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {isCreating && isSelected ? 'Creating...' : 'Use template'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      {/* Preview Modal */}
      {previewTemplate && previewInfo && (
        <TemplatePreviewModal
          templateId={previewTemplate}
          templateName={previewInfo.name}
          onClose={() => setPreviewTemplate(null)}
          onUse={() => handleUseTemplate(previewTemplate)}
          isCreating={isCreating}
        />
      )}
    </div>
  );
}
