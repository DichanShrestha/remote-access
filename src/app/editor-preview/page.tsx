"use client";

import { useState, useEffect } from 'react';
import { PageRenderer } from '@/components/page-render/PageRenderer';
import { PageDocument } from '@/lib/page-engine/schemas';

/**
 * Lightweight route loaded in an iframe by the EditorShell.
 * Listens for `postMessage` events to re-render the live PageDocument.
 */
export default function EditorPreviewPage() {
  const [doc, setDoc] = useState<PageDocument | null>(null);
  const [pageId, setPageId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Receive document updates
      if (event.data?.type === 'UPDATE_DOC') {
        setDoc(event.data.doc);
        setPageId(event.data.pageId);
      }
      
      // Handle scrolling to selected sections
      if (event.data?.type === 'SCROLL_TO') {
        const el = document.getElementById(`preview-section-${event.data.sectionId}`);
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

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-sans">
        Loading preview...
      </div>
    );
  }

  // Use isPreview={true} to disable Analytics / Chatbot in the preview window
  // But because we're in an iframe, smooth scrolling and scroll-bound animations will still work normally!
  return <PageRenderer document={doc} isPreview={true} pageId={pageId} />;
}
