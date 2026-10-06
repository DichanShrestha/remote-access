"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Search,
  Trash2,
  User,
  Bot,
  ChevronRight,
  Loader2,
  Clock,
  Hash,
} from "lucide-react";
import {
  getBotConversations,
  getConversationMessages,
  deleteConversation,
} from "@/app/actions/chat-log-actions";
import type {
  ConversationSummary,
  ConversationMessage,
} from "@/types/conversations";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTimestamp(date: Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function ConversationsPanel({ botId }: { botId: string }) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadConversations = async () => {
    setLoadingList(true);
    try {
      const data = await getBotConversations(botId);
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations", error);
    } finally {
      setLoadingList(false);
    }
  };

  const selectConversation = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setLoadingMessages(true);
    try {
      const data = await getConversationMessages(botId, sessionId);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation? This cannot be undone.")) return;
    setDeletingId(sessionId);
    try {
      await deleteConversation(botId, sessionId);
      setConversations((prev) => prev.filter((c) => c.sessionId !== sessionId));
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.firstMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(
    (c) => c.sessionId === selectedSessionId
  );

  return (
    <div className="flex-1 flex border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm min-h-0">
      {/* Sidebar — Conversation List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 flex-shrink-0">
        {/* Search */}
        <div className="p-3 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mb-3" />
              <p className="text-sm">Loading conversations…</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 px-6 text-center">
              <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">
                {searchQuery ? "No matching conversations" : "No conversations yet"}
              </p>
              <p className="text-xs mt-1 opacity-70">
                {searchQuery
                  ? "Try a different search term."
                  : "Conversations with your AI chatbot will appear here."}
              </p>
            </div>
          ) : (
            <div className="p-2 flex flex-col gap-1">
              {filteredConversations.map((conv) => {
                const isSelected = conv.sessionId === selectedSessionId;
                const isDeleting = conv.sessionId === deletingId;
                return (
                  <button
                    key={conv.sessionId}
                    onClick={() => selectConversation(conv.sessionId)}
                    disabled={isDeleting}
                    className={`w-full text-left p-3 rounded-xl transition-all group relative ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-md"
                        : "hover:bg-white hover:shadow-sm text-slate-700"
                    } ${isDeleting ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-medium leading-snug line-clamp-2 ${
                          isSelected ? "text-white" : "text-slate-800"
                        }`}
                      >
                        {conv.firstMessage}
                      </p>
                      <button
                        onClick={(e) => handleDelete(conv.sessionId, e)}
                        className={`p-1 rounded-md flex-shrink-0 transition-all ${
                          isSelected
                            ? "text-slate-400 hover:text-red-300 hover:bg-slate-800 opacity-0 group-hover:opacity-100"
                            : "text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                        }`}
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`text-xs flex items-center gap-1 ${
                          isSelected ? "text-slate-400" : "text-slate-400"
                        }`}
                      >
                        <Hash className="w-3 h-3" />
                        {conv.messageCount} msgs
                      </span>
                      <span
                        className={`text-xs flex items-center gap-1 ${
                          isSelected ? "text-slate-400" : "text-slate-400"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(conv.updatedAt)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer count */}
        {!loadingList && conversations.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 text-xs text-slate-400 font-medium">
            {filteredConversations.length} of {conversations.length} conversations
          </div>
        )}
      </div>

      {/* Main — Chat Thread */}
      <div className="hidden md:flex flex-1 flex-col min-w-0 bg-white">
        {!selectedSessionId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400 px-6">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="w-9 h-9 text-slate-300" />
              </div>
              <p className="font-semibold text-slate-500 text-lg mb-1">
                Select a conversation
              </p>
              <p className="text-sm">
                Choose a conversation from the list to view the full chat thread.
              </p>
            </div>
          </div>
        ) : loadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Loading messages…</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {selectedConversation?.firstMessage}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedConversation &&
                    new Date(selectedConversation.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}{" "}
                  · {messages.length} messages
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="max-w-3xl mx-auto flex flex-col gap-4">
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          isUser
                            ? "bg-slate-900 text-white rounded-br-md"
                            : "bg-slate-100 text-slate-800 rounded-bl-md"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p
                          className={`text-[10px] mt-2 ${
                            isUser ? "text-slate-400" : "text-slate-400"
                          }`}
                        >
                          {formatTimestamp(msg.createdAt)}
                        </p>
                      </div>
                      {isUser && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
