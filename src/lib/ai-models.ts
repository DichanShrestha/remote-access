export interface AIModel {
    id: string;
    provider: string;
    name: string;
    inputPricePer1M: number;
    outputPricePer1M: number;
    keyFeature: string;
    charsPerToken: number;
}

export const AI_MODELS: AIModel[] = [
    // OpenAI
    {
        id: "gpt-5.4",
        provider: "OpenAI",
        name: "GPT-5.4",
        inputPricePer1M: 2.5,
        outputPricePer1M: 15.0,
        keyFeature: "Flagship reasoning & multi-modality",
        charsPerToken: 3.7,
    },
    {
        id: "gpt-5.2",
        provider: "OpenAI",
        name: "GPT-5.2",
        inputPricePer1M: 1.75,
        outputPricePer1M: 14.0,
        keyFeature: "Optimized for agentic workflows",
        charsPerToken: 3.7,
    },
    {
        id: "gpt-5-mini",
        provider: "OpenAI",
        name: "GPT-5 Mini",
        inputPricePer1M: 0.25,
        outputPricePer1M: 2.0,
        keyFeature: "Fast, cheap mini version of GPT-5",
        charsPerToken: 3.7,
    },
    {
        id: "gpt-4o",
        provider: "OpenAI",
        name: "GPT-4o",
        inputPricePer1M: 2.5,
        outputPricePer1M: 10.0,
        keyFeature: "Legacy flagship (omni-modal)",
        charsPerToken: 3.7,
    },
    {
        id: "gpt-4o-mini",
        provider: "OpenAI",
        name: "GPT-4o-mini",
        inputPricePer1M: 0.15,
        outputPricePer1M: 0.6,
        keyFeature: "High-efficiency legacy model",
        charsPerToken: 3.7,
    },
    // Claude
    {
        id: "claude-4.6-opus",
        provider: "Claude",
        name: "Claude 4.6 Opus",
        inputPricePer1M: 5.0,
        outputPricePer1M: 25.0,
        keyFeature: "State-of-the-art coding & complexity",
        charsPerToken: 3.5,
    },
    {
        id: "claude-4.6-sonnet",
        provider: "Claude",
        name: "Claude 4.6 Sonnet",
        inputPricePer1M: 3.0,
        outputPricePer1M: 15.0,
        keyFeature: "Balanced intelligence and speed",
        charsPerToken: 3.5,
    },
    {
        id: "claude-4.5-haiku",
        provider: "Claude",
        name: "Claude 4.5 Haiku",
        inputPricePer1M: 1.0,
        outputPricePer1M: 5.0,
        keyFeature: "Budget-friendly high-volume model",
        charsPerToken: 3.5,
    },
    {
        id: "claude-3.5-sonnet",
        provider: "Claude",
        name: "Claude 3.5 Sonnet",
        inputPricePer1M: 3.0,
        outputPricePer1M: 15.0,
        keyFeature: "Reliable legacy favorite",
        charsPerToken: 3.5,
    },
    // Gemini
    {
        id: "gemini-3.1-pro",
        provider: "Gemini",
        name: "Gemini 3.1 Pro",
        inputPricePer1M: 2.0,
        outputPricePer1M: 12.0,
        keyFeature: "Reasoning-first (1M context)",
        charsPerToken: 4.0,
    },
    {
        id: "gemini-3.1-flash",
        provider: "Gemini",
        name: "Gemini 3.1 Flash",
        inputPricePer1M: 0.125,
        outputPricePer1M: 0.75,
        keyFeature: "Lowest cost frontier-tier model",
        charsPerToken: 4.0,
    },
    {
        id: "gemini-2.5-pro",
        provider: "Gemini",
        name: "Gemini 2.5 Pro",
        inputPricePer1M: 1.0,
        outputPricePer1M: 6.0,
        keyFeature: "Large context efficiency",
        charsPerToken: 4.0,
    },
    // Grok
    {
        id: "grok-4",
        provider: "Grok",
        name: "Grok 4",
        inputPricePer1M: 3.0,
        outputPricePer1M: 15.0,
        keyFeature: "Truth-seeking flagship",
        charsPerToken: 3.8,
    },
    {
        id: "grok-4.1-fast",
        provider: "Grok",
        name: "Grok 4.1 Fast",
        inputPricePer1M: 0.2,
        outputPricePer1M: 0.5,
        keyFeature: "2M token context, ultra-low latency",
        charsPerToken: 3.8,
    },
    {
        id: "grok-3-mini",
        provider: "Grok",
        name: "Grok 3 Mini",
        inputPricePer1M: 0.3,
        outputPricePer1M: 0.5,
        keyFeature: "High benchmark performance/price ratio",
        charsPerToken: 3.8,
    },
];

export const AI_PROVIDERS = ["OpenAI", "Claude", "Gemini", "Grok"] as const;

export function getProviderColor(provider: string) {
    switch (provider) {
        case "OpenAI":
            return { text: "text-[#0F172A]", dot: "bg-[#10a37f]" };
        case "Claude":
            return { text: "text-[#0F172A]", dot: "bg-[#d97706]" };
        case "Gemini":
            return { text: "text-[#0F172A]", dot: "bg-[#4285f4]" };
        case "Grok":
            return { text: "text-[#0F172A]", dot: "bg-[#e11d48]" };
        default:
            return { text: "text-[#0F172A]", dot: "bg-slate-500" };
    }
}
