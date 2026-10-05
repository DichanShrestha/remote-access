/**
 * Text chunking utility.
 * Splits large text into overlapping chunks suitable for embedding.
 */

export type TextChunk = {
    content: string;
    metadata: {
        chunkIndex: number;
        startChar: number;
        endChar: number;
    };
};

const DEFAULT_CHUNK_SIZE = 1000; // ~250 tokens
const DEFAULT_CHUNK_OVERLAP = 200; // ~50 tokens overlap

/**
 * Split text into overlapping chunks.
 * Uses sentence-aware splitting to avoid cutting mid-sentence.
 */
export function chunkText(
    text: string,
    options?: {
        chunkSize?: number;
        chunkOverlap?: number;
    }
): TextChunk[] {
    const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
    const overlap = options?.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP;

    // Clean the text
    const cleanedText = text
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/\s+/g, " ")
        .trim();

    if (cleanedText.length <= chunkSize) {
        return [
            {
                content: cleanedText,
                metadata: {
                    chunkIndex: 0,
                    startChar: 0,
                    endChar: cleanedText.length,
                },
            },
        ];
    }

    const chunks: TextChunk[] = [];
    let start = 0;
    let chunkIndex = 0;

    while (start < cleanedText.length) {
        let end = Math.min(start + chunkSize, cleanedText.length);

        // Try to end at a sentence boundary
        if (end < cleanedText.length) {
            const lastPeriod = cleanedText.lastIndexOf(".", end);
            const lastQuestion = cleanedText.lastIndexOf("?", end);
            const lastExclamation = cleanedText.lastIndexOf("!", end);
            const lastNewline = cleanedText.lastIndexOf("\n", end);

            const bestBreak = Math.max(
                lastPeriod,
                lastQuestion,
                lastExclamation,
                lastNewline
            );

            // Only use sentence boundary if it's not too far back
            if (bestBreak > start + chunkSize * 0.5) {
                end = bestBreak + 1;
            }
        }

        const content = cleanedText.slice(start, end).trim();

        if (content.length > 0) {
            chunks.push({
                content,
                metadata: {
                    chunkIndex,
                    startChar: start,
                    endChar: end,
                },
            });
            chunkIndex++;
        }

        // Move start forward, accounting for overlap
        const nextStart = end - overlap;

        // Prevent infinite loop if we are not making progress
        if (nextStart <= start) {
            start = end; // Force forward progress
        } else {
            start = nextStart;
        }

        // Break if we've reached or passed the end
        if (start >= cleanedText.length) break;
    }

    return chunks;
}
