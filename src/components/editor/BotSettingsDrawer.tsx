"use client";

import React, { useState, useEffect } from "react";
import { getOrCreateBotForPage, updateBotSettings } from "@/app/actions/chatbot-settings-actions";
import { 
  X, 
  Save, 
  Bot, 
  MessageSquare, 
  Shield, 
  Palette, 
  Brain, 
  ExternalLink, 
  Check, 
  Loader2, 
  Power
} from "lucide-react";
import Link from "next/link";

interface BotSettingsDrawerProps {
  pageId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BotSettingsDrawer({ pageId, isOpen, onClose }: BotSettingsDrawerProps) {
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (pageId === "demo-id") {
      setLoading(false);
      return;
    }
    setLoading(true);
    getOrCreateBotForPage(pageId)
      .then((b) => {
        setBot(b);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load bot settings:", err);
        setError("Failed to load chatbot configuration.");
        setLoading(false);
      });
  }, [pageId, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (pageId === "demo-id" || !bot) return;
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const updated = await updateBotSettings(bot.id, bot);
      setBot(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to save bot settings:", err);
      setError(err?.message || "Failed to save chatbot settings.");
    } finally {
      setSaving(false);
    }
  };

  const isBotActive = bot?.status === "active";

  const handleToggleStatus = () => {
    if (!bot) return;
    const nextStatus = isBotActive ? "draft" : "active";
    setBot({ ...bot, status: nextStatus });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#292A25]/40 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-md bg-[#FDFCF8] dark:bg-slate-900 h-full shadow-2xl border-l border-[#E8E7E1] dark:border-slate-800 flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#E8E7E1] dark:border-slate-800 flex items-center justify-between bg-[#FDFCF8] dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#292A25] text-[#FDFCF8] flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#292A25] dark:text-slate-100 font-serif">
                AI Chatbot
              </h2>
              <p className="text-xs text-[#777970] dark:text-slate-400">
                Configure your page's conversational assistant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#777970] hover:text-[#292A25] dark:hover:text-slate-200 hover:bg-[#F3F2EA] dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-sm text-[#777970] gap-3">
              <Loader2 size={24} className="animate-spin text-[#292A25]" />
              <span>Loading Chatbot Configuration…</span>
            </div>
          ) : pageId === "demo-id" ? (
            <div className="p-6 text-sm text-[#777970] text-center bg-[#FAF9F5] border border-[#E8E7E1] rounded-2xl">
              <Bot className="w-10 h-10 text-[#292A25] mx-auto mb-3 opacity-60" />
              <p className="font-semibold text-[#292A25] mb-1">Demo Mode</p>
              <p className="text-xs leading-relaxed">
                AI Chatbot configuration is available on live pages. Sign in to activate your AI Assistant.
              </p>
            </div>
          ) : bot && (
            <>
              {/* Enable / Disable Toggle Card */}
              <div className="p-4 bg-[#FAF9F5] dark:bg-slate-800/40 border border-[#E8E7E1] dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isBotActive ? "bg-emerald-100 text-emerald-700" : "bg-[#E8E7E1] text-[#777970]"
                  }`}>
                    <Power size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#292A25] dark:text-slate-200 block">
                      Chatbot Status
                    </span>
                    <span className="text-[11px] text-[#777970] dark:text-slate-400">
                      {isBotActive ? "Active on live page" : "Disabled"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    isBotActive 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                      : "bg-[#F3F2EA] text-[#777970] border-[#E8E7E1] hover:bg-[#E8E7E1]"
                  }`}
                >
                  {isBotActive ? "Enabled" : "Disabled"}
                </button>
              </div>

              {/* Section 1: General Info */}
              <div className="space-y-4 p-4 bg-[#FDFCF8] dark:bg-slate-800/20 border border-[#E8E7E1] dark:border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E8E7E1] dark:border-slate-800">
                  <MessageSquare size={15} className="text-[#777970]" />
                  <h3 className="text-xs font-bold text-[#A1A299] uppercase tracking-wider">
                    General Settings
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292A25] dark:text-slate-300 mb-1.5">
                    Bot Name
                  </label>
                  <input
                    type="text"
                    value={bot.name || ""}
                    onChange={(e) => setBot({ ...bot, name: e.target.value })}
                    placeholder="e.g. Smart Assistant"
                    className="w-full px-3.5 py-2 bg-[#FDFCF8] dark:bg-slate-900 border border-[#E8E7E1] dark:border-slate-700 rounded-lg text-xs text-[#292A25] dark:text-slate-200 focus:outline-hidden focus:border-[#292A25]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292A25] dark:text-slate-300 mb-1.5">
                    Welcome Message
                  </label>
                  <textarea
                    value={bot.welcomeMessage || ""}
                    onChange={(e) => setBot({ ...bot, welcomeMessage: e.target.value })}
                    rows={2}
                    placeholder="Hi! How can I help you today?"
                    className="w-full px-3.5 py-2 bg-[#FDFCF8] dark:bg-slate-900 border border-[#E8E7E1] dark:border-slate-700 rounded-lg text-xs text-[#292A25] dark:text-slate-200 focus:outline-hidden focus:border-[#292A25] resize-none"
                  />
                </div>
              </div>

              {/* Section 2: AI System Prompt */}
              <div className="space-y-4 p-4 bg-[#FDFCF8] dark:bg-slate-800/20 border border-[#E8E7E1] dark:border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E8E7E1] dark:border-slate-800">
                  <Shield size={15} className="text-[#777970]" />
                  <h3 className="text-xs font-bold text-[#A1A299] uppercase tracking-wider">
                    AI Behavior & Instructions
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292A25] dark:text-slate-300 mb-1.5">
                    System Prompt
                  </label>
                  <textarea
                    value={bot.systemPrompt || ""}
                    onChange={(e) => setBot({ ...bot, systemPrompt: e.target.value })}
                    rows={4}
                    placeholder="Define tone, guidelines, and instructions for how the AI should answer visitors..."
                    className="w-full px-3.5 py-2 bg-[#FDFCF8] dark:bg-slate-900 border border-[#E8E7E1] dark:border-slate-700 rounded-lg text-xs text-[#292A25] dark:text-slate-200 focus:outline-hidden focus:border-[#292A25] resize-y font-sans"
                  />
                  <p className="text-[11px] text-[#777970] mt-1.5">
                    Guide your assistant's tone, offer summaries, or specify actions when greeting visitors.
                  </p>
                </div>
              </div>

              {/* Section 3: Appearance & Lead Form */}
              <div className="space-y-4 p-4 bg-[#FDFCF8] dark:bg-slate-800/20 border border-[#E8E7E1] dark:border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E8E7E1] dark:border-slate-800">
                  <Palette size={15} className="text-[#777970]" />
                  <h3 className="text-xs font-bold text-[#A1A299] uppercase tracking-wider">
                    Appearance & Leads
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#292A25] dark:text-slate-300 mb-1.5">
                    Widget Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bot.colorTheme || "#292A25"}
                      onChange={(e) => setBot({ ...bot, colorTheme: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={bot.colorTheme || "#292A25"}
                      onChange={(e) => setBot({ ...bot, colorTheme: e.target.value })}
                      className="flex-1 px-3 py-1.5 text-xs font-mono bg-[#FDFCF8] dark:bg-slate-900 border border-[#E8E7E1] dark:border-slate-700 rounded-lg text-[#292A25] dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <label htmlFor="enableLeadsToggle" className="text-xs font-semibold text-[#292A25] dark:text-slate-200 cursor-pointer block">
                      Require Lead Capture Form
                    </label>
                    <span className="text-[11px] text-[#777970] dark:text-slate-400 block">
                      Ask visitors for name & email before chatting
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    id="enableLeadsToggle"
                    checked={!!bot.collectLeads}
                    onChange={(e) => setBot({ ...bot, collectLeads: e.target.checked })}
                    className="w-4 h-4 rounded border-[#E8E7E1] text-[#292A25] focus:ring-[#292A25] cursor-pointer"
                  />
                </div>
              </div>

              {/* Section 4: Knowledge Base Link */}
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <Brain size={16} />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Knowledge Base & Documents
                  </h3>
                </div>
                <p className="text-xs text-emerald-900/70 dark:text-emerald-300/80 leading-relaxed">
                  Train your chatbot on custom FAQs, PDF documents, or product catalog links in the AI Knowledge dashboard.
                </p>
                <Link
                  href="/dashboard/knowledge"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors mt-1"
                >
                  <ExternalLink size={13} />
                  Manage AI Knowledge
                </Link>
              </div>

              {error && (
                <div className="p-3 bg-[#FDF3F3] border border-[#FADCDC] text-[#D14F4F] rounded-xl text-xs">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {bot && pageId !== "demo-id" && (
          <div className="p-4 border-t border-[#E8E7E1] dark:border-slate-800 bg-[#FDFCF8] dark:bg-slate-900 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <Check size={14} /> Settings saved!
              </span>
            ) : (
              <span className="text-xs text-[#777970]">
                Changes affect live page chatbot.
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#777970] hover:text-[#292A25] bg-[#F3F2EA] hover:bg-[#E8E7E1] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-[#292A25] hover:bg-[#3C3D37] text-[#FDFCF8] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Settings
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
