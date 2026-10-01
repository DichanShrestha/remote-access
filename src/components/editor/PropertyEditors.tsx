import React from 'react';
import { PageSection, ThemeConfig, PageDocument } from '@/lib/page-engine/schemas';

interface EditorProps<T extends PageSection> {
  section: T;
  onChange: (updates: Partial<T>) => void;
}

export function HeroEditor({ section, onChange }: EditorProps<Extract<PageSection, { type: 'hero' }>>) {
  const { content, layout } = section;
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div>
        <label className="block text-slate-500 mb-1">Title</label>
        <input 
          type="text" 
          value={content.title} 
          onChange={e => onChange({ content: { ...content, title: e.target.value } })}
          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900" 
        />
      </div>
      <div>
        <label className="block text-slate-500 mb-1">Subtitle</label>
        <textarea 
          value={content.subtitle || ''} 
          onChange={e => onChange({ content: { ...content, subtitle: e.target.value } })}
          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900" 
        />
      </div>
      <div>
        <label className="block text-slate-500 mb-1">Button Text</label>
        <input 
          type="text" 
          value={content.buttonText || ''} 
          onChange={e => onChange({ content: { ...content, buttonText: e.target.value } })}
          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900" 
        />
      </div>
      <div>
        <label className="block text-slate-500 mb-1">Button URL</label>
        <input 
          type="text" 
          value={content.buttonUrl || ''} 
          onChange={e => onChange({ content: { ...content, buttonUrl: e.target.value } })}
          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900" 
        />
      </div>
      <div>
        <label className="block text-slate-500 mb-1">Layout</label>
        <select 
          value={layout} 
          onChange={e => onChange({ layout: e.target.value as any })}
          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
        >
          <option value="center">Center</option>
          <option value="left">Left</option>
          <option value="split">Split</option>
        </select>
      </div>
    </div>
  );
}

export function RichTextEditor({ section, onChange }: EditorProps<Extract<PageSection, { type: 'rich-text' }>>) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div>
        <label className="block text-slate-500 mb-1">Text (HTML allowed)</label>
        <textarea 
          rows={6}
          value={section.content.text} 
          onChange={e => onChange({ content: { ...section.content, text: e.target.value } })}
          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900" 
        />
      </div>
    </div>
  );
}

export function AiChatEditor({ section, onChange }: EditorProps<Extract<PageSection, { type: 'ai-chat' }>>) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div>
        <label className="block text-slate-500 mb-1">Greeting</label>
        <input 
          type="text" 
          value={section.content.greeting || ''} 
          onChange={e => onChange({ content: { ...section.content, greeting: e.target.value } })}
          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900" 
        />
      </div>
      <div>
        <label className="block text-slate-500 mb-1">Layout</label>
        <select 
          value={section.layout} 
          onChange={e => onChange({ layout: e.target.value as any })}
          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
        >
          <option value="floating">Floating Bubble</option>
          <option value="inline">Inline Block</option>
        </select>
      </div>
    </div>
  );
}

export function LinkListEditor({ section, onChange }: EditorProps<Extract<PageSection, { type: 'link-list' }>>) {
  const { content } = section;
  return (
    <div className="flex flex-col gap-4 text-sm">
      <h3 className="font-semibold text-slate-700 dark:text-slate-200">Links</h3>
      {content.links.map((link, idx) => (
        <div key={link.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col gap-2">
          <input 
            type="text" 
            placeholder="Label"
            value={link.label} 
            onChange={e => {
              const newLinks = [...content.links];
              newLinks[idx] = { ...link, label: e.target.value };
              onChange({ content: { ...content, links: newLinks } });
            }}
            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900" 
          />
          <input 
            type="text" 
            placeholder="URL"
            value={link.url} 
            onChange={e => {
              const newLinks = [...content.links];
              newLinks[idx] = { ...link, url: e.target.value };
              onChange({ content: { ...content, links: newLinks } });
            }}
            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900" 
          />
        </div>
      ))}
      <button 
        onClick={() => onChange({ content: { ...content, links: [...content.links, { id: Math.random().toString(), label: 'New Link', url: '#' }] } })}
        className="w-full py-2 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
      >
        + Add Link
      </button>
    </div>
  );
}

export function FaqEditor({ section, onChange }: EditorProps<Extract<PageSection, { type: 'faq' }>>) {
  const { content } = section;
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div>
        <label className="block text-slate-500 mb-1">Title</label>
        <input 
          type="text" 
          value={content.title || ''} 
          onChange={e => onChange({ content: { ...content, title: e.target.value } })}
          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900" 
        />
      </div>
      <h3 className="font-semibold text-slate-700 dark:text-slate-200">Questions</h3>
      {content.items.map((item, idx) => (
        <div key={item.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col gap-2">
          <input 
            type="text" 
            placeholder="Question"
            value={item.question} 
            onChange={e => {
              const newItems = [...content.items];
              newItems[idx] = { ...item, question: e.target.value };
              onChange({ content: { ...content, items: newItems } });
            }}
            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900" 
          />
          <textarea 
            placeholder="Answer"
            value={item.answer} 
            onChange={e => {
              const newItems = [...content.items];
              newItems[idx] = { ...item, answer: e.target.value };
              onChange({ content: { ...content, items: newItems } });
            }}
            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900" 
          />
        </div>
      ))}
      <button 
        onClick={() => onChange({ content: { ...content, items: [...content.items, { id: Math.random().toString(), question: 'New Question?', answer: 'Answer here.' }] } })}
        className="w-full py-2 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
      >
        + Add Question
      </button>
    </div>
  );
}

export function ThemeEditor({ theme, onChange }: { theme: ThemeConfig, onChange: (t: ThemeConfig) => void }) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <div>
        <label className="block text-slate-500 mb-1">Theme Style</label>
        <select 
          value={theme.style} 
          onChange={e => onChange({ ...theme, style: e.target.value as any })}
          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
        >
          <option value="premium-minimal">Premium Minimal</option>
          <option value="bold">Bold</option>
          <option value="playful">Playful</option>
        </select>
      </div>
      <div>
        <label className="block text-slate-500 mb-1">Primary Color</label>
        <div className="flex gap-2">
          <input 
            type="color" 
            value={theme.primaryColor} 
            onChange={e => onChange({ ...theme, primaryColor: e.target.value })}
            className="w-10 h-10 border-0 p-0" 
          />
          <input 
            type="text" 
            value={theme.primaryColor} 
            onChange={e => onChange({ ...theme, primaryColor: e.target.value })}
            className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900" 
          />
        </div>
      </div>
      <div>
        <label className="block text-slate-500 mb-1">Border Radius</label>
        <select 
          value={theme.radius} 
          onChange={e => onChange({ ...theme, radius: e.target.value as any })}
          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
        >
          <option value="none">None</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="full">Full (Pill)</option>
        </select>
      </div>
    </div>
  );
}
