"use client";

import { useState, useEffect } from "react";
import { getOrCreateBotForPage, updateBotSettings } from "@/app/actions/chatbot-settings-actions";
import { Save, MessageSquare, Shield, Palette } from "lucide-react";

export function BotSettingsPanel({ pageId }: { pageId: string }) {
    const [bot, setBot] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (pageId === "demo-id") {
            setLoading(false);
            return;
        }
        getOrCreateBotForPage(pageId)
            .then(b => {
                setBot(b);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [pageId]);

    const handleSave = async () => {
        if (pageId === "demo-id" || !bot) return;
        setSaving(true);
        try {
            const updated = await updateBotSettings(bot.id, bot);
            setBot(updated);
        } catch (error) {
            console.error("Failed to save bot", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-4 text-sm text-slate-400 flex justify-center items-center h-40">Loading AI Assistant...</div>;
    }

    if (pageId === "demo-id") {
        return (
            <div className="p-6 text-sm text-slate-500 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl m-4">
                <MessageSquare className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <p>AI Chatbot configuration is not available in demo mode.</p>
                <p className="mt-2 text-xs opacity-70">Please sign in to create and customize your AI Assistant.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Chatbot Configuration</h3>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                    {saving ? <span className="animate-spin">⟳</span> : <Save className="w-3.5 h-3.5" />}
                    Save
                </button>
            </div>

            {/* General */}
            <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">General</h4>
                </div>
                
                <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Bot Name</label>
                    <input
                        type="text"
                        value={bot.name || ""}
                        onChange={e => setBot({ ...bot, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Welcome Message</label>
                    <textarea
                        value={bot.welcomeMessage || ""}
                        onChange={e => setBot({ ...bot, welcomeMessage: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    />
                </div>
            </div>

            {/* AI Behavior */}
            <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">AI Behavior</h4>
                </div>
                
                <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">System Prompt</label>
                    <textarea
                        value={bot.systemPrompt || ""}
                        onChange={e => setBot({ ...bot, systemPrompt: e.target.value })}
                        rows={4}
                        placeholder="Instructions for how the AI should behave..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                    />
                </div>
            </div>

            {/* Appearance & Leads */}
            <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                    <Palette className="w-4 h-4 text-slate-500" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Appearance</h4>
                </div>
                
                <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Theme Color</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={bot.colorTheme || "#000000"}
                            onChange={e => setBot({ ...bot, colorTheme: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                        />
                        <input
                            type="text"
                            value={bot.colorTheme || "#000000"}
                            onChange={e => setBot({ ...bot, colorTheme: e.target.value })}
                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono"
                        />
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer" htmlFor="enableLeads">
                        Require Lead Form
                    </label>
                    <input
                        type="checkbox"
                        id="enableLeads"
                        checked={!!bot.collectLeads}
                        onChange={e => setBot({ ...bot, collectLeads: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                    />
                </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs">
                <strong>Note:</strong> To train your bot with your data, visit the Data Sources tab in the main dashboard.
            </div>
        </div>
    );
}
