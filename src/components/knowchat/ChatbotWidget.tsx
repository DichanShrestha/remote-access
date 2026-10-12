"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
    MessageSquare,
    X,
    ArrowUp,
    ArrowRight,
    ArrowLeft,
    Ellipsis,
    SquarePen,
    History,
    Clock,
    Trash2,
    CircleCheck,
    Bot,
    Loader2,
    RotateCcw,
    Calendar,
    CalendarCheck,
    ExternalLink
} from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { v4 as uuidv4 } from "uuid";
import { MarkdownMessage } from "@/components/ui/MarkdownMessage";
import { LeadCaptureSettings } from "@/types/lead-capture";

interface ChatSession {
    id: string;
    startedAt: string;
    updatedAt: string;
    lastMessage: string;
    messageCount: number;
    ended: boolean;
    messages: unknown[];
}

interface BotPublicConfig {
    id: string;
    name?: string;
    colorTheme?: string;
    welcomeMessage?: string;
    welcomeMessages?: string[];
    suggestedQuestions?: string[];
    avatarEmoji?: string;
    avatarUrl?: string;
    collectLeads?: boolean;
    leadCaptureConfig?: LeadCaptureSettings;
    bookingLink?: string | null;
    aiEnabled?: boolean;
    aiRepliesRemaining?: number;
}

interface MessagePart {
    type: string;
    text?: string;
}

interface MessageLike {
    id?: string;
    role?: string;
    content?: string;
    parts?: MessagePart[];
}

/**
 * Calculates WCAG-compliant high-contrast foreground color (dark or light)
 * based on the luminance of the provided hex color.
 */
function getContrastColor(hexColor: string | null | undefined): string {
    if (!hexColor || typeof hexColor !== "string" || !hexColor.startsWith("#")) {
        return "#ffffff";
    }
    const clean = hexColor.replace("#", "");
    let r = 0, g = 0, b = 0;
    if (clean.length === 3) {
        r = parseInt(clean[0] + clean[0], 16);
        g = parseInt(clean[1] + clean[1], 16);
        b = parseInt(clean[2] + clean[2], 16);
    } else if (clean.length === 6) {
        r = parseInt(clean.substring(0, 2), 16);
        g = parseInt(clean.substring(2, 4), 16);
        b = parseInt(clean.substring(4, 6), 16);
    } else {
        return "#ffffff";
    }
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 148 ? "#0f172a" : "#ffffff";
}

function formatSessionTime(dateString: string): string {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
        return "Recent";
    }
}

export function ChatbotWidget({ botId }: { botId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<BotPublicConfig | null>(null);
    const [sessionId, setSessionId] = useState(() => uuidv4());
    const [viewMode, setViewMode] = useState<"chat" | "recent_chats">("chat");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isChatEnded, setIsChatEnded] = useState(false);
    const [recentChats, setRecentChats] = useState<ChatSession[]>(() => {
        if (typeof window === "undefined") return [];
        try {
            const stored = localStorage.getItem(`smartpage_bot_${botId}_recent_chats`);
            return stored ? (JSON.parse(stored) as ChatSession[]) : [];
        } catch {
            return [];
        }
    });

    // Lead capture states
    const [leadCaptured, setLeadCaptured] = useState(false);
    const [leadDismissed, setLeadDismissed] = useState(false);
    const [inChatPromptTriggered, setInChatPromptTriggered] = useState(false);
    const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "" });
    const [leadSubmitting, setLeadSubmitting] = useState(false);
    const [leadError, setLeadError] = useState<string | null>(null);
    const [leadSuccessMessage, setLeadSuccessMessage] = useState<string | null>(null);

    const [inputValue, setInputValue] = useState("");
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isMenuOpen]);

    // Focus composer when opening chat
    useEffect(() => {
        if (isOpen && viewMode === "chat") {
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen, viewMode]);

    // Fetch bot configuration
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

    const transport = useMemo(
        () =>
            new TextStreamChatTransport({
                api: "/api/chat/public",
                body: {
                    botId,
                    sessionId,
                    visitorId: sessionId,
                },
            }),
        [botId, sessionId]
    );

    const { messages, sendMessage, status, error, setMessages } = useChat({
        transport,
    });

    const isLoading = status === "streaming" || status === "submitted";

    // Extract text content from message parts
    const getMessageText = useCallback((msg: MessageLike): string => {
        if (msg.parts && Array.isArray(msg.parts)) {
            return msg.parts
                .filter((p: MessagePart) => p.type === "text")
                .map((p: MessagePart) => p.text || "")
                .join("");
        }
        return msg.content || "";
    }, []);

    // Save active conversation into localStorage without triggering cascading render
    const saveSessionToStorage = useCallback(
        (msgs: unknown[], ended: boolean) => {
            if (!botId || !sessionId || msgs.length === 0) return;
            try {
                const storageKey = `smartpage_bot_${botId}_recent_chats`;
                const stored = localStorage.getItem(storageKey);
                const list: ChatSession[] = stored ? JSON.parse(stored) : [];
                const lastMsg = (msgs as MessageLike[]).slice().reverse().find(m => getMessageText(m));
                const snippet = lastMsg ? getMessageText(lastMsg).slice(0, 80) : "Conversation";

                const existingIdx = list.findIndex(s => s.id === sessionId);
                const updated: ChatSession = {
                    id: sessionId,
                    startedAt: existingIdx >= 0 ? list[existingIdx].startedAt : new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    lastMessage: snippet,
                    messageCount: msgs.length,
                    ended,
                    messages: msgs,
                };

                let nextList: ChatSession[];
                if (existingIdx >= 0) {
                    nextList = [...list];
                    nextList[existingIdx] = updated;
                } else {
                    nextList = [updated, ...list];
                }
                const trimmed = nextList.slice(0, 20);
                localStorage.setItem(storageKey, JSON.stringify(trimmed));
            } catch (err) {
                console.error("Failed to save chat session", err);
            }
        },
        [botId, sessionId, getMessageText]
    );

    // Sync messages to recent chats whenever messages update
    useEffect(() => {
        if (messages.length > 0) {
            saveSessionToStorage(messages, isChatEnded);
        }
    }, [messages, isChatEnded, saveSessionToStorage]);

    const leadSettings: LeadCaptureSettings = config?.leadCaptureConfig || {
        enabled: Boolean(config?.collectLeads),
        mode: "first",
        triggerKeywords: ["pricing", "cost", "quote", "demo", "contact", "talk to sales", "buy"],
        thresholdType: "message_count",
        thresholdValue: 3,
        title: "Where can our team reach you?",
        subtitle: "Leave your contact details so our team can follow up with more information.",
        askName: true,
        askEmail: true,
        askPhone: false,
    };

    const isLeadCaptureActive = Boolean(config?.collectLeads || leadSettings?.enabled);
    const mode = leadSettings?.mode || "first";

    const trackBookingEvent = useCallback(
        (event: "booking_link_shown" | "booking_link_clicked") => {
            if (!botId) return;
            fetch("/api/analytics/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    botId,
                    event,
                    sessionId,
                }),
            }).catch(err => console.error("Failed to track booking event", err));
        },
        [botId, sessionId]
    );

    // Capacity-inspired suggested questions: up to 6 questions configured or default
    const suggestedQuestions: string[] = useMemo(() => {
        if (config?.welcomeMessages && Array.isArray(config.welcomeMessages)) {
            const questions = config.welcomeMessages
                .map((m: string) => m?.trim())
                .filter((m: string) => m && m !== config.welcomeMessage);
            if (questions.length > 0) return questions.slice(0, 6);
        }
        if (config?.bookingLink) {
            return [
                "Book a call or meeting",
                "Explore our services",
                "View pricing",
            ];
        }
        return [
            "Explore our services",
            "View pricing",
            "Get a quote",
        ];
    }, [config]);

    // Auto-scroll when messages arrive
    useEffect(() => {
        if (isOpen && viewMode === "chat") {
            const container = messagesContainerRef.current;
            if (container) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: isLoading ? "auto" : "smooth"
                });
            } else {
                messagesEndRef.current?.scrollIntoView({ behavior: isLoading ? "auto" : "smooth" });
            }
        }
    }, [messages, isOpen, inChatPromptTriggered, isChatEnded, viewMode, leadSuccessMessage, isLoading]);

    // Handle Start New Chat
    const handleStartNewChat = () => {
        if (messages.length > 0) {
            saveSessionToStorage(messages, true);
        }
        const newSessionId = uuidv4();
        setSessionId(newSessionId);
        setMessages([]);
        setIsChatEnded(false);
        setInChatPromptTriggered(false);
        setLeadDismissed(false);
        setLeadSuccessMessage(null);
        setLeadError(null);
        setInputValue("");
        setViewMode("chat");
        setIsMenuOpen(false);
    };

    // Handle End Chat
    const handleEndChat = () => {
        setIsChatEnded(true);
        if (messages.length > 0) {
            saveSessionToStorage(messages, true);
        }
        setIsMenuOpen(false);
        setViewMode("chat");
    };

    // Handle Resume / Continue Chat
    const handleResumeChat = () => {
        setIsChatEnded(false);
        if (messages.length > 0) {
            saveSessionToStorage(messages, false);
        }
        setIsMenuOpen(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    // Handle View Recent Chats
    const handleViewRecentChats = () => {
        try {
            const stored = localStorage.getItem(`smartpage_bot_${botId}_recent_chats`);
            if (stored) {
                setRecentChats(JSON.parse(stored));
            }
        } catch {
            // ignore
        }
        setViewMode("recent_chats");
        setIsMenuOpen(false);
    };

    // Handle selecting a previous chat session
    const handleSelectSession = (session: ChatSession) => {
        setSessionId(session.id);
        setMessages((session.messages as Parameters<typeof setMessages>[0]) || []);
        setIsChatEnded(Boolean(session.ended));
        setViewMode("chat");
    };

    // Handle deleting a chat session
    const handleDeleteSession = (e: React.MouseEvent, idToDelete: string) => {
        e.stopPropagation();
        try {
            const storageKey = `smartpage_bot_${botId}_recent_chats`;
            const nextList = recentChats.filter(s => s.id !== idToDelete);
            localStorage.setItem(storageKey, JSON.stringify(nextList));
            setRecentChats(nextList);
            if (sessionId === idToDelete) {
                handleStartNewChat();
            }
        } catch (err) {
            console.error("Failed to delete session", err);
        }
    };

    // Trigger check on user message send
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
                if (newMsgCount >= (leadSettings.thresholdValue || 3)) {
                    setInChatPromptTriggered(true);
                }
            }
        }
    };

    // Validate and submit lead
    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLeadError(null);

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (leadSettings.askEmail !== false) {
            if (!leadForm.email.trim()) {
                setLeadError("Email address is required.");
                return;
            }
            if (!emailRegex.test(leadForm.email.trim())) {
                setLeadError("Please enter a valid email address.");
                return;
            }
        }

        if (leadSettings.askName && !leadForm.name.trim()) {
            setLeadError("Please enter your name.");
            return;
        }

        setLeadSubmitting(true);
        const snippet = messages.slice(-3).map(m => `${m.role}: ${getMessageText(m)}`).join("\n");

        try {
            const res = await fetch("/api/chat/public", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    botId,
                    sessionId,
                    visitorId: sessionId,
                    leadCapture: true,
                    triggerMode: mode,
                    name: leadForm.name.trim() || null,
                    email: leadForm.email.trim() || null,
                    phone: leadForm.phone.trim() || null,
                    conversationSnippet: snippet,
                }),
            });

            if (!res.ok) {
                throw new Error("Unable to submit contact details. Please try again.");
            }

            // Success confirmation
            setLeadCaptured(true);
            setLeadSuccessMessage("Thank you! We've received your details. Our team will follow up shortly.");
            setInChatPromptTriggered(false);
            setLeadError(null);
        } catch (err: unknown) {
            console.error("Failed to submit lead", err);
            // Preserve entered values on recoverable error! Do NOT fake success.
            const message = err instanceof Error ? err.message : "Something went wrong while submitting. Please check your network and try again.";
            setLeadError(message);
        } finally {
            setLeadSubmitting(false);
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        // Automatically resume the conversation if it was previously ended!
        if (isChatEnded) {
            setIsChatEnded(false);
        }

        const textToSend = inputValue.trim();
        checkTriggersOnSend(textToSend);

        sendMessage({ text: textToSend });
        setInputValue("");
    };

    const handleSelectSuggestion = (suggestion: string) => {
        if (isLoading) return;
        if (isChatEnded) {
            setIsChatEnded(false);
        }
        checkTriggersOnSend(suggestion);
        sendMessage({ text: suggestion });
    };

    if (!config) return null;

    const brandAccent = config.colorTheme || "#0f172a";
    const contrastOnBrand = getContrastColor(brandAccent);

    // Gated first-mode check
    const isChatBlocked = isLeadCaptureActive && mode === "first" && !leadCaptured;

    return (
        <div
            className="fixed z-50 font-sans"
            style={{
                bottom: "max(1.25rem, env(safe-area-inset-bottom, 1.25rem))",
                right: "max(1.25rem, env(safe-area-inset-right, 1.25rem))",
            }}
        >
            {/* 1. Chat Launcher (DocsBot minimal circular button) */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    style={{
                        backgroundColor: brandAccent,
                        color: contrastOnBrand,
                    }}
                    className="w-13 h-13 rounded-full flex items-center justify-center shadow-lg shadow-black/15 hover:opacity-95 hover:scale-[1.03] active:scale-95 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
                    aria-label="Open chat assistant"
                    aria-expanded={false}
                >
                    <MessageSquare className="w-5 h-5" />
                </button>
            )}

            {/* 2. Chat Window Panel */}
            {isOpen && (
                <div
                    className="bg-white dark:bg-slate-900 w-[380px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[min(620px,calc(100vh-2.5rem))] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/10 flex flex-col min-h-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-sm:fixed max-sm:inset-0 max-sm:w-full max-sm:max-w-none max-sm:h-full max-sm:max-h-full max-sm:rounded-none max-sm:border-0"
                    role="dialog"
                    aria-modal="true"
                    aria-label={config.name || "Chat Assistant"}
                >
                    {/* Header (DocsBot / Capacity inspired: compact, clean surface, subtle divider) */}
                    <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between select-none flex-shrink-0">
                        {viewMode === "recent_chats" ? (
                            <div className="flex items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setViewMode("chat")}
                                    className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                                    title="Back to conversation"
                                    aria-label="Back to conversation"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div>
                                    <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                                        Recent Chats
                                    </h2>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {recentChats.length} saved conversation{recentChats.length === 1 ? "" : "s"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2.5 min-w-0">
                                {/* Avatar */}
                                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-700 dark:text-slate-200 text-xs font-medium overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                                    {config.avatarUrl ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={config.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : config.avatarEmoji ? (
                                        <span>{config.avatarEmoji}</span>
                                    ) : (
                                        <Bot className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
                                        {config.name || "Assistant"}
                                    </h2>
                                    {isChatEnded ? (
                                        <p className="text-[10px] text-slate-400">Chat ended</p>
                                    ) : null}
                                </div>
                            </div>
                        )}

                        {/* Controls (3-Dot Options + Minimize/Close) */}
                        <div className="flex items-center gap-0.5">
                            <div className="relative" ref={menuRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsMenuOpen(prev => !prev)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                                    title="Options"
                                    aria-label="Options"
                                    aria-expanded={isMenuOpen}
                                >
                                    <Ellipsis className="w-4 h-4" />
                                </button>

                                {/* Dropdown Card */}
                                {isMenuOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                        <button
                                            type="button"
                                            onClick={handleStartNewChat}
                                            className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                                        >
                                            <SquarePen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                            <span>Start a new chat</span>
                                        </button>

                                        {isChatEnded ? (
                                            <button
                                                type="button"
                                                onClick={handleResumeChat}
                                                className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                <span>Continue this chat</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleEndChat}
                                                className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                                            >
                                                <X className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                <span>End chat</span>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleViewRecentChats}
                                            className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                                        >
                                            <History className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                            <span>View recent chats</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                                title="Close"
                                aria-label="Close chat"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* View A: Recent Chats Screen */}
                    {viewMode === "recent_chats" ? (
                        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-2.5 bg-slate-50/50 dark:bg-slate-950/40 overscroll-contain">
                            <div className="flex items-center justify-between pb-1">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                    History
                                </span>
                                <button
                                    type="button"
                                    onClick={handleStartNewChat}
                                    className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:white flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                    <SquarePen className="w-3 h-3" />
                                    New chat
                                </button>
                            </div>

                            {recentChats.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center my-auto">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2.5 text-slate-400">
                                        <History className="w-5 h-5" />
                                    </div>
                                    <p className="font-medium text-xs text-slate-700 dark:text-slate-300">
                                        No recent chats yet
                                    </p>
                                    <p className="text-[11px] text-slate-400 max-w-[200px] mt-0.5 mb-3">
                                        Your previous conversations will be listed here.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleStartNewChat}
                                        style={{ backgroundColor: brandAccent, color: contrastOnBrand }}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-1.5"
                                    >
                                        <SquarePen className="w-3 h-3" />
                                        Start a chat
                                    </button>
                                </div>
                            ) : (
                                recentChats.map(session => (
                                    <div
                                        key={session.id}
                                        onClick={() => handleSelectSession(session)}
                                        className={`p-3 rounded-xl border transition-all cursor-pointer relative group text-left ${
                                            session.id === sessionId
                                                ? "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-2xs"
                                                : "bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatSessionTime(session.updatedAt)}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                {session.ended && (
                                                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500">
                                                        Ended
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeleteSession(e, session.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-500 transition-opacity rounded cursor-pointer"
                                                    title="Delete this chat"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium line-clamp-2 leading-relaxed">
                                            {session.lastMessage || "Conversation"}
                                        </p>
                                        <div className="mt-1.5 text-[10px] text-slate-400">
                                            {session.messageCount} message{session.messageCount === 1 ? "" : "s"}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        /* View B: Conversation Flow */
                        <div
                            ref={messagesContainerRef}
                            className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3.5 bg-slate-50/50 dark:bg-slate-950/40 overscroll-contain"
                        >
                            {/* 3. Welcome State (Greeting bubble + Capacity-inspired suggested question chips) */}
                            <div className="flex flex-col gap-2.5 items-start">
                                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-[13px] leading-relaxed max-w-[88%] shadow-2xs">
                                    <MarkdownMessage content={config.welcomeMessage || "Hi! How can I help you today?"} />
                                </div>

                                {/* Suggested questions (shown only before conversation messages start and when not blocked) */}
                                {messages.length === 0 && !isChatBlocked && suggestedQuestions.length > 0 && (
                                    <div className="w-full flex flex-col gap-1.5 pt-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
                                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 px-1">
                                            Suggested questions
                                        </span>
                                        <div className="flex flex-col gap-1.5">
                                            {suggestedQuestions.map((q, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleSelectSuggestion(q)}
                                                    className="w-full text-left px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
                                                >
                                                    <span className="truncate">{q}</span>
                                                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Service Status Warnings if applicable */}
                            {config.aiEnabled === false && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900/60 p-3 text-xs text-amber-900 dark:text-amber-200">
                                    This assistant is temporarily unavailable. Please check back later.
                                </div>
                            )}

                            {config.aiEnabled &&
                                typeof config.aiRepliesRemaining === "number" &&
                                config.aiRepliesRemaining <= 0 && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900/60 p-3 text-xs text-amber-900 dark:text-amber-200">
                                        This assistant has used its current reply allowance.
                                    </div>
                                )}

                            {/* 6. Contextual Lead Capture — Mode 1 (First of Chat gated form) */}
                            {isChatBlocked && (
                                <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/95 p-4 shadow-sm animate-in fade-in duration-200">
                                    <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                        {leadSettings.title || "Where can our team reach you?"}
                                    </h3>
                                    {leadSettings.subtitle && (
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
                                            {leadSettings.subtitle}
                                        </p>
                                    )}

                                    {leadError && (
                                        <div className="text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 rounded-lg p-2 mb-2.5">
                                            {leadError}
                                        </div>
                                    )}

                                    <form onSubmit={handleLeadSubmit} className="flex flex-col gap-2">
                                        {leadSettings.askName !== false && (
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Your name"
                                                    value={leadForm.name}
                                                    onChange={e => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-slate-400"
                                                />
                                            </div>
                                        )}
                                        {leadSettings.askEmail !== false && (
                                            <div>
                                                <input
                                                    type="email"
                                                    placeholder="Email address"
                                                    required
                                                    value={leadForm.email}
                                                    onChange={e => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                                                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-slate-400"
                                                />
                                            </div>
                                        )}
                                        {leadSettings.askPhone && (
                                            <div>
                                                <input
                                                    type="tel"
                                                    placeholder="Phone number"
                                                    value={leadForm.phone}
                                                    onChange={e => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                                                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-slate-400"
                                                />
                                            </div>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={leadSubmitting}
                                            style={{ backgroundColor: brandAccent, color: contrastOnBrand }}
                                            className="mt-1 w-full py-2 text-xs font-medium rounded-lg shadow-2xs hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                                        >
                                            {leadSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                            Start Chat
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* 4. Conversation Messages (Left-aligned assistant, right-aligned visitor) */}
                            {(!isChatBlocked || leadCaptured) &&
                                messages.map(m => {
                                    const text = getMessageText(m as MessageLike);
                                    if (!text) return null;
                                    const isUser = m.role === "user";
                                    const containsBooking = !isUser && Boolean(
                                        config.bookingLink && text.includes(config.bookingLink)
                                    );

                                    return (
                                        <div
                                            key={m.id}
                                            className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in fade-in duration-150 min-w-0`}
                                        >
                                            <div
                                                className={`p-3 text-[13px] max-w-[85%] min-w-0 break-words leading-relaxed ${
                                                    isUser
                                                        ? "rounded-2xl rounded-tr-xs shadow-2xs"
                                                        : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-xs shadow-2xs"
                                                }`}
                                                style={
                                                    isUser
                                                        ? {
                                                              backgroundColor: brandAccent,
                                                              color: contrastOnBrand,
                                                          }
                                                        : {}
                                                }
                                            >
                                                <MarkdownMessage
                                                    content={text}
                                                    isUser={isUser}
                                                    bookingLink={config.bookingLink}
                                                    onBookingClick={() => trackBookingEvent("booking_link_clicked")}
                                                />

                                                {containsBooking && config.bookingLink && (
                                                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/70 flex flex-col gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                                                <Calendar className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                                                    Schedule an Appointment
                                                                </div>
                                                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                                                    Choose a convenient date and time
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={config.bookingLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={() => trackBookingEvent("booking_link_clicked")}
                                                            style={{ backgroundColor: brandAccent, color: contrastOnBrand }}
                                                            className="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs hover:opacity-95 transition-opacity"
                                                        >
                                                            <CalendarCheck className="w-3.5 h-3.5" />
                                                            <span>Open Booking Calendar</span>
                                                            <ExternalLink className="w-3 h-3 opacity-80 ml-0.5" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                            {/* 6. Contextual Lead Capture — Mode 2 & 3 Inline Form */}
                            {!isChatBlocked && inChatPromptTriggered && !leadCaptured && !leadDismissed && (
                                <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/95 p-3.5 shadow-sm animate-in fade-in duration-200">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                                {leadSettings.title || "Where can our team reach you?"}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                                {leadSettings.subtitle || "Leave your contact details so our team can follow up."}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setLeadDismissed(true)}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 -mr-1 -mt-1 rounded-md transition-colors"
                                            title="Skip"
                                            aria-label="Skip lead capture"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {leadError && (
                                        <div className="text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 rounded-lg p-2 mb-2">
                                            {leadError}
                                        </div>
                                    )}

                                    <form onSubmit={handleLeadSubmit} className="flex flex-col gap-2 mt-2">
                                        {leadSettings.askName !== false && (
                                            <input
                                                type="text"
                                                placeholder="Your name"
                                                value={leadForm.name}
                                                onChange={e => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-slate-400"
                                            />
                                        )}
                                        {leadSettings.askEmail !== false && (
                                            <input
                                                type="email"
                                                placeholder="Email address"
                                                required
                                                value={leadForm.email}
                                                onChange={e => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-slate-400"
                                            />
                                        )}
                                        {leadSettings.askPhone && (
                                            <input
                                                type="tel"
                                                placeholder="Phone number"
                                                value={leadForm.phone}
                                                onChange={e => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-slate-400"
                                            />
                                        )}
                                        <div className="flex items-center gap-2 mt-1">
                                            <button
                                                type="submit"
                                                disabled={leadSubmitting}
                                                style={{ backgroundColor: brandAccent, color: contrastOnBrand }}
                                                className="flex-1 py-1.5 text-xs font-medium rounded-lg shadow-2xs hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                                            >
                                                {leadSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                                Send Details
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setLeadDismissed(true)}
                                                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                Not now
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Lead Submission Success Confirmation Message */}
                            {leadSuccessMessage && (
                                <div className="rounded-xl border border-emerald-200/90 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/40 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2 shadow-2xs animate-in fade-in duration-200">
                                    <CircleCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span>{leadSuccessMessage}</span>
                                </div>
                            )}

                            {/* Chat Ended Notification Card with Option to Continue or Start New */}
                            {isChatEnded && (
                                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-3.5 rounded-2xl text-center space-y-2.5 shadow-2xs animate-in fade-in duration-200">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                            This conversation was ended
                                        </p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            You can resume this chat anytime or start a brand new conversation.
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={handleResumeChat}
                                            style={{ backgroundColor: brandAccent, color: contrastOnBrand }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg shadow-2xs hover:opacity-95 cursor-pointer transition-opacity"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                            Continue this chat
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleStartNewChat}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                                        >
                                            <SquarePen className="w-3 h-3" />
                                            New chat
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Error Alert */}
                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-900/60 p-3 text-xs text-rose-800 dark:text-rose-200"
                                >
                                    {error.message || "Unable to complete response. Please try again."}
                                </div>
                            )}

                            {/* Typing / Loading indicator (DocsBot subtle dots) */}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 px-3.5 py-2.5 rounded-2xl rounded-tl-xs flex gap-1.5 items-center shadow-2xs">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                        <div
                                            className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.15s" }}
                                        />
                                        <div
                                            className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.3s" }}
                                        />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* 5. Fixed Message Composer at Bottom (Always available to type or continue chat) */}
                    {viewMode === "chat" && !isChatBlocked && config.aiEnabled !== false && config.aiRepliesRemaining !== 0 && (
                        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                            <form onSubmit={handleSend} className="relative flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    placeholder={isChatEnded ? "Type a message to continue this chat..." : "Type your message..."}
                                    disabled={isLoading}
                                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400/40 focus:border-slate-400 dark:focus:border-slate-500 transition-all disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    style={{
                                        backgroundColor: inputValue.trim() ? brandAccent : undefined,
                                        color: inputValue.trim() ? contrastOnBrand : undefined,
                                    }}
                                    className={`absolute right-1.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                                        !inputValue.trim()
                                            ? "text-slate-400 bg-transparent"
                                            : "shadow-2xs hover:opacity-90 active:scale-95"
                                    }`}
                                    aria-label="Send message"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
