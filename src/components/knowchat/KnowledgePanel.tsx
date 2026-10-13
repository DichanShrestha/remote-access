"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    FileText,
    Globe,
    HelpCircle,
    Image as ImageIcon,
    Trash2,
    Plus,
    UploadCloud,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Clock,
    Search,
    ExternalLink,
    MessageSquareMore,
    ArrowUp,
    ArrowDown,
    ArrowRight,
    Sparkles,
    Save,
    X
} from "lucide-react";
import { toast } from "sonner";
import {
    getTrainingStatus,
    crawlAndTrain,
    uploadAndTrainFiles,
    deleteDataSource,
    getKnowledgeUploadPolicy
} from "@/app/actions/training-actions";
import { getQAs, saveQA, deleteQA } from "@/app/actions/qa-actions";
import {
    getVisualSets,
    createVisualSet,
    deleteVisualSet,
    uploadCatalogImages,
    getAIImageUsage
} from "@/app/actions/catalog-actions";
import { getSuggestedQuestions, updateSuggestedQuestions } from "@/app/actions/bot-actions";

type Tab = "sources" | "faqs" | "visuals" | "questions";

interface DataSourceItem {
    id: string;
    source: string;
    type: string;
    status: string;
    createdAt?: Date | string;
}

interface QAItem {
    id: string;
    questions: string[];
    answer: string;
    createdAt?: Date | string;
}

interface VisualSetItem {
    id: string;
    title: string;
    description: string | null;
    triggerQueries?: string[];
    price?: number | null;
    currency?: string | null;
    redirectUrl?: string | null;
    images?: Array<{ publicUrl: string }>;
}

export function KnowledgePanel({ botId }: { botId: string }) {
    const [activeTab, setActiveTab] = useState<Tab>("sources");
    const [uploadingDoc, setUploadingDoc] = useState<{ name: string } | null>(null);
    const [isCrawling, setIsCrawling] = useState(false);
    const [isSavingFaq, setIsSavingFaq] = useState(false);
    const [isSavingVisual, setIsSavingVisual] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Counts for tab badges
    const [counts, setCounts] = useState({ sources: 0, faqs: 0, visuals: 0, questions: 0 });

    // Data Sources State
    const [sources, setSources] = useState<DataSourceItem[]>([]);
    const [urlInput, setUrlInput] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [uploadPolicy, setUploadPolicy] = useState<{
        allowed: boolean;
        maxFileBytes: number;
        remainingBytes: number;
        totalBytesLimit?: number;
        usedBytes?: number;
        sourcesRemaining: number;
        sourcesLimit?: number;
        sourcesUsed?: number;
        plan?: string;
    } | null>(null);

    // FAQs State
    const [faqs, setFaqs] = useState<QAItem[]>([]);
    const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
    const [faqSearch, setFaqSearch] = useState("");

    // Visuals State (Bulk image upload, optional description, price, redirect URL)
    const [visualSets, setVisualSets] = useState<VisualSetItem[]>([]);
    const [newVisual, setNewVisual] = useState({
        title: "",
        description: "",
        queries: "",
        price: "",
        currency: "$",
        redirectUrl: "",
    });
    const [visualFiles, setVisualFiles] = useState<File[]>([]);
    const [visualPreviews, setVisualPreviews] = useState<string[]>([]);
    const [isVisualDragging, setIsVisualDragging] = useState(false);
    const [imageUsage, setImageUsage] = useState<{
        currentImages: number;
        maxImages: number;
        maxImageFileBytes: number;
        knowledgeUsedBytes: number;
        knowledgeLimitBytes: number;
        aiEnabled: boolean;
        plan: string;
    } | null>(null);

    // Suggested Questions State
    const [questions, setQuestions] = useState<string[]>([]);
    const [newQuestionInput, setNewQuestionInput] = useState("");
    const [savingQuestions, setSavingQuestions] = useState(false);

    // Refresh data after mutations
    const refreshData = useCallback(async () => {
        try {
            if (activeTab === "sources") {
                const [data, policyData] = await Promise.all([
                    getTrainingStatus(botId),
                    getKnowledgeUploadPolicy()
                ]);
                const items = (data?.sources || []) as DataSourceItem[];
                setSources(items);
                setUploadPolicy(policyData);
                setCounts(prev => ({ ...prev, sources: items.length }));
            } else if (activeTab === "faqs") {
                const data = (await getQAs(botId)) as QAItem[];
                setFaqs(data || []);
                setCounts(prev => ({ ...prev, faqs: (data || []).length }));
            } else if (activeTab === "visuals") {
                const [data, usage] = await Promise.all([
                    getVisualSets(botId) as Promise<VisualSetItem[]>,
                    getAIImageUsage()
                ]);
                setVisualSets(data || []);
                setImageUsage(usage);
                setCounts(prev => ({ ...prev, visuals: (data || []).length }));
            } else if (activeTab === "questions") {
                const data = await getSuggestedQuestions(botId);
                setQuestions(data || []);
                setCounts(prev => ({ ...prev, questions: (data || []).length }));
            }
        } catch (error) {
            console.error("Failed to refresh knowledge data", error);
        }
    }, [activeTab, botId]);

    // Initial load and tab change listener
    useEffect(() => {
        let isMounted = true;
        async function fetchTabData() {
            try {
                if (activeTab === "sources") {
                    const [data, policyData] = await Promise.all([
                        getTrainingStatus(botId),
                        getKnowledgeUploadPolicy()
                    ]);
                    if (isMounted) {
                        const items = (data?.sources || []) as DataSourceItem[];
                        setSources(items);
                        setUploadPolicy(policyData);
                        setCounts(prev => ({ ...prev, sources: items.length }));
                    }
                } else if (activeTab === "faqs") {
                    const data = (await getQAs(botId)) as QAItem[];
                    if (isMounted) {
                        setFaqs(data || []);
                        setCounts(prev => ({ ...prev, faqs: (data || []).length }));
                    }
                } else if (activeTab === "visuals") {
                    const [data, usage] = await Promise.all([
                        getVisualSets(botId) as Promise<VisualSetItem[]>,
                        getAIImageUsage()
                    ]);
                    if (isMounted) {
                        setVisualSets(data || []);
                        setImageUsage(usage);
                        setCounts(prev => ({ ...prev, visuals: (data || []).length }));
                    }
                } else if (activeTab === "questions") {
                    const data = await getSuggestedQuestions(botId);
                    if (isMounted) {
                        setQuestions(data || []);
                        setCounts(prev => ({ ...prev, questions: (data || []).length }));
                    }
                }
            } catch (error) {
                console.error("Failed to load knowledge data", error);
            } finally {
                if (isMounted) {
                    setInitialLoading(false);
                }
            }
        }

        fetchTabData();
        return () => {
            isMounted = false;
        };
    }, [activeTab, botId]);

    // Initial count fetch for all tabs
    useEffect(() => {
        async function fetchAllCounts() {
            try {
                const [sourcesRes, faqsRes, visualsRes, questionsRes] = await Promise.allSettled([
                    getTrainingStatus(botId),
                    getQAs(botId),
                    getVisualSets(botId),
                    getSuggestedQuestions(botId),
                ]);
                setCounts({
                    sources: sourcesRes.status === "fulfilled" ? (sourcesRes.value?.sources || []).length : 0,
                    faqs: faqsRes.status === "fulfilled" ? (faqsRes.value || []).length : 0,
                    visuals: visualsRes.status === "fulfilled" ? (visualsRes.value || []).length : 0,
                    questions: questionsRes.status === "fulfilled" ? (questionsRes.value || []).length : 0,
                });
            } catch {
                // Ignore silent count fetch error
            }
        }
        fetchAllCounts();
    }, [botId]);

    // --- SUGGESTED QUESTIONS HANDLERS ---
    const handleAddQuestion = (textToAdd?: string) => {
        const text = (textToAdd ?? newQuestionInput).trim();
        if (!text) return;
        if (questions.length >= 6) {
            toast.error("Maximum 6 suggested questions allowed.");
            return;
        }
        if (questions.some(q => q.toLowerCase() === text.toLowerCase())) {
            toast.error("This question already exists in your list.");
            return;
        }
        setQuestions(prev => [...prev, text]);
        setNewQuestionInput("");
    };

    const handleRemoveQuestion = (idx: number) => {
        setQuestions(prev => prev.filter((_, i) => i !== idx));
    };

    const handleUpdateQuestion = (idx: number, val: string) => {
        setQuestions(prev => {
            const next = [...prev];
            next[idx] = val;
            return next;
        });
    };

    const handleMoveQuestion = (idx: number, dir: "up" | "down") => {
        if (dir === "up" && idx === 0) return;
        if (dir === "down" && idx === questions.length - 1) return;
        setQuestions(prev => {
            const next = [...prev];
            const target = dir === "up" ? idx - 1 : idx + 1;
            const temp = next[idx];
            next[idx] = next[target];
            next[target] = temp;
            return next;
        });
    };

    const handleSaveQuestions = async () => {
        setSavingQuestions(true);
        try {
            const cleanList = questions.map(q => q.trim()).filter(Boolean);
            const res = await updateSuggestedQuestions(botId, cleanList);
            setQuestions(res.questions);
            setCounts(prev => ({ ...prev, questions: res.questions.length }));
            toast.success("Suggested questions saved successfully");
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to save suggested questions";
            toast.error(msg);
        } finally {
            setSavingQuestions(false);
        }
    };

    // --- SOURCES HANDLERS ---
    const handleAddUrl = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = urlInput.trim();
        if (!trimmed) return;

        setIsCrawling(true);
        const toastId = toast.loading(`Crawling ${trimmed} & indexing content...`);
        try {
            await crawlAndTrain(botId, trimmed);
            toast.success("Website URL crawled and indexed!", { id: toastId });
            setUrlInput("");
            await refreshData();
        } catch (error: unknown) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "Failed to crawl website";
            toast.error(msg, { id: toastId });
        } finally {
            setIsCrawling(false);
        }
    };

    const processFiles = async (files: FileList | File[]) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        setUploadingDoc({ name: file.name });
        const toastId = toast.loading(`Training in progress: "${file.name}"...`);

        try {
            const policy = await getKnowledgeUploadPolicy();
            if (!policy.allowed) {
                throw new Error("AI knowledge requires an active trial or Smart Page + AI plan.");
            }
            if (file.size > policy.maxFileBytes) {
                throw new Error(`This file exceeds your ${Math.floor(policy.maxFileBytes / 1048576)} MB per-file limit.`);
            }
            if (file.size > policy.remainingBytes) {
                throw new Error("This upload exceeds your remaining knowledge storage.");
            }
            if (policy.sourcesRemaining < 1) {
                throw new Error("You have reached your knowledge-source limit.");
            }

            const formData = new FormData();
            formData.append("files", file);
            formData.append("file", file);

            const results = await uploadAndTrainFiles(botId, formData);
            const errorResult = results.find(r => r.status === "error");
            if (errorResult) {
                throw new Error(errorResult.error || "Failed to process document");
            }

            toast.success(`"${file.name}" trained and indexed successfully!`, { id: toastId });
            await refreshData();
        } catch (error: unknown) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "The file could not be uploaded.";
            toast.error(msg, { id: toastId });
        } finally {
            setUploadingDoc(null);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
            e.target.value = "";
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleDeleteSource = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}" from training sources?`)) return;
        try {
            await deleteDataSource(id);
            toast.success("Source deleted");
            await refreshData();
        } catch (error: unknown) {
            console.error(error);
            toast.error("Failed to delete source");
        }
    };

    // --- FAQS HANDLERS ---
    const handleAddFaq = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFaq.question.trim() || !newFaq.answer.trim()) return;

        setIsSavingFaq(true);
        try {
            await saveQA(botId, {
                questions: [newFaq.question.trim()],
                answer: newFaq.answer.trim()
            });
            toast.success("FAQ pair added successfully");
            setNewFaq({ question: "", answer: "" });
            await refreshData();
        } catch (error: unknown) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "Failed to save FAQ";
            toast.error(msg);
        } finally {
            setIsSavingFaq(false);
        }
    };

    const handleDeleteFaq = async (id: string) => {
        try {
            await deleteQA(id);
            toast.success("FAQ deleted");
            await refreshData();
        } catch (error: unknown) {
            console.error(error);
            toast.error("Failed to delete FAQ");
        }
    };

    // --- VISUALS HANDLERS ---
    const handleVisualFilesSelected = (files: FileList | File[]) => {
        if (!files || files.length === 0) return;
        if (imageUsage && (!imageUsage.aiEnabled || imageUsage.maxImages === 0)) {
            toast.error("AI image indexing is not available on your plan. Upgrade to Smart Page + AI.");
            return;
        }

        const validFiles: File[] = [];
        const newPreviews: string[] = [];
        const currentTotal = (imageUsage?.currentImages || 0) + visualFiles.length;
        const maxAllowed = imageUsage?.maxImages || 0;

        Array.from(files).forEach(f => {
            if (!f.type.startsWith("image/")) {
                toast.error(`"${f.name}" is not an image file`);
                return;
            }

            if (imageUsage?.maxImageFileBytes && f.size > imageUsage.maxImageFileBytes) {
                const maxMB = Math.round(imageUsage.maxImageFileBytes / (1024 * 1024));
                toast.error(`"${f.name}" exceeds the ${maxMB} MB per-image limit.`);
                return;
            }

            if (maxAllowed > 0 && currentTotal + validFiles.length >= maxAllowed) {
                toast.error(`You have reached the maximum limit of ${maxAllowed} AI images for your plan.`);
                return;
            }

            validFiles.push(f);
            newPreviews.push(URL.createObjectURL(f));
        });

        if (validFiles.length > 0) {
            setVisualFiles(prev => [...prev, ...validFiles]);
            setVisualPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveVisualFile = (index: number) => {
        setVisualFiles(prev => prev.filter((_, i) => i !== index));
        setVisualPreviews(prev => {
            const urlToRevoke = prev[index];
            if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleAddVisual = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVisual.title.trim()) {
            toast.error("Item title is required");
            return;
        }
        if (visualFiles.length === 0) {
            toast.error("Please upload at least one image");
            return;
        }

        setIsSavingVisual(true);
        try {
            // 1. Bulk upload images to storage
            const formData = new FormData();
            visualFiles.forEach(f => formData.append("files", f));

            const uploadRes = await uploadCatalogImages(formData);
            const uploadedUrls = uploadRes.urls;
            const uploadedSizes = uploadRes.sizes || [];

            const queries = newVisual.queries
                .split(",")
                .map(q => q.trim())
                .filter(Boolean);

            const parsedPrice = newVisual.price.trim() ? parseFloat(newVisual.price) : null;
            const currency = parsedPrice !== null ? (newVisual.currency || "$") : null;
            const redirectUrl = newVisual.redirectUrl.trim() || null;

            const images = uploadedUrls.map((url, idx) => ({
                publicUrl: url,
                caption: "",
                order: idx,
                sizeBytes: uploadedSizes[idx] ?? visualFiles[idx]?.size ?? 0,
            }));

            await createVisualSet(
                botId,
                newVisual.title.trim(),
                newVisual.description.trim(),
                queries,
                images,
                parsedPrice,
                currency,
                redirectUrl
            );

            toast.success("Visual item added to catalog");
            visualPreviews.forEach(p => URL.revokeObjectURL(p));
            setVisualFiles([]);
            setVisualPreviews([]);
            setNewVisual({
                title: "",
                description: "",
                queries: "",
                price: "",
                currency: "$",
                redirectUrl: "",
            });
            await refreshData();
        } catch (error: unknown) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "Failed to add visual item";
            toast.error(msg);
        } finally {
            setIsSavingVisual(false);
        }
    };

    const handleDeleteVisual = async (id: string) => {
        try {
            await deleteVisualSet(id, botId);
            toast.success("Catalog item deleted");
            await refreshData();
        } catch (error: unknown) {
            console.error(error);
            toast.error("Failed to delete catalog item");
        }
    };

    const filteredFaqs = faqs.filter(faq => {
        if (!faqSearch.trim()) return true;
        const q = (faq.questions?.[0] || "").toLowerCase();
        const a = (faq.answer || "").toLowerCase();
        return q.includes(faqSearch.toLowerCase()) || a.includes(faqSearch.toLowerCase());
    });

    const tabs = [
        { id: "sources" as Tab, label: "Documents & URLs", icon: FileText, count: counts.sources },
        { id: "faqs" as Tab, label: "Frequently Asked Questions", icon: HelpCircle, count: counts.faqs },
        { id: "questions" as Tab, label: "Suggested Questions", icon: MessageSquareMore, count: counts.questions },
        { id: "visuals" as Tab, label: "Visual Catalog", icon: ImageIcon, count: counts.visuals },
    ];

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300">
            {/* Horizontal Tabs Navigation (Matching App Aesthetic) */}
            <div className="border-b border-slate-200 overflow-x-auto no-scrollbar">
                <nav className="flex items-center gap-1 sm:gap-2 -mb-px">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                                    isActive
                                        ? "border-slate-900 text-slate-900 font-semibold"
                                        : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                                <span>{tab.label}</span>
                                <span
                                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                                        isActive
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-600"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content Body */}
            {initialLoading ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-16 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="w-7 h-7 animate-spin mb-3 text-slate-600" />
                    <p className="text-sm font-medium text-slate-600">Loading knowledge base...</p>
                </div>
            ) : (
                <>
                    {/* TAB 1: DATA SOURCES */}
                    {activeTab === "sources" && (
                        <div className="space-y-8 animate-in fade-in duration-200">
                            {/* Two Column Ingestion Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Upload Document Card */}
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2.5 mb-1.5">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                                                <UploadCloud className="w-4 h-4" />
                                            </div>
                                            <h3 className="font-semibold text-sm text-slate-900">Upload Documents</h3>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-4">
                                            Upload PDFs, Word documents, or text files for indexing.
                                        </p>
                                    </div>

                                    <label
                                        onDragOver={e => {
                                            e.preventDefault();
                                            if (!uploadingDoc) setIsDragging(true);
                                        }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={e => {
                                            if (!uploadingDoc) handleDrop(e);
                                        }}
                                        className={`flex flex-col items-center justify-center w-full min-h-32 border-2 border-dashed rounded-xl transition-all ${
                                            uploadingDoc
                                                ? "border-amber-400 bg-amber-50/40 cursor-wait"
                                                : isDragging
                                                ? "border-slate-900 bg-slate-50 cursor-pointer"
                                                : "border-slate-200 hover:border-slate-400 hover:bg-slate-50/60 cursor-pointer"
                                        }`}
                                    >
                                        {uploadingDoc ? (
                                            <div className="flex flex-col items-center text-center p-4 animate-in fade-in duration-200">
                                                <Loader2 className="w-6 h-6 text-slate-800 animate-spin mb-2" />
                                                <span className="text-xs font-semibold text-slate-800">
                                                    Training in progress...
                                                </span>
                                                <span className="text-[11px] font-medium text-slate-600 truncate max-w-[240px] mt-0.5">
                                                    {uploadingDoc.name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 mt-1">
                                                    Extracting text & generating Gemini vector embeddings
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-center p-4">
                                                <UploadCloud className="w-5 h-5 text-slate-400 mb-1.5" />
                                                <span className="text-xs font-semibold text-slate-800">
                                                    Click to upload <span className="font-normal text-slate-500">or drag & drop</span>
                                                </span>
                                                <span className="text-[11px] text-slate-400 mt-0.5">
                                                    PDF, DOCX, TXT (up to {uploadPolicy ? Math.floor(uploadPolicy.maxFileBytes / 1048576) : 10} MB)
                                                </span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.txt"
                                            onChange={handleFileUpload}
                                            disabled={!!uploadingDoc}
                                        />
                                    </label>
                                </div>

                                {/* Crawl Website Card */}
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2.5 mb-1.5">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <h3 className="font-semibold text-sm text-slate-900">Crawl Website</h3>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-4">
                                            Provide any public website URL to crawl and ingest knowledge.
                                        </p>
                                    </div>

                                    <form onSubmit={handleAddUrl} className="flex flex-col gap-2.5 mt-auto">
                                        <input
                                            type="url"
                                            placeholder="https://example.com/faq"
                                            value={urlInput}
                                            onChange={e => setUrlInput(e.target.value)}
                                            disabled={isCrawling}
                                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={isCrawling || !urlInput.trim()}
                                            className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {isCrawling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                            {isCrawling ? "Crawling & Training..." : "Crawl & Add"}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Trained Sources List */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Trained Knowledge Sources ({sources.length}{uploadPolicy?.sourcesLimit ? ` / ${uploadPolicy.sourcesLimit}` : ""})
                                    </h3>
                                </div>

                                {sources.length === 0 ? (
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <p className="font-semibold text-sm text-slate-800">No knowledge sources yet</p>
                                        <p className="text-xs text-slate-500 max-w-sm mt-1">
                                            Upload a PDF or enter a website URL above to start training your AI assistant.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {sources.map(source => {
                                            const isUrl = source.type === "url";
                                            const isReady = source.status === "complete" || source.status === "ready";
                                            const isError = source.status === "error";

                                            return (
                                                <div
                                                    key={source.id}
                                                    className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-300 transition-all shadow-xs"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                                                            {isUrl ? <Globe className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-semibold text-slate-900 truncate">
                                                                    {source.source}
                                                                </p>
                                                                {isUrl && (
                                                                    <a
                                                                        href={source.source}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-slate-400 hover:text-slate-600"
                                                                        title="Open URL"
                                                                    >
                                                                        <ExternalLink className="w-3 h-3" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[11px] text-slate-400 uppercase font-medium">
                                                                    {source.type}
                                                                </span>
                                                                <span className="text-slate-300">•</span>
                                                                <span
                                                                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.2 rounded-full ${
                                                                        isReady
                                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                                                            : isError
                                                                            ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                                                                            : "bg-amber-50 text-amber-700 border border-amber-200/60"
                                                                    }`}
                                                                >
                                                                    {isReady ? (
                                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                                    ) : isError ? (
                                                                        <AlertCircle className="w-3 h-3 text-rose-600" />
                                                                    ) : (
                                                                        <Clock className="w-3 h-3 text-amber-600" />
                                                                    )}
                                                                    {isReady ? "Ready" : isError ? "Failed" : "Processing"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSource(source.id, source.source)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Delete source"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: FAQS */}
                    {activeTab === "faqs" && (
                        <div className="space-y-8 animate-in fade-in duration-200">
                            {/* New FAQ Form Card */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                                        <HelpCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-slate-900">Add New Q&A Pair</h3>
                                        <p className="text-xs text-slate-500">
                                            Teach the AI specific question-answer pairs for guaranteed accurate answers.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleAddFaq} className="flex flex-col gap-3.5 pt-2">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 mb-1 block">Question</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. What are your turnaround times?"
                                            value={newFaq.question}
                                            onChange={e => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                                            disabled={isSavingFaq}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 mb-1 block">Answer</label>
                                        <textarea
                                            placeholder="e.g. Our standard delivery time is 3 to 5 business days."
                                            value={newFaq.answer}
                                            onChange={e => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                                            disabled={isSavingFaq}
                                            rows={3}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all resize-none"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end pt-1">
                                        <button
                                            type="submit"
                                            disabled={isSavingFaq || !newFaq.question.trim() || !newFaq.answer.trim()}
                                            className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2.5 px-5 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                                        >
                                            {isSavingFaq ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                            Add FAQ
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Saved FAQs List */}
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Saved FAQs ({faqs.length})
                                    </h3>
                                    {faqs.length > 0 && (
                                        <div className="relative w-full sm:w-64">
                                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                placeholder="Search FAQs..."
                                                value={faqSearch}
                                                onChange={e => setFaqSearch(e.target.value)}
                                                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                                            />
                                        </div>
                                    )}
                                </div>

                                {filteredFaqs.length === 0 ? (
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                                            <HelpCircle className="w-5 h-5" />
                                        </div>
                                        <p className="font-semibold text-sm text-slate-800">
                                            {faqSearch ? "No matching FAQs found" : "No FAQs added yet"}
                                        </p>
                                        <p className="text-xs text-slate-500 max-w-sm mt-1">
                                            {faqSearch
                                                ? "Try searching for a different keyword."
                                                : "Add custom question-answer pairs above to give your AI instant precision."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {filteredFaqs.map(faq => (
                                            <div
                                                key={faq.id}
                                                className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-start justify-between gap-4 hover:border-slate-300 transition-all shadow-xs"
                                            >
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <p className="text-xs font-semibold text-slate-900 leading-snug">
                                                        {faq.questions?.[0]}
                                                    </p>
                                                    <p className="text-xs text-slate-600 leading-relaxed">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteFaq(faq.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                                                    title="Delete FAQ"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: VISUAL CATALOG */}
                    {activeTab === "visuals" && (
                        <div className="space-y-8 animate-in fade-in duration-200">
                            {/* AI Image Quota & Usage Bar */}
                            {imageUsage && (
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60">
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-semibold text-slate-900">AI Image Knowledge Quota</h4>
                                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                    {imageUsage.plan === 'smart_page_ai' ? 'Smart Page + AI' : imageUsage.plan === 'trial' ? '14-day Trial' : 'Smart Page ($9)'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Vectorized by Gemini embeddings for in-chat visual recommendations. Image bytes count toward shared knowledge storage.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2.5 text-xs">
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2">
                                            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Indexed Images</span>
                                            <span className={`font-semibold ${imageUsage.maxImages > 0 && imageUsage.currentImages >= imageUsage.maxImages ? 'text-amber-600' : 'text-slate-800'}`}>
                                                {imageUsage.maxImages === 0 ? "Not included" : `${imageUsage.currentImages} / ${imageUsage.maxImages}`}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2">
                                            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Max File Size</span>
                                            <span className="font-semibold text-slate-800">
                                                {imageUsage.maxImageFileBytes === 0 ? "—" : `${Math.round(imageUsage.maxImageFileBytes / 1048576)} MB each`}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2">
                                            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Knowledge Storage</span>
                                            <span className="font-semibold text-slate-800">
                                                {imageUsage.knowledgeLimitBytes === 0 ? "—" : `${(imageUsage.knowledgeUsedBytes / 1048576).toFixed(1)} / ${(imageUsage.knowledgeLimitBytes / 1048576).toFixed(0)} MB`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Plan Restriction Callout */}
                            {imageUsage && (!imageUsage.aiEnabled || imageUsage.maxImages === 0) ? (
                                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center flex flex-col items-center">
                                    <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 border border-amber-100">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-semibold text-sm text-slate-900 mb-1">AI Image Indexing Not Available on Current Plan</h3>
                                    <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                                        The $9 Smart Page plan does not include AI image indexing. Upgrade to Smart Page + AI to index up to 50 photos (10 MB each) that your assistant can recommend with rich cards in chat.
                                    </p>
                                    <a
                                        href="/dashboard/billing"
                                        className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2.5 px-5 rounded-xl shadow-xs transition-colors cursor-pointer"
                                    >
                                        Upgrade to Smart Page + AI
                                    </a>
                                </div>
                            ) : (
                                /* New Visual Catalog Item Form */
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                                            <ImageIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm text-slate-900">Add Visual Catalog Item</h3>
                                            <p className="text-xs text-slate-500">
                                                Add products, portfolio photos, or services for your AI assistant to display as interactive cards in chat.
                                            </p>
                                        </div>
                                    </div>

                                <form onSubmit={handleAddVisual} className="space-y-4 pt-2">
                                    {/* Bulk Image Upload Dropzone */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-xs font-semibold text-slate-700 block">
                                                Upload Images <span className="text-rose-500">*</span>
                                            </label>
                                            <span className="text-[11px] text-slate-400">
                                                {visualFiles.length > 0
                                                    ? `${visualFiles.length} ${visualFiles.length === 1 ? "image" : "images"} selected (bulk upload)`
                                                    : "Bulk image upload supported (e.g. room angles, views)"}
                                            </span>
                                        </div>

                                        <label
                                            onDragOver={e => {
                                                e.preventDefault();
                                                setIsVisualDragging(true);
                                            }}
                                            onDragLeave={() => setIsVisualDragging(false)}
                                            onDrop={e => {
                                                e.preventDefault();
                                                setIsVisualDragging(false);
                                                if (e.dataTransfer.files) {
                                                    handleVisualFilesSelected(e.dataTransfer.files);
                                                }
                                            }}
                                            className={`flex flex-col items-center justify-center w-full min-h-28 py-4 px-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                                                isVisualDragging
                                                    ? "border-slate-900 bg-slate-50"
                                                    : "border-slate-200 hover:border-slate-400 hover:bg-slate-50/60"
                                            } ${isSavingVisual ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                                                <span className="text-xs font-semibold text-slate-800">
                                                    Click to select images <span className="font-normal text-slate-500">or drag & drop</span>
                                                </span>
                                                <span className="text-[11px] text-slate-400 mt-0.5">
                                                    Upload multiple photos (PNG, JPG, WEBP). Perfect for room designs from all 4 angles or product variants.
                                                </span>
                                            </div>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                disabled={isSavingVisual}
                                                onChange={e => {
                                                    if (e.target.files) {
                                                        handleVisualFilesSelected(e.target.files);
                                                        e.target.value = "";
                                                    }
                                                }}
                                            />
                                        </label>

                                        {/* Image Previews Grid */}
                                        {visualPreviews.length > 0 && (
                                            <div className="flex flex-wrap gap-2.5 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                                                {visualPreviews.map((preview, idx) => (
                                                    <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-semibold px-1 py-0.5 rounded">
                                                            #{idx + 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveVisualFile(idx);
                                                            }}
                                                            className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer"
                                                            title="Remove image"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-500 bg-white flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-500 hover:text-slate-800">
                                                    <Plus className="w-4 h-4 mb-0.5" />
                                                    <span className="text-[10px] font-medium">+ More</span>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        className="hidden"
                                                        disabled={isSavingVisual}
                                                        onChange={e => {
                                                            if (e.target.files) {
                                                                handleVisualFilesSelected(e.target.files);
                                                                e.target.value = "";
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    {/* Fields Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-semibold text-slate-700 mb-1 block">
                                                Item Title <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Master Bedroom Interior Design (4 Views)"
                                                value={newVisual.title}
                                                onChange={e => setNewVisual(prev => ({ ...prev, title: e.target.value }))}
                                                disabled={isSavingVisual}
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="text-xs font-semibold text-slate-700 mb-1 block">
                                                Description <span className="font-normal text-slate-400">(optional)</span>
                                            </label>
                                            <textarea
                                                placeholder="e.g. Scandinavian oak furniture with panoramic windows and custom warm ambient lighting."
                                                value={newVisual.description}
                                                onChange={e => setNewVisual(prev => ({ ...prev, description: e.target.value }))}
                                                disabled={isSavingVisual}
                                                rows={2}
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all resize-none"
                                            />
                                        </div>

                                        {/* Price & Currency (Optional) */}
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 mb-1 block">
                                                Price <span className="font-normal text-slate-400">(optional)</span>
                                            </label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={newVisual.currency}
                                                    onChange={e => setNewVisual(prev => ({ ...prev, currency: e.target.value }))}
                                                    disabled={isSavingVisual}
                                                    className="w-20 px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                                                >
                                                    <option value="$">$ (USD)</option>
                                                    <option value="€">€ (EUR)</option>
                                                    <option value="£">£ (GBP)</option>
                                                    <option value="Rs">Rs (NPR/INR)</option>
                                                    <option value="¥">¥ (JPY)</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="e.g. 299.00"
                                                    value={newVisual.price}
                                                    onChange={e => setNewVisual(prev => ({ ...prev, price: e.target.value }))}
                                                    disabled={isSavingVisual}
                                                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Redirect URL (Optional) */}
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 mb-1 block">
                                                Redirect URL <span className="font-normal text-slate-400">(optional)</span>
                                            </label>
                                            <input
                                                type="url"
                                                placeholder="https://example.com/product/chair"
                                                value={newVisual.redirectUrl}
                                                onChange={e => setNewVisual(prev => ({ ...prev, redirectUrl: e.target.value }))}
                                                disabled={isSavingVisual}
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                                            />
                                        </div>

                                        {/* Trigger Keywords (Optional) */}
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-semibold text-slate-700 mb-1 block">
                                                Trigger Keywords <span className="font-normal text-slate-400">(optional, comma-separated)</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="room design, bedroom, modern interior, chair"
                                                value={newVisual.queries}
                                                onChange={e => setNewVisual(prev => ({ ...prev, queries: e.target.value }))}
                                                disabled={isSavingVisual}
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSavingVisual || !newVisual.title.trim() || visualFiles.length === 0}
                                            className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2.5 px-6 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                                        >
                                            {isSavingVisual ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    Uploading & Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Add to Catalog
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                            )}

                            {/* Catalog Items Grid */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Catalog Items ({visualSets.length})
                                </h3>

                                {visualSets.length === 0 ? (
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                        <p className="font-semibold text-sm text-slate-800">No visual items in catalog</p>
                                        <p className="text-xs text-slate-500 max-w-sm mt-1">
                                            Upload products, room designs, or portfolio images above to let your chatbot recommend them with rich preview cards.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {visualSets.map(set => {
                                            const imgUrl = set.images?.[0]?.publicUrl;
                                            const totalImages = set.images?.length || 0;
                                            return (
                                                <div
                                                    key={set.id}
                                                    className="bg-white border border-slate-200/80 rounded-xl overflow-hidden hover:border-slate-300 transition-all shadow-xs flex flex-col group"
                                                >
                                                    {/* Image Preview */}
                                                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                                        {imgUrl ? (
                                                            /* eslint-disable-next-line @next/next/no-img-element */
                                                            <img
                                                                src={imgUrl}
                                                                alt={set.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <ImageIcon className="w-8 h-8" />
                                                            </div>
                                                        )}

                                                        {/* Multiple images indicator */}
                                                        {totalImages > 1 && (
                                                            <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                                                                <ImageIcon className="w-3 h-3" />
                                                                {totalImages} photos
                                                            </span>
                                                        )}

                                                        {/* Price Tag if provided */}
                                                        {set.price != null && (
                                                            <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg shadow-xs">
                                                                {set.currency || "$"}
                                                                {set.price}
                                                            </span>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteVisual(set.id)}
                                                            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-xs text-slate-600 hover:text-rose-600 hover:bg-white rounded-lg shadow-xs transition-colors cursor-pointer"
                                                            title="Delete item"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <h4 className="font-semibold text-xs text-slate-900 truncate">
                                                                {set.title}
                                                            </h4>
                                                            {set.description && (
                                                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                                                                    {set.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                                                            {set.redirectUrl && (
                                                                <a
                                                                    href={set.redirectUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 truncate transition-colors"
                                                                >
                                                                    <ExternalLink className="w-3 h-3 flex-shrink-0 text-slate-400" />
                                                                    <span className="truncate">{set.redirectUrl}</span>
                                                                </a>
                                                            )}

                                                            {set.triggerQueries && set.triggerQueries.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {set.triggerQueries.map((q, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md"
                                                                        >
                                                                            #{q}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: SUGGESTED QUESTIONS */}
                    {activeTab === "questions" && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* Left Column: Editor & Management */}
                                <div className="lg:col-span-7 space-y-6">
                                    {/* Add New Question Card */}
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                                        <div className="flex items-center gap-2.5 mb-1.5">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                                                <Sparkles className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-sm text-slate-900">Add Suggested Question</h3>
                                                <p className="text-xs text-slate-500">
                                                    Short, high-intent questions visitors can click with one tap.
                                                </p>
                                            </div>
                                        </div>

                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleAddQuestion();
                                            }}
                                            className="mt-4 flex gap-2"
                                        >
                                            <input
                                                type="text"
                                                placeholder="e.g. What are your pricing plans?"
                                                value={newQuestionInput}
                                                maxLength={90}
                                                onChange={(e) => setNewQuestionInput(e.target.value)}
                                                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newQuestionInput.trim() || questions.length >= 6}
                                                className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Add
                                            </button>
                                        </form>

                                        {/* Starter Ideas */}
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <span className="text-[11px] font-medium text-slate-400 block mb-2">
                                                Quick suggestions:
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {[
                                                    "Explore our services",
                                                    "View pricing",
                                                    "Get a quote",
                                                    "What are your business hours?",
                                                    "How do I get started?",
                                                    "Book a consultation"
                                                ].map((suggestion, idx) => {
                                                    const alreadyAdded = questions.some(
                                                        q => q.toLowerCase() === suggestion.toLowerCase()
                                                    );
                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            disabled={alreadyAdded || questions.length >= 6}
                                                            onClick={() => handleAddQuestion(suggestion)}
                                                            className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                                                                alreadyAdded
                                                                    ? "border-slate-200 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed"
                                                                    : "border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-medium"
                                                            }`}
                                                        >
                                                            <span>{suggestion}</span>
                                                            {!alreadyAdded && <Plus className="w-2.5 h-2.5 text-slate-400" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Configured Questions List */}
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold text-sm text-slate-900">Configured Questions</h3>
                                                <p className="text-xs text-slate-500">
                                                    Shown in order below the welcome greeting (up to 6 questions).
                                                </p>
                                            </div>
                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                                                {questions.length} / 6
                                            </span>
                                        </div>

                                        {questions.length === 0 ? (
                                            <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
                                                <MessageSquareMore className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <p className="text-xs font-medium text-slate-700">No custom questions configured</p>
                                                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                                                    Default questions (&ldquo;Explore our services&rdquo;, &ldquo;View pricing&rdquo;, &ldquo;Get a quote&rdquo;) will be shown until you save custom ones.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => setQuestions(["Explore our services", "View pricing", "Get a quote"])}
                                                    className="mt-3 text-xs font-medium text-slate-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    Load default templates
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2.5">
                                                {questions.map((question, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all"
                                                    >
                                                        <span className="w-6 h-6 rounded-lg bg-slate-200/70 text-slate-600 text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                                                            {idx + 1}
                                                        </span>
                                                        <input
                                                            type="text"
                                                            value={question}
                                                            onChange={(e) => handleUpdateQuestion(idx, e.target.value)}
                                                            className="flex-1 bg-transparent text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-300 rounded px-2 py-1"
                                                        />
                                                        <div className="flex items-center gap-0.5 flex-shrink-0">
                                                            <button
                                                                type="button"
                                                                disabled={idx === 0}
                                                                onClick={() => handleMoveQuestion(idx, "up")}
                                                                className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                                                title="Move up"
                                                            >
                                                                <ArrowUp className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={idx === questions.length - 1}
                                                                onClick={() => handleMoveQuestion(idx, "down")}
                                                                className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                                                title="Move down"
                                                            >
                                                                <ArrowDown className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveQuestion(idx)}
                                                                className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer ml-1"
                                                                title="Remove question"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Save Action Bar */}
                                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => setQuestions(["Explore our services", "View pricing", "Get a quote"])}
                                                className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                            >
                                                Reset to defaults
                                            </button>
                                            <button
                                                type="button"
                                                disabled={savingQuestions}
                                                onClick={handleSaveQuestions}
                                                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                                            >
                                                {savingQuestions ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-3.5 h-3.5" />
                                                        Save Questions
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Live Chatbot Preview */}
                                <div className="lg:col-span-5 sticky top-6">
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-xs font-semibold text-slate-800">Live Widget Preview</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Visitor View</span>
                                        </div>

                                        {/* Widget Mockup Card */}
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 shadow-inner space-y-4">
                                            {/* Header Mockup */}
                                            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                                                        bot
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-900">My AI Assistant</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <span className="text-sm font-bold tracking-widest">&bull;&bull;&bull;</span>
                                                </div>
                                            </div>

                                            {/* Greeting Bubble */}
                                            <div className="flex flex-col gap-2.5 items-start">
                                                <div className="bg-white border border-slate-200/80 text-slate-800 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-[12px] leading-relaxed max-w-[90%] shadow-2xs">
                                                    Hello! How can I help you today?
                                                </div>

                                                {/* Suggested Questions Section */}
                                                <div className="w-full flex flex-col gap-1.5 pt-1">
                                                    <span className="text-[11px] font-medium text-slate-400 px-1">
                                                        Suggested questions
                                                    </span>
                                                    <div className="flex flex-col gap-1.5">
                                                        {(questions.length > 0
                                                            ? questions
                                                            : ["Explore our services", "View pricing", "Get a quote"]
                                                        ).map((q, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="w-full text-left px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all flex items-center justify-between group shadow-2xs cursor-default"
                                                            >
                                                                <span className="truncate">{q || `Question ${idx + 1}`}</span>
                                                                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-transform flex-shrink-0 ml-2" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-slate-400 text-center mt-3 leading-relaxed">
                                            Visitors can click any question chip to send it instantly to the chatbot.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
