"use client";

import React, { useState } from "react";
import {
  Sparkles,
  KeyRound,
  Gauge,
  Check,
  Plus,
  X,
  Save,
  Loader2,
  Users,
  Eye,
  Sliders,
  ShieldCheck,
  Calendar,
  CalendarCheck,
  ExternalLink,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { updateLeadCaptureConfig } from "@/app/actions/bot-actions";
import {
  LeadCaptureSettings,
  DEFAULT_LEAD_CAPTURE_SETTINGS
} from "@/types/lead-capture";

interface LeadCaptureConfigPanelProps {
  botId: string;
  botName: string;
  colorTheme?: string | null;
  initialConfig: LeadCaptureSettings;
}

export function LeadCaptureConfigPanel({
  botId,
  botName,
  colorTheme = "#171717",
  initialConfig,
}: LeadCaptureConfigPanelProps) {
  const [config, setConfig] = useState<LeadCaptureSettings>({
    ...DEFAULT_LEAD_CAPTURE_SETTINGS,
    ...initialConfig,
  });
  const [newKeyword, setNewKeyword] = useState("");
  const [newBookingKeyword, setNewBookingKeyword] = useState("");
  const [previewTab, setPreviewTab] = useState<"form" | "booking">("form");
  const [isSaving, setIsSaving] = useState(false);

  const bookingKeywordsList = config.bookingKeywords || DEFAULT_LEAD_CAPTURE_SETTINGS.bookingKeywords || [];

  const handleAddBookingKeyword = () => {
    const trimmed = newBookingKeyword.trim().toLowerCase();
    if (!trimmed) return;
    if (bookingKeywordsList.includes(trimmed)) {
      toast.error("Booking keyword already added");
      return;
    }
    setConfig(prev => ({
      ...prev,
      bookingKeywords: [...(prev.bookingKeywords || DEFAULT_LEAD_CAPTURE_SETTINGS.bookingKeywords || []), trimmed],
    }));
    setNewBookingKeyword("");
  };

  const handleRemoveBookingKeyword = (keywordToRemove: string) => {
    setConfig(prev => ({
      ...prev,
      bookingKeywords: (prev.bookingKeywords || DEFAULT_LEAD_CAPTURE_SETTINGS.bookingKeywords || []).filter(k => k !== keywordToRemove),
    }));
  };

  const handleAddSuggestedBookingKeyword = (keyword: string) => {
    const lower = keyword.toLowerCase();
    if (bookingKeywordsList.includes(lower)) return;
    setConfig(prev => ({
      ...prev,
      bookingKeywords: [...(prev.bookingKeywords || DEFAULT_LEAD_CAPTURE_SETTINGS.bookingKeywords || []), lower],
    }));
  };

  const handleAddKeyword = () => {
    const trimmed = newKeyword.trim().toLowerCase();
    if (!trimmed) return;
    if (config.triggerKeywords.includes(trimmed)) {
      toast.error("Keyword already added");
      return;
    }
    setConfig(prev => ({
      ...prev,
      triggerKeywords: [...prev.triggerKeywords, trimmed],
    }));
    setNewKeyword("");
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setConfig(prev => ({
      ...prev,
      triggerKeywords: prev.triggerKeywords.filter(k => k !== keywordToRemove),
    }));
  };

  const handleKeyDownKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateLeadCaptureConfig(botId, config);
      toast.success("Lead capture settings saved successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to update lead capture settings");
    } finally {
      setIsSaving(false);
    }
  };

  const primaryColor = colorTheme || "#171717";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Master Enable Banner */}
      <div className="bg-white border border-[#E8E5DF] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              config.enabled ? "bg-[#F2EFE9] text-[#171717]" : "bg-[#FBF9F5] text-[#8C8D85]"
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#171717]">Automated Lead Capture</h2>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  config.enabled
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-[#F2EFE9] text-[#737373]"
                }`}
              >
                {config.enabled ? "Active" : "Disabled"}
              </span>
            </div>
            <p className="text-xs text-[#737373] mt-0.5">
              Prompt visitors for contact details to capture high-intent leads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              config.enabled ? "bg-[#171717]" : "bg-[#E8E5DF]"
            }`}
            role="switch"
            aria-checked={config.enabled}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                config.enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Grid: 2-Column Settings (Left 7 cols) & Sticky Live Preview (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 2-Column Settings Layout */}
        <div className="lg:col-span-7 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Trigger Strategy Mode */}
            <div className="bg-white border border-[#E8E5DF] rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sliders className="w-4 h-4 text-[#171717]" />
                  <h3 className="text-sm font-bold text-[#171717]">1. Trigger Condition</h3>
                </div>
                <p className="text-[11px] text-[#737373]">
                  Select when the AI prompts visitors for contact information.
                </p>
              </div>

              <div className="space-y-2">
                {/* Option A: Start of Chat */}
                <div
                  onClick={() => setConfig(prev => ({ ...prev, mode: "first" }))}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    config.mode === "first"
                      ? "border-[#171717] bg-[#FBF9F5] shadow-2xs"
                      : "border-[#E8E5DF] hover:border-[#D5D3CB] hover:bg-[#FBF9F5]/40"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      config.mode === "first" ? "bg-[#171717] text-white" : "bg-[#F2EFE9] text-[#737373]"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#171717]">At Start of Chat</span>
                      {config.mode === "first" && <Check className="w-3.5 h-3.5 text-[#171717]" />}
                    </div>
                    <p className="text-[11px] text-[#737373] mt-0.5 leading-snug">
                      Require contact details before start of chat.
                    </p>
                  </div>
                </div>

                {/* Option B: Trigger Keywords */}
                <div
                  onClick={() => setConfig(prev => ({ ...prev, mode: "keywords" }))}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    config.mode === "keywords"
                      ? "border-[#171717] bg-[#FBF9F5] shadow-2xs"
                      : "border-[#E8E5DF] hover:border-[#D5D3CB] hover:bg-[#FBF9F5]/40"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      config.mode === "keywords" ? "bg-[#171717] text-white" : "bg-[#F2EFE9] text-[#737373]"
                    }`}
                  >
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#171717]">Trigger Keywords</span>
                      {config.mode === "keywords" && <Check className="w-3.5 h-3.5 text-[#171717]" />}
                    </div>
                    <p className="text-[11px] text-[#737373] mt-0.5 leading-snug">
                      Prompt when high-intent words are detected in conversation.
                    </p>
                  </div>
                </div>

                {/* Option C: Threshold */}
                <div
                  onClick={() => setConfig(prev => ({ ...prev, mode: "threshold" }))}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    config.mode === "threshold"
                      ? "border-[#171717] bg-[#FBF9F5] shadow-2xs"
                      : "border-[#E8E5DF] hover:border-[#D5D3CB] hover:bg-[#FBF9F5]/40"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      config.mode === "threshold" ? "bg-[#171717] text-white" : "bg-[#F2EFE9] text-[#737373]"
                    }`}
                  >
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#171717]">Engagement Threshold</span>
                      {config.mode === "threshold" && <Check className="w-3.5 h-3.5 text-[#171717]" />}
                    </div>
                    <p className="text-[11px] text-[#737373] mt-0.5 leading-snug">
                      Prompt after visitor sends a specified volume of messages.
                    </p>
                  </div>
                </div>
              </div>

              {/* Keyword sub-config */}
              {config.mode === "keywords" && (
                <div className="pt-3 border-t border-[#F2EFE9] space-y-2.5">
                  <label className="text-[11px] font-semibold text-[#171717] block">
                    Trigger Keywords
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={e => setNewKeyword(e.target.value)}
                      onKeyDown={handleKeyDownKeyword}
                      placeholder="Add keyword (e.g., pricing, demo)..."
                      className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-[#E8E5DF] bg-[#FBF9F5] focus:outline-none focus:border-[#171717]"
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="px-3 py-1.5 bg-[#171717] hover:bg-[#262626] text-white rounded-xl text-xs font-medium shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {config.triggerKeywords.length === 0 ? (
                      <span className="text-[11px] text-amber-700 italic">No keywords added yet.</span>
                    ) : (
                      config.triggerKeywords.map(kw => (
                        <span
                          key={kw}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-[#F2EFE9] text-[#171717] border border-[#E8E5DF]"
                        >
                          #{kw}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(kw)}
                            className="hover:text-rose-600 cursor-pointer ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Threshold sub-config */}
              {config.mode === "threshold" && (
                <div className="pt-3 border-t border-[#F2EFE9] space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, thresholdType: "message_count" }))}
                      className={`px-2 py-1.5 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                        config.thresholdType === "message_count"
                          ? "bg-[#171717] text-white border-[#171717]"
                          : "bg-white text-[#565850] border-[#E8E5DF]"
                      }`}
                    >
                      Message Count
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, thresholdType: "word_count" }))}
                      className={`px-2 py-1.5 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                        config.thresholdType === "word_count"
                          ? "bg-[#171717] text-white border-[#171717]"
                          : "bg-white text-[#565850] border-[#E8E5DF]"
                      }`}
                    >
                      Word Count
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#171717] mb-1">
                      <span>Trigger after: {config.thresholdValue} {config.thresholdType === "message_count" ? "messages" : "words"}</span>
                    </div>
                    <input
                      type="range"
                      min={config.thresholdType === "message_count" ? 1 : 10}
                      max={config.thresholdType === "message_count" ? 12 : 150}
                      step={config.thresholdType === "message_count" ? 1 : 5}
                      value={config.thresholdValue}
                      onChange={e => setConfig(prev => ({ ...prev, thresholdValue: parseInt(e.target.value) || 1 }))}
                      className="w-full accent-[#171717] cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Prompt & Fields Customization */}
            <div className="bg-white border border-[#E8E5DF] rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#171717]" />
                  <h3 className="text-sm font-bold text-[#171717]">2. Prompt & Fields</h3>
                </div>
                <p className="text-[11px] text-[#737373]">
                  Customize card header and select required fields.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#171717] block mb-1">
                    Card Title
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={e => setConfig(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. How can our team reach you?"
                    className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#E8E5DF] bg-[#FBF9F5] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#171717] block mb-1">
                    Context Subtitle
                  </label>
                  <input
                    type="text"
                    value={config.subtitle}
                    onChange={e => setConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g. Leave your details so we can send pricing."
                    className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#E8E5DF] bg-[#FBF9F5] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <div className="pt-2 border-t border-[#F2EFE9] space-y-2">
                  <label className="text-[11px] font-semibold text-[#171717] block">
                    Information to collect
                  </label>
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between p-2 rounded-xl border border-[#E8E5DF] bg-[#FBF9F5]/40 hover:bg-[#FBF9F5] cursor-pointer">
                      <span className="text-xs font-medium text-[#171717]">Full Name</span>
                      <input
                        type="checkbox"
                        checked={config.askName}
                        onChange={e => setConfig(prev => ({ ...prev, askName: e.target.checked }))}
                        className="rounded border-[#E8E5DF] text-[#171717] focus:ring-[#171717] h-4 w-4 accent-[#171717]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl border border-[#E8E5DF] bg-[#F2EFE9]/40 cursor-not-allowed">
                      <span className="text-xs font-medium text-[#171717]">Email Address</span>
                      <span className="text-[10px] font-medium text-[#737373]">Required</span>
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl border border-[#E8E5DF] bg-[#FBF9F5]/40 hover:bg-[#FBF9F5] cursor-pointer">
                      <span className="text-xs font-medium text-[#171717]">Phone Number</span>
                      <input
                        type="checkbox"
                        checked={config.askPhone}
                        onChange={e => setConfig(prev => ({ ...prev, askPhone: e.target.checked }))}
                        className="rounded border-[#E8E5DF] text-[#171717] focus:ring-[#171717] h-4 w-4 accent-[#171717]"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Booking Link & Intent Triggers (Spans across) */}
          <div className="bg-white border border-[#E8E5DF] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Calendar className="w-4 h-4 text-[#171717]" />
                  <h3 className="text-sm font-bold text-[#171717]">3. Booking Link & Intent Triggers</h3>
                </div>
                <p className="text-[11px] text-[#737373]">
                  Connect your calendar and manage booking intent triggers.
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  config.bookingLink
                    ? "bg-[#F2EFE9] text-[#171717] border border-[#E8E5DF]"
                    : "bg-[#FBF9F5] text-[#8C8D85]"
                }`}
              >
                {config.bookingLink ? "Configured" : "Not Set"}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#171717] block">
                  Booking Calendar Link
                </label>
                {config.bookingLink && (
                  <a
                    href={config.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#171717] hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    Test link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                placeholder="https://cal.com/your-team or https://calendly.com/your-team"
                value={config.bookingLink || ""}
                onChange={e => setConfig(prev => ({ ...prev, bookingLink: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E5DF] bg-[#FBF9F5] text-xs text-[#171717] placeholder:text-[#8C8D85] focus:outline-none focus:border-[#171717]"
              />
            </div>

            {/* Booking Trigger Keywords */}
            <div className="space-y-2 pt-2 border-t border-[#F2EFE9]">
              <div>
                <label className="text-[11px] font-semibold text-[#171717] block">
                  Booking Intent Trigger Keywords
                </label>
                <p className="text-[11px] text-[#737373]">
                  Assistant shares calendar link when these terms are mentioned.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBookingKeyword}
                  onChange={e => setNewBookingKeyword(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleAddBookingKeyword();
                    }
                  }}
                  placeholder="e.g. consult, call, meeting..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#E8E5DF] bg-[#FBF9F5] text-[#171717] placeholder:text-[#8C8D85] focus:outline-none focus:border-[#171717]"
                />
                <button
                  type="button"
                  onClick={handleAddBookingKeyword}
                  className="px-3 py-1.5 bg-[#171717] hover:bg-[#262626] text-white rounded-xl text-xs font-medium shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {/* Active Keywords Tags */}
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#FBF9F5] rounded-xl border border-[#E8E5DF]">
                {bookingKeywordsList.length === 0 ? (
                  <span className="text-[11px] text-[#8C8D85] italic">Default booking terms active.</span>
                ) : (
                  bookingKeywordsList.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white border border-[#E8E5DF] text-xs font-medium text-[#171717]"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveBookingKeyword(kw)}
                        className="text-[#8C8D85] hover:text-rose-600 transition-colors ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-medium text-[#8C8D85]">Suggested:</span>
                {["schedule", "meeting", "call", "appointment", "demo", "book"].map((sug, i) => {
                  const isAdded = bookingKeywordsList.includes(sug);
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddSuggestedBookingKeyword(sug)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        isAdded
                          ? "bg-[#F2EFE9] text-[#8C8D85] border-[#E8E5DF] cursor-default"
                          : "bg-white text-[#565850] border-[#E8E5DF] hover:border-[#171717] hover:text-[#171717]"
                      }`}
                    >
                      {isAdded ? `✓ ${sug}` : `+ ${sug}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display Card Toggle */}
            <div className="pt-3 border-t border-[#F2EFE9] flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-[#171717] block cursor-pointer" htmlFor="toggleBookingCard">
                  Interactive Booking Card in Chat
                </label>
                <p className="text-[11px] text-[#737373]">
                  Render interactive calendar action card in chat.
                </p>
              </div>
              <input
                type="checkbox"
                id="toggleBookingCard"
                checked={config.showBookingCard !== false}
                onChange={e => setConfig(prev => ({ ...prev, showBookingCard: e.target.checked }))}
                className="rounded border-[#E8E5DF] text-[#171717] focus:ring-[#171717] h-4 w-4 accent-[#171717] cursor-pointer"
              />
            </div>
          </div>

          {/* Action Save Bar */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-[#171717] hover:bg-[#262626] text-white rounded-xl px-5 py-2.5 text-xs font-medium shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Configuration
            </button>
          </div>
        </div>

        {/* Right Column: Live Chatbot Widget Preview (Sticky) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="bg-white border border-[#E8E5DF] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2EFE9]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#171717]" />
                <h3 className="text-sm font-bold text-[#171717]">Live Widget Preview</h3>
              </div>
              
              {/* Tab Selector */}
              <div className="flex items-center bg-[#F2EFE9] p-0.5 rounded-xl text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setPreviewTab("form")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    previewTab === "form"
                      ? "bg-white text-[#171717] shadow-2xs font-semibold"
                      : "text-[#737373] hover:text-[#171717]"
                  }`}
                >
                  Lead Form
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("booking")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    previewTab === "booking"
                      ? "bg-white text-[#171717] shadow-2xs font-semibold"
                      : "text-[#737373] hover:text-[#171717]"
                  }`}
                >
                  Booking Card
                </button>
              </div>
            </div>

            {/* Mock Widget Container */}
            <div className="rounded-2xl border border-[#E8E5DF] shadow-md overflow-hidden bg-white max-w-sm mx-auto">
              {/* Header */}
              <div
                style={{ backgroundColor: primaryColor }}
                className="p-3.5 text-white flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                    AI
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{botName || "Support Assistant"}</div>
                    <div className="text-[10px] text-white/80">Online</div>
                  </div>
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-3.5 bg-[#FBF9F5] min-h-[300px] flex flex-col justify-end gap-2.5 text-xs">
                {previewTab === "booking" ? (
                  <>
                    <div className="p-2.5 bg-white rounded-xl border border-[#E8E5DF] text-[#171717] max-w-[85%] text-[11px] leading-relaxed">
                      Hello! How can I help you today?
                    </div>
                    <div
                      style={{ backgroundColor: primaryColor }}
                      className="p-2.5 text-white rounded-xl rounded-tr-sm self-end max-w-[80%] text-[11px]"
                    >
                      Can we schedule a call to talk through options?
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-[#E8E5DF] text-[#171717] max-w-[92%] text-[11px] leading-relaxed space-y-2 shadow-2xs">
                      <div>
                        I would be delighted to help! You can choose a time that works best for you right here:
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FBF9F5] border border-[#E8E5DF] flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#F2EFE9] text-[#171717] flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-[#171717] text-xs">Schedule an Appointment</div>
                            <div className="text-[10px] text-[#737373] truncate">
                              {config.bookingLink ? config.bookingLink.replace(/^https?:\/\//, '') : "cal.com/your-team"}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          style={{ backgroundColor: primaryColor }}
                          className="w-full py-1.5 px-3 rounded-lg text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Open Booking Calendar</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : config.mode === "first" ? (
                  <>
                    <div className="p-2.5 bg-white rounded-xl border border-[#E8E5DF] text-[#171717] max-w-[85%] text-[11px] leading-relaxed">
                      Hello! How can I help you today?
                    </div>
                    {/* Mode 1 Preview Form */}
                    <div className="p-3 bg-white rounded-xl border border-[#E8E5DF] shadow-xs space-y-2 mt-1">
                      <div className="font-semibold text-[#171717] text-xs">
                        {config.title || "Please introduce yourself"}
                      </div>
                      {config.subtitle && (
                        <div className="text-[10px] text-[#737373] leading-tight">
                          {config.subtitle}
                        </div>
                      )}
                      <div className="space-y-1.5 pt-1">
                        {config.askName && (
                          <div className="h-7 px-2 border border-[#E8E5DF] rounded-lg bg-[#FBF9F5] flex items-center text-[#8C8D85] text-[10px]">
                            Name
                          </div>
                        )}
                        <div className="h-7 px-2 border border-[#E8E5DF] rounded-lg bg-[#FBF9F5] flex items-center text-[#8C8D85] text-[10px]">
                          Email address *
                        </div>
                        {config.askPhone && (
                          <div className="h-7 px-2 border border-[#E8E5DF] rounded-lg bg-[#FBF9F5] flex items-center text-[#8C8D85] text-[10px]">
                            Phone number
                          </div>
                        )}
                        <button
                          type="button"
                          style={{ backgroundColor: primaryColor }}
                          className="w-full py-1.5 text-white rounded-lg text-[11px] font-semibold mt-1"
                        >
                          Start Chat
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2.5 bg-white rounded-xl border border-[#E8E5DF] text-[#171717] max-w-[85%] text-[11px] leading-relaxed">
                      Hi there! Looking for our pricing plans or a custom demo?
                    </div>
                    <div
                      style={{ backgroundColor: primaryColor }}
                      className="p-2.5 text-white rounded-xl rounded-tr-sm self-end max-w-[80%] text-[11px]"
                    >
                      {config.mode === "keywords"
                        ? `What is your ${config.triggerKeywords[0] || "pricing"}?`
                        : "Can you tell me more about your options?"}
                    </div>

                    {/* Mode 2 & 3 Inline Prompt Preview */}
                    <div className="p-3 bg-white rounded-xl border border-[#171717] shadow-sm space-y-2 mt-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-[#171717] text-xs">
                            {config.title || "Would you like our team to follow up?"}
                          </div>
                          <div className="text-[10px] text-[#737373] leading-tight mt-0.5">
                            {config.subtitle || "Leave your info so we can send details."}
                          </div>
                        </div>
                        <span className="text-[10px] text-[#8C8D85]">✕</span>
                      </div>
                      <div className="space-y-1 pt-1">
                        {config.askName && (
                          <div className="h-6 px-2 border border-[#E8E5DF] rounded-lg bg-[#FBF9F5] flex items-center text-[#8C8D85] text-[10px]">
                            Your name
                          </div>
                        )}
                        <div className="h-6 px-2 border border-[#E8E5DF] rounded-lg bg-[#FBF9F5] flex items-center text-[#8C8D85] text-[10px]">
                          Email address *
                        </div>
                        {config.askPhone && (
                          <div className="h-6 px-2 border border-[#E8E5DF] rounded-lg bg-[#FBF9F5] flex items-center text-[#8C8D85] text-[10px]">
                            Phone number
                          </div>
                        )}
                        <div className="flex gap-1.5 pt-1">
                          <button
                            type="button"
                            style={{ backgroundColor: primaryColor }}
                            className="flex-1 py-1 text-white rounded-lg text-[10px] font-semibold"
                          >
                            Send Details
                          </button>
                          <button
                            type="button"
                            className="px-2 py-1 text-[#737373] rounded-lg text-[10px] hover:bg-[#F2EFE9]"
                          >
                            Not now
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-2 bg-white border-t border-[#E8E5DF] flex items-center gap-2">
                <div className="flex-1 px-3 py-1.5 rounded-lg border border-[#E8E5DF] bg-[#FBF9F5] text-[11px] text-[#8C8D85]">
                  {config.mode === "first" && !config.enabled
                    ? "Type your message..."
                    : config.mode === "first"
                    ? "Fill form above to continue..."
                    : "Type your message..."}
                </div>
                <div
                  style={{ backgroundColor: primaryColor }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs opacity-80"
                >
                  ➤
                </div>
              </div>
            </div>

            <div className="bg-[#FBF9F5] border border-[#E8E5DF] rounded-xl p-3 text-[11px] text-[#737373] flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-[#8C8D85] flex-shrink-0 mt-0.5" />
              <span>
                All leads captured automatically sync to your{" "}
                <strong className="text-[#171717]">Leads List</strong> tab with instant notifications.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
