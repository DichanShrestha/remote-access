"use client";
import React, { useState, useMemo } from 'react';
import { SectionType } from '@/lib/page-engine/schemas';
import { ComponentRegistry, ComponentMetadata, ComponentCategory, CATEGORY_INFO } from '@/lib/page-engine/registry';
import { Search, X } from 'lucide-react';

// ── Mini visual previews for each component ────────────────────
function ComponentPreview({ type }: { type: SectionType }) {
  const base = "w-full h-full flex flex-col items-center justify-center bg-blue-50/60 dark:bg-blue-900/10 rounded-lg p-3 gap-1.5";
  switch (type) {
    case 'url-button':
      return <div className={base}><div className="flex items-center justify-between w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"><span>Visit my shop</span><svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /></svg></div></div>;
    case 'image-button':
      return <div className={base}><div className="w-full aspect-[2/1] bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><svg className="w-6 h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div></div>;
    case 'carousel':
      return <div className={base}><div className="w-full aspect-[2/1] bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-between px-2"><svg className="w-3 h-3 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg><div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"/><div className="w-1.5 h-1.5 rounded-full bg-blue-200 dark:bg-blue-800"/><div className="w-1.5 h-1.5 rounded-full bg-blue-200 dark:bg-blue-800"/></div><svg className="w-3 h-3 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div></div>;
    case 'video':
      return <div className={base}><div className="w-full aspect-[2/1] bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center gap-2 px-3"><svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg><div className="flex-1 h-1 bg-blue-200 dark:bg-blue-800 rounded-full"><div className="h-1 w-1/3 bg-blue-400 rounded-full"/></div><span className="text-[10px] text-slate-400">2:34</span></div></div>;
    case 'rich-text':
      return <div className={base}><div className="w-full text-left"><div className="text-[10px] font-medium text-slate-600 dark:text-slate-300 mb-1">A little about me</div><div className="h-1 bg-blue-200 dark:bg-blue-800 rounded w-full mb-1"/><div className="h-1 bg-blue-200 dark:bg-blue-800 rounded w-3/4"/></div></div>;
    case 'lead-form':
      return <div className={base}><div className="w-full"><div className="text-[10px] text-slate-500 mb-1">Your name</div><div className="h-5 border border-slate-200 dark:border-slate-700 rounded mb-1.5 bg-white dark:bg-slate-800"/><div className="h-5 rounded text-[10px] font-semibold flex items-center justify-center text-white bg-slate-700">Send message</div></div></div>;
    case 'collect-emails':
      return <div className={base}><div className="w-full"><div className="text-[10px] text-slate-500 mb-1">Your email</div><div className="h-5 border border-slate-200 dark:border-slate-700 rounded mb-1.5 bg-white dark:bg-slate-800"/><div className="h-5 rounded text-[10px] font-semibold flex items-center justify-center text-white bg-slate-700">Subscribe</div></div></div>;
    case 'email-button':
      return <div className={base}><div className="flex items-center justify-between w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"><span>Email me</span><svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div></div>;
    case 'file-button':
      return <div className={base}><div className="flex items-center justify-between w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"><span>Download my guide</span><svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div></div>;
    case 'audio':
      return <div className={base}><div className="flex items-center gap-2 w-full"><svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg><div className="flex-1 h-1 bg-blue-200 dark:bg-blue-800 rounded-full"><div className="h-1 w-1/3 bg-blue-400 rounded-full"/></div><span className="text-[10px] text-slate-400">2:34</span></div></div>;
    case 'resume':
      return <div className={base}><div className="w-full text-left"><div className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Designer · 2022–today</div><div className="h-1 bg-blue-200 dark:bg-blue-800 rounded w-full mt-1 mb-0.5"/><div className="h-1 bg-blue-200 dark:bg-blue-800 rounded w-3/4"/></div></div>;
    case 'quote':
      return <div className={base}><div className="w-full text-left"><div className="text-[10px] italic text-slate-500">"So glad we worked together."</div></div></div>;
    case 'marquee':
      return <div className={base}><div className="w-full bg-blue-100/70 dark:bg-blue-900/30 rounded px-2 py-2 overflow-hidden"><div className="text-[9px] font-black uppercase tracking-wider text-blue-300 whitespace-nowrap">NEW COLLECTION · NEW COLLECTION</div></div></div>;
    case 'timeline':
      return <div className={base}><div className="w-full text-left flex flex-col gap-1"><div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-400 text-[7px] text-white flex items-center justify-center font-bold">1</span><span className="text-[10px]">Discover</span></div><div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-400 text-[7px] text-white flex items-center justify-center font-bold">2</span><span className="text-[10px]">Create</span></div><div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-400 text-[7px] text-white flex items-center justify-center font-bold">3</span><span className="text-[10px]">Launch</span></div></div></div>;
    case 'social-links':
      return <div className={base}><div className="flex gap-2 justify-center"><span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold">IG</span><span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold">TT</span><span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold">X</span></div></div>;
    case 'donate':
      return <div className={base}><div className="flex gap-2 justify-center"><span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-black">P</span><span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-black">V</span><span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-black">$</span></div></div>;
    case 'countdown':
      return <div className={base}><div className="flex gap-3 justify-center"><div className="text-center"><div className="text-lg font-black text-blue-500">07</div><div className="text-[8px] text-slate-400">days</div></div><div className="text-center"><div className="text-lg font-black text-blue-500">12</div><div className="text-[8px] text-slate-400">hours</div></div><div className="text-center"><div className="text-lg font-black text-blue-500">36</div><div className="text-[8px] text-slate-400">mins</div></div></div></div>;
    default:
      return <div className={base}><div className="text-[10px] text-slate-400 text-center">{ComponentRegistry[type]?.label || type}</div></div>;
  }
}

// ── Component Picker ───────────────────────────────────────────
const CATEGORIES: ComponentCategory[] = ['popular', 'share', 'showcase', 'story', 'connect', 'trust', 'organize'];

export function ComponentPicker({
  onAdd,
  onClose,
}: {
  onAdd: (type: SectionType) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | null>(null);

  const filteredEntries = useMemo(() => {
    return (Object.values(ComponentRegistry) as ComponentMetadata[]).filter(entry => {
      const matchesSearch = !search || entry.label.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !activeCategory || entry.categories.includes(activeCategory);
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  // Deduplicate — show each component once even if it's in multiple categories
  const uniqueEntries = useMemo(() => {
    const seen = new Set<SectionType>();
    return filteredEntries.filter(e => { if (seen.has(e.type)) return false; seen.add(e.type); return true; });
  }, [filteredEntries]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Search */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-300" />
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search blocks…"
            className="flex-1 bg-transparent text-base outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
          />
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Category pills — horizontally scrollable */}
        <div className="flex gap-2 px-6 py-3 overflow-x-auto border-b border-slate-100 dark:border-slate-800 scrollbar-none flex-shrink-0">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all whitespace-nowrap ${!activeCategory ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}
          >
            All blocks
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}
            >
              {CATEGORY_INFO[cat].label}
            </button>
          ))}
        </div>

        {/* Grid of component cards */}
        <div className="flex-1 overflow-y-auto p-6">
          {uniqueEntries.length === 0 && (
            <div className="text-center text-slate-300 py-16 text-sm">No blocks match your search.</div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uniqueEntries.map(item => (
              <button
                key={item.type}
                onClick={() => { onAdd(item.type); onClose(); }}
                className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-lg transition-all duration-200 group overflow-hidden text-left"
              >
                {/* Preview area */}
                <div className="h-28 w-full p-2">
                  <ComponentPreview type={item.type} />
                </div>
                {/* Label */}
                <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700/50">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
