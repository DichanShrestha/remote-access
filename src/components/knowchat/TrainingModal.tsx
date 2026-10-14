"use client";

import React, { useState, useEffect } from "react";
import { X, FileText, Link as LinkIcon, HelpCircle, Image as ImageIcon, Trash2, Plus, UploadCloud } from "lucide-react";
import { getTrainingStatus, crawlAndTrain, uploadAndTrainFiles, deleteDataSource, getKnowledgeUploadPolicy } from "@/app/actions/training-actions";
import { getQAs, saveQA, deleteQA } from "@/app/actions/qa-actions";
import { getVisualSets, createVisualSet, deleteVisualSet } from "@/app/actions/catalog-actions";

type Tab = "sources" | "faqs" | "visuals";

export function TrainingModal({ botId, isOpen, onClose }: { botId: string; isOpen: boolean; onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<Tab>("sources");
    const [loading, setLoading] = useState(false);
    
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
        if (isOpen) {
            loadData();
        }
    }, [isOpen, activeTab]);

    const loadData = async () => {
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
        const file = e.target.files[0];
        setLoading(true);
        try {
            const policy = await getKnowledgeUploadPolicy();
            if (!policy.allowed) throw new Error("AI knowledge requires an active trial or Growth plan.");
            if (file.size > policy.maxFileBytes) throw new Error(`This file exceeds your ${Math.floor(policy.maxFileBytes / 1048576)} MB per-file limit.`);
            if (file.size > policy.remainingBytes) throw new Error("This upload exceeds your remaining knowledge storage.");
            if (policy.sourcesRemaining < 1) throw new Error("You have reached your knowledge-source limit.");
            const formData = new FormData();
            formData.append("file", file);
            await uploadAndTrainFiles(botId, formData);
            await loadData();
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "The file could not be uploaded.");
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                
                {/* SIDEBAR TABS */}
                <div className="w-64 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4">
                    <h2 className="font-bold text-lg text-slate-800 dark:text-white mb-6 px-2">Train AI Assistant</h2>
                    
                    <nav className="flex flex-col gap-2">
                        <button 
                            onClick={() => setActiveTab("sources")}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "sources" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                        >
                            <FileText className="w-4 h-4" /> Documents & URLs
                        </button>
                        <button 
                            onClick={() => setActiveTab("faqs")}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "faqs" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                        >
                            <HelpCircle className="w-4 h-4" /> FAQs
                        </button>
                        <button 
                            onClick={() => setActiveTab("visuals")}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "visuals" ? "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300" : "text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                        >
                            <ImageIcon className="w-4 h-4" /> Visual Catalog
                        </button>
                    </nav>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-slate-900">
                    <div className="absolute top-4 right-4 z-10">
                        <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        {activeTab === "sources" && (
                            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4">
                                <h3 className="text-2xl font-bold mb-2">Data Sources</h3>
                                <p className="text-slate-500 mb-8">Upload PDFs, docs, or enter website URLs for the AI to read and learn from.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                    {/* Upload File */}
                                    <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl">
                                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><UploadCloud className="w-4 h-4 text-blue-500"/> Upload Document</h4>
                                        <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <div className="text-center text-sm text-slate-500">
                                                <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                            </div>
                                            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} disabled={loading} />
                                        </label>
                                    </div>
                                    
                                    {/* Add URL */}
                                    <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl">
                                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><LinkIcon className="w-4 h-4 text-blue-500"/> Crawl Website</h4>
                                        <form onSubmit={handleAddUrl} className="flex flex-col gap-3">
                                            <input 
                                                type="url" 
                                                placeholder="https://example.com" 
                                                value={urlInput}
                                                onChange={e => setUrlInput(e.target.value)}
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                                                required
                                            />
                                            <button type="submit" disabled={loading || !urlInput} className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 rounded-lg disabled:opacity-50">
                                                {loading ? "Crawling..." : "Add URL"}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* List Sources */}
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Trained Sources ({sources.length})</h4>
                                <div className="flex flex-col gap-3">
                                    {sources.map(source => (
                                        <div key={source.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/50">
                                            <div className="flex items-center gap-3">
                                                {source.type === 'url' ? <LinkIcon className="w-4 h-4 text-slate-400" /> : <FileText className="w-4 h-4 text-slate-400" />}
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{source.source}</p>
                                                    <p className="text-xs text-slate-500 capitalize">{source.type} • {source.status}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteSource(source.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {sources.length === 0 && <p className="text-sm text-slate-500 italic">No sources trained yet.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === "faqs" && (
                            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4">
                                <h3 className="text-2xl font-bold mb-2">Frequently Asked Questions</h3>
                                <p className="text-slate-500 mb-8">Directly train the AI on specific Q&A pairs for guaranteed accurate answers.</p>

                                <form onSubmit={handleAddFaq} className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl mb-8 flex flex-col gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Question</label>
                                        <input 
                                            type="text" 
                                            placeholder="E.g. What are your opening hours?"
                                            value={newFaq.question}
                                            onChange={e => setNewFaq({ ...newFaq, question: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Answer</label>
                                        <textarea 
                                            placeholder="We are open Monday to Friday from 9 AM to 5 PM."
                                            value={newFaq.answer}
                                            onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 resize-none"
                                            required
                                        />
                                    </div>
                                    <button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm py-2 px-4 rounded-lg self-start disabled:opacity-50 flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> Add FAQ
                                    </button>
                                </form>

                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Saved FAQs ({faqs.length})</h4>
                                <div className="flex flex-col gap-3">
                                    {faqs.map(faq => (
                                        <div key={faq.id} className="flex items-start justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/50">
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{faq.questions?.[0]}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">{faq.answer}</p>
                                            </div>
                                            <button onClick={() => handleDeleteFaq(faq.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {faqs.length === 0 && <p className="text-sm text-slate-500 italic">No FAQs added yet.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === "visuals" && (
                            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4">
                                <h3 className="text-2xl font-bold mb-2">Visual Catalog</h3>
                                <p className="text-slate-500 mb-8">Add visual items (products, portfolio images) that the AI can recommend in chat.</p>

                                <form onSubmit={handleAddVisual} className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Item Title</label>
                                        <input 
                                            type="text" 
                                            value={newVisual.title}
                                            onChange={e => setNewVisual({ ...newVisual, title: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Description</label>
                                        <textarea 
                                            value={newVisual.description}
                                            onChange={e => setNewVisual({ ...newVisual, description: e.target.value })}
                                            rows={2}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Image URL</label>
                                        <input 
                                            type="url" 
                                            placeholder="https://..."
                                            value={newVisual.imageUrl}
                                            onChange={e => setNewVisual({ ...newVisual, imageUrl: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Trigger Keywords (comma separated)</label>
                                        <input 
                                            type="text" 
                                            placeholder="red shoes, sneakers..."
                                            value={newVisual.queries}
                                            onChange={e => setNewVisual({ ...newVisual, queries: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                    <div className="md:col-span-2 pt-2">
                                        <button type="submit" disabled={loading} className="bg-pink-600 hover:bg-pink-700 text-white font-medium text-sm py-2 px-4 rounded-lg disabled:opacity-50 flex items-center gap-2">
                                            <Plus className="w-4 h-4" /> Add to Catalog
                                        </button>
                                    </div>
                                </form>

                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Catalog Items ({visualSets.length})</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {visualSets.map(set => (
                                        <div key={set.id} className="flex gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/50">
                                            <div className="w-16 h-16 rounded-md bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                                                {set.images?.[0]?.publicUrl && (
                                                    <img src={set.images[0].publicUrl} alt={set.title} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{set.title}</p>
                                                <p className="text-xs text-slate-500 truncate">{set.description}</p>
                                            </div>
                                            <button onClick={() => handleDeleteVisual(set.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors self-start flex-shrink-0">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {visualSets.length === 0 && <p className="text-sm text-slate-500 italic col-span-2">No visual items added yet.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
