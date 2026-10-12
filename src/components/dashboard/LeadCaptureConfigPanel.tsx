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
  MessageSquare,
  HelpCircle,
  Calendar,
  CalendarCheck,
  ExternalLink
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
  colorTheme = "#2563eb",
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

  const primaryColor = colorTheme || "#2563eb";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Master Enable Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              config.enabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
            }`}
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Automated Lead Capture</h2>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  config.enabled
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {config.enabled ? "Active" : "Disabled"}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Automatically prompt visitors for their contact info to capture high-intent leads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`relative inline-flex h-7 w-13 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              config.enabled ? "bg-emerald-500" : "bg-slate-200"
            }`}
            role="switch"
            aria-checked={config.enabled}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                config.enabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Grid: Settings & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Triggers & Form Config (8 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Trigger Strategy Mode */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sliders className="w-4 h-4 text-slate-600" />
                <h3 className="text-base font-bold text-slate-900">1. Trigger Condition</h3>
              </div>
              <p className="text-xs text-slate-500">
                Choose when the AI assistant asks visitors for their name, email, or phone.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Option A: First of Chat */}
              <div
                onClick={() => setConfig(prev => ({ ...prev, mode: "first" }))}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                  config.mode === "first"
                    ? "border-blue-600 bg-blue-50/40 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    config.mode === "first" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">At Start of Chat</span>
                    {config.mode === "first" && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Gate or introduce the chat immediately. Visitors fill in their contact information before beginning their interaction.
                  </p>
                </div>
              </div>

              {/* Option B: Trigger Keywords */}
              <div
                onClick={() => setConfig(prev => ({ ...prev, mode: "keywords" }))}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                  config.mode === "keywords"
                    ? "border-blue-600 bg-blue-50/40 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    config.mode === "keywords" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <KeyRound className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Trigger Keywords</span>
                    {config.mode === "keywords" && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Prompt visitor only when specific high-intent words (e.g. pricing, quote, sales, demo) are sent in chat.
                  </p>
                </div>
              </div>

              {/* Option C: Threshold */}
              <div
                onClick={() => setConfig(prev => ({ ...prev, mode: "threshold" }))}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                  config.mode === "threshold"
                    ? "border-blue-600 bg-blue-50/40 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    config.mode === "threshold" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Gauge className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Engagement Threshold</span>
                    {config.mode === "threshold" && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Prompt after the visitor has demonstrated genuine interest by sending a specific number of messages or words.
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-config for Mode 2: Trigger Keywords */}
            {config.mode === "keywords" && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
                <label className="text-xs font-semibold text-slate-700 block">
                  Keywords that trigger the lead capture card
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={e => setNewKeyword(e.target.value)}
                    onKeyDown={handleKeyDownKeyword}
                    placeholder="Type keyword and press Enter (e.g., pricing, call, demo)..."
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {config.triggerKeywords.length === 0 ? (
                    <span className="text-xs text-amber-600 italic">No keywords added yet. Visitors won't be prompted until at least one keyword is specified.</span>
                  ) : (
                    config.triggerKeywords.map(kw => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60"
                      >
                        #{kw}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(kw)}
                          className="hover:text-red-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Sub-config for Mode 3: Threshold */}
            {config.mode === "threshold" && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">
                    Metric to measure
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, thresholdType: "message_count" }))}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                        config.thresholdType === "message_count"
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      Message Count (e.g. 3 messages)
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, thresholdType: "word_count" }))}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                        config.thresholdType === "word_count"
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      Word Count (e.g. 50 words)
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>
                      Trigger after{" "}
                      <span className="text-blue-600 font-bold">
                        {config.thresholdValue} {config.thresholdType === "message_count" ? "messages" : "words"}
                      </span>
                    </span>
                    <span className="text-slate-400 font-normal">
                      {config.thresholdType === "message_count" ? "Recommended: 2 - 5" : "Recommended: 30 - 80"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={config.thresholdType === "message_count" ? 1 : 10}
                    max={config.thresholdType === "message_count" ? 15 : 200}
                    step={config.thresholdType === "message_count" ? 1 : 5}
                    value={config.thresholdValue}
                    onChange={e => setConfig(prev => ({ ...prev, thresholdValue: parseInt(e.target.value) || 1 }))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Form & Card Content Customization */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-slate-600" />
                <h3 className="text-base font-bold text-slate-900">2. Prompt & Fields Customization</h3>
              </div>
              <p className="text-xs text-slate-500">
                Customize the headline and determine which fields to ask visitors for.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Card Title
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={e => setConfig(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. How can our team reach you?"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Card Subtitle / Context
                </label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={e => setConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Leave your details so our team can follow up with tailored pricing."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 block mb-3">
                  Information to collect
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.askName}
                      onChange={e => setConfig(prev => ({ ...prev, askName: e.target.checked }))}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-800">Full Name</div>
                      <div className="text-slate-400 text-[10px]">Optional/Required</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50/50 cursor-not-allowed">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-800">Email</div>
                      <div className="text-blue-600 text-[10px]">Always Required</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.askPhone}
                      onChange={e => setConfig(prev => ({ ...prev, askPhone: e.target.checked }))}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-800">Phone Number</div>
                      <div className="text-slate-400 text-[10px]">SMS / Call follow-up</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Booking Link & Intent Triggers */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <h3 className="text-base font-bold text-slate-900">3. Booking Link & Intent Triggers</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Configure your calendar link and manage the triggers that prompt the AI to share it with visitors.
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  config.bookingLink
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {config.bookingLink ? "Configured" : "Not Set"}
              </span>
            </div>

            {/* Booking URL Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 block">
                  Booking Calendar Link
                </label>
                {config.bookingLink && (
                  <a
                    href={config.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                  >
                    Test link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://cal.com/your-team or https://calendly.com/your-team"
                  value={config.bookingLink || ""}
                  onChange={e => {
                    const val = e.target.value;
                    setConfig(prev => ({ ...prev, bookingLink: val }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                <span className="font-medium text-slate-600">Supported:</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">cal.com</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">calendly.com</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">savvycal.com</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">custom url</span>
              </div>
            </div>

            {/* Booking Trigger Keywords */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-semibold text-slate-700 block">
                  Booking Intent Trigger Keywords
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  When a visitor mentions any of these terms, the assistant activates the booking protocol and provides your link.
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
                  placeholder="e.g. consult, discovery, interview"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddBookingKeyword}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {/* Active Keywords Tags */}
              <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                {bookingKeywordsList.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No custom keywords configured. Default booking terms are used.</span>
                ) : (
                  bookingKeywordsList.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs group"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveBookingKeyword(kw)}
                        className="text-slate-400 hover:text-rose-500 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Suggestions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-medium text-slate-400 block">Suggested triggers:</span>
                <div className="flex flex-wrap gap-1.5">
                  {["schedule", "meeting", "call", "appointment", "demo", "book", "consultation"].map((sug, i) => {
                    const isAdded = bookingKeywordsList.includes(sug);
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isAdded}
                        onClick={() => handleAddSuggestedBookingKeyword(sug)}
                        className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          isAdded
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-default"
                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50"
                        }`}
                      >
                        {isAdded ? `✓ ${sug}` : `+ ${sug}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Display Card Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-slate-800 block cursor-pointer" htmlFor="toggleBookingCard">
                  Interactive Booking Card in Chat
                </label>
                <p className="text-[11px] text-slate-500">
                  Renders an action button with calendar icon whenever the booking link is triggered.
                </p>
              </div>
              <input
                type="checkbox"
                id="toggleBookingCard"
                checked={config.showBookingCard !== false}
                onChange={e => setConfig(prev => ({ ...prev, showBookingCard: e.target.checked }))}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Configuration
            </button>
          </div>
        </div>

        {/* Right Column: Live Chatbot Widget Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Live Widget Preview</h3>
              </div>
              
              {/* Tab Selector */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setPreviewTab("form")}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    previewTab === "form"
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Lead Form
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("booking")}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    previewTab === "booking"
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Booking Card
                </button>
              </div>
            </div>

            {/* Mock Widget Container */}
            <div className="rounded-2xl border border-slate-200 shadow-lg overflow-hidden bg-white max-w-sm mx-auto">
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
              <div className="p-3.5 bg-slate-50 min-h-[310px] flex flex-col justify-end gap-2.5 text-xs">
                {previewTab === "booking" ? (
                  <>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 max-w-[85%] text-[11px] leading-relaxed">
                      Hello! How can I help you today?
                    </div>
                    <div
                      style={{ backgroundColor: primaryColor }}
                      className="p-2.5 text-white rounded-xl rounded-tr-sm self-end max-w-[80%] text-[11px]"
                    >
                      Can we schedule a call to talk through options?
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 max-w-[92%] text-[11px] leading-relaxed space-y-2 shadow-2xs">
                      <div>
                        I would be delighted to help! You can choose a time that works best for you right here:
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-900 text-xs">Schedule an Appointment</div>
                            <div className="text-[10px] text-slate-500 truncate">
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
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 max-w-[85%] text-[11px] leading-relaxed">
                      Hello! How can I help you today?
                    </div>
                    {/* Mode 1 Preview Form */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2 mt-1">
                      <div className="font-semibold text-slate-800 text-xs">
                        {config.title || "Please introduce yourself"}
                      </div>
                      {config.subtitle && (
                        <div className="text-[10px] text-slate-500 leading-tight">
                          {config.subtitle}
                        </div>
                      )}
                      <div className="space-y-1.5 pt-1">
                        {config.askName && (
                          <div className="h-7 px-2 border border-slate-200 rounded bg-slate-50 flex items-center text-slate-400 text-[10px]">
                            Name
                          </div>
                        )}
                        <div className="h-7 px-2 border border-slate-200 rounded bg-slate-50 flex items-center text-slate-400 text-[10px]">
                          Email address *
                        </div>
                        {config.askPhone && (
                          <div className="h-7 px-2 border border-slate-200 rounded bg-slate-50 flex items-center text-slate-400 text-[10px]">
                            Phone number
                          </div>
                        )}
                        <button
                          type="button"
                          style={{ backgroundColor: primaryColor }}
                          className="w-full py-1.5 text-white rounded text-[11px] font-semibold mt-1"
                        >
                          Start Chat
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 max-w-[85%] text-[11px] leading-relaxed">
                      Hi there! Looking for our pricing plans or a custom demo?
                    </div>
                    <div
                      style={{ backgroundColor: primaryColor }}
                      className="p-2.5 text-white rounded-xl rounded-tr-sm self-end max-w-[80%] text-[11px]"
                    >
                      {config.mode === "keywords"
                        ? `What is your ${config.triggerKeywords[0] || "pricing"}?`
                        : "Can you tell me more about your enterprise options?"}
                    </div>

                    {/* Mode 2 & 3 Inline Prompt Preview */}
                    <div className="p-3 bg-white rounded-xl border-2 border-emerald-500/50 shadow-md space-y-2 mt-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {config.title || "Would you like our team to follow up?"}
                          </div>
                          <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                            {config.subtitle || "Leave your info so we can send details."}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">✕</span>
                      </div>
                      <div className="space-y-1 pt-1">
                        {config.askName && (
                          <div className="h-6 px-2 border border-slate-200 rounded bg-slate-50 flex items-center text-slate-400 text-[10px]">
                            Your name
                          </div>
                        )}
                        <div className="h-6 px-2 border border-slate-200 rounded bg-slate-50 flex items-center text-slate-400 text-[10px]">
                          Email address *
                        </div>
                        {config.askPhone && (
                          <div className="h-6 px-2 border border-slate-200 rounded bg-slate-50 flex items-center text-slate-400 text-[10px]">
                            Phone number
                          </div>
                        )}
                        <div className="flex gap-1.5 pt-1">
                          <button
                            type="button"
                            style={{ backgroundColor: primaryColor }}
                            className="flex-1 py-1 text-white rounded text-[10px] font-semibold"
                          >
                            Send Details
                          </button>
                          <button
                            type="button"
                            className="px-2 py-1 text-slate-500 rounded text-[10px] hover:bg-slate-100"
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
              <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-2">
                <div className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] text-slate-400">
                  {config.mode === "first" && !config.enabled
                    ? "Type your message..."
                    : config.mode === "first"
                    ? "Fill form above to continue..."
                    : "Type your message..."}
                </div>
                <div
                  style={{ backgroundColor: primaryColor }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs opacity-70"
                >
                  ➤
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>
                All leads captured through the chatbot automatically sync to your{" "}
                <strong className="text-slate-800">Leads dashboard</strong> and trigger instant notifications.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
