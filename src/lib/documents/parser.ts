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

/**
 * Configure PDF.js worker for Node.js environments.
 */
async function configureWorker() {
    try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

        // 1. Locate the worker file in the build environment
        // Vercel keeps files in /var/task during execution
        const workerPath = path.join(process.cwd(), 'public', 'pdf.worker.mjs');

        // 2. Read the file and convert to Base64
        const workerBuffer = fs.readFileSync(workerPath);
        const workerBase64 = workerBuffer.toString('base64');

        // 3. Set the workerSrc using the 'data:' protocol (Supported by ESM loader)
        pdfjs.GlobalWorkerOptions.workerSrc = `data:text/javascript;base64,${workerBase64}`;

    } catch (e) {
        console.error("Critical Worker Error:", e);
    }
}

// Global initialization
configureWorker();

export async function parsePDF(buffer: Buffer): Promise<string> {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    // Ensure worker is configured right before parsing
    await configureWorker();

    try {
        const data = new Uint8Array(buffer);
        const loadingTask = pdfjs.getDocument({ data });
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
