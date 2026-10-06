"use client";

import React, { useState, useEffect } from "react";
import { FileText, Link as LinkIcon, HelpCircle, Image as ImageIcon, Trash2, Plus, UploadCloud, Brain, Loader2 } from "lucide-react";
import { getTrainingStatus, crawlAndTrain, uploadAndTrainFiles, deleteDataSource } from "@/app/actions/training-actions";
import { getQAs, saveQA, deleteQA } from "@/app/actions/qa-actions";
import { getVisualSets, createVisualSet, deleteVisualSet } from "@/app/actions/catalog-actions";

type Tab = "sources" | "faqs" | "visuals";

export function KnowledgePanel({ botId }: { botId: string }) {
    const [activeTab, setActiveTab] = useState<Tab>("sources");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Data Sources State
    const [sources, setSources] = useState<any[]>([]);
    const [urlInput, setUrlInput] = useState("");

    // FAQs State
    const [faqs, setFaqs] = useState<any[]>([]);
    const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

    // Visuals State
    const [visualSets, setVisualSets] = useState<any[]>([]);
    const [newVisual, setNewVisual] = useState({ title: "", description: "", imageUrl: "", queries: "" });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setInitialLoading(true);
        try {
            if (activeTab === "sources") {
                const data = await getTrainingStatus(botId);
                setSources(data.sources);
            } else if (activeTab === "faqs") {
                const data = await getQAs(botId);
                setFaqs(data);
            } else if (activeTab === "visuals") {
                const data = await getVisualSets(botId);
                setVisualSets(data);
            }
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setInitialLoading(false);
        }
    };

    // --- SOURCES ---
    const handleAddUrl = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!urlInput) return;
        setLoading(true);
        try {
            await crawlAndTrain(botId, urlInput);
            setUrlInput("");
            await loadData();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", e.target.files[0]);
            await uploadAndTrainFiles(botId, formData);
            await loadData();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSource = async (id: string) => {
        await deleteDataSource(id);
        await loadData();
    };

    // --- FAQS ---
    const handleAddFaq = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFaq.question || !newFaq.answer) return;
        setLoading(true);
        try {
            await saveQA(botId, { questions: [newFaq.question], answer: newFaq.answer });
            setNewFaq({ question: "", answer: "" });
            await loadData();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFaq = async (id: string) => {
        await deleteQA(id);
        await loadData();
    };

    // --- VISUALS ---
    const handleAddVisual = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVisual.title || !newVisual.imageUrl) return;
        setLoading(true);
        try {
            const queries = newVisual.queries.split(",").map(q => q.trim()).filter(Boolean);
            await createVisualSet(
                botId,
                newVisual.title,
                newVisual.description,
                queries,
                [{ publicUrl: newVisual.imageUrl, caption: "", order: 0 }]
            );
            setNewVisual({ title: "", description: "", imageUrl: "", queries: "" });
            await loadData();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVisual = async (id: string) => {
        await deleteVisualSet(id, botId);
        await loadData();
    };

    const tabs = [
        { id: "sources" as Tab, label: "Documents & URLs", icon: FileText, color: "blue" },
        { id: "faqs" as Tab, label: "FAQs", icon: HelpCircle, color: "purple" },
        { id: "visuals" as Tab, label: "Visual Catalog", icon: ImageIcon, color: "pink" },
    ];

    const activeColor = tabs.find(t => t.id === activeTab)?.color || "blue";

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Tabs */}
            <div className="lg:w-56 flex-shrink-0">
                <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 lg:sticky lg:top-10">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                                    isActive
                                        ? `bg-${tab.color}-50 text-${tab.color}-700 border border-${tab.color}-200 shadow-sm`
                                        : "text-slate-500 hover:bg-slate-100 border border-transparent"
                                }`}
                                style={isActive ? {
                                    backgroundColor: tab.color === 'blue' ? '#eff6ff' : tab.color === 'purple' ? '#faf5ff' : '#fdf2f8',
                                    color: tab.color === 'blue' ? '#1d4ed8' : tab.color === 'purple' ? '#7e22ce' : '#be185d',
                                    borderColor: tab.color === 'blue' ? '#bfdbfe' : tab.color === 'purple' ? '#e9d5ff' : '#fbcfe8',
                                } : {}}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
                {initialLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        <p className="text-sm font-medium">Loading knowledge data…</p>
                    </div>
                ) : (
                    <>
                        {activeTab === "sources" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Data Sources</h3>
                                <p className="text-slate-500 text-sm mb-8">Upload PDFs, docs, or enter website URLs for the AI to read and learn from.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                    {/* Upload File */}
                                    <div className="border border-slate-200 bg-slate-50 p-5 rounded-xl">
                                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                            <UploadCloud className="w-4 h-4 text-blue-500" /> Upload Document
                                        </h4>
                                        <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                            <div className="text-center text-sm text-slate-500">
                                                <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                            </div>
                                            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} disabled={loading} />
                                        </label>
                                    </div>

                                    {/* Add URL */}
                                    <div className="border border-slate-200 bg-slate-50 p-5 rounded-xl">
                                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                            <LinkIcon className="w-4 h-4 text-blue-500" /> Crawl Website
                                        </h4>
                                        <form onSubmit={handleAddUrl} className="flex flex-col gap-3">
                                            <input
                                                type="url"
                                                placeholder="https://example.com"
                                                value={urlInput}
                                                onChange={e => setUrlInput(e.target.value)}
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                required
                                            />
                                            <button type="submit" disabled={loading || !urlInput} className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 rounded-lg disabled:opacity-50 transition-colors">
                                                {loading ? "Crawling…" : "Add URL"}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* List Sources */}
                                <h4 className="font-semibold text-slate-800 mb-4">Trained Sources ({sources.length})</h4>
                                <div className="flex flex-col gap-3">
                                    {sources.map(source => (
                                        <div key={source.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:shadow-sm transition-shadow">
                                            <div className="flex items-center gap-3">
                                                {source.type === 'url' ? <LinkIcon className="w-4 h-4 text-slate-400" /> : <FileText className="w-4 h-4 text-slate-400" />}
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">{source.source}</p>
                                                    <p className="text-xs text-slate-500 capitalize">{source.type} • {source.status}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteSource(source.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {sources.length === 0 && <p className="text-sm text-slate-400 italic py-4">No sources trained yet. Upload a document or crawl a URL to get started.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === "faqs" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Frequently Asked Questions</h3>
                                <p className="text-slate-500 text-sm mb-8">Directly train the AI on specific Q&A pairs for guaranteed accurate answers.</p>

                                <form onSubmit={handleAddFaq} className="border border-slate-200 bg-slate-50 p-6 rounded-xl mb-8 flex flex-col gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Question</label>
                                        <input
                                            type="text"
                                            placeholder="E.g. What are your opening hours?"
                                            value={newFaq.question}
                                            onChange={e => setNewFaq({ ...newFaq, question: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Answer</label>
                                        <textarea
                                            placeholder="We are open Monday to Friday from 9 AM to 5 PM."
                                            value={newFaq.answer}
                                            onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm py-2.5 px-5 rounded-lg self-start disabled:opacity-50 flex items-center gap-2 transition-colors">
                                        <Plus className="w-4 h-4" /> Add FAQ
                                    </button>
                                </form>

                                <h4 className="font-semibold text-slate-800 mb-4">Saved FAQs ({faqs.length})</h4>
                                <div className="flex flex-col gap-3">
                                    {faqs.map(faq => (
                                        <div key={faq.id} className="flex items-start justify-between p-4 border border-slate-200 rounded-xl bg-white hover:shadow-sm transition-shadow">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-slate-800 mb-1">{faq.questions?.[0]}</p>
                                                <p className="text-sm text-slate-600">{faq.answer}</p>
                                            </div>
                                            <button onClick={() => handleDeleteFaq(faq.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 rounded-lg hover:bg-red-50 ml-3">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {faqs.length === 0 && <p className="text-sm text-slate-400 italic py-4">No FAQs added yet. Add question-answer pairs to train your AI.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === "visuals" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Visual Catalog</h3>
                                <p className="text-slate-500 text-sm mb-8">Add visual items (products, portfolio images) that the AI can recommend in chat.</p>

                                <form onSubmit={handleAddVisual} className="border border-slate-200 bg-slate-50 p-6 rounded-xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Item Title</label>
                                        <input
                                            type="text"
                                            value={newVisual.title}
                                            onChange={e => setNewVisual({ ...newVisual, title: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
                                        <textarea
                                            value={newVisual.description}
                                            onChange={e => setNewVisual({ ...newVisual, description: e.target.value })}
                                            rows={2}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white resize-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Image URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={newVisual.imageUrl}
                                            onChange={e => setNewVisual({ ...newVisual, imageUrl: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Trigger Keywords (comma separated)</label>
                                        <input
                                            type="text"
                                            placeholder="red shoes, sneakers…"
                                            value={newVisual.queries}
                                            onChange={e => setNewVisual({ ...newVisual, queries: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-2 pt-2">
                                        <button type="submit" disabled={loading} className="bg-pink-600 hover:bg-pink-700 text-white font-medium text-sm py-2.5 px-5 rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors">
                                            <Plus className="w-4 h-4" /> Add to Catalog
                                        </button>
                                    </div>
                                </form>

                                <h4 className="font-semibold text-slate-800 mb-4">Catalog Items ({visualSets.length})</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {visualSets.map(set => (
                                        <div key={set.id} className="flex gap-3 p-4 border border-slate-200 rounded-xl bg-white hover:shadow-sm transition-shadow">
                                            <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                                                {set.images?.[0]?.publicUrl && (
                                                    <img src={set.images[0].publicUrl} alt={set.title} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{set.title}</p>
                                                <p className="text-xs text-slate-500 truncate">{set.description}</p>
                                            </div>
                                            <button onClick={() => handleDeleteVisual(set.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors self-start flex-shrink-0 rounded-lg hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {visualSets.length === 0 && <p className="text-sm text-slate-400 italic col-span-2 py-4">No visual items added yet.</p>}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
