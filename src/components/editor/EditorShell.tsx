"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GroupNode, PageDocument, PageNode, PageSection, SectionType } from '@/lib/page-engine/schemas';
import { findNode, findNodeParentId, insertNode, isGroup, moveNode, removeSection, updateNode, updateSection, duplicateSection, toggleSectionVisibility, getNodeDepth } from '@/lib/page-engine/operations';
import { ComponentRegistry } from '@/lib/page-engine/registry';

import { saveDraftConfig } from '@/app/editor/actions';
import { composePage, editSection } from '@/app/editor/ai-actions';
import { DraggableSectionList } from './DraggableSectionList';
import { ComponentPicker } from './ComponentPicker';
import { SectionInspector } from './SectionInspector';
import { Send, Plus, Sparkles, Smartphone, Monitor, Undo, Settings, Bot, Layers, Layout } from 'lucide-react';
import { BotSettingsDrawer } from './BotSettingsDrawer';
import { TemplatePickerModal } from './TemplatePickerModal';
import { previewTemplate } from '@/app/actions/template-actions';
export function EditorShell({
  initialDocument,
  pageId
}: {
  initialDocument: PageDocument;
  pageId: string
}) {
  const router = useRouter();
  const [doc, setDoc] = useState<PageDocument>(initialDocument);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [insertionGroupId, setInsertionGroupId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [composePrompt, setComposePrompt] = useState('');
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [history, setHistory] = useState<PageDocument[]>([]);
  const [showBotDrawer, setShowBotDrawer] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // Sync doc to iframe whenever it changes
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'UPDATE_DOC', doc, pageId },
        '*'
      );
    }
  }, [doc, pageId]);

  // Handle initialization message from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'PREVIEW_READY') {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            { type: 'UPDATE_DOC', doc, pageId },
            '*'
          );
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [doc, pageId]);

  // Scroll to selected section via iframe
  useEffect(() => {
    if (selectedSectionId && iframeRef.current?.contentWindow) {
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'SCROLL_TO', sectionId: selectedSectionId },
          '*'
        );
      }, 50);
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
    try {
      await saveDraftConfig(pageId, doc);
      router.push('/onboarding/claim');
    } catch (error) {
      console.error(error);
      setIsPublishing(false);
      alert('Your changes could not be saved. Please try again.');
    }
  };

  const handleAddSection = (type: SectionType) => {
    const meta = ComponentRegistry[type];
    const newSection: PageSection = {
      id: Math.random().toString(36).substring(7),
      isHidden: false,
      ...meta.defaultData()
    } as PageSection;
    const insertionTarget = insertionGroupId ? findNode(doc.sections, insertionGroupId) : undefined;
    const parent = insertionTarget && isGroup(insertionTarget) ? insertionTarget.id : undefined;
    updateDoc(prev => insertNode(prev, newSection, parent));
    setSelectedSectionId(newSection.id);
  };

  const handleAddGroup = (parentId?: string) => {
    const currentSelection = selectedSectionId ? findNode(doc.sections, selectedSectionId) : undefined;
    const requestedParent = parentId ?? (currentSelection && isGroup(currentSelection) ? currentSelection.id : insertionGroupId ?? undefined);
    const parentDepth = requestedParent ? getNodeDepth(doc.sections, requestedParent) : 0;
    if (requestedParent && (parentDepth === undefined || parentDepth >= 4)) return;
    const group: GroupNode = {
      kind: 'group',
      id: Math.random().toString(36).slice(2, 11),
      name: 'Layout Group',
      direction: 'column',
      horizontalAlign: 'left',
      verticalAlign: 'top',
      width: 'full',
      customWidth: 100,
      gap: 'medium',
      customGap: 24,
      padding: 'medium',
      customPadding: 24,
      mobileDirection: 'column',
      children: [],
    };
    updateDoc(prev => insertNode(prev, group, requestedParent));
    setSelectedSectionId(group.id);
    setInsertionGroupId(group.id);
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
    const section = findNode(doc.sections, selectedSectionId);
    if (!section || isGroup(section)) return;

    setIsEditingSection(true);
    try {
      const updatedSection = await editSection(editPrompt, section, pageId);
      updateDoc(prev => updateSection(prev, section.id, updatedSection as Partial<PageSection>));
      setEditPrompt('');
    } catch (error) {
      alert("Failed to edit section with AI. Please try again.");
      console.error(error);
    } finally {
      setIsEditingSection(false);
    }
  };

  const handleTemplateChange = async (templateId: string) => {
    try {
      const mergedDoc = await previewTemplate(doc, templateId);
      updateDoc(() => mergedDoc);
      setShowTemplatePicker(false);
    } catch (error) {
      alert("Failed to preview template. Please try again.");
      console.error(error);
    }
  };

  const selectedSection = selectedSectionId ? findNode(doc.sections, selectedSectionId) : undefined;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans">

      {/* LEFT COLUMN: Section List */}
      <div className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-base tracking-tight">Layers</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {isSaving ? <span className="animate-pulse text-blue-500">Saving…</span> : <span>Saved</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <DraggableSectionList
            nodes={doc.sections}
            selectedNodeId={selectedSectionId}
            onSelect={id => {
              setSelectedSectionId(id);
              const node = findNode(doc.sections, id);
              setInsertionGroupId(node && isGroup(node) ? node.id : findNodeParentId(doc.sections, id) ?? null);
            }}
            onMove={(id, parentId, index) => updateDoc(prev => moveNode(prev, id, parentId, index))}
            onRemove={id => {
              const removed = findNode(doc.sections, id);
              updateDoc(prev => removeSection(prev, id));
              if (selectedSectionId === id || (removed && isGroup(removed) && selectedSectionId && findNode(removed.children, selectedSectionId))) setSelectedSectionId(null);
              if (insertionGroupId === id || (removed && isGroup(removed) && insertionGroupId && findNode(removed.children, insertionGroupId))) setInsertionGroupId(null);
            }}
            onDuplicate={id => updateDoc(prev => duplicateSection(prev, id))}
            onToggleHide={id => updateDoc(prev => toggleSectionVisibility(prev, id))}
            onAddGroup={handleAddGroup}
            onAddComponent={parentId => { setInsertionGroupId(parentId ?? null); if (parentId) setSelectedSectionId(parentId); setShowPicker(true); }}
          />
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex gap-2">
            <button onClick={() => handleAddGroup()} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
              <Layers className="h-4 w-4" /> Group
            </button>
            <button onClick={() => setShowPicker(true)} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:opacity-90 dark:bg-white dark:text-slate-900">
              <Plus className="h-4 w-4" /> {insertionGroupId ? 'Add to Group' : 'Component'}
            </button>
          </div>
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
              onClick={() => setShowBotDrawer(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#F3F2EA] hover:bg-[#E8E7E1] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#292A25] dark:text-slate-100 font-semibold text-xs rounded-xl border border-[#E8E7E1] dark:border-slate-700 transition-all cursor-pointer shadow-xs"
              title="Configure AI Chatbot"
            >
              <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              AI Chatbot
            </button>

            <button
              onClick={() => setShowTemplatePicker(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
              title="Change Template"
            >
              <Layout className="w-4 h-4" />
              Change Template
            </button>

            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPublishing ? <span className="animate-spin text-base leading-none">⟳</span> : <Send className="w-4 h-4" />}
              Publish
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-hidden bg-slate-200/50 dark:bg-slate-950 p-6 flex justify-center items-start">
          <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden h-full border border-slate-200 dark:border-slate-800 ring-1 ring-slate-900/5 transition-all duration-300 ${previewMode === 'mobile' ? 'w-[390px]' : 'w-full max-w-5xl'}`}>
            <iframe
              ref={iframeRef}
              src="/editor-preview"
              className="w-full h-full border-0"
              title="Editor Preview"
            />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Inspector */}
      <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-20">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-base tracking-tight flex items-center gap-4">
            {selectedSection ? (
              <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
                {isGroup(selectedSection) ? selectedSection.name || 'Layout Group' : ComponentRegistry[selectedSection.type]?.label}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Settings className="w-4 h-4 text-slate-400" />
                Design Settings
              </span>
            )}
          </h2>
          {selectedSection && (
            <button onClick={() => { setSelectedSectionId(null); setInsertionGroupId(null); }} className="text-xs text-blue-500 hover:underline">
              ← Back
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!selectedSection ? (
            <div className="flex flex-col gap-6">
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
            <div className="flex flex-col gap-5">
              {/* Data-driven Inspector */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Properties</h3>
                <SectionInspector
                  section={selectedSection}
                  onChange={updated => updateDoc(prev => updateNode(prev, selectedSection.id, updated as Partial<PageNode>))}
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

      {/* Template Picker Modal */}
      {showTemplatePicker && (
        <TemplatePickerModal onSelect={handleTemplateChange} onClose={() => setShowTemplatePicker(false)} />
      )}

      {/* AI Chatbot Slide-Over Drawer */}
      <BotSettingsDrawer
        pageId={pageId}
        isOpen={showBotDrawer}
        onClose={() => setShowBotDrawer(false)}
      />
    </div>
  );
}
