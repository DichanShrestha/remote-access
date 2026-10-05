import { openai, createOpenAI } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { embedMany, embed } from "ai";

/**
 * Generate embeddings using Google's text-embedding-004 by default.
 * Supports BYOK (Bring Your Own Key) — if an API key is provided,
 * it assumes it is an OpenAI key and falls back to text-embedding-3-small.
 */

/**
 * Generate embeddings for an array of text chunks.
 */
export async function generateEmbeddings(
    texts: string[],
    apiKey?: string
): Promise<number[][]> {
    const model = apiKey
        ? createOpenAI({ apiKey }).embedding("text-embedding-3-small")
        : openai.embedding("text-embedding-3-small");

    // Process in batches of 100 (Google limit for embedMany might also be 100)
    const batchSize = 100;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);

        const { embeddings } = await embedMany({
            model,
            values: batch,
        });

        allEmbeddings.push(...embeddings);
    }

    return allEmbeddings;
}

/**
 * Generate a single embedding for a query string (used in RAG retrieval).
 */
export async function generateQueryEmbedding(
    query: string,
    apiKey?: string
): Promise<number[]> {
    const model = apiKey
        ? createOpenAI({ apiKey }).embedding("text-embedding-3-small")
        : openai.embedding("text-embedding-3-small");

    const { embedding } = await embed({
        model,
        value: query,
    });

    return embedding;
}
