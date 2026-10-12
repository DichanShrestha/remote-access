"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { v4 as uuidv4 } from "uuid";
import { MarkdownMessage } from "@/components/ui/MarkdownMessage";

export function ChatbotWidget({ botId }: { botId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<any>(null);
    const [sessionId] = useState(() => uuidv4());
    const [leadCaptured, setLeadCaptured] = useState(false);
    const [leadDismissed, setLeadDismissed] = useState(false);
    const [inChatPromptTriggered, setInChatPromptTriggered] = useState(false);
    const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "" });
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`/api/bot/${botId}/config`)
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                const leadSettings = data.leadCaptureConfig;
                const isEnabled = data.collectLeads || leadSettings?.enabled;
                if (!isEnabled) {
                    setLeadCaptured(true);
                }
            })
            .catch(err => console.error("Failed to load bot config", err));
    }, [botId]);

    const { messages, sendMessage, status, error } = useChat({
        transport: new TextStreamChatTransport({
            api: "/api/chat/public",
            body: {
                botId,
                sessionId,
                visitorId: sessionId,
            },
        }),
    });

    const isLoading = status === "streaming" || status === "submitted";

    const leadSettings = config?.leadCaptureConfig || {
        enabled: Boolean(config?.collectLeads),
        mode: "first",
        triggerKeywords: ["pricing", "cost", "quote", "demo", "contact", "talk to sales", "buy"],
        thresholdType: "message_count",
        thresholdValue: 3,
        title: "Before we continue, how can we reach you?",
        subtitle: "Leave your contact details so our team can follow up with you.",
        askName: true,
        askEmail: true,
        askPhone: false,
    };

    const isLeadCaptureActive = Boolean(config?.collectLeads || leadSettings?.enabled);
    const mode = leadSettings?.mode || "first";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen, inChatPromptTriggered]);

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leadForm.email && !leadForm.phone) return;

        // Build brief snippet from recent messages
        const snippet = messages.slice(-3).map(m => `${m.role}: ${getMessageText(m)}`).join("\n");

        try {
            await fetch("/api/chat/public", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    botId,
                    sessionId,
                    visitorId: sessionId,
                    leadCapture: true,
                    triggerMode: mode,
                    name: leadForm.name,
                    email: leadForm.email,
                    phone: leadForm.phone,
                    conversationSnippet: snippet,
                }),
            });
            setLeadCaptured(true);
            setInChatPromptTriggered(false);
        } catch (error) {
            console.error("Failed to submit lead form", error);
            setLeadCaptured(true); // Proceed anyway
            setInChatPromptTriggered(false);
        }
    };

    const checkTriggersOnSend = (userText: string) => {
        if (!isLeadCaptureActive || leadCaptured || leadDismissed || inChatPromptTriggered) return;

        if (mode === "keywords") {
            const keywords: string[] = Array.isArray(leadSettings.triggerKeywords) ? leadSettings.triggerKeywords : [];
            const lowerText = userText.toLowerCase();
            const matched = keywords.some(kw => kw && lowerText.includes(kw.trim().toLowerCase()));
            if (matched) {
                setInChatPromptTriggered(true);
            }
        } else if (mode === "threshold") {
            const userMsgs = messages.filter(m => m.role === "user");
            const newMsgCount = userMsgs.length + 1;

            if (leadSettings.thresholdType === "word_count") {
                const totalWords = userMsgs.reduce((acc, m) => acc + getMessageText(m).split(/\s+/).filter(Boolean).length, 0)
                    + userText.split(/\s+/).filter(Boolean).length;
                if (totalWords >= (leadSettings.thresholdValue || 30)) {
                    setInChatPromptTriggered(true);
                }
            } else {
                // message count
                if (newMsgCount >= (leadSettings.thresholdValue || 3)) {
                    setInChatPromptTriggered(true);
                }
            }
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const textToSend = inputValue.trim();
        checkTriggersOnSend(textToSend);

        sendMessage({ text: textToSend });
        setInputValue("");
    };

    // Extract text content from message parts
    const getMessageText = (msg: any): string => {
        if (msg.parts && Array.isArray(msg.parts)) {
            return msg.parts
                .filter((p: any) => p.type === "text")
                .map((p: any) => p.text)
                .join("");
        }
        return msg.content || "";
    };

    if (!config) return null;

    // In "first" mode, chat is blocked until lead is provided
    const isChatBlocked = isLeadCaptureActive && mode === "first" && !leadCaptured;

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {/* Widget Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{ backgroundColor: config.colorTheme || "#000000" }}
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-black/10 hover:scale-105 transition-transform cursor-pointer"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white dark:bg-slate-900 w-[350px] sm:w-[400px] h-[600px] max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div
                        style={{ backgroundColor: config.colorTheme || "#000000" }}
                        className="p-4 flex items-center justify-between text-white"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
                                {config.avatarEmoji || <User className="w-4 h-4" />}
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm leading-tight">{config.name}</h3>
                                <p className="text-xs text-white/70">Online</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50 dark:bg-slate-950/50">
                        {/* Welcome Message */}
                        {config.welcomeMessage && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 p-3 rounded-2xl rounded-tl-sm text-sm max-w-[85%] shadow-sm">
                                    <MarkdownMessage content={config.welcomeMessage} />
                                </div>
                            </div>
                        )}
                        {config.aiEnabled === false && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">This assistant is temporarily unavailable. Please contact the page owner.</div>}
                        {config.aiEnabled && typeof config.aiRepliesRemaining === "number" && config.aiRepliesRemaining <= 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">This assistant has used its current reply allowance. Please check back later.</div>}

                        {/* Mode 1: Initial Lead Capture Form (at start of chat) */}
                        {isChatBlocked && (
                            <div className="flex justify-start">
                                <form onSubmit={handleLeadSubmit} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl rounded-tl-sm w-[90%] shadow-sm animate-in fade-in duration-200">
                                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                                        {leadSettings.title || "Please introduce yourself before we chat."}
                                    </h4>
                                    {leadSettings.subtitle && (
                                        <p className="text-[11px] text-slate-500 mb-3">{leadSettings.subtitle}</p>
                                    )}
                                    <div className="flex flex-col gap-2">
                                        {leadSettings.askName !== false && (
                                            <input
                                                type="text"
                                                placeholder="Name"
                                                required
                                                value={leadForm.name}
                                                onChange={e => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        )}
                                        {leadSettings.askEmail !== false && (
                                            <input
                                                type="email"
                                                placeholder="Email address"
                                                required
                                                value={leadForm.email}
                                                onChange={e => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        )}
                                        {leadSettings.askPhone && (
                                            <input
                                                type="tel"
                                                placeholder="Phone number"
                                                value={leadForm.phone}
                                                onChange={e => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        )}
                                        <button
                                            type="submit"
                                            style={{ backgroundColor: config.colorTheme || "#000000" }}
                                            className="mt-1 w-full py-2 text-white text-sm font-semibold rounded-lg shadow-sm cursor-pointer hover:opacity-95"
                                        >
                                            Start Chat
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Messages */}
                        {(!isChatBlocked || leadCaptured) && messages.map(m => {
                            const text = getMessageText(m);
                            if (!text) return null;
                            return (
                                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`p-3 text-sm max-w-[85%] shadow-sm ${
                                            m.role === 'user'
                                                ? 'rounded-2xl rounded-tr-sm text-white'
                                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm'
                                        }`}
                                        style={m.role === 'user' ? { backgroundColor: config.colorTheme || "#000000" } : {}}
                                    >
                                        <MarkdownMessage content={text} isUser={m.role === 'user'} />
                                    </div>
                                </div>
                            );
                        })}

                        {/* Mode 2 & 3: Inline In-Chat Trigger Lead Capture Prompt */}
                        {!isChatBlocked && inChatPromptTriggered && !leadCaptured && !leadDismissed && (
                            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <form onSubmit={handleLeadSubmit} className="bg-white dark:bg-slate-800 border-2 border-emerald-500/40 dark:border-emerald-500/30 p-4 rounded-2xl rounded-tl-sm w-[90%] shadow-md">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                                {leadSettings.title || "Would you like our team to follow up?"}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                {leadSettings.subtitle || "Leave your info so we can send you more details."}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setLeadDismissed(true)}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
                                            title="Skip"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-3">
                                        {leadSettings.askName !== false && (
                                            <input
                                                type="text"
                                                placeholder="Your name"
                                                value={leadForm.name}
                                                onChange={e => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        )}
                                        {leadSettings.askEmail !== false && (
                                            <input
                                                type="email"
                                                placeholder="Email address"
                                                required
                                                value={leadForm.email}
                                                onChange={e => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        )}
                                        {leadSettings.askPhone && (
                                            <input
                                                type="tel"
                                                placeholder="Phone number"
                                                value={leadForm.phone}
                                                onChange={e => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        )}
                                        <div className="flex items-center gap-2 mt-1">
                                            <button
                                                type="submit"
                                                style={{ backgroundColor: config.colorTheme || "#000000" }}
                                                className="flex-1 py-1.5 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer hover:opacity-95"
                                            >
                                                Send Details
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setLeadDismissed(true)}
                                                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                            >
                                                Not now
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                        {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{error.message || "We could not complete that reply. Please try again."}</div>}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl rounded-tl-sm flex gap-1 items-center h-10 shadow-sm">
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    {!isChatBlocked && config.aiEnabled !== false && config.aiRepliesRemaining !== 0 && (
                        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                            <form onSubmit={handleSend} className="relative flex items-center">
                                <input
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    placeholder="Type your message..."
                                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="absolute right-2 p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
