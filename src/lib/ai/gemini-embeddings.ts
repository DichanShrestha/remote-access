export async function generateGeminiEmbedding(
    params: { text?: string; imageBase64?: string; mimeType?: string },
    taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" = "RETRIEVAL_DOCUMENT"
): Promise<number[]> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_FREE_API_KEY;
    if (!apiKey) {
        // Gracefully return empty if Gemini multimodal key is not set
        return [];
    }

    const parts: any[] = [];

    if (params.text) {
        parts.push({ text: params.text });
    }

    if (params.imageBase64 && params.mimeType) {
        parts.push({
            inlineData: {
                mimeType: params.mimeType,
                data: params.imageBase64
            }
        });
    }

    if (parts.length === 0) {
        throw new Error("Must provide either text or image to generate embedding.");
    }

    const payload = {
        model: "models/gemini-embedding-2-preview",
        content: { parts },
        taskType
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.embedding.values;
}
