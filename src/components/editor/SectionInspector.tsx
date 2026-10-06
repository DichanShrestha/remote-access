"use client";
import React, { useState } from 'react';
import { PageNode, PageSection, SectionType } from '@/lib/page-engine/schemas';
import { isGroup } from '@/lib/page-engine/operations';
import { LayoutGroupInspector } from './LayoutGroupInspector';
import { Plus, Trash, ChevronDown, ChevronUp, Image as ImageIcon, X, Link2, Type, Layout, MousePointerClick, Eye, Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Field definition system ────────────────────────────────────
type FieldType = 'text' | 'textarea' | 'url' | 'select' | 'color' | 'email' | 'number' | 'toggle' | 'datetime' | 'segmented-control';

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

// ── Inspector definitions per component (NON-HERO) ─────────────
const INSPECTOR_DEFS: Partial<Record<SectionType, InspectorDef>> = {
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
  'case-studies': {
    fields: [
      { key: 'content.title', label: 'Section Title', type: 'text' },
      { key: 'content.description', label: 'Description', type: 'textarea' },
      { key: 'content.actionText', label: 'Top Action Label', type: 'text' },
      { key: 'content.actionUrl', label: 'Top Action URL', type: 'url' },
    ],
    arrayFields: [{
      key: 'content.items', label: 'Case Studies',
      itemFields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'imageUrl', label: 'Image URL', type: 'url' },
        { key: 'url', label: 'Link URL', type: 'url' },
        { key: 'buttonText', label: 'Link Label', type: 'text' },
      ],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), title: '', description: '', imageUrl: '', url: '', buttonText: 'Read more' }),
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
      itemFields: [{ key: 'label', label: 'Label', type: 'text' }, { key: 'url', label: 'URL', type: 'url' }, { key: 'badge', label: 'Badge', type: 'text' }, { key: 'isActive', label: 'Active tab', type: 'toggle' }],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), label: '', url: '', isActive: false }),
    }],
  },

  contact: {
    fields: [
      { key: 'content.title', label: 'Title', type: 'text' },
      { key: 'content.description', label: 'Description', type: 'textarea' },
      { key: 'content.buttonText', label: 'Button Label', type: 'text' },
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
  stats: {
    fields: [
      { key: 'content.title', label: 'Section Title', type: 'text' },
      { key: 'content.description', label: 'Description', type: 'textarea' },
    ],
    arrayFields: [{
      key: 'content.items', label: 'Stats',
      itemFields: [
        { key: 'value', label: 'Value', type: 'text', placeholder: 'e.g. 150' },
        { key: 'label', label: 'Label', type: 'text', placeholder: 'e.g. Clients' },
        { key: 'prefix', label: 'Prefix', type: 'text', placeholder: 'e.g. $' },
        { key: 'suffix', label: 'Suffix', type: 'text', placeholder: 'e.g. +' },
      ],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), value: '', label: '', prefix: '', suffix: '' }),
    }],
  },
  'feature-split': {
    fields: [
      { key: 'layout', label: 'Layout', type: 'segmented-control' as FieldType, options: [{ label: 'Image Left', value: 'image-left' }, { label: 'Image Right', value: 'image-right' }] },
      { key: 'content.eyebrow', label: 'Eyebrow', type: 'text' },
      { key: 'content.title', label: 'Title', type: 'text' },
      { key: 'content.description', label: 'Description', type: 'textarea' },
      { key: 'content.imageUrl', label: 'Image URL', type: 'url' },
      { key: 'content.buttonText', label: 'Button Text', type: 'text' },
      { key: 'content.buttonUrl', label: 'Button URL', type: 'url' },
    ],
    arrayFields: [{
      key: 'content.checkpoints', label: 'Checkpoints',
      itemFields: [{ key: 'text', label: 'Text', type: 'text' }],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), text: '' }),
    }],
  },
  'value-cards': {
    fields: [
      { key: 'content.title', label: 'Section Title', type: 'text' },
      { key: 'content.description', label: 'Section Description', type: 'textarea' },
    ],
    arrayFields: [{
      key: 'content.cards', label: 'Cards',
      itemFields: [
        { key: 'author', label: 'Name', type: 'text' },
        { key: 'role', label: 'Role', type: 'text' },
        { key: 'avatarUrl', label: 'Avatar URL', type: 'url' },
        { key: 'quote', label: 'Review / Quote', type: 'textarea' },
        { key: 'metric', label: 'Large Metric', type: 'text', placeholder: 'e.g. +120%' },
        { key: 'label', label: 'Metric Label', type: 'text', placeholder: 'e.g. Revenue' },
      ],
      newItem: () => ({ id: Math.random().toString(36).substr(2, 9), author: '', quote: '', metric: '', label: '' }),
    }],
  },
};

// ── Field renderer (shared) ────────────────────────────────────
function InspectorField({ field, value, onChange }: { field: FieldDef; value: any; onChange: (v: any) => void }) {
  const base = "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition placeholder:text-slate-400";
  switch (field.type) {
    case 'segmented-control':
      return (
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {field.options?.map(o => (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-md text-xs font-medium transition ${value === o.value ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
              {o.value === 'image-left' ? (
                <svg className="w-5 h-5 opacity-75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
              ) : o.value === 'image-right' ? (
                <svg className="w-5 h-5 opacity-75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M15 21V9" /></svg>
              ) : null}
              {o.label}
            </button>
          ))}
        </div>
      );
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

// ── Array field editor (shared) ────────────────────────────────
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
          <div key={item.id || idx} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition" onClick={() => setExpandedIndex(isExpanded ? null : idx)}>
              <span className="text-sm truncate flex-1">{typeof preview === 'string' && preview ? preview : `Item ${idx + 1}`}</span>
              <div className="flex items-center gap-1">
                <button onClick={e => { e.stopPropagation(); const n = [...items]; n.splice(idx, 1); onChange(n); }} className="p-1 text-red-400 hover:text-red-600"><Trash className="w-3 h-3" /></button>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
            {isExpanded && (
              <div className="p-3 flex flex-col gap-3 border-t border-slate-200 dark:border-slate-700">
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

// ══════════════════════════════════════════════════════════════════
// ██ HERO-SPECIFIC INSPECTOR ██
// ══════════════════════════════════════════════════════════════════

/** Collapsible section card used in Hero inspector */
function InspectorGroup({ title, icon, children, defaultOpen = true }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {icon}
          {title}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-4 border-t border-slate-100 dark:border-slate-700/50 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

/** Media picker with thumbnail preview and Supabase upload */
function MediaPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const hasImage = value && value.trim().length > 0;

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('smart-page-assets')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('smart-page-assets')
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const promptUrl = () => {
    const url = prompt('Enter image URL:', value);
    if (url !== null) onChange(url);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        className="hidden" 
      />
      
      {isUploading ? (
        <div className="w-full h-24 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 flex flex-col items-center justify-center gap-2 text-blue-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-medium">Uploading...</span>
        </div>
      ) : hasImage ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
          <img src={value} alt="" className="w-full h-28 object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white rounded-lg text-slate-700 shadow-lg hover:bg-slate-50 transition"
              title="Upload new image"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={promptUrl}
              className="p-2 bg-white rounded-lg text-slate-700 shadow-lg hover:bg-slate-50 transition"
              title="Change URL"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChange('')}
              className="p-2 bg-white rounded-lg text-red-500 shadow-lg hover:bg-red-50 transition"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
          >
            <Upload className="w-5 h-5" />
            <span className="text-xs font-medium">Upload File</span>
          </button>
          <button
            onClick={promptUrl}
            className="flex-1 h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
          >
            <LinkIcon className="w-5 h-5" />
            <span className="text-xs font-medium">Paste URL</span>
          </button>
        </div>
      )}
    </div>
  );
}

/** Compact text input for Hero fields */
function HeroInput({ label, value, onChange, placeholder, multiline }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const base = "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition placeholder:text-slate-400";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      {multiline ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={base + " resize-y"} />
      ) : (
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} />
      )}
    </div>
  );
}

/** Action block card (Primary / Secondary CTA) */
function ActionCard({ title, textValue, urlValue, onTextChange, onUrlChange, textPlaceholder, urlPlaceholder }: {
  title: string;
  textValue: string;
  urlValue: string;
  onTextChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  textPlaceholder?: string;
  urlPlaceholder?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-800/20">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 block">{title}</span>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-slate-400">Label</label>
          <input
            type="text"
            value={textValue || ''}
            onChange={e => onTextChange(e.target.value)}
            placeholder={textPlaceholder || 'Button text'}
            className="w-full px-2.5 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition placeholder:text-slate-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-slate-400 flex items-center gap-1"><Link2 className="w-3 h-3" /> URL</label>
          <input
            type="url"
            value={urlValue || ''}
            onChange={e => onUrlChange(e.target.value)}
            placeholder={urlPlaceholder || 'https://...'}
            className="w-full px-2.5 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition placeholder:text-slate-400"
          />
        </div>
      </div>
    </div>
  );
}

/** The full Hero-specific inspector panel */
function HeroInspector({ section, onChange }: { section: PageSection; onChange: (updated: PageSection) => void }) {
  const handleFieldChange = (path: string, value: any) => onChange(deepSet(section, path, value));

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Layout & Variant */}
      <InspectorGroup title="Layout & Variant" icon={<Layout className="w-3.5 h-3.5" />} defaultOpen={true}>
        <HeroVariantPicker
          currentVariant={(section.variant as string) || 'editorial-center'}
          onChange={(v) => onChange({ ...section, variant: v })}
        />
        {/* Text Contrast Toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Text Contrast
          </label>
          <div className="flex gap-1.5">
            {(['auto', 'light', 'dark'] as const).map((mode) => {
              const isActive = ((section as any).textContrast || 'auto') === mode;
              return (
                <button
                  key={mode}
                  onClick={() => onChange(deepSet(section, 'textContrast', mode))}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>
        {/* Zoom Reveal Toggle */}
        <div className="flex items-center justify-between py-1">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>
            Zoom Reveal Intro
          </label>
          <button
            onClick={() => onChange(deepSet(section, 'zoomReveal', !(section as any).zoomReveal))}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${(section as any).zoomReveal ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${(section as any).zoomReveal ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>
        
        {/* Zoom Word Input (only shown when Zoom Reveal is active) */}
        {(section as any).zoomReveal && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <HeroInput
              label="Zoom Word"
              value={(section as any).zoomWord || ''}
              onChange={v => onChange(deepSet(section, 'zoomWord', v))}
              placeholder="e.g. INK (defaults to first word of Title)"
            />
          </div>
        )}
      </InspectorGroup>

      <SectionAppearance section={section} onChange={onChange} />

      {/* 2. Typography & Content */}
      <InspectorGroup title="Typography & Content" icon={<Type className="w-3.5 h-3.5" />} defaultOpen={true}>
        <HeroInput label="Eyebrow" value={deepGet(section, 'content.eyebrow') || ''} onChange={v => handleFieldChange('content.eyebrow', v)} placeholder="e.g. Designer · Writer · Creator" />
        <HeroInput label="Name / Title" value={deepGet(section, 'content.title') || ''} onChange={v => handleFieldChange('content.title', v)} placeholder="Your name or brand" />
        <HeroInput label="Headline" value={deepGet(section, 'content.headline') || ''} onChange={v => handleFieldChange('content.headline', v)} placeholder="What you do or stand for" />
        <HeroInput label="Description" value={deepGet(section, 'content.subtitle') || ''} onChange={v => handleFieldChange('content.subtitle', v)} placeholder="A short supporting description" multiline />
        <div className="grid grid-cols-2 gap-2.5">
          <HeroInput label="Badge / Status" value={deepGet(section, 'content.badge') || ''} onChange={v => handleFieldChange('content.badge', v)} placeholder="e.g. Open to work" />
          <HeroInput label="Location" value={deepGet(section, 'content.location') || ''} onChange={v => handleFieldChange('content.location', v)} placeholder="San Francisco, CA" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <HeroInput label="Metric Value" value={deepGet(section, 'content.metric') || ''} onChange={v => handleFieldChange('content.metric', v)} placeholder="e.g. 12K" />
          <HeroInput label="Metric Label" value={deepGet(section, 'content.metricLabel') || ''} onChange={v => handleFieldChange('content.metricLabel', v)} placeholder="e.g. followers" />
        </div>
      </InspectorGroup>

      {/* 3. Media & Assets */}
      <InspectorGroup title="Media & Assets" icon={<ImageIcon className="w-3.5 h-3.5" />} defaultOpen={false}>
        <MediaPicker label="Hero Image" value={deepGet(section, 'content.imageUrl') || ''} onChange={v => handleFieldChange('content.imageUrl', v)} />
        <MediaPicker label="Avatar / Photo" value={deepGet(section, 'content.avatarUrl') || ''} onChange={v => handleFieldChange('content.avatarUrl', v)} />
      </InspectorGroup>

      {/* 4. Actions */}
      <InspectorGroup title="Actions" icon={<MousePointerClick className="w-3.5 h-3.5" />} defaultOpen={false}>
        <ActionCard
          title="Primary Action"
          textValue={deepGet(section, 'content.buttonText') || ''}
          urlValue={deepGet(section, 'content.buttonUrl') || ''}
          onTextChange={v => handleFieldChange('content.buttonText', v)}
          onUrlChange={v => handleFieldChange('content.buttonUrl', v)}
          textPlaceholder="Get in Touch"
          urlPlaceholder="https://..."
        />
        <ActionCard
          title="Secondary Action"
          textValue={deepGet(section, 'content.secondaryButtonText') || ''}
          urlValue={deepGet(section, 'content.secondaryButtonUrl') || ''}
          onTextChange={v => handleFieldChange('content.secondaryButtonText', v)}
          onUrlChange={v => handleFieldChange('content.secondaryButtonUrl', v)}
          textPlaceholder="View Work"
          urlPlaceholder="#portfolio"
        />
      </InspectorGroup>

    </div>
  );
}

function SectionAppearance({ section, onChange }: { section: PageSection; onChange: (updated: PageSection) => void }) {
  const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50";
  const supportsButtonColors = ['hero', 'cta', 'url-button', 'image-button', 'email-button', 'file-button', 'lead-form', 'collect-emails', 'booking', 'feature-split', 'contact'].includes(section.type);

  return (
    <div className="mt-1 pt-6 border-t border-slate-200 dark:border-slate-700/50">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">Section Design</label>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">Section Padding</label>
          <select value={section.sectionPadding || ''} onChange={e => onChange({ ...section, sectionPadding: e.target.value ? e.target.value as NonNullable<PageSection['sectionPadding']> : undefined })} className={inputClass}>
            <option value="">Component default</option>
            <option value="none">None</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="custom">Custom</option>
          </select>
          {section.sectionPadding === 'custom' && (
            <div className="mt-2">
              <label className="text-[11px] text-slate-400 mb-1 block">Padding (px)</label>
              <input type="number" min={0} max={160} value={section.customSectionPadding ?? 32} onChange={e => onChange({ ...section, customSectionPadding: Math.max(0, Math.min(160, Number(e.target.value))) })} className={inputClass} />
            </div>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">Content Width</label>
          <select value={section.contentWidth || ''} onChange={e => onChange({ ...section, contentWidth: e.target.value ? e.target.value as NonNullable<PageSection['contentWidth']> : undefined })} className={inputClass}>
            <option value="">Component default</option>
            <option value="narrow">Narrow</option>
            <option value="standard">Standard</option>
            <option value="wide">Wide</option>
            <option value="full">Full</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">Background Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={section.backgroundColor || '#ffffff'}
              onChange={e => onChange({ ...section, backgroundColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0 p-0"
            />
            <button
              onClick={() => onChange({ ...section, backgroundColor: undefined })}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              Clear
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">Text Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={section.textColor || '#000000'}
              onChange={e => onChange({ ...section, textColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0 p-0"
            />
            <button
              onClick={() => onChange({ ...section, textColor: undefined })}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      {supportsButtonColors && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Button Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={section.buttonColor || '#000000'} onChange={e => onChange({ ...section, buttonColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
              <button onClick={() => onChange({ ...section, buttonColor: undefined })} className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">Clear</button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Button Text</label>
            <div className="flex items-center gap-2">
              <input type="color" value={section.buttonTextColor || '#ffffff'} onChange={e => onChange({ ...section, buttonTextColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
              <button onClick={() => onChange({ ...section, buttonTextColor: undefined })} className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Compact variant picker for the Hero */
function HeroVariantPicker({ currentVariant, onChange }: { currentVariant: string; onChange: (v: string) => void }) {
  const variants = [
    { id: 'editorial-center', label: 'Editorial', icon: (
      <svg className="w-full h-full" viewBox="0 0 60 32" fill="none"><rect x="16" y="4" width="28" height="3" rx="1.5" fill="currentColor" opacity="0.6"/><rect x="20" y="10" width="20" height="2" rx="1" fill="currentColor" opacity="0.3"/><rect x="22" y="14" width="16" height="2" rx="1" fill="currentColor" opacity="0.2"/><rect x="23" y="20" width="14" height="4" rx="2" fill="currentColor" opacity="0.4"/></svg>
    )},
    { id: 'split', label: 'Split', icon: (
      <svg className="w-full h-full" viewBox="0 0 60 32" fill="none"><rect x="4" y="6" width="22" height="3" rx="1.5" fill="currentColor" opacity="0.6"/><rect x="4" y="12" width="18" height="2" rx="1" fill="currentColor" opacity="0.3"/><rect x="4" y="17" width="14" height="2" rx="1" fill="currentColor" opacity="0.2"/><rect x="4" y="23" width="10" height="3" rx="1.5" fill="currentColor" opacity="0.4"/><rect x="34" y="4" width="22" height="24" rx="3" fill="currentColor" opacity="0.15"/></svg>
    )},
    { id: 'split-wide', label: 'Wide Split', icon: (
      <svg className="w-full h-full" viewBox="0 0 60 32" fill="none"><rect x="0" y="0" width="29" height="32" fill="currentColor" opacity="0.12"/><rect x="4" y="10" width="18" height="3" rx="1" fill="currentColor" opacity="0.55"/><rect x="4" y="16" width="13" height="2" rx="1" fill="currentColor" opacity="0.3"/><rect x="31" y="0" width="29" height="32" fill="currentColor" opacity="0.2"/></svg>
    )},
    { id: 'immersive', label: 'Immersive', icon: (
      <svg className="w-full h-full" viewBox="0 0 60 32" fill="none"><rect x="0" y="0" width="60" height="32" rx="2" fill="currentColor" opacity="0.12"/><rect x="6" y="18" width="28" height="3" rx="1.5" fill="currentColor" opacity="0.6"/><rect x="6" y="23" width="20" height="2" rx="1" fill="currentColor" opacity="0.3"/><rect x="6" y="27" width="12" height="3" rx="1.5" fill="currentColor" opacity="0.4"/></svg>
    )},
    { id: 'minimal', label: 'Minimal', icon: (
      <svg className="w-full h-full" viewBox="0 0 60 32" fill="none"><circle cx="30" cy="8" r="5" fill="currentColor" opacity="0.2"/><rect x="18" y="16" width="24" height="3" rx="1.5" fill="currentColor" opacity="0.5"/><rect x="22" y="21" width="16" height="2" rx="1" fill="currentColor" opacity="0.2"/><rect x="24" y="26" width="12" height="3" rx="1.5" fill="currentColor" opacity="0.3"/></svg>
    )},
    { id: 'asymmetric', label: 'Asymmetric', icon: (
      <svg className="w-full h-full" viewBox="0 0 60 32" fill="none"><rect x="4" y="8" width="30" height="3" rx="1.5" fill="currentColor" opacity="0.6"/><rect x="4" y="14" width="24" height="2" rx="1" fill="currentColor" opacity="0.3"/><rect x="4" y="19" width="12" height="3" rx="1.5" fill="currentColor" opacity="0.4"/><rect x="40" y="6" width="16" height="20" rx="2" fill="currentColor" opacity="0.15"/></svg>
    )},
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {variants.map((v) => {
        const isActive = currentVariant === v.id;
        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all duration-150 ${
              isActive
                ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/20 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/30'
            }`}
          >
            <div className={`w-full h-10 flex items-center justify-center ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
              {v.icon}
            </div>
            <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500'}`}>
              {v.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}


import { SECTION_VARIANTS } from '@/lib/page-engine/variants';

// ── Main Inspector ─────────────────────────────────────────────
export function SectionInspector({ section, onChange }: { section: PageNode; onChange: (updated: PageNode) => void }) {
  if (isGroup(section)) {
    return <LayoutGroupInspector group={section} onChange={onChange} />;
  }

  // HERO gets its own premium inspector
  if (section.type === 'hero') {
    return <HeroInspector section={section} onChange={onChange} />;
  }

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

      <SectionAppearance section={section} onChange={onChange} />
    </div>
  );
}
