import fs from 'fs';
import path from 'path';
/**
 * Document parsing utilities.
 * Handles PDF, DOCX, and TXT file parsing with security validation.
 */

// Polyfill for Node.js environments missing browser APIs used by modern pdf.js (e.g. Node < 20)
if (typeof global !== 'undefined' && typeof (global as any).DOMMatrix === 'undefined') {
    (global as any).DOMMatrix = class DOMMatrix {
        constructor() { }
        translate() { return this; }
        scale() { return this; }
        rotate() { return this; }
        multiply() { return this; }
        inverse() { return this; }
    };
}

let isWorkerConfigured = false;

/**
 * Configure PDF.js worker for Node.js environments lazily.
 * Setting globalThis.pdfjsWorker allows pdfjs to use the in-memory WorkerMessageHandler
 * directly without spawning a web worker or parsing URLs.
 */
async function configureWorker() {
    if (isWorkerConfigured) return;
    try {
        const [pdfjs, pdfjsWorker] = await Promise.all([
            import("pdfjs-dist/legacy/build/pdf.mjs"),
            // @ts-expect-error pdf.worker.mjs has no types declaration in pdfjs-dist
            import("pdfjs-dist/legacy/build/pdf.worker.mjs"),
        ]);

        (globalThis as any).pdfjsWorker = pdfjsWorker;
        if (pdfjs?.GlobalWorkerOptions) {
            pdfjs.GlobalWorkerOptions.workerSrc = "";
        }
        isWorkerConfigured = true;
    } catch (e) {
        console.warn("[PDF Parser] Worker configuration warning:", e);
    }
}


export async function parsePDF(buffer: Buffer): Promise<string> {
    await configureWorker();
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    try {
        const data = new Uint8Array(buffer);
        const loadingTask = pdfjs.getDocument({
            data,
            useSystemFonts: true,
            disableFontFace: true,
            isEvalSupported: false,
        });
        const pdf = await loadingTask.promise;

        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item: any) => item.str);
            fullText += strings.join(" ") + "\n";
        }

        return fullText;
    } catch (error) {
        console.error("PDF parsing failed:", error);
        throw new Error("Could not extract text from PDF. Ensure the file is not password protected.");
    }
}

/**
 * Parse a DOCX file and extract plain text.
 */
export async function parseDOCX(buffer: Buffer): Promise<string> {
    const mammoth = await import("mammoth");

    const result = await mammoth.extractRawText({ buffer });
    return result.value;
}

/**
 * Parse a TXT file (just decode the buffer).
 */
export function parseTXT(buffer: Buffer): string {
    return buffer.toString("utf-8");
}

/**
 * Parse any supported file based on its extension.
 */
export async function parseDocument(
    buffer: Buffer,
    fileName: string
): Promise<string> {
    const ext = fileName.split(".").pop()?.toLowerCase();

    switch (ext) {
        case "pdf":
            return parsePDF(buffer);
        case "docx":
            return parseDOCX(buffer);
        case "txt":
            return parseTXT(buffer);
        default:
            throw new Error(`Unsupported file type: .${ext}`);
    }
}

/**
 * Extract text content from a web page URL using Jina AI Reader API.
 */
export async function crawlUrl(url: string): Promise<string> {
    console.log("Crawling URL with Jina API:", url);

    if (!process.env.JINA_API_KEY) {
        console.warn("[INGESTION ERROR]: Jina API pipeline failed (API Key missing)");
        throw new Error("JINA_API_KEY is not configured.");
    }

    try {
        const response = await fetch(`https://r.jina.ai/${url}`, {
            headers: {
                "Authorization": `Bearer ${process.env.JINA_API_KEY}`,
                "Accept": "text/plain",
            },
            signal: AbortSignal.timeout(30000), // 30s timeout
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
            console.warn(`[INGESTION ERROR]: Jina API pipeline failed for ${url} with status ${response.status}`);
            throw new Error(`Failed to crawl URL: ${response.status} ${response.statusText}`);
        }

        const markdown = await response.text();
        console.log("Markdown fetched via Jina API.");

        const text = markdown.trim().slice(0, 20000);

        if (text.length < 50) {
            throw new Error("Page content too short — may not have useful text or blocks crawling.");
        }

        return text;
    } catch (error) {
        console.warn(`[INGESTION ERROR]: Jina API pipeline failed for ${url}`, error);
        throw error;
    }
}
