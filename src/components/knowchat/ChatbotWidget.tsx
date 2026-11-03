"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
    MessageSquare,
    X,
    ArrowUp,
    ArrowUpRight,
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
    ExternalLink,
    Sparkles,
    ShieldCheck,
    AlertTriangle,
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

type LeadFormState = { name: string; email: string; phone: string };

const DEFAULT_ACCENT = "#0f172a";

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

function normalizeHex(value: string | null | undefined): string {
    if (!value || typeof value !== "string") return DEFAULT_ACCENT;
    const clean = value.trim();
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(clean)) return DEFAULT_ACCENT;
    return clean.length === 4
        ? `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`
        : clean;
}

function mixHex(base: string, target: string, ratio: number): string {
    const parse = (hex: string) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
    const [r1, g1, b1] = parse(base);
    const [r2, g2, b2] = parse(target);
    const channel = (a: number, b: number) =>
        Math.round(a + (b - a) * ratio).toString(16).padStart(2, "0");
    return `#${channel(r1, r2)}${channel(g1, g2)}${channel(b1, b2)}`;
}

function withAlpha(hex: string, alpha: number): string {
    const [r, g, b] = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

/* -------------------------------------------------------------------------- */
/* Presentational pieces                                                      */
/* -------------------------------------------------------------------------- */

function BotAvatar({
    config,
    size = 36,
    showStatus = false,
    statusClassName = "",
}: {
    config: BotPublicConfig;
    size?: number;
    showStatus?: boolean;
    statusClassName?: string;
}) {
    const avatarEmoji = config.avatarEmoji?.trim();
    const hasCustomEmoji = Boolean(avatarEmoji && avatarEmoji.toLowerCase() !== "bot");

    return (
        <div className="relative flex-none">
            <div
                className="grid overflow-hidden rounded-full bg-white text-slate-700 ring-1 ring-black/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:bg-white/10 dark:text-slate-200 dark:ring-white/10"
                style={{ width: size, height: size }}
            >
                {config.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={config.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : hasCustomEmoji ? (
                    <span style={{ fontSize: Math.round(size * 0.46) }}>{avatarEmoji}</span>
                ) : (
                    <Bot style={{ width: Math.round(size * 0.44), height: Math.round(size * 0.44) }} strokeWidth={1.7} />
                )}
            </div>
            {showStatus && (
                <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#fdfcf8] bg-emerald-500 shadow-sm dark:border-[#171816] ${statusClassName}`}
                />
            )}
        </div>
    );
}

function TypingDots() {
    return (
        <span className="flex items-center gap-1" aria-hidden="true">
            {[0, 1, 2].map((index) => (
                <span
                    key={index}
                    className="bot-typing-dot h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500"
                    style={{ animationDelay: `${index * 140}ms` }}
                />
            ))}
        </span>
    );
}

const inputClass =
    "h-10 w-full rounded-xl border border-black/[0.08] bg-white px-3 text-[12.5px] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-900/[0.04] disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:focus:border-white/20 dark:focus:ring-white/[0.06]";

function LeadCaptureForm({
    settings,
    form,
    onChange,
    onSubmit,
    submitting,
    error,
    submitLabel,
}: {
    settings: LeadCaptureSettings;
    form: LeadFormState;
    onChange: (patch: Partial<LeadFormState>) => void;
    onSubmit: (event: React.FormEvent) => void;
    submitting: boolean;
    error: string | null;
    submitLabel: string;
}) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-1.5 rounded-xl border border-rose-200/80 bg-rose-50 px-2.5 py-2 text-[11px] leading-4 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                >
                    <AlertTriangle className="mt-px h-3 w-3 flex-none" />
                    {error}
                </div>
            )}

            {settings.askName !== false && (
                <label className="block">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                        Name
                    </span>
                    <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        placeholder="Your name"
                        value={form.name}
                        onChange={(event) => onChange({ name: event.target.value })}
                        className={inputClass}
                    />
                </label>
            )}

            {settings.askEmail !== false && (
                <label className="block">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                        Email
                    </span>
                    <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        value={form.email}
                        onChange={(event) => onChange({ email: event.target.value })}
                        className={inputClass}
                    />
                </label>
            )}

            {settings.askPhone && (
                <label className="block">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                        Phone
                    </span>
                    <input
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        placeholder="+1 555 000 0000"
                        value={form.phone}
                        onChange={(event) => onChange({ phone: event.target.value })}
                        className={inputClass}
                    />
                </label>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="mt-0.5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--bot-accent)] text-[12.5px] font-semibold text-[var(--bot-on-accent)] shadow-[0_10px_24px_-14px_rgba(15,23,42,0.8)] transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {submitLabel}
            </button>
        </form>
    );
}

/* -------------------------------------------------------------------------- */
/* Widget                                                                     */
/* -------------------------------------------------------------------------- */

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
    const [leadForm, setLeadForm] = useState<LeadFormState>({ name: "", email: "", phone: "" });
    const [leadSubmitting, setLeadSubmitting] = useState(false);
    const [leadError, setLeadError] = useState<string | null>(null);
    const [leadSuccessMessage, setLeadSuccessMessage] = useState<string | null>(null);

    const [inputValue, setInputValue] = useState("");
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

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

    // Close the panel with Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    // Focus composer when opening chat
    useEffect(() => {
        if (isOpen && viewMode === "chat") {
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen, viewMode]);

    // Keep the composer compact until the visitor writes more
    useEffect(() => {
        const element = inputRef.current;
        if (!element) return;
        element.style.height = "auto";
        element.style.height = `${Math.min(element.scrollHeight, 112)}px`;
    }, [inputValue, isOpen, viewMode]);

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

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        // Automatically resume the conversation if it was previously ended!
        if (isChatEnded) {
            setIsChatEnded(false);
        }

        const textToSend = inputValue.trim();
        checkTriggersOnSend(textToSend);

        sendMessage({ text: textToSend });
        setInputValue("");
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
        }
    };

    const handleComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            handleSend();
        }
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

    const brandAccent = normalizeHex(config.colorTheme);
    const contrastOnBrand = getContrastColor(brandAccent);
    const accentDeep = mixHex(brandAccent, "#000000", 0.24);
    const accentSoft = mixHex(brandAccent, "#ffffff", 0.9);
    const accentMist = mixHex(brandAccent, "#ffffff", 0.96);

    const themeVars = {
        "--bot-accent": brandAccent,
        "--bot-accent-deep": accentDeep,
        "--bot-accent-soft": accentSoft,
        "--bot-on-accent": contrastOnBrand,
    } as React.CSSProperties;

    // Gated first-mode check
    const isChatBlocked = isLeadCaptureActive && mode === "first" && !leadCaptured;
    const assistantName = config.name || "Assistant";
    const canSend = Boolean(inputValue.trim()) && !isLoading;
    const showComposer =
        viewMode === "chat" && !isChatBlocked && config.aiEnabled !== false && config.aiRepliesRemaining !== 0;

    const iconButtonClass =
        "grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-black/[0.05] hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:text-slate-400 dark:hover:bg-white/[0.07] dark:hover:text-slate-100 dark:focus-visible:ring-white/20";

    return (
        <div
            className="fixed z-50 font-sans"
            style={{
                bottom: "max(1.25rem, env(safe-area-inset-bottom, 1.25rem))",
                right: "max(1.25rem, env(safe-area-inset-right, 1.25rem))",
            }}
        >
            {/* Launcher */}
            {!isOpen && (
                <div className="bot-launcher-in group relative">
                    <div className="pointer-events-none absolute bottom-full right-0 mb-3 hidden translate-y-1 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 sm:block">
                        Chat with {assistantName}
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="relative grid h-14 w-14 cursor-pointer place-items-center rounded-full text-white shadow-[0_18px_40px_-12px_rgba(15,23,42,0.45),0_4px_12px_-4px_rgba(15,23,42,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-12px_rgba(15,23,42,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 focus-visible:ring-offset-2 active:translate-y-0 active:scale-95"
                        style={{
                            backgroundImage: `linear-gradient(145deg, ${mixHex(brandAccent, "#ffffff", 0.12)}, ${accentDeep})`,
                            color: contrastOnBrand,
                        }}
                        aria-label={`Open chat with ${assistantName}`}
                        aria-expanded={false}
                    >
                        <span
                            className="pointer-events-none absolute inset-0 rounded-full opacity-60"
                            style={{ boxShadow: `inset 0 1px 0 ${withAlpha("#ffffff", 0.28)}` }}
                        />
                        <MessageSquare className="h-5 w-5" strokeWidth={1.9} />
                        {!isChatEnded && config.aiEnabled !== false && (
                            <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm dark:border-[#171816]" />
                        )}
                    </button>
                </div>
            )}

            {/* Panel */}
            {isOpen && (
                <div
                    className="bot-panel-in flex h-[620px] max-h-[min(700px,calc(100dvh-2.5rem))] w-[392px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[26px] border border-black/[0.06] bg-[#fbfaf6] shadow-[0_32px_80px_-24px_rgba(15,23,42,0.35),0_12px_32px_-16px_rgba(15,23,42,0.18)] dark:border-white/[0.08] dark:bg-[#121312] max-sm:fixed max-sm:inset-0 max-sm:h-full max-sm:max-h-full max-sm:w-full max-sm:max-w-none max-sm:rounded-none max-sm:border-0"
                    style={themeVars}
                    role="dialog"
                    aria-modal="true"
                    aria-label={assistantName}
                    data-lenis-prevent
                >
                    {/* Header */}
                    <div className="relative flex flex-shrink-0 items-center justify-between gap-3 border-b border-black/[0.055] bg-[#fdfcf8] px-3.5 py-3 dark:border-white/[0.07] dark:bg-[#171816] max-sm:pt-[max(0.75rem,env(safe-area-inset-top))]">
                        <div
                            className="pointer-events-none absolute inset-0"
                            style={{ backgroundImage: `linear-gradient(120deg, ${withAlpha(brandAccent, 0.1)}, transparent 64%)` }}
                        />

                        {viewMode === "recent_chats" ? (
                            <div className="relative flex min-w-0 items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setViewMode("chat")}
                                    className={iconButtonClass}
                                    title="Back to conversation"
                                    aria-label="Back to conversation"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <div className="min-w-0">
                                    <h2 className="truncate text-[13.5px] font-semibold leading-tight tracking-[-0.01em] text-slate-900 dark:text-slate-100">
                                        Recent chats
                                    </h2>
                                    <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                                        {recentChats.length} saved conversation{recentChats.length === 1 ? "" : "s"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative flex min-w-0 items-center gap-2.5">
                                <BotAvatar config={config} size={36} showStatus={!isChatEnded && config.aiEnabled !== false} />
                                <div className="min-w-0">
                                    <h2 className="truncate text-[13.5px] font-semibold leading-tight tracking-[-0.01em] text-slate-900 dark:text-slate-100">
                                        {assistantName}
                                    </h2>
                                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                                        {isChatEnded ? (
                                            "Conversation ended"
                                        ) : config.aiEnabled === false ? (
                                            "Temporarily unavailable"
                                        ) : (
                                            <>
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                Online now
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="relative flex flex-none items-center gap-0.5">
                            {viewMode === "recent_chats" && (
                                <button
                                    type="button"
                                    onClick={handleStartNewChat}
                                    className={iconButtonClass}
                                    title="New chat"
                                    aria-label="Start a new chat"
                                >
                                    <SquarePen className="h-4 w-4" />
                                </button>
                            )}

                            <div className="relative" ref={menuRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsMenuOpen(prev => !prev)}
                                    className={iconButtonClass}
                                    title="Options"
                                    aria-label="Options"
                                    aria-expanded={isMenuOpen}
                                >
                                    <Ellipsis className="h-4 w-4" />
                                </button>

                                {isMenuOpen && (
                                    <div className="bot-pop-in absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-black/[0.07] bg-white p-1.5 shadow-[0_18px_40px_-16px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-[#1c1d1b]">
                                        <button
                                            type="button"
                                            onClick={handleStartNewChat}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12px] font-medium text-slate-600 transition hover:bg-black/[0.04] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
                                        >
                                            <SquarePen className="h-3.5 w-3.5 flex-none text-slate-400" />
                                            Start a new chat
                                        </button>

                                        {isChatEnded ? (
                                            <button
                                                type="button"
                                                onClick={handleResumeChat}
                                                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12px] font-medium text-slate-600 transition hover:bg-black/[0.04] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
                                            >
                                                <RotateCcw className="h-3.5 w-3.5 flex-none text-slate-400" />
                                                Continue this chat
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleEndChat}
                                                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12px] font-medium text-slate-600 transition hover:bg-black/[0.04] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
                                            >
                                                <X className="h-3.5 w-3.5 flex-none text-slate-400" />
                                                End chat
                                            </button>
                                        )}

                                        <div className="my-1 h-px bg-black/[0.055] dark:bg-white/[0.07]" />

                                        <button
                                            type="button"
                                            onClick={handleViewRecentChats}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12px] font-medium text-slate-600 transition hover:bg-black/[0.04] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
                                        >
                                            <History className="h-3.5 w-3.5 flex-none text-slate-400" />
                                            View recent chats
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className={iconButtonClass}
                                title="Close"
                                aria-label="Close chat"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Recent chats */}
                    {viewMode === "recent_chats" ? (
                        <div className="bot-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain bg-[#fbfaf6] p-3.5 dark:bg-[#101110]">
                            {recentChats.length === 0 ? (
                                <div className="m-auto flex flex-col items-center px-6 text-center">
                                    <div
                                        className="mb-3 grid h-12 w-12 place-items-center rounded-2xl"
                                        style={{ backgroundColor: accentSoft, color: brandAccent }}
                                    >
                                        <History className="h-5 w-5" strokeWidth={1.8} />
                                    </div>
                                    <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                                        No recent chats yet
                                    </p>
                                    <p className="mt-1 max-w-[210px] text-[11.5px] leading-5 text-slate-500 dark:text-slate-400">
                                        Your previous conversations will be saved here on this device.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleStartNewChat}
                                        className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold shadow-sm transition hover:opacity-90"
                                        style={{ backgroundColor: brandAccent, color: contrastOnBrand }}
                                    >
                                        <SquarePen className="h-3.5 w-3.5" />
                                        Start a chat
                                    </button>
                                </div>
                            ) : (
                                recentChats.map(session => (
                                    <div
                                        key={session.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleSelectSession(session)}
                                        onKeyDown={(event) => {
                                            if (event.target !== event.currentTarget) return;
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                handleSelectSession(session);
                                            }
                                        }}
                                        className={`group relative w-full cursor-pointer rounded-2xl border p-3.5 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
                                            session.id === sessionId
                                                ? "border-black/[0.1] bg-white shadow-[0_6px_18px_-12px_rgba(15,23,42,0.3)] dark:border-white/15 dark:bg-white/[0.06]"
                                                : "border-black/[0.055] bg-white hover:-translate-y-px hover:border-black/[0.1] hover:shadow-[0_8px_20px_-14px_rgba(15,23,42,0.28)] dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="grid h-7 w-7 flex-none place-items-center rounded-lg"
                                                style={{ backgroundColor: accentMist, color: brandAccent }}
                                            >
                                                <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.9} />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    {formatSessionTime(session.updatedAt)}
                                                    <span className="text-slate-300 dark:text-slate-600">·</span>
                                                    {session.messageCount} message{session.messageCount === 1 ? "" : "s"}
                                                    {session.ended && (
                                                        <span className="ml-auto rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:bg-white/10 dark:text-slate-400">
                                                            Ended
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-0.5 line-clamp-2 text-[12px] font-medium leading-5 text-slate-700 dark:text-slate-200">
                                                    {session.lastMessage || "Conversation"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(event) => handleDeleteSession(event, session.id)}
                                            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 focus:opacity-100 group-hover:opacity-100 dark:text-slate-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                                            title="Delete this chat"
                                            aria-label="Delete this chat"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        /* Conversation */
                        <div className="relative flex min-h-0 flex-1 flex-col">
                            <div
                                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-44"
                                style={{ background: `radial-gradient(90% 100% at 50% 0%, ${withAlpha(brandAccent, 0.06)}, transparent 72%)` }}
                            />
                            <div
                                ref={messagesContainerRef}
                                role="log"
                                aria-live="polite"
                                aria-label="Conversation"
                                className="bot-scroll relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4"
                            >
                                {/* Welcome state */}
                                {messages.length === 0 && (
                                    <div className="bot-msg-in my-auto flex flex-col items-center px-1 pb-1 pt-2 text-center">
                                        <div className="relative">
                                            <div
                                                className="pointer-events-none absolute inset-0 rounded-full blur-xl"
                                                style={{ backgroundColor: withAlpha(brandAccent, 0.18) }}
                                            />
                                            <div
                                                className="relative rounded-full p-[2px]"
                                                style={{
                                                    backgroundImage: `linear-gradient(145deg, ${withAlpha(brandAccent, 0.55)}, ${withAlpha(brandAccent, 0.08)})`,
                                                }}
                                            >
                                                <BotAvatar config={config} size={52} />
                                            </div>
                                        </div>
                                        <p className="mt-3 text-[14.5px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">
                                            {assistantName}
                                        </p>
                                        <div className="mt-1.5 max-w-[300px] text-[12.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                                            <MarkdownMessage content={config.welcomeMessage || "Hi! How can I help you today?"} />
                                        </div>

                                        {!isChatBlocked && suggestedQuestions.length > 0 && (
                                            <div className="mt-5 w-full">
                                                <p className="mb-2 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                                    Suggested questions
                                                </p>
                                                <div className="flex flex-col gap-1.5">
                                                    {suggestedQuestions.map((question, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => handleSelectSuggestion(question)}
                                                            className="group flex w-full items-center gap-2.5 rounded-2xl border border-black/[0.055] bg-white px-3 py-2.5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition-all duration-150 hover:-translate-y-px hover:border-black/[0.1] hover:shadow-[0_8px_20px_-14px_rgba(15,23,42,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 dark:border-white/[0.07] dark:bg-white/[0.04] dark:hover:border-white/15 dark:hover:bg-white/[0.06]"
                                                        >
                                                            <span
                                                                className="grid h-7 w-7 flex-none place-items-center rounded-lg"
                                                                style={{ backgroundColor: accentMist, color: brandAccent }}
                                                            >
                                                                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.9} />
                                                            </span>
                                                            <span className="flex-1 text-[12px] font-medium leading-snug text-slate-700 dark:text-slate-200">
                                                                {question}
                                                            </span>
                                                            <ArrowUpRight className="h-3.5 w-3.5 flex-none text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-500" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Service warnings */}
                                {config.aiEnabled === false && (
                                    <div className="flex items-start gap-2 rounded-2xl border border-amber-200/80 bg-amber-50 px-3.5 py-3 text-[11.5px] leading-5 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" />
                                        This assistant is temporarily unavailable. Please check back later.
                                    </div>
                                )}

                                {config.aiEnabled &&
                                    typeof config.aiRepliesRemaining === "number" &&
                                    config.aiRepliesRemaining <= 0 && (
                                        <div className="flex items-start gap-2 rounded-2xl border border-amber-200/80 bg-amber-50 px-3.5 py-3 text-[11.5px] leading-5 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" />
                                            This assistant has used its current reply allowance.
                                        </div>
                                    )}

                                {/* Lead gate */}
                                {isChatBlocked && (
                                    <div className="bot-msg-in rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-[0_12px_32px_-20px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                                        <div className="mb-3 flex items-start gap-2.5">
                                            <span
                                                className="grid h-8 w-8 flex-none place-items-center rounded-xl"
                                                style={{ backgroundColor: accentSoft, color: brandAccent }}
                                            >
                                                <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
                                            </span>
                                            <div>
                                                <h3 className="text-[12.5px] font-semibold leading-5 text-slate-900 dark:text-slate-100">
                                                    {leadSettings.title || "Where can our team reach you?"}
                                                </h3>
                                                {leadSettings.subtitle && (
                                                    <p className="mt-0.5 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                                                        {leadSettings.subtitle}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <LeadCaptureForm
                                            settings={leadSettings}
                                            form={leadForm}
                                            onChange={(patch) => setLeadForm(prev => ({ ...prev, ...patch }))}
                                            onSubmit={handleLeadSubmit}
                                            submitting={leadSubmitting}
                                            error={leadError}
                                            submitLabel="Start chat"
                                        />
                                        <p className="mt-2.5 text-center text-[10px] leading-4 text-slate-500 dark:text-slate-400">
                                            We only use these details to follow up on your question.
                                        </p>
                                    </div>
                                )}

                                {/* Messages */}
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
                                                className={`bot-msg-in flex min-w-0 gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                                            >
                                                {!isUser && <BotAvatar config={config} size={26} />}
                                                <div
                                                    className={`min-w-0 max-w-[82%] break-words px-3.5 py-2.5 text-[13px] leading-relaxed ${
                                                        isUser
                                                            ? "rounded-[18px] rounded-tr-md shadow-[0_8px_20px_-12px_rgba(15,23,42,0.5)]"
                                                            : "rounded-[18px] rounded-tl-md border border-black/[0.055] bg-white text-slate-700 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.12)] dark:border-white/[0.07] dark:bg-white/[0.05] dark:text-slate-100"
                                                    }`}
                                                    style={
                                                        isUser
                                                            ? {
                                                                  backgroundImage: `linear-gradient(145deg, ${mixHex(brandAccent, "#ffffff", 0.08)}, ${brandAccent})`,
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
                                                        <div className="mt-3 flex flex-col gap-2 border-t border-black/[0.06] pt-2.5 dark:border-white/10">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="grid h-7 w-7 flex-none place-items-center rounded-lg"
                                                                    style={{ backgroundColor: accentSoft, color: brandAccent }}
                                                                >
                                                                    <Calendar className="h-3.5 w-3.5" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="text-[11.5px] font-semibold text-slate-900 dark:text-slate-100">
                                                                        Schedule an appointment
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
                                                                className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11.5px] font-semibold shadow-sm transition hover:opacity-90"
                                                                style={{ backgroundColor: brandAccent, color: contrastOnBrand }}
                                                            >
                                                                <CalendarCheck className="h-3.5 w-3.5" />
                                                                <span>Open booking calendar</span>
                                                                <ExternalLink className="ml-0.5 h-3 w-3 opacity-80" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                {/* Inline lead capture */}
                                {!isChatBlocked && inChatPromptTriggered && !leadCaptured && !leadDismissed && (
                                    <div className="bot-msg-in rounded-[20px] border border-black/[0.06] bg-white p-3.5 shadow-[0_12px_32px_-20px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                                        <div className="mb-3 flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-2.5">
                                                <span
                                                    className="grid h-7 w-7 flex-none place-items-center rounded-lg"
                                                    style={{ backgroundColor: accentSoft, color: brandAccent }}
                                                >
                                                    <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
                                                </span>
                                                <div>
                                                    <h4 className="text-[12px] font-semibold leading-4 text-slate-900 dark:text-slate-100">
                                                        {leadSettings.title || "Where can our team reach you?"}
                                                    </h4>
                                                    <p className="mt-0.5 text-[10.5px] leading-4 text-slate-500 dark:text-slate-400">
                                                        {leadSettings.subtitle || "Leave your contact details so our team can follow up."}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setLeadDismissed(true)}
                                                className="grid h-6 w-6 flex-none place-items-center rounded-full text-slate-400 transition hover:bg-black/[0.05] hover:text-slate-600 dark:hover:bg-white/[0.07] dark:hover:text-slate-200"
                                                title="Skip"
                                                aria-label="Skip lead capture"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>

                                        <LeadCaptureForm
                                            settings={leadSettings}
                                            form={leadForm}
                                            onChange={(patch) => setLeadForm(prev => ({ ...prev, ...patch }))}
                                            onSubmit={handleLeadSubmit}
                                            submitting={leadSubmitting}
                                            error={leadError}
                                            submitLabel="Send details"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setLeadDismissed(true)}
                                            className="mt-1.5 w-full rounded-lg py-1.5 text-[10.5px] font-medium text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                                        >
                                            Not now
                                        </button>
                                    </div>
                                )}

                                {/* Success confirmation */}
                                {leadSuccessMessage && (
                                    <div className="bot-msg-in flex items-start gap-2 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-3.5 py-3 text-[11.5px] leading-5 text-emerald-800 shadow-[0_2px_8px_-4px_rgba(16,185,129,0.2)] dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                                        <CircleCheck className="mt-0.5 h-4 w-4 flex-none text-emerald-600 dark:text-emerald-400" />
                                        <span>{leadSuccessMessage}</span>
                                    </div>
                                )}

                                {/* Ended chat */}
                                {isChatEnded && (
                                    <div className="bot-msg-in rounded-[20px] border border-black/[0.06] bg-white p-4 text-center shadow-[0_12px_32px_-20px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                                        <div
                                            className="mx-auto grid h-9 w-9 place-items-center rounded-full"
                                            style={{ backgroundColor: accentSoft, color: brandAccent }}
                                        >
                                            <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
                                        </div>
                                        <p className="mt-2.5 text-[12.5px] font-semibold text-slate-900 dark:text-slate-100">
                                            This conversation was ended
                                        </p>
                                        <p className="mx-auto mt-0.5 max-w-[240px] text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                                            You can resume this chat anytime or start a brand new conversation.
                                        </p>
                                        <div className="mt-3 flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleResumeChat}
                                                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11.5px] font-semibold shadow-sm transition hover:opacity-90"
                                                style={{ backgroundColor: brandAccent, color: contrastOnBrand }}
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                Continue chat
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleStartNewChat}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-black/[0.08] px-3 py-2 text-[11.5px] font-semibold text-slate-600 transition hover:bg-black/[0.03] dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                                            >
                                                <SquarePen className="h-3 w-3" />
                                                New chat
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Error */}
                                {error && (
                                    <div
                                        role="alert"
                                        className="flex items-start gap-2 rounded-2xl border border-rose-200/80 bg-rose-50 px-3.5 py-3 text-[11.5px] leading-5 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
                                    >
                                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" />
                                        {error.message || "Unable to complete response. Please try again."}
                                    </div>
                                )}

                                {/* Typing */}
                                {isLoading && (
                                    <div className="bot-msg-in flex items-end gap-2">
                                        <BotAvatar config={config} size={26} />
                                        <div className="flex items-center gap-2 rounded-[18px] rounded-tl-md border border-black/[0.055] bg-white px-3.5 py-3 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.12)] dark:border-white/[0.07] dark:bg-white/[0.05]">
                                            <TypingDots />
                                            <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                                                {assistantName} is typing
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    )}

                    {/* Composer */}
                    {showComposer && (
                        <div className="flex-shrink-0 border-t border-black/[0.055] bg-[#fdfcf8] px-3 pb-3 pt-3 dark:border-white/[0.07] dark:bg-[#171816] max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                            <form onSubmit={handleSend}>
                                <div className="flex items-end gap-2 rounded-[20px] border border-black/[0.08] bg-white p-1.5 pl-3.5 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.12)] transition focus-within:border-slate-300 focus-within:shadow-[0_0_0_4px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-white/[0.04] dark:focus-within:border-white/20">
                                    <textarea
                                        ref={inputRef}
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        onKeyDown={handleComposerKeyDown}
                                        rows={1}
                                        placeholder={isChatEnded ? "Type a message to continue…" : "Ask me anything…"}
                                        disabled={isLoading}
                                        aria-label="Message"
                                        className="bot-scroll max-h-28 min-h-6 w-full resize-none bg-transparent py-1.5 text-[13px] leading-5 text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 dark:text-slate-100 dark:placeholder:text-slate-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!canSend}
                                        style={
                                            canSend
                                                ? {
                                                      backgroundImage: `linear-gradient(145deg, ${mixHex(brandAccent, "#ffffff", 0.1)}, ${brandAccent})`,
                                                      color: contrastOnBrand,
                                                  }
                                                : undefined
                                        }
                                        className={`grid h-8 w-8 flex-none place-items-center rounded-xl transition-all duration-150 ${
                                            canSend
                                                ? "shadow-[0_6px_14px_-8px_rgba(15,23,42,0.6)] hover:opacity-90 active:scale-95"
                                                : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-500"
                                        }`}
                                        aria-label="Send message"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <ArrowUp className="h-4 w-4" strokeWidth={2.2} />
                                        )}
                                    </button>
                                </div>
                            </form>
                            <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-slate-500 dark:text-slate-400">
                                <span className="hidden sm:inline">Enter to send · Shift + Enter for a new line</span>
                                <span className="sm:hidden">AI assistant</span>
                                <span className="inline-flex items-center gap-1">
                                    <Sparkles className="h-2.5 w-2.5" />
                                    Powered by <span className="font-semibold text-slate-500 dark:text-slate-400">Pageory</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
