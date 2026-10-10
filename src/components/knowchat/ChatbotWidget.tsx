"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { v4 as uuidv4 } from "uuid";

export function ChatbotWidget({ botId }: { botId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<any>(null);
    const [sessionId] = useState(() => uuidv4());
    const [leadCaptured, setLeadCaptured] = useState(false);
    const [leadForm, setLeadForm] = useState({ name: "", email: "" });
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`/api/bot/${botId}/config`)
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                if (!data.collectLeads) {
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leadForm.email) return;

        try {
            await fetch("/api/chat/public", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    botId,
                    sessionId,
                    visitorId: sessionId,
                    leadCapture: true,
                    name: leadForm.name,
                    email: leadForm.email,
                }),
            });
            setLeadCaptured(true);
        } catch (error) {
            console.error("Failed to submit lead form", error);
            setLeadCaptured(true); // Proceed anyway
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        sendMessage({ text: inputValue });
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

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {/* Widget Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{ backgroundColor: config.colorTheme || "#000000" }}
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-black/10 hover:scale-105 transition-transform"
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
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50 dark:bg-slate-950/50">
                        {/* Welcome Message */}
                        {config.welcomeMessage && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 p-3 rounded-2xl rounded-tl-sm text-sm max-w-[85%] shadow-sm">
                                    {config.welcomeMessage}
                                </div>
                            </div>
                        )}
                        {config.aiEnabled === false && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">This assistant is temporarily unavailable. Please contact the page owner.</div>}
                        {config.aiEnabled && typeof config.aiRepliesRemaining === "number" && config.aiRepliesRemaining <= 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">This assistant has used its current reply allowance. Please check back later.</div>}

                        {/* Lead Capture Form */}
                        {!leadCaptured && (
                            <div className="flex justify-start">
                                <form onSubmit={handleLeadSubmit} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl rounded-tl-sm w-[85%] shadow-sm">
                                    <p className="text-xs font-medium text-slate-500 mb-3">Please introduce yourself before we chat.</p>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            required
                                            value={leadForm.name}
                                            onChange={e => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            required
                                            value={leadForm.email}
                                            onChange={e => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                        <button
                                            type="submit"
                                            style={{ backgroundColor: config.colorTheme || "#000000" }}
                                            className="mt-1 w-full py-2 text-white text-sm font-semibold rounded-lg shadow-sm"
                                        >
                                            Start Chat
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Messages */}
                        {leadCaptured && messages.map(m => {
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
                                        <div dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br/>') }} />
                                    </div>
                                </div>
                            );
                        })}
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
                    {leadCaptured && config.aiEnabled !== false && config.aiRepliesRemaining !== 0 && (
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
