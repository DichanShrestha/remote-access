"use server";

import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function runChatbotAudit(url: string) {
    try {
        const headerStore = await headers();
        const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
        const limitCheck = rateLimit(`audit:${ip}`, { limit: 5, windowSeconds: 60 });
        if (!limitCheck.success) {
            return { error: "RATE_LIMITED", message: "Too many audit requests. Please try again in a minute." };
        }

        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                return { error: "INVALID_URL", message: "Invalid URL protocol." };
            }
            const host = parsedUrl.hostname.toLowerCase();
            if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host.endsWith(".internal") || host.endsWith(".local")) {
                return { error: "INVALID_URL", message: "Target URL cannot be a private or local address." };
            }
        } catch {
            return { error: "INVALID_URL", message: "Please provide a valid website URL." };
        }

        const jinaKey = process.env.JINA_API_KEY;
        const geminiKey = process.env.GEMINI_FREE_API_KEY;

        if (!jinaKey || !geminiKey) {
            console.error("Missing JINA_API_KEY or GEMINI_FREE_API_KEY");
            throw new Error("Missing API Keys");
        }

        // 1. Scrape content using Jina AI
        const jinaResponse = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
            headers: {
                "Authorization": `Bearer ${jinaKey}`,
            },
        });

        if (!jinaResponse.ok) {
            throw new Error("Failed to fetch website content");
        }

        const markdownContent = await jinaResponse.text();

        // 2. Call Gemini
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

        const systemPrompt = `You are a Principal UX & Chatbot Expert. Analyze the provided website content and return a JSON payload with exactly this structure:
{
  "accessibilityScore": number (1-100, based on clear navigation, support availability, and FAQ clarity),
  "frictionPoints": [
    { "title": "...", "description": "..." } // Exactly 3 points
  ],
  "remediation": {
    "faqQuestion": "...", // A dynamic question parsed relative to their product pricing/tiers or common user inquiry
    "faqAnswer": "...", // The answer content for the above question
    "engagementTrigger": "...", // A high-converting greeting message targeted to their visitors
    "systemPromptInstruction": "..." // Precise operational instructions to keep users from abandoning their checkout funnel
  }
}`;

        const payload = {
            contents: [{ parts: [{ text: `Website Content:\n\n${markdownContent.substring(0, 50000)}` }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                responseMimeType: "application/json"
            }
        };

        const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (geminiResponse.status === 429) {
            return { error: "QUOTA_EXCEEDED" };
        }

        if (!geminiResponse.ok) {
            const errBody = await geminiResponse.text();
            if (errBody.includes("quota") || errBody.includes("Quota")) {
                return { error: "QUOTA_EXCEEDED" };
            }
            throw new Error(`Gemini API Error: ${geminiResponse.statusText}`);
        }

        const data = await geminiResponse.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("Invalid response from Gemini");
        }

        return { data: JSON.parse(text) };
    } catch (error) {
        console.error("Chatbot Audit Error:", error);
        return { error: "INTERNAL_ERROR" };
    }
}

export async function runConversionAudit(url: string) {
    try {
        const jinaKey = process.env.JINA_API_KEY;
        const geminiKey = process.env.GEMINI_FREE_API_KEY;

        if (!jinaKey || !geminiKey) {
            console.error("Missing JINA_API_KEY or GEMINI_FREE_API_KEY");
            throw new Error("Missing API Keys");
        }

        const jinaResponse = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
            headers: {
                "Authorization": `Bearer ${jinaKey}`,
            },
        });

        if (!jinaResponse.ok) {
            throw new Error("Failed to fetch website content");
        }

        const markdownContent = await jinaResponse.text();

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

        const systemPrompt = `You are a Principal UX & Conversion Optimization Expert. Analyze the provided website content and return a JSON payload with exactly this structure:
{
  "accessibilityScore": number (1-100, based on clear navigation, support availability, and FAQ clarity),
  "frictionPoints": [
    { "title": "...", "description": "..." } // Exactly 3 points
  ],
  "remediations": [
    {
      "category": "...", // e.g., "Objection Handling", "High-Intent Hook", "Navigation Optimization"
      "title": "...", // Core structural issue to solve
      "actionableFix": "...", // Direct tactical step on what to change on their landing page
      "copyableAsset": "..." // Casual, punchy, ready-to-use text asset or execution copy the user can paste directly
    }
  ] // Exactly 3 remediation objects
}`;

        const payload = {
            contents: [{ parts: [{ text: `Website Content:\n\n${markdownContent.substring(0, 50000)}` }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                responseMimeType: "application/json"
            }
        };

        const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (geminiResponse.status === 429) {
            return { error: "QUOTA_EXCEEDED" };
        }

        if (!geminiResponse.ok) {
            const errBody = await geminiResponse.text();
            if (errBody.includes("quota") || errBody.includes("Quota")) {
                return { error: "QUOTA_EXCEEDED" };
            }
            throw new Error(`Gemini API Error: ${geminiResponse.statusText}`);
        }

        const data = await geminiResponse.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("Invalid response from Gemini");
        }

        return { data: JSON.parse(text) };
    } catch (error) {
        console.error("Conversion Audit Error:", error);
        return { error: "INTERNAL_ERROR" };
    }
}

export async function generateFaqs({ url, text }: { url?: string; text?: string }) {
    try {
        const geminiKey = process.env.GEMINI_FREE_API_KEY;

        if (!geminiKey) {
            console.error("Missing GEMINI_FREE_API_KEY");
            throw new Error("Missing API Keys");
        }

        let corpus = text || "";

        if (url) {
            const jinaKey = process.env.JINA_API_KEY;
            if (!jinaKey) throw new Error("Missing JINA_API_KEY");

            const jinaResponse = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
                headers: { "Authorization": `Bearer ${jinaKey}` },
            });

            if (!jinaResponse.ok) {
                throw new Error("Failed to fetch website content");
            }
            corpus = await jinaResponse.text();
        }

        if (!corpus.trim()) {
            throw new Error("No content provided");
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

        const systemPrompt = `You are an expert AI knowledge base curator. Extract exactly 10 highly accurate FAQ pairs optimized for conversational semantic mapping from the provided corpus. Return a JSON payload with exactly this structure:
[
  {
    "question": "The conversational question...",
    "answer": "The accurate, concise answer..."
  }
]`;

        const payload = {
            contents: [{ parts: [{ text: `Content Corpus:\n\n${corpus.substring(0, 50000)}` }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                responseMimeType: "application/json"
            }
        };

        const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (geminiResponse.status === 429) {
            return { error: "QUOTA_EXCEEDED" };
        }

        if (!geminiResponse.ok) {
            const errBody = await geminiResponse.text();
            if (errBody.includes("quota") || errBody.includes("Quota")) {
                return { error: "QUOTA_EXCEEDED" };
            }
            throw new Error(`Gemini API Error: ${geminiResponse.statusText}`);
        }

        const data = await geminiResponse.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error("Invalid response from Gemini");
        }

        return { data: JSON.parse(responseText) };
    } catch (error) {
        console.error("FAQ Generation Error:", error);
        return { error: "INTERNAL_ERROR" };
    }
}
