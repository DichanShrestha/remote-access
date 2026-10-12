"use server";
import { authService } from "@/services/auth";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { parseDocument, crawlUrl } from "@/lib/documents/parser";
import { crawlWebsite } from "@/lib/documents/crawler";
import { chunkText } from "@/lib/ai/chunker";
import { generateEmbeddings, getActiveEmbeddingModel } from "@/lib/ai/embeddings";
import { validateFile, getStringSize } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { updateStorageUsage } from "@/lib/guards/resource-manager";
import { AI_CHARS_PER_TOKEN, getSmartPageEntitlement } from "@/lib/tier-limits";
import { storageService } from "@/lib/storage/service";
import { requireAIEntitlement } from "@/lib/billing/entitlements";

export async function getKnowledgeUploadPolicy() {
    const user = await authService.requireUser();
    const account = await prisma.user.findUnique({ where: { id: user.id }, include: { subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 }, usage: true } });
    if (!account) throw new Error('Workspace not found');
    const entitlement = getSmartPageEntitlement(account);
    const sources = await prisma.dataSource.count({ where: { userId: user.id, type: { not: 'qa' }, status: { not: 'error' } } });
    return { allowed: entitlement.aiEnabled, maxFileBytes: entitlement.limits.knowledgeFileBytes, remainingBytes: Math.max(0, entitlement.limits.knowledgeBytes - Number(account.usage?.knowledgeBytes || 0)), sourcesRemaining: Math.max(0, entitlement.limits.knowledgeSources - sources) };
}

/**
 * Upload and process document files for a bot.
 * Flow: Upload → Parse → Chunk → Embed → Store
 */
export async function uploadAndTrainFiles(botId: string, formData: FormData) {

    const user = await authService.requireUser();
    const billing = await prisma.user.findUnique({ where: { id: user.id }, include: { subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 } } });
    if (!billing) throw new Error("Workspace not found");
    const entitlement = getSmartPageEntitlement(billing);
    if (!entitlement.aiEnabled) throw new Error("Knowledge training requires an active trial or Smart Page + AI plan.");



    // Verify bot ownership
    const bot = await prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
    });
    if (!bot) throw new Error("Bot not found");

    const files = formData.getAll("files") as File[];

    if (files.length === 0) throw new Error("No files provided");

    // Enforce Storage Guard
    const totalBytes = files.reduce((acc, file) => acc + file.size, 0);
    const perFileLimit = entitlement.limits.knowledgeFileBytes;
    const existingSources = await prisma.dataSource.count({ where: { userId: user.id, type: { not: "qa" }, status: { not: "error" } } });
    const existingUsage = await prisma.usage.findUnique({ where: { userId: user.id } });
    let existingTokens = existingUsage?.indexedTokens || 0;
    if (files.some((f) => f.size > perFileLimit)) throw new Error(`Each knowledge file must be ${Math.floor(perFileLimit / 1024 / 1024)} MB or smaller on your current plan.`);
    if (existingSources + files.length > entitlement.limits.knowledgeSources) throw new Error(`Your plan allows ${entitlement.limits.knowledgeSources} knowledge sources.`);
    if (Number(existingUsage?.knowledgeBytes || 0) + totalBytes > entitlement.limits.knowledgeBytes) throw new Error("Your knowledge storage limit would be exceeded. Delete a source or upgrade your plan.");

    // Update bot status
    await prisma.bot.update({
        where: { id: botId },
        data: { status: "training" },
    });

    const results: Array<{ id?: string; source: string; status: string; error?: string }> = [];
    let successfulBytes = 0;

    for (const file of files) {
        // Validate file
        const validation = validateFile(file, perFileLimit);
        if (!validation.valid) {
            results.push({ source: file.name, status: "error", error: validation.error });
            continue;
        }

        // Create data source record
        const dataSource = await prisma.dataSource.create({
            data: {
                botId,
                userId: user.id,
                type: "file",
                source: file.name,
                status: "crawling",
            },
        });

        let filePath: string | null = null;
        try {
            // Upload file to Supabase Storage
            filePath = `${user.id}/${botId}/${Date.now()}-${file.name}`;
            await storageService.upload({ bucket: "docs", key: filePath, size: file.size, contentType: file.type }, file);

            await prisma.dataSource.update({
                where: { id: dataSource.id },
                data: { filePath, status: "chunking" },
            });

            // Parse document
            const buffer = Buffer.from(await file.arrayBuffer());
            const text = await parseDocument(buffer, file.name);

            // Chunk the text
            const textChunks = chunkText(text);

            const tokenCount = Math.ceil(text.length / AI_CHARS_PER_TOKEN);
            if (existingTokens + tokenCount > entitlement.limits.indexedTokens) throw new Error("Your indexed text limit would be exceeded. Remove a source or upgrade your plan.");
            await prisma.dataSource.update({ where: { id: dataSource.id }, data: { status: "embedding" } });
            const embeddings = await generateEmbeddings(textChunks.map((c) => c.content));

            // Store chunks with embeddings using raw SQL for vector type
            for (let i = 0; i < textChunks.length; i++) {
                await prisma.$executeRaw`
          INSERT INTO document_chunks (id, data_source_id, bot_id, user_id, content, embedding, metadata)
          VALUES (
            uuid_generate_v4(),
            ${dataSource.id}::uuid,
            ${botId}::uuid,
            ${user.id}::uuid,
            ${textChunks[i].content},
            ${JSON.stringify(embeddings[i])}::vector,
            ${JSON.stringify({
                ...textChunks[i].metadata,
                embeddingModel: getActiveEmbeddingModel(),
            })}::jsonb
          )
        `;
            }

            // Calculate character-based storage size
            const textSize = file.size;
            await prisma.dataSource.update({
                where: { id: dataSource.id },
                data: { status: "complete", metadata: { chunks: textChunks.length, storageBytes: textSize, indexedTokens: tokenCount } },
            });

            successfulBytes += textSize;
            existingTokens += tokenCount;
            results.push({ id: dataSource.id, source: file.name, status: "complete" });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            if (filePath) try { await storageService.delete([{ bucket: "docs", key: filePath }]); } catch {}
            await prisma.documentChunk.deleteMany({ where: { dataSourceId: dataSource.id } });
            await prisma.dataSource.update({
                where: { id: dataSource.id },
                data: { status: "error", errorMessage: message },
            });
            results.push({ id: dataSource.id, source: file.name, status: "error", error: message });
        }
    }

    if (successfulBytes > 0) {
        await updateStorageUsage(user.id, successfulBytes);
        const successfulSources = results.filter((r) => r.status === "complete");
        const successfulTokenTotal = await prisma.dataSource.findMany({ where: { id: { in: successfulSources.map((r) => r.id!).filter(Boolean) } }, select: { metadata: true } });
        const indexedTokens = successfulTokenTotal.reduce((sum, source) => sum + Number((source.metadata as any)?.indexedTokens || 0), 0);
        await prisma.usage.upsert({ where: { userId: user.id }, create: { userId: user.id, knowledgeBytes: successfulBytes, indexedTokens }, update: { knowledgeBytes: { increment: successfulBytes }, indexedTokens: { increment: indexedTokens } } });
    }

    // Update bot status
    const allComplete = results.every((r) => r.status === "complete");
    await prisma.bot.update({
        where: { id: botId },
        data: { status: allComplete ? "active" : "error" },
    });

    revalidatePath(`/dashboard/bot/${botId}`);
    return results;
}

/**
 * Crawl a URL and train the bot on its content.
 * Flow: Crawl → Chunk → Embed → Store
 */
export async function crawlAndTrain(botId: string, url: string) {

    const user = await authService.requireUser();
    const billing = await prisma.user.findUnique({ where: { id: user.id }, include: { subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 }, usage: true } });
    if (!billing) throw new Error("Workspace not found");
    const entitlement = getSmartPageEntitlement(billing);
    if (!entitlement.aiEnabled) throw new Error("Knowledge training requires an active trial or Smart Page + AI plan.");
    const sourceCount = await prisma.dataSource.count({ where: { userId: user.id, type: { not: 'qa' }, status: { not: 'error' } } });
    if (sourceCount >= entitlement.limits.knowledgeSources) throw new Error(`Your plan allows ${entitlement.limits.knowledgeSources} knowledge sources.`);



    // Validate URL
    let parsedUrl: URL;
    try {
        parsedUrl = new URL(url);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            throw new Error("Invalid protocol");
        }
    } catch {
        throw new Error("Invalid URL");
    }

    // Verify bot ownership
    const bot = await prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
    });
    if (!bot) throw new Error("Bot not found");

    // Update bot status
    await prisma.bot.update({
        where: { id: botId },
        data: { status: "training" },
    });

    // Create data source record
    const dataSource = await prisma.dataSource.create({
        data: {
            botId,
            userId: user.id,
            type: "url",
            source: parsedUrl.href,
            status: "crawling",
        },
    });

    try {
        // Multi-page crawl (limit 30, depth 2)
        const pages = await crawlWebsite(parsedUrl.href, 20, 2); // Using 20 as a safe limit for now

        if (pages.length === 0) throw new Error("No content found at the provided URL.");

        // Calculate total bytes from all pages
        const totalSourceBytes = pages.reduce((acc, page) => acc + getStringSize(page.content), 0);

        const indexedTokens = Math.ceil(pages.reduce((sum, page) => sum + page.content.length, 0) / AI_CHARS_PER_TOKEN);
        if ((billing.usage?.indexedTokens || 0) + indexedTokens > entitlement.limits.indexedTokens) throw new Error("Your indexed text limit would be exceeded. Remove a source or upgrade your plan.");

        await prisma.dataSource.update({
            where: { id: dataSource.id },
            data: { status: "chunking" },
        });

        let totalChunks = 0;

        for (const page of pages) {
            // Chunk the text per page
            const textChunks = chunkText(page.content);
            totalChunks += textChunks.length;

            // Generate embeddings for the page's chunks
            const embeddings = await generateEmbeddings(
                textChunks.map((c) => c.content)
            );

            // Store chunks with embeddings
            for (let i = 0; i < textChunks.length; i++) {
                await prisma.$executeRaw`
                    INSERT INTO document_chunks (id, data_source_id, bot_id, user_id, content, embedding, metadata)
                    VALUES (
                        uuid_generate_v4(),
                        ${dataSource.id}::uuid,
                        ${botId}::uuid,
                        ${user.id}::uuid,
                        ${textChunks[i].content},
                        ${JSON.stringify(embeddings[i])}::vector,
                        ${JSON.stringify({
                    ...textChunks[i].metadata,
                    url: page.url,
                    title: page.title,
                    embeddingModel: getActiveEmbeddingModel(),
                })}::jsonb
                    )
                `;
            }
        }

        await updateStorageUsage(user.id, totalSourceBytes);

        await prisma.dataSource.update({
            where: { id: dataSource.id },
            data: {
                status: "complete",
                metadata: {
                    chunks: totalChunks,
                    pages: pages.length,
                    url: parsedUrl.href,
                    storageBytes: totalSourceBytes,
                    indexedTokens
                }
            },
        });
        await prisma.usage.upsert({ where: { userId: user.id }, create: { userId: user.id, indexedTokens }, update: { indexedTokens: { increment: indexedTokens } } });

        // Update bot status
        await prisma.bot.update({
            where: { id: botId },
            data: { status: "active" },
        });

        revalidatePath(`/dashboard/bot/${botId}/sources`);
        return { success: true, id: dataSource.id, chunks: totalChunks, pages: pages.length };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";

        await prisma.documentChunk.deleteMany({ where: { dataSourceId: dataSource.id } });

        await prisma.dataSource.update({
            where: { id: dataSource.id },
            data: { status: "error", errorMessage: message },
        });

        await prisma.bot.update({
            where: { id: botId },
            data: { status: "error" },
        });

        throw new Error(`Crawl failed: ${message}`);
    }
}

/**
 * Re-train an existing data source.
 */
export async function reTrainSource(dataSourceId: string) {

    const user = await authService.requireUser();
    await requireAIEntitlement(user.id);



    const dataSource = await prisma.dataSource.findFirst({
        where: { id: dataSourceId, userId: user.id },
        include: { bot: true }
    });

    if (!dataSource) throw new Error("Data source not found");

    // Clear existing chunks
    await prisma.documentChunk.deleteMany({
        where: { dataSourceId }
    });

    // Re-trigger based on type
    if (dataSource.type === "url") {
        // To re-train a URL, we delete the old source (and its storage count) and crawl fresh.
        await deleteDataSource(dataSourceId);
        return crawlAndTrain(dataSource.botId, dataSource.source);
    } else {
        // For files, we need the file buffer. This is harder to do from a re-train button
        // without re-uploading, unless we fetch from storage.

        if (!dataSource.filePath) throw new Error("File path missing");

        const data = await storageService.download({ bucket: "docs", key: dataSource.filePath });

        const buffer = Buffer.from(await data.arrayBuffer());
        const text = await parseDocument(buffer, dataSource.source);
        const textChunks = chunkText(text);

        await prisma.dataSource.update({
            where: { id: dataSourceId },
            data: { status: "embedding" }
        });

        const embeddings = await generateEmbeddings(textChunks.map(c => c.content));

        for (let i = 0; i < textChunks.length; i++) {
            await prisma.$executeRaw`
                INSERT INTO document_chunks (id, data_source_id, bot_id, user_id, content, embedding, metadata)
                VALUES (
                    uuid_generate_v4(),
                    ${dataSourceId}::uuid,
                    ${dataSource.botId}::uuid,
                    ${user.id}::uuid,
                    ${textChunks[i].content},
                    ${JSON.stringify(embeddings[i])}::vector,
                    ${JSON.stringify({
                        ...textChunks[i].metadata,
                        embeddingModel: getActiveEmbeddingModel(),
                    })}::jsonb
                )
            `;
        }

        await prisma.dataSource.update({
            where: { id: dataSourceId },
            data: {
                status: "complete",
                metadata: {
                    ...(dataSource.metadata as any),
                    chunks: textChunks.length
                }
            }
        });

        return { success: true };
    }
}

/**
 * Delete a data source and its chunks.
 */
export async function deleteDataSource(dataSourceId: string) {

    const user = await authService.requireUser();



    const dataSource = await prisma.dataSource.findFirst({
        where: { id: dataSourceId, userId: user.id },
    });

    if (!dataSource) throw new Error("Data source not found");

    // Delete file from storage if it's a file source
    if (dataSource.filePath) {
        await storageService.delete([{ bucket: "docs", key: dataSource.filePath }]);
    }

    // Decrement storage usage if storageBytes is in metadata
    const metadata = dataSource.metadata as any;
    if (metadata?.storageBytes) {
        await updateStorageUsage(user.id, -metadata.storageBytes);
    }
    const removedTokens = Number(metadata?.indexedTokens || 0);
    await prisma.usage.updateMany({ where: { userId: user.id }, data: {
        ...(dataSource.type === 'file' && Number(metadata?.storageBytes || 0) ? { knowledgeBytes: { decrement: BigInt(metadata.storageBytes) } } : {}),
        ...(removedTokens ? { indexedTokens: { decrement: removedTokens } } : {}),
    } });

    // Cascade delete handles chunks
    await prisma.dataSource.delete({ where: { id: dataSourceId } });

    revalidatePath(`/dashboard/bot/${dataSource.botId}`);
    return { success: true };
}

/**
 * Get the training status of all data sources for a bot.
 */
export async function getTrainingStatus(botId: string) {

    const user = await authService.requireUser();



    const sources = await prisma.dataSource.findMany({
        where: { botId, userId: user.id },
        orderBy: { createdAt: "desc" },
    });

    const bot = await prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
        select: { status: true },
    });

    return { sources, botStatus: bot?.status ?? "draft" };
}
