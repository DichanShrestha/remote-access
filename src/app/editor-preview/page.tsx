"use client";

import { useState, useEffect } from 'react';
import { PageRenderer } from '@/components/page-render/PageRenderer';
import { PageDocument } from '@/lib/page-engine/schemas';

/**
 * Lightweight route loaded in an iframe by the EditorShell.
 * Listens for `postMessage` events to re-render the live PageDocument.
 * Supports direct canvas click-to-select and active section outlining.
 */
export default function EditorPreviewPage() {
  const [doc, setDoc] = useState<PageDocument | null>(null);
  const [pageId, setPageId] = useState<string | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Receive document updates
      if (event.data?.type === 'UPDATE_DOC') {
        setDoc(event.data.doc);
        setPageId(event.data.pageId);
      }
      
      // Update selected section highlight
      if (event.data?.type === 'SET_SELECTED_ID') {
        setSelectedId(event.data.sectionId || null);
      }

      // Handle scrolling to selected sections
      if (event.data?.type === 'SCROLL_TO') {
        const id = event.data.sectionId;
        setSelectedId(id || null);
        const el = document.getElementById(`preview-section-${id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Notify the parent EditorShell that the iframe is ready to receive data
    window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Direct click selection in the canvas
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchorEl = target.closest('[data-page-anchor]') as HTMLElement | null;
      if (anchorEl) {
        e.preventDefault();
        e.stopPropagation();
        const sectionId = anchorEl.getAttribute('data-page-anchor');
        if (sectionId) {
          setSelectedId(sectionId);
          window.parent.postMessage({ type: 'SELECT_SECTION', sectionId }, '*');
        }
      }
    };

    window.addEventListener('click', handleClick, true);
    return () => window.removeEventListener('click', handleClick, true);
  }, []);

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-sans">
        Loading preview...
      </div>
    );
  }

  return (
    <div className="relative">
      <style>{`
        /* Highlight sections on hover and selection in editor preview */
        [data-page-anchor] {
          cursor: pointer;
          transition: outline 0.15s ease, box-shadow 0.15s ease;
        }
        [data-page-anchor]:hover {
          outline: 2px dashed rgba(59, 130, 246, 0.45) !important;
          outline-offset: -2px;
        }
        ${selectedId ? `
          [data-page-anchor="${selectedId}"] {
            outline: 2.5px solid #2563eb !important;
            outline-offset: -2px;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.18) !important;
            position: relative;
            z-index: 30;
          }
        ` : ''}
      `}</style>
      <PageRenderer document={doc} isPreview={true} pageId={pageId} />
    </div>
  );
}
