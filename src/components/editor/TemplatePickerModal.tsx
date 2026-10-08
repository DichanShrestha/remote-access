import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { getAvailableTemplatesForClient } from '@/app/actions/template-actions';

type TemplateProps = {
  id: string;
  name: string;
  description: string;
  mood: string;
  category: string;
};

export function TemplatePickerModal({
  onSelect,
  onClose
}: {
  onSelect: (templateId: string) => void;
  onClose: () => void;
}) {
  const [templates, setTemplates] = useState<TemplateProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    getAvailableTemplatesForClient().then(data => {
      setTemplates(data);
      setLoading(false);
    });
  }, []);

  const handleSelect = (id: string) => {
    setApplying(id);
    onSelect(id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Change Template</h2>
            <p className="text-xs text-slate-500">Preview a new template. Your content will be preserved.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm">Loading templates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-end justify-center group">
                    <div className="absolute w-48 h-48 rounded-full top-8 left-1/2 -translate-x-1/2 bg-slate-200/50 dark:bg-slate-700/50" />
                    
                    <div className="relative z-10 w-[140px] h-[220px] border-4 border-slate-800 dark:border-slate-950 border-b-0 rounded-t-2xl bg-white overflow-hidden shadow-xl transform translate-y-6 transition-transform group-hover:translate-y-4">
                      <iframe 
                        src={`/template-preview?id=${template.id}`} 
                        className="border-0 w-[390px] h-[844px] origin-top-left"
                        style={{ transform: 'scale(0.34)' }}
                        loading="lazy"
                        tabIndex={-1}
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {template.category}
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">{template.name}</h3>
                    <p className="text-xs text-slate-500 mb-4 flex-1">{template.description}</p>
                    
                    <button 
                      onClick={() => handleSelect(template.id)}
                      disabled={applying === template.id}
                      className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {applying === template.id ? (
                        <><Loader2 size={14} className="animate-spin" /> Previewing...</>
                      ) : (
                        'Preview Template'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
