"use client";
import React, { useState, useEffect, useRef } from 'react';
import { PageDocument, PageSection, SectionType } from '@/lib/page-engine/schemas';
import { addSection, removeSection, updateSection, duplicateSection, toggleSectionVisibility } from '@/lib/page-engine/operations';
import { ComponentRegistry } from '@/lib/page-engine/registry';
import { PageRenderer } from '@/components/page-render/PageRenderer';
import { saveDraftConfig, publishPage } from '@/app/editor/actions';
import { composePage, editSection } from '@/app/editor/ai-actions';
import { DraggableSectionList } from './DraggableSectionList';
import { ComponentPicker } from './ComponentPicker';
import { SectionInspector } from './SectionInspector';
import { Send, Plus, Sparkles, Smartphone, Monitor, Undo, Settings, MessageSquare } from 'lucide-react';
import { BotSettingsPanel } from './BotSettingsPanel';


export function EditorShell({
  initialDocument,
  pageId
}: {
  initialDocument: PageDocument;
  pageId: string
}) {
  const [doc, setDoc] = useState<PageDocument>(initialDocument);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [composePrompt, setComposePrompt] = useState('');
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [history, setHistory] = useState<PageDocument[]>([]);
  const [activeTab, setActiveTab] = useState<'design' | 'chatbot'>('design');

  // Autosave
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (pageId === "demo-id") return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      saveDraftConfig(pageId, doc).finally(() => setIsSaving(false));
    }, 2000);
    return () => clearTimeout(timeoutRef.current!);
  }, [doc, pageId]);

  // Scroll to selected section
  useEffect(() => {
    if (selectedSectionId) {
      const el = document.getElementById(`preview-section-${selectedSectionId}`);
      if (el) {
        // Add a slight delay to ensure rendering is complete (e.g. if switching tabs/modes)
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    }
  }, [selectedSectionId]);

  // Wrap setDoc with history tracking
  const updateDoc = (updater: (prev: PageDocument) => PageDocument) => {
    setDoc(prev => {
      setHistory(h => [...h.slice(-20), prev]); // keep last 20 states
      return updater(prev);
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setDoc(prev);
  };

  const handlePublish = async () => {
    if (pageId === "demo-id") {
      alert("Cannot publish in demo mode.");
      return;
    }
    setIsPublishing(true);
    await saveDraftConfig(pageId, doc);
    await publishPage(pageId);
    setIsPublishing(false);
    alert('Page published successfully!');
  };

  const handleAddSection = (type: SectionType) => {
    const meta = ComponentRegistry[type];
    const newSection: PageSection = {
      id: Math.random().toString(36).substring(7),
      isHidden: false,
      ...meta.defaultData()
    } as PageSection;
    updateDoc(prev => addSection(prev, newSection));
    setSelectedSectionId(newSection.id);
  };

  const handleCompose = async () => {
    if (!composePrompt.trim()) return;
    setIsComposing(true);
    try {
      const newDoc = await composePage(composePrompt, pageId);
      updateDoc(() => newDoc);
      setComposePrompt('');
      setSelectedSectionId(null);
    } catch (error) {
      alert("Failed to compose page. Please try again.");
      console.error(error);
    } finally {
      setIsComposing(false);
    }
  };

  const handleAiEdit = async () => {
    if (!editPrompt.trim() || !selectedSectionId) return;
    const section = doc.sections.find(s => s.id === selectedSectionId);
    if (!section) return;

    setIsEditingSection(true);
    try {
      const updatedSection = await editSection(editPrompt, section, pageId);
      updateDoc(prev => updateSection(prev, section.id, updatedSection as any));
      setEditPrompt('');
    } catch (error) {
      alert("Failed to edit section with AI. Please try again.");
      console.error(error);
    } finally {
      setIsEditingSection(false);
    }
  };

  const selectedSection = doc.sections.find(s => s.id === selectedSectionId);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans">

      {/* LEFT COLUMN: Section List */}
      <div className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-base tracking-tight">Sections</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {isSaving ? <span className="animate-pulse text-blue-500">Saving…</span> : <span>Saved</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <DraggableSectionList
            sections={doc.sections}
            selectedSectionId={selectedSectionId}
            onSelect={id => setSelectedSectionId(id)}
            onReorder={sections => updateDoc(prev => ({ ...prev, sections }))}
            onRemove={id => { updateDoc(prev => removeSection(prev, id)); if (selectedSectionId === id) setSelectedSectionId(null); }}
            onDuplicate={id => updateDoc(prev => duplicateSection(prev, id))}
            onToggleHide={id => updateDoc(prev => toggleSectionVisibility(prev, id))}
          />
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowPicker(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm rounded-xl hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            Add Component
          </button>
        </div>
      </div>

      {/* MIDDLE: Live Preview */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            {/* Preview mode toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-md transition ${previewMode === 'desktop' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Desktop preview"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-md transition ${previewMode === 'mobile' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Mobile preview"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            <button onClick={handleUndo} disabled={history.length === 0} className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition" title="Undo">
              <Undo className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {isPublishing ? <span className="animate-spin text-base leading-none">⟳</span> : <Send className="w-4 h-4" />}
              Publish
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-y-auto bg-slate-200/50 dark:bg-slate-950 p-6 flex justify-center items-start">
          <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden min-h-[600px] border border-slate-200 dark:border-slate-800 ring-1 ring-slate-900/5 transition-all duration-300 ${previewMode === 'mobile' ? 'w-[390px]' : 'w-full max-w-5xl'}`}>
            <PageRenderer document={doc} isPreview={true} pageId={pageId} />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Inspector / AI */}
      <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-20">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-base tracking-tight flex items-center gap-4">
            {selectedSection ? (
              <>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500">{ComponentRegistry[selectedSection.type]?.label}</span>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setActiveTab('design')}
                  className={`flex items-center gap-1.5 transition-colors ${activeTab === 'design' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <Settings className="w-4 h-4" />
                  Design
                </button>
                <button 
                  onClick={() => setActiveTab('chatbot')}
                  className={`flex items-center gap-1.5 transition-colors ${activeTab === 'chatbot' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  AI Chatbot
                </button>
              </>
            )}
          </h2>
          {selectedSection && (
            <button onClick={() => setSelectedSectionId(null)} className="text-xs text-blue-500 hover:underline">
              ← Back
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!selectedSection ? (
            activeTab === 'design' ? (
            <div className="flex flex-col gap-6">
              {/* AI Composer */}
              <div className="flex flex-col gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl relative overflow-hidden">
                <div className="absolute -top-4 -right-4 opacity-5">
                  <Sparkles className="w-24 h-24 text-blue-500" />
                </div>
                <h3 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 relative z-10 text-sm">
                  <Sparkles className="w-4 h-4" />
                  AI Page Composer
                </h3>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 relative z-10">
                  Describe your page and AI will generate it instantly.
                </p>
                <textarea
                  value={composePrompt}
                  onChange={e => setComposePrompt(e.target.value)}
                  placeholder="e.g. A portfolio for a fashion photographer with gallery, testimonials, and booking…"
                  className="w-full p-3 text-sm rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-900 relative z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
                <button
                  onClick={handleCompose}
                  disabled={isComposing || !composePrompt.trim()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow transition-all disabled:opacity-50 relative z-10 flex items-center justify-center gap-2"
                >
                  {isComposing ? <span className="animate-spin text-base leading-none">⟳</span> : <Sparkles className="w-4 h-4" />}
                  {isComposing ? 'Generating…' : 'Generate Page'}
                </button>
              </div>

              {/* Theme Settings */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Theme</h3>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Style</label>
                  <select
                    value={doc.theme.style}
                    onChange={e => updateDoc(prev => ({ ...prev, theme: { ...prev.theme, style: e.target.value as any } }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                  >
                    <option value="premium-minimal">Premium Minimal</option>
                    <option value="bold">Bold</option>
                    <option value="playful">Playful</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={doc.theme.primaryColor} onChange={e => updateDoc(prev => ({ ...prev, theme: { ...prev.theme, primaryColor: e.target.value } }))} className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0" />
                    <input type="text" value={doc.theme.primaryColor} onChange={e => updateDoc(prev => ({ ...prev, theme: { ...prev.theme, primaryColor: e.target.value } }))} className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Border Radius</label>
                  <select
                    value={doc.theme.radius}
                    onChange={e => updateDoc(prev => ({ ...prev, theme: { ...prev.theme, radius: e.target.value as any } }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                  >
                    <option value="none">None</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="full">Full</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Density</label>
                  <select
                    value={doc.theme.density}
                    onChange={e => updateDoc(prev => ({ ...prev, theme: { ...prev.theme, density: e.target.value as any } }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                  >
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>
              </div>

              {/* Page Features */}
              <div className="flex flex-col gap-4 mt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Features</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="smoothScroll"
                    checked={!!doc.settings.enableSmoothScrolling}
                    onChange={e => updateDoc(prev => ({ ...prev, settings: { ...prev.settings, enableSmoothScrolling: e.target.checked } }))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="smoothScroll" className="text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                    Enable Smooth Scrolling
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-400 text-center">
                Select a section to edit its content.
              </div>
            </div>
            ) : (
              <BotSettingsPanel pageId={pageId} />
            )
          ) : (
            <div className="flex flex-col gap-5">
              {/* AI Section Editor */}
              <div className="flex flex-col gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl relative overflow-hidden">
                <h3 className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2 text-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Edit
                </h3>
                <textarea
                  value={editPrompt}
                  onChange={e => setEditPrompt(e.target.value)}
                  placeholder="e.g. Make the title more engaging…"
                  className="w-full p-2 text-sm rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={2}
                />
                <button
                  onClick={handleAiEdit}
                  disabled={isEditingSection || !editPrompt.trim()}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isEditingSection ? <span className="animate-spin leading-none">⟳</span> : <Sparkles className="w-3 h-3" />}
                  {isEditingSection ? 'Applying…' : 'Apply Edit'}
                </button>
              </div>

              {/* Data-driven Inspector */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Properties</h3>
                <SectionInspector
                  section={selectedSection}
                  onChange={updated => updateDoc(prev => updateSection(prev, selectedSection.id, updated))}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Component Picker Modal */}
      {showPicker && (
        <ComponentPicker onAdd={handleAddSection} onClose={() => setShowPicker(false)} />
      )}
    </div>
  );
}
