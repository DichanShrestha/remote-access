"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { parseDocument, crawlUrl } from "@/lib/documents/parser";
import { crawlWebsite } from "@/lib/documents/crawler";
import { chunkText } from "@/lib/ai/chunker";
import { generateEmbeddings } from "@/lib/ai/embeddings";
import { validateFile, getStringSize } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { enforceStorageGuard, updateStorageUsage } from "@/lib/guards/resource-manager";

/**
 * Upload and process document files for a bot.
 * Flow: Upload → Parse → Chunk → Embed → Store
 */
export async function uploadAndTrainFiles(botId: string, formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Verify bot ownership
    const bot = await prisma.bot.findFirst({
        where: { id: botId, userId: user.id },
    });
    if (!bot) throw new Error("Bot not found");

    const files = formData.getAll("files") as File[];

    if (files.length === 0) throw new Error("No files provided");

    // Enforce Storage Guard
    const totalBytes = files.reduce((acc, file) => acc + file.size, 0);
    await enforceStorageGuard(user.id, totalBytes);

    // Update bot status
    await prisma.bot.update({
        where: { id: botId },
        data: { status: "training" },
    });

    const results: Array<{ id?: string; source: string; status: string; error?: string }> = [];
    let successfulBytes = 0;

    for (const file of files) {
        // Validate file
        const validation = validateFile(file);
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

        try {
            // Upload file to Supabase Storage
            const filePath = `${user.id}/${botId}/${Date.now()}-${file.name}`;
            const supabaseAdmin = createAdminClient();

            const { error: uploadError } = await supabaseAdmin.storage
                .from("docs")
                .upload(filePath, file, { contentType: file.type });

            if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

            await prisma.dataSource.update({
                where: { id: dataSource.id },
                data: { filePath, status: "chunking" },
            });

            // Parse document
            const buffer = Buffer.from(await file.arrayBuffer());
            const text = await parseDocument(buffer, file.name);

            // Chunk the text
            const textChunks = chunkText(text);

            await prisma.dataSource.update({
                where: { id: dataSource.id },
                data: { status: "embedding" },
            });

            // Generate embeddings
            const embeddings = await generateEmbeddings(
                textChunks.map((c) => c.content)
            );

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
            ${JSON.stringify(embeddings[i])}::vector(1536),
            ${JSON.stringify(textChunks[i].metadata)}::jsonb
          )
        `;
            }

            // Calculate character-based storage size
            const textSize = getStringSize(text);

            await prisma.dataSource.update({
                where: { id: dataSource.id },
                data: { status: "complete", metadata: { chunks: textChunks.length, storageBytes: textSize } },
            });

            successfulBytes += textSize;
            results.push({ id: dataSource.id, source: file.name, status: "complete" });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            await prisma.dataSource.update({
                where: { id: dataSource.id },
                data: { status: "error", errorMessage: message },
            });
            results.push({ id: dataSource.id, source: file.name, status: "error", error: message });
        }
    }

    if (successfulBytes > 0) {
        await updateStorageUsage(user.id, successfulBytes);
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
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

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

        // Enforce Storage Guard
        try {
            await enforceStorageGuard(user.id, totalSourceBytes);
        } catch (e) {
            await prisma.dataSource.update({
                where: { id: dataSource.id },
                data: { status: "error", errorMessage: "Storage limit reached." },
            });
            throw e;
        }

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
                        ${JSON.stringify(embeddings[i])}::vector(1536),
                        ${JSON.stringify({
                    ...textChunks[i].metadata,
                    url: page.url,
                    title: page.title
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
                    storageBytes: totalSourceBytes
                }
            },
        });

        // Update bot status
        await prisma.bot.update({
            where: { id: botId },
            data: { status: "active" },
        });

        revalidatePath(`/dashboard/bot/${botId}/sources`);
        return { success: true, id: dataSource.id, chunks: totalChunks, pages: pages.length };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";

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
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

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

        const supabaseAdmin = createAdminClient();
        const { data, error } = await supabaseAdmin.storage
            .from("docs")
            .download(dataSource.filePath);

        if (error || !data) throw new Error("Failed to download file for re-training");

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
                    ${JSON.stringify(embeddings[i])}::vector(1536),
                    ${JSON.stringify(textChunks[i].metadata)}::jsonb
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
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const dataSource = await prisma.dataSource.findFirst({
        where: { id: dataSourceId, userId: user.id },
    });

    if (!dataSource) throw new Error("Data source not found");

    // Delete file from storage if it's a file source
    if (dataSource.filePath) {
        const supabaseAdmin = createAdminClient();
        await supabaseAdmin.storage.from("docs").remove([dataSource.filePath]);
    }

    // Decrement storage usage if storageBytes is in metadata
    const metadata = dataSource.metadata as any;
    if (metadata?.storageBytes) {
        await updateStorageUsage(user.id, -metadata.storageBytes);
    }

    // Cascade delete handles chunks
    await prisma.dataSource.delete({ where: { id: dataSourceId } });

    revalidatePath(`/dashboard/bot/${dataSource.botId}`);
    return { success: true };
}

/**
 * Get the training status of all data sources for a bot.
 */
export async function getTrainingStatus(botId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

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
