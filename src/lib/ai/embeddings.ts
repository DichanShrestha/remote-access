import { createOpenAI } from "@ai-sdk/openai";
import { embedMany, embed } from "ai";

/**
 * OpenRouter Text Embeddings module.
 *
 * Uses OpenRouter's OpenAI-compatible /v1/embeddings endpoint.
 * Default model: openai/text-embedding-3-small (1536-dimensional, cost-effective).
 * Configurable via AI_EMBEDDING_MODEL (e.g. google/gemini-embedding-001).
 */

export const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
export const DEFAULT_EMBEDDING_MODEL = process.env.AI_EMBEDDING_MODEL || "openai/text-embedding-3-small";

export function getActiveEmbeddingModel(): string {
    return process.env.AI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
}

export function getEmbeddingProvider(apiKey?: string) {
    const key = apiKey || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    return createOpenAI({
        baseURL: OPENROUTER_BASE_URL,
        apiKey: key,
    });
}

/**
 * Generate embeddings for an array of text chunks using OpenRouter.
 */
export async function generateEmbeddings(
    texts: string[],
    apiKey?: string
): Promise<number[][]> {
    const provider = getEmbeddingProvider(apiKey);
    const model = provider.embedding(getActiveEmbeddingModel());

    // Process in batches of 100
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
    const provider = getEmbeddingProvider(apiKey);
    const model = provider.embedding(getActiveEmbeddingModel());

    const { embedding } = await embed({
        model,
        value: query,
    });

    return embedding;
}

