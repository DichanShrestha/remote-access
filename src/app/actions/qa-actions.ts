"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { enforceStorageGuard, updateStorageUsage } from "@/lib/guards/resource-manager";
import { getStringSize } from "@/lib/utils";
import { generateEmbeddings } from "@/lib/ai/embeddings";

/**
 * Get or create a synthetic DataSource of type "qa" for a given bot.
 * All QA-based document_chunks reference this single DataSource
 * so they appear in the same vector search as website/file chunks.
 */
async function getOrCreateQADataSource(botId: string, userId: string) {
    let ds = await prisma.dataSource.findFirst({
        where: { botId, userId, type: "qa" },
    });

    if (!ds) {
        ds = await prisma.dataSource.create({
            data: {
                botId,
                userId,
                type: "qa",
                source: "Q&A Pairs",
                status: "complete",
            },
        });
    }

    return ds;
}

/**
 * Build the text content that will be embedded for a QA pair.
 * Combines questions + answer so the vector captures both the intent
 * and the knowledge. The metadata tags it as type "qa" with the qaId
 * so we can give it priority during retrieval.
 */
function buildQAEmbeddingText(questions: string[], answer: string): string {
    const questionsBlock = questions.join("\n");
    return `Question: ${questionsBlock}\nAnswer: ${answer}`;
}

/**
 * Generate and store vector embeddings for a QA pair in document_chunks.
 * Removes any previous chunks for this QA pair first (idempotent).
 */
async function syncQAEmbeddings(
    qaId: string,
    botId: string,
    userId: string,
    questions: string[],
    answer: string
) {
    const ds = await getOrCreateQADataSource(botId, userId);

    // Delete old chunks for this QA pair (identified by metadata.qaId)
    await prisma.$executeRaw`
        DELETE FROM document_chunks
        WHERE data_source_id = ${ds.id}::uuid
          AND bot_id = ${botId}::uuid
          AND (metadata->>'qaId') = ${qaId}
    `;

    // Build embedding text and generate vector
    const embeddingText = buildQAEmbeddingText(questions, answer);
    const [embedding] = await generateEmbeddings([embeddingText]);

    // Insert new chunk
    await prisma.$executeRaw`
        INSERT INTO document_chunks (id, data_source_id, bot_id, user_id, content, embedding, metadata)
        VALUES (
            uuid_generate_v4(),
            ${ds.id}::uuid,
            ${botId}::uuid,
            ${userId}::uuid,
            ${embeddingText},
            ${JSON.stringify(embedding)}::vector(1536),
            ${JSON.stringify({
        qaId,
        type: "qa",
        chunkIndex: 0,
        startChar: 0,
        endChar: embeddingText.length,
    })}::jsonb
        )
    `;
}

/**
 * Remove vector embeddings for a QA pair from document_chunks.
 */
async function removeQAEmbeddings(qaId: string, botId: string, userId: string) {
    const ds = await prisma.dataSource.findFirst({
        where: { botId, userId, type: "qa" },
    });

    if (ds) {
        await prisma.$executeRaw`
            DELETE FROM document_chunks
            WHERE data_source_id = ${ds.id}::uuid
              AND bot_id = ${botId}::uuid
              AND (metadata->>'qaId') = ${qaId}
        `;
    }
}

// ─── Public Actions ────────────────────────────────────────

/**
 * Fetch all Q&A pairs for a bot.
 */
export async function getQAs(botId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    return await prisma.qAPair.findMany({
        where: { botId, userId: user.id },
        orderBy: { createdAt: "desc" },
    });
}

/**
 * Add or update a Q&A pair.
 * Automatically generates and stores a vector embedding in document_chunks
 * so the QA pair participates in the same semantic search as website/file content.
 */
export async function saveQA(
    botId: string,
    data: { questions: string[]; answer: string; id?: string }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Verify bot ownership
    const bot = await prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
    });
    if (!bot) throw new Error("Bot not found");

    const questionsText = data.questions.join(" ");
    const newContentSize = getStringSize(questionsText + " " + data.answer);

    if (data.id) {
        // Update
        const oldQA = await prisma.qAPair.findUnique({
            where: { id: data.id, userId: user.id },
        });

        if (oldQA) {
            const oldContentSize = getStringSize(oldQA.questions.join(" ") + " " + oldQA.answer);
            const sizeDiff = newContentSize - oldContentSize;

            if (sizeDiff > 0) {
                await enforceStorageGuard(user.id, sizeDiff);
            }

            const updated = await prisma.qAPair.update({
                where: { id: data.id, userId: user.id },
                data: {
                    questions: data.questions,
                    answer: data.answer,
                },
            });

            // Re-sync vector embedding
            await syncQAEmbeddings(updated.id, botId, user.id, data.questions, data.answer);

            await updateStorageUsage(user.id, sizeDiff);
            revalidatePath(`/dashboard/bot/${botId}/sources/qa`);
            return updated;
        }
        throw new Error("QA pair not found");
    } else {
        // Create
        await enforceStorageGuard(user.id, newContentSize);

        const created = await prisma.qAPair.create({
            data: {
                botId,
                userId: user.id,
                questions: data.questions,
                answer: data.answer,
            },
        });

        // Generate and store vector embedding
        await syncQAEmbeddings(created.id, botId, user.id, data.questions, data.answer);

        await updateStorageUsage(user.id, newContentSize);
        revalidatePath(`/dashboard/bot/${botId}/sources/qa`);
        return created;
    }
}

/**
 * Delete a Q&A pair.
 * Also removes the corresponding vector embedding from document_chunks.
 */
export async function deleteQA(qaId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const qa = await prisma.qAPair.findUnique({
        where: { id: qaId, userId: user.id },
    });

    if (!qa) throw new Error("QA pair not found");

    // Remove vector embedding first
    await removeQAEmbeddings(qa.id, qa.botId, user.id);

    const deleted = await prisma.qAPair.delete({
        where: { id: qaId, userId: user.id },
    });

    const qaSize = getStringSize(qa.questions.join(" ") + " " + qa.answer);
    await updateStorageUsage(user.id, -qaSize);

    revalidatePath(`/dashboard/bot/${deleted.botId}/sources/qa`);
    return { success: true };
}

/**
 * Increment usage count when a Q&A pair is matched.
 */
export async function incrementQAUsage(qaId: string) {
    return await prisma.qAPair.update({
        where: { id: qaId },
        data: { usageCount: { increment: 1 } },
    });
}
