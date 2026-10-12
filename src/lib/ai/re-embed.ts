import { prisma } from "@/lib/prisma";
import { generateEmbeddings, getActiveEmbeddingModel } from "./embeddings";

export interface ReEmbedOptions {
    botId?: string;
    batchSize?: number;
    forceAll?: boolean;
}

export interface ReEmbedResult {
    totalChecked: number;
    reEmbedded: number;
    targetModel: string;
    errors: string[];
}

/**
 * Safe re-embedding migration utility.
 *
 * Prevents silent mixing of embedding models by scanning document_chunks,
 * detecting chunks that were embedded with a different model, and re-embedding
 * them in batches to maintain vector database integrity and compatibility.
 */
export async function reEmbedChunks(options: ReEmbedOptions = {}): Promise<ReEmbedResult> {
    const { botId, batchSize = 50, forceAll = false } = options;
    const targetModel = getActiveEmbeddingModel();
    const errors: string[] = [];
    let reEmbedded = 0;

    // Find candidate chunks
    const whereClause: { botId?: string } = {};
    if (botId) {
        whereClause.botId = botId;
    }

    const chunks = await prisma.documentChunk.findMany({
        where: whereClause,
        select: {
            id: true,
            content: true,
            metadata: true,
        },
    });

    const totalChecked = chunks.length;

    // Filter to chunks requiring re-embedding
    const outdatedChunks = chunks.filter((chunk) => {
        if (forceAll) return true;
        const meta = chunk.metadata as Record<string, unknown> | null;
        const currentChunkModel = meta?.embeddingModel as string | undefined;
        return currentChunkModel !== targetModel;
    });

    if (outdatedChunks.length === 0) {
        return {
            totalChecked,
            reEmbedded: 0,
            targetModel,
            errors,
        };
    }

    // Process in batches
    for (let i = 0; i < outdatedChunks.length; i += batchSize) {
        const batch = outdatedChunks.slice(i, i + batchSize);
        try {
            const embeddings = await generateEmbeddings(batch.map((c) => c.content));

            for (let j = 0; j < batch.length; j++) {
                const chunk = batch[j];
                const newEmbedding = embeddings[j];
                const existingMeta = (chunk.metadata as Record<string, unknown>) || {};

                const updatedMeta = {
                    ...existingMeta,
                    embeddingModel: targetModel,
                    reEmbeddedAt: new Date().toISOString(),
                };

                await prisma.$executeRaw`
                    UPDATE document_chunks
                    SET embedding = ${JSON.stringify(newEmbedding)}::vector,
                        metadata = ${JSON.stringify(updatedMeta)}::jsonb
                    WHERE id = ${chunk.id}::uuid
                `;

                reEmbedded++;
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            errors.push(`Batch ${i / batchSize + 1} failed: ${errorMsg}`);
        }
    }

    return {
        totalChecked,
        reEmbedded,
        targetModel,
        errors,
    };
}
