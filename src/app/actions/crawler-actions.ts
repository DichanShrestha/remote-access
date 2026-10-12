import { authService } from "@/services/auth";
"use server";

import { createClient } from "@/lib/supabase/server";
import { sanitizeInput, getStringSize } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { crawlWebsite as performCrawl } from "@/lib/documents/crawler";
import { chunkText } from "@/lib/ai/chunker";
import { generateEmbeddings, getActiveEmbeddingModel } from "@/lib/ai/embeddings";
import { enforceStorageGuard, updateStorageUsage } from "@/lib/guards/resource-manager";
import { revalidatePath } from "next/cache";

export type CrawlResult = {
    name: string;
    description: string;
    favicon: string;
    themeColor: string;
};

/**
 * Fetches metadata from a website to auto-populate the chatbot configuration.
 * Refactored to use Jina AI Reader API instead of Cheerio.
 */
export async function crawlWebsite(url: string): Promise<CrawlResult> {
    
    const user = await authService.requireUser();

    

    try {
        // Add protocol if missing
        let targetUrl = url.trim();
        if (!targetUrl.startsWith("http")) {
            targetUrl = `https://${targetUrl}`;
        }

        if (!process.env.JINA_API_KEY) {
            console.warn("[INGESTION ERROR]: Jina API pipeline failed (API Key missing)");
            throw new Error("JINA_API_KEY is not configured.");
        }

        const response = await fetch(`https://r.jina.ai/${targetUrl}`, {
            headers: {
                "Authorization": `Bearer ${process.env.JINA_API_KEY}`,
                "Accept": "text/plain",
            },
            signal: AbortSignal.timeout(15000), // 15s timeout
        });

        if (!response.ok) {
            console.warn(`[INGESTION ERROR]: Jina API pipeline failed for ${targetUrl} with status ${response.status}`);
            throw new Error(`Failed to crawl URL: ${response.status} ${response.statusText}`);
        }

        const markdown = await response.text();
        console.log("markdown in crawler-actiom.ts", markdown)

        // Extract basic metadata from markdown
        const titleMatch = markdown.match(/^#\s+(.*)/m);
        const title = titleMatch ? titleMatch[1].trim() : new URL(targetUrl).hostname;

        // Use the first 300 chars of markdown as description
        const description = markdown.slice(0, 300).replace(/\s+/g, ' ').trim() || "";

        return {
            name: sanitizeInput(title).slice(0, 50),
            description: sanitizeInput(description).slice(0, 200),
            favicon: `https://www.google.com/s2/favicons?domain=${targetUrl}&sz=128`,
            themeColor: "#000000",
        };
    } catch (error) {
        console.warn(`[INGESTION ERROR]: Jina API pipeline failed for ${url}`, error);
        // Return a default result if crawling fails
        return {
            name: new URL(url.startsWith("http") ? url : `https://${url}`).hostname,
            description: "",
            favicon: `https://www.google.com/s2/favicons?domain=${url}&sz=128`,
            themeColor: "#000000",
        };
    }
}

/**
 * Enhanced crawl action that extracts all valuable content, generates embeddings, and stores them.
 */
export async function crawlAndStoreUrl(botId: string, url: string) {
    
    const user = await authService.requireUser();

    

    // Basic URL validation
    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http")) targetUrl = `https://${targetUrl}`;

    try {
        const parsedUrl = new URL(targetUrl);

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

        // Use the robust multi-page crawler (Limit to 15 pages for this specific action)
        const pages = await performCrawl(parsedUrl.href, 15, 2);

        if (pages.length === 0) throw new Error("No content found at the provided URL.");

        // Calculate total size for storage guard
        const totalSourceBytes = pages.reduce((acc, page) => acc + getStringSize(page.content), 0);

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
            data: { status: "embedding" },
        });

        let totalChunks = 0;
        const allChunksToInsert: Array<{ content: string; embedding: number[]; metadata: any }> = [];

        // 1. Process each page: Chunk & Embed (collect all)
        for (const page of pages) {
            const textChunks = chunkText(page.content);
            if (textChunks.length === 0) continue;

            const pageEmbeddings = await generateEmbeddings(textChunks.map((c) => c.content));

            for (let i = 0; i < textChunks.length; i++) {
                allChunksToInsert.push({
                    content: textChunks[i].content,
                    embedding: pageEmbeddings[i],
                    metadata: {
                        ...textChunks[i].metadata,
                        url: page.url,
                        title: page.title, // Smart Meta: Include pageTitle
                        embeddingModel: getActiveEmbeddingModel(),
                    }
                });
            }
            totalChunks += textChunks.length;
        }

        // 2. Batch store chunks with embeddings (Requirement: Batch Insert)
        // Split into batches of 50 to ensure we don't exceed SQL parameter limits
        const batchSize = 50;
        for (let i = 0; i < allChunksToInsert.length; i += batchSize) {
            const batch = allChunksToInsert.slice(i, i + batchSize);

            // Using executeRaw with a manually built VALUES clause for vector support
            // We use JSON.stringify(chunk.embedding) to match pgvector's expectation
            const valueRows = batch.map((_, index) => {
                const offset = index * 6;
                return `(uuid_generate_v4(), $${offset + 1}::uuid, $${offset + 2}::uuid, $${offset + 3}::uuid, $${offset + 4}, $${offset + 5}::vector, $${offset + 6}::jsonb)`;
            }).join(', ');

            const params = [];
            for (const chunk of batch) {
                params.push(dataSource.id, botId, user.id, chunk.content, JSON.stringify(chunk.embedding), JSON.stringify(chunk.metadata));
            }

            await prisma.$executeRawUnsafe(
                `INSERT INTO document_chunks (id, data_source_id, bot_id, user_id, content, embedding, metadata) VALUES ${valueRows}`,
                ...params
            );
        }

        await updateStorageUsage(user.id, totalSourceBytes);

        // Finalize status
        await prisma.dataSource.update({
            where: { id: dataSource.id },
            data: {
                status: "complete",
                metadata: {
                    chunks: totalChunks,
                    pages: pages.length,
                    storageBytes: totalSourceBytes
                }
            },
        });

        await prisma.bot.update({
            where: { id: botId },
            data: { status: "active" },
        });

        revalidatePath(`/dashboard/bot/${botId}/sources`);
        return { success: true, pages: pages.length, chunks: totalChunks };

    } catch (error) {
        console.error("Crawl and Store failed:", error);
        const message = error instanceof Error ? error.message : "Scraping failed";

        // Attempt to mark bot as error if training fails
        try {
            await prisma.bot.update({
                where: { id: botId },
                data: { status: "error" },
            });
        } catch (e) { /* ignore */ }

        throw new Error(message);
    }
}
