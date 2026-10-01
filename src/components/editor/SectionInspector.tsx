"use client";
import React, { useState } from 'react';
import { PageSection, SectionType } from '@/lib/page-engine/schemas';
import { Plus, Trash, ChevronDown, ChevronUp } from 'lucide-react';

// ── Field definition system ────────────────────────────────────
type FieldType = 'text' | 'textarea' | 'url' | 'select' | 'color' | 'email' | 'number' | 'toggle' | 'datetime';

type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
};

type ArrayFieldDef = {
  key: string;
  label: string;
  itemFields: FieldDef[];
  newItem: () => Record<string, any>;
};

type InspectorDef = {
  fields: FieldDef[];
  arrayFields?: ArrayFieldDef[];
};

// ── Deep get/set helpers ───────────────────────────────────────
function deepGet(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

function deepSet(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const clone = JSON.parse(JSON.stringify(obj));
  let current = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] === undefined) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
  return clone;
}

// ── Inspector definitions per component ────────────────────────
const INSPECTOR_DEFS: Partial<Record<SectionType, InspectorDef>> = {
  hero: {
    fields: [
      { key: 'content.eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'e.g. Designer · Writer · Creator' },
      { key: 'content.title', label: 'Name / Title', type: 'text', placeholder: 'Your name or brand' },
      { key: 'content.headline', label: 'Headline', type: 'text', placeholder: 'What you do or stand for' },
      { key: 'content.subtitle', label: 'Description', type: 'textarea', placeholder: 'A short supporting description' },
      { key: 'content.buttonText', label: 'Primary Button', type: 'text', placeholder: 'e.g. Get in Touch' },
      { key: 'content.buttonUrl', label: 'Primary Button URL', type: 'url' },
      { key: 'content.secondaryButtonText', label: 'Secondary Button', type: 'text', placeholder: 'e.g. View Work' },
      { key: 'content.secondaryButtonUrl', label: 'Secondary Button URL', type: 'url' },
      { key: 'content.avatarUrl', label: 'Avatar / Photo URL', type: 'url' },
      { key: 'content.imageUrl', label: 'Hero Image URL', type: 'url' },
      { key: 'content.location', label: 'Location', type: 'text', placeholder: 'e.g. San Francisco, CA' },
      { key: 'content.badge', label: 'Badge / Status', type: 'text', placeholder: 'e.g. Available for work' },
      { key: 'content.metric', label: 'Metric Value', type: 'text', placeholder: 'e.g. 12K' },
      { key: 'content.metricLabel', label: 'Metric Label', type: 'text', placeholder: 'e.g. followers' },
    ],
  },
  'rich-text': {
    fields: [{ key: 'content.text', label: 'Content (HTML)', type: 'textarea' }],
  },
  cta: {
    fields: [
      { key: 'content.title', label: 'Title', type: 'text' },
      { key: 'content.text', label: 'Description', type: 'textarea' },
      { key: 'content.buttonText', label: 'Button Text', type: 'text' },
      { key: 'content.buttonUrl', label: 'Button URL', type: 'url' },
    ],
  },
  'url-button': {
    fields: [
      { key: 'content.label', label: 'Label', type: 'text' },
      { key: 'content.url', label: 'URL', type: 'url' },
      { key: 'content.description', label: 'Description', type: 'text' },
      { key: 'layout', label: 'Style', type: 'select', options: [{ label: 'Filled', value: 'filled' }, { label: 'Outline', value: 'outline' }, { label: 'Ghost', value: 'ghost' }] },
    ],
  },
  'image-button': {
    fields: [
      { key: 'content.imageUrl', label: 'Image URL', type: 'url' },
      { key: 'content.label', label: 'Label', type: 'text' },
      { key: 'content.url', label: 'Link URL', type: 'url' },
    ],
  },
  'email-button': {
    fields: [
      { key: 'content.label', label: 'Label', type: 'text' },
      { key: 'content.email', label: 'Email', type: 'email' },
      { key: 'content.subject', label: 'Subject', type: 'text' },
    ],
  },
  'file-button': {
    fields: [
      { key: 'content.label', label: 'Label', type: 'text' },
      { key: 'content.fileUrl', label: 'File URL', type: 'url' },
      { key: 'content.fileName', label: 'File Name', type: 'text' },
    ],
  },
  'social-links': {
    fields: [{ key: 'layout', label: 'Layout', type: 'select', options: [{ label: 'Row', value: 'row' }, { label: 'Grid', value: 'grid' }] }],
    arrayFields: [{
      key: 'content.links', label: 'Links',
      itemFields: [{ key: 'platform', label: 'Platform', type: 'text' }, { key: 'url', label: 'URL', type: 'url' }],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), platform: '', url: '' }),
    }],
  },
  image: {
    fields: [
      { key: 'content.url', label: 'Image URL', type: 'url' },
      { key: 'content.alt', label: 'Alt Text', type: 'text' },
      { key: 'content.caption', label: 'Caption', type: 'text' },
      { key: 'layout', label: 'Layout', type: 'select', options: [{ label: 'Contained', value: 'contained' }, { label: 'Full Width', value: 'full' }] },
    ],
  },
  gallery: {
    fields: [{ key: 'layout', label: 'Layout', type: 'select', options: [{ label: 'Grid', value: 'grid' }, { label: 'Masonry', value: 'masonry' }] }],
    arrayFields: [{
      key: 'content.images', label: 'Images',
      itemFields: [{ key: 'url', label: 'Image URL', type: 'url' }, { key: 'caption', label: 'Caption', type: 'text' }],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), url: '', caption: '' }),
    }],
  },
  carousel: {
    fields: [],
    arrayFields: [{
      key: 'content.images', label: 'Images',
      itemFields: [{ key: 'url', label: 'Image URL', type: 'url' }, { key: 'caption', label: 'Caption', type: 'text' }],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), url: '', caption: '' }),
    }],
  },
  video: {
    fields: [
      { key: 'content.url', label: 'Video URL', type: 'url', placeholder: 'YouTube or embed URL' },
      { key: 'content.title', label: 'Title', type: 'text' },
    ],
  },
  audio: {
    fields: [
      { key: 'content.url', label: 'Audio URL', type: 'url' },
      { key: 'content.title', label: 'Title', type: 'text' },
      { key: 'content.artist', label: 'Artist', type: 'text' },
    ],
  },
  resume: {
    fields: [{ key: 'content.title', label: 'Section Title', type: 'text' }],
    arrayFields: [{
      key: 'content.items', label: 'Experience',
      itemFields: [
        { key: 'role', label: 'Role', type: 'text' },
        { key: 'company', label: 'Company', type: 'text' },
        { key: 'period', label: 'Period', type: 'text', placeholder: '2022–today' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), role: '', company: '', period: '', description: '' }),
    }],
  },
  services: {
    fields: [{ key: 'content.title', label: 'Section Title', type: 'text' }],
    arrayFields: [{
      key: 'content.items', label: 'Services',
      itemFields: [{ key: 'title', label: 'Title', type: 'text' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'price', label: 'Price', type: 'text' }],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), title: '', description: '', price: '' }),
    }],
  },
  products: {
    fields: [{ key: 'content.title', label: 'Section Title', type: 'text' }],
    arrayFields: [{
      key: 'content.items', label: 'Products',
      itemFields: [{ key: 'title', label: 'Title', type: 'text' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'price', label: 'Price', type: 'text' }, { key: 'imageUrl', label: 'Image URL', type: 'url' }, { key: 'url', label: 'Product URL', type: 'url' }],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), title: '', description: '', price: '', imageUrl: '', url: '' }),
    }],
  },
  testimonials: {
    fields: [{ key: 'content.title', label: 'Section Title', type: 'text' }],
    arrayFields: [{
      key: 'content.items', label: 'Testimonials',
      itemFields: [{ key: 'quote', label: 'Quote', type: 'textarea' }, { key: 'author', label: 'Author', type: 'text' }, { key: 'role', label: 'Role', type: 'text' }, { key: 'avatarUrl', label: 'Avatar URL', type: 'url' }],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), quote: '', author: '', role: '' }),
    }],
  },
  faq: {
    fields: [{ key: 'content.title', label: 'Section Title', type: 'text' }],
    arrayFields: [{
      key: 'content.items', label: 'Questions',
      itemFields: [{ key: 'question', label: 'Question', type: 'text' }, { key: 'answer', label: 'Answer', type: 'textarea' }],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), question: '', answer: '' }),
    }],
  },
  announcement: {
    fields: [
      { key: 'content.text', label: 'Text', type: 'text' },
      { key: 'content.url', label: 'Link URL', type: 'url' },
      { key: 'content.buttonText', label: 'Button Text', type: 'text' },
    ],
  },
  'lead-form': {
    fields: [
      { key: 'content.title', label: 'Title', type: 'text' },
      { key: 'content.description', label: 'Description', type: 'textarea' },
      { key: 'content.buttonText', label: 'Button Text', type: 'text' },
      { key: 'content.successMessage', label: 'Success Message', type: 'text' },
    ],
  },
  'collect-emails': {
    fields: [
      { key: 'content.title', label: 'Title', type: 'text' },
      { key: 'content.placeholder', label: 'Placeholder', type: 'text' },
      { key: 'content.buttonText', label: 'Button Text', type: 'text' },
      { key: 'content.successMessage', label: 'Success Message', type: 'text' },
    ],
  },
  booking: {
    fields: [
      { key: 'content.title', label: 'Title', type: 'text' },
      { key: 'content.description', label: 'Description', type: 'textarea' },
      { key: 'content.provider', label: 'Provider', type: 'select', options: [{ label: 'Cal.com', value: 'cal.com' }, { label: 'Calendly', value: 'calendly' }, { label: 'Custom', value: 'custom' }] },
      { key: 'content.link', label: 'Booking Link', type: 'url' },
    ],
  },
  'link-list': {
    fields: [],
    arrayFields: [{
      key: 'content.links', label: 'Links',
      itemFields: [{ key: 'label', label: 'Label', type: 'text' }, { key: 'url', label: 'URL', type: 'url' }],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), label: '', url: '' }),
    }],
  },
  'ai-chat': {
    fields: [
      { key: 'content.greeting', label: 'Greeting', type: 'text' },
      { key: 'layout', label: 'Layout', type: 'select', options: [{ label: 'Floating', value: 'floating' }, { label: 'Inline', value: 'inline' }] },
    ],
  },
  contact: {
    fields: [
      { key: 'content.title', label: 'Title', type: 'text' },
      { key: 'content.email', label: 'Email', type: 'email' },
      { key: 'content.phone', label: 'Phone', type: 'text' },
      { key: 'content.address', label: 'Address', type: 'textarea' },
    ],
  },
  quote: {
    fields: [
      { key: 'content.text', label: 'Quote', type: 'textarea' },
      { key: 'content.author', label: 'Author', type: 'text' },
    ],
  },
  marquee: {
    fields: [
      { key: 'content.text', label: 'Text', type: 'text' },
      { key: 'layout', label: 'Direction', type: 'select', options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }] },
    ],
  },
  donate: {
    fields: [{ key: 'content.title', label: 'Title', type: 'text' }],
    arrayFields: [{
      key: 'content.links', label: 'Payment Links',
      itemFields: [{ key: 'platform', label: 'Platform', type: 'text', placeholder: 'PayPal, Venmo, etc.' }, { key: 'url', label: 'URL', type: 'url' }],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), platform: '', url: '' }),
    }],
  },
  countdown: {
    fields: [
      { key: 'content.title', label: 'Title', type: 'text' },
      { key: 'content.targetDate', label: 'Target Date & Time', type: 'datetime' },
    ],
  },
  timeline: {
    fields: [{ key: 'content.title', label: 'Section Title', type: 'text' }],
    arrayFields: [{
      key: 'content.items', label: 'Steps',
      itemFields: [{ key: 'label', label: 'Label', type: 'text' }, { key: 'description', label: 'Description', type: 'textarea' }],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), label: '', description: '' }),
    }],
  },
  divider: {
    fields: [{ key: 'layout', label: 'Style', type: 'select', options: [{ label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }] }],
  },
  spacer: {
    fields: [{ key: 'layout', label: 'Size', type: 'select', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }, { label: 'XL', value: 'xl' }] }],
  },
};

// ── Field renderer ─────────────────────────────────────────────
function InspectorField({ field, value, onChange }: { field: FieldDef; value: any; onChange: (v: any) => void }) {
  const base = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
  switch (field.type) {
    case 'textarea':
      return <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} rows={3} className={base + " resize-y"} />;
    case 'select':
      return <select value={value || ''} onChange={e => onChange(e.target.value)} className={base}>{field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
    case 'color':
      return <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />;
    case 'datetime':
      return <input type="datetime-local" value={value || ''} onChange={e => onChange(e.target.value)} className={base} />;
    case 'toggle':
      return <button onClick={() => onChange(!value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${value ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>{value ? 'On' : 'Off'}</button>;
    default:
      return <input type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} className={base} />;
  }
}

// ── Array field editor ─────────────────────────────────────────
function ArrayFieldEditor({ def, items, onChange }: { def: ArrayFieldDef; items: any[]; onChange: (items: any[]) => void }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{def.label}</span>
        <button onClick={() => onChange([...items, def.newItem()])} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium"><Plus className="w-3 h-3" /> Add</button>
      </div>
      {items.map((item, idx) => {
        const isExpanded = expandedIndex === idx;
        const preview = item[def.itemFields[0].key] || `${def.label} #${idx + 1}`;
        return (
          <div key={item.id || idx} className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-700/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition" onClick={() => setExpandedIndex(isExpanded ? null : idx)}>
              <span className="text-sm truncate flex-1">{typeof preview === 'string' && preview ? preview : `Item ${idx + 1}`}</span>
              <div className="flex items-center gap-1">
                <button onClick={e => { e.stopPropagation(); const n = [...items]; n.splice(idx, 1); onChange(n); }} className="p-1 text-red-400 hover:text-red-600"><Trash className="w-3 h-3" /></button>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
            {isExpanded && (
              <div className="p-3 flex flex-col gap-3 border-t border-slate-200 dark:border-slate-600">
                {def.itemFields.map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">{field.label}</label>
                    <InspectorField field={field} value={item[field.key]} onChange={v => { const n = [...items]; n[idx] = { ...n[idx], [field.key]: v }; onChange(n); }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

import { SECTION_VARIANTS } from '@/lib/page-engine/variants';

// ── Main Inspector ─────────────────────────────────────────────
export function SectionInspector({ section, onChange }: { section: PageSection; onChange: (updated: PageSection) => void }) {
  const def = INSPECTOR_DEFS[section.type];
  
  const handleFieldChange = (path: string, value: any) => onChange(deepSet(section, path, value));

  const variants = SECTION_VARIANTS[section.type];

  return (
    <div className="flex flex-col gap-6">
      {variants && variants.length > 0 && (
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Layout Variant</label>
          <div className="grid grid-cols-2 gap-3">
            {variants.map(v => {
              const isActive = (section.variant || 'default') === v.id;
              return (
                <button 
                  key={v.id}
                  onClick={() => onChange({ ...section, variant: v.id })}
                  className={`flex flex-col gap-2 p-2 rounded-xl border-2 transition-all ${isActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'}`}
                >
                  <div className="h-16 w-full rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700">
                    {v.previewNode}
                  </div>
                  <span className={`text-[10px] font-semibold text-center w-full ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {v.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!def ? (
        <div className="text-sm text-slate-400 italic py-4 text-center">No editable properties. Use AI Edit above!</div>
      ) : (
        <div className="flex flex-col gap-5">
          {def.fields.map(field => (
            <div key={field.key}>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">{field.label}</label>
              <InspectorField field={field} value={deepGet(section, field.key)} onChange={v => handleFieldChange(field.key, v)} />
            </div>
          ))}
          {def.arrayFields?.map(arrayDef => (
            <ArrayFieldEditor key={arrayDef.key} def={arrayDef} items={deepGet(section, arrayDef.key) || []} onChange={items => handleFieldChange(arrayDef.key, items)} />
          ))}
        </div>
      )}
    </div>
  );
}
