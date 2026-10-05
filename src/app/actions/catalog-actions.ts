"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateGeminiEmbedding } from "@/lib/ai/gemini-embeddings";

async function fetchImageAsBase64(url: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        return {
            imageBase64: buffer.toString('base64'),
            mimeType
        };
    } catch (e) {
        console.error("Failed to fetch image for embedding", e);
        return null;
    }
}

async function processImageEmbeddings(
    botId: string, 
    itemId: string, 
    title: string, 
    description: string, 
    triggerQueries: string[], 
    imageIds: string[]
) {
    if (imageIds.length === 0) return;
    
    const imagesToProcess = await prisma.catalogImage.findMany({
        where: { id: { in: imageIds } }
    });

    // Run embeddings in parallel
    await Promise.all(imagesToProcess.map(async (img) => {
        try {
            const textToEmbed = `Title: ${title}\nDescription: ${description || ''}\nTriggers: ${triggerQueries.join(', ')}\nCaption: ${img.caption || ''}`;
            let embeddingParams: any = { text: textToEmbed };
            
            const imageData = await fetchImageAsBase64(img.publicUrl);
            if (imageData) {
                embeddingParams.imageBase64 = imageData.imageBase64;
                embeddingParams.mimeType = imageData.mimeType;
            }

            const vector = await generateGeminiEmbedding(embeddingParams);
            const vectorString = `[${vector.join(',')}]`;

            await prisma.$executeRaw`
                UPDATE "catalog_images" 
                SET "embedding" = ${vectorString}::vector, "status" = 'ready'
                WHERE "id" = ${img.id}::uuid
            `;
        } catch (err) {
            console.error(`Failed to generate embedding for image ${img.id}`, err);
            await prisma.catalogImage.update({
                where: { id: img.id },
                data: { status: "failed" }
            });
        }
    }));
}

export async function createVisualSet(
    botId: string,
    title: string,
    description: string,
    triggerQueries: string[],
    images: { publicUrl: string; caption: string | null; order: number }[],
    price?: number | null,
    currency?: string | null,
    redirectUrl?: string | null
) {
    const normalizedTriggers = triggerQueries.map(q => q.toLowerCase().trim()).filter(Boolean);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");
    if (!title) throw new Error("Title is required");
    if (!images || images.length === 0) throw new Error("At least one image is required");

    const newSet = await prisma.catalogItem.create({
        data: {
            botId,
            userId: user.id,
            title,
            description,
            triggerQueries: normalizedTriggers,
            price: price ?? null,
            currency: currency ?? null,
            redirectUrl: redirectUrl ?? null,
            status: "ready", // The set itself is ready immediately
            images: {
                create: images.map(img => ({
                    publicUrl: img.publicUrl,
                    caption: img.caption,
                    order: img.order,
                    status: "processing"
                }))
            }
        }
    });

    const createdImages = await prisma.catalogImage.findMany({ where: { catalogItemId: newSet.id } });
    const imageIds = createdImages.map(img => img.id);

    // Run processing asynchronously but await it to ensure it completes before response
    // (In a high-load environment, you might push to an SQS queue instead)
    await processImageEmbeddings(botId, newSet.id, title, description, normalizedTriggers, imageIds);

    revalidatePath(`/dashboard/bot/${botId}/catalog`);
    return { success: true, id: newSet.id };
}

export async function updateVisualSet(
    itemId: string,
    botId: string,
    title: string,
    description: string,
    triggerQueries: string[],
    images: { id?: string; publicUrl: string; caption: string | null; order: number }[],
    price?: number | null,
    currency?: string | null,
    redirectUrl?: string | null
) {
    const normalizedTriggers = triggerQueries.map(q => q.toLowerCase().trim()).filter(Boolean);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");
    if (!title) throw new Error("Title is required");

    let coreInfoChanged = false;
    
    // Check if title, desc, or triggers changed to know if we need a new embedding for ALL images
    const oldSet = await prisma.catalogItem.findUnique({
        where: { id: itemId }
    });
    
    if (oldSet) {
        if (oldSet.title !== title || 
            oldSet.description !== description || 
            oldSet.triggerQueries.join(',') !== normalizedTriggers.join(',')) {
            coreInfoChanged = true;
        }
    }

    const imagesToProcess: string[] = [];

    // Start a transaction to update the set and manage its images
    await prisma.$transaction(async (tx) => {
        // 1. Update main set
        await tx.catalogItem.update({
            where: { id: itemId, botId, userId: user.id },
            data: {
                title,
                description,
                triggerQueries: normalizedTriggers,
                price: price ?? null,
                currency: currency ?? null,
                redirectUrl: redirectUrl ?? null,
                updatedAt: new Date()
            }
        });

        // 2. Fetch existing images to compute deletions and changes
        const existingImages = await tx.catalogImage.findMany({
            where: { catalogItemId: itemId }
        });

        const incomingImageIds = new Set(images.map(img => img.id).filter(Boolean));
        
        // Find images to delete
        const imagesToDelete = existingImages.filter(img => !incomingImageIds.has(img.id));
        
        if (imagesToDelete.length > 0) {
            await tx.catalogImage.deleteMany({
                where: { id: { in: imagesToDelete.map(img => img.id) } }
            });
            
            // Clean up deleted images from storage
            try {
                const supabaseAdmin = createAdminClient();
                const pathsToDelete = imagesToDelete.map(img => {
                    const urlObj = new URL(img.publicUrl);
                    const pathParts = urlObj.pathname.split("/catalog-assets/");
                    if (pathParts.length > 1) {
                        return decodeURIComponent(pathParts[1]);
                    }
                    return null;
                }).filter(Boolean) as string[];

                if (pathsToDelete.length > 0) {
                    await supabaseAdmin.storage.from("catalog-assets").remove(pathsToDelete);
                }
            } catch (e) {
                console.error("Failed to delete removed images from storage", e);
            }
        }

        // 3. Upsert images
        for (const img of images) {
            if (img.id) {
                const existingImg = existingImages.find(e => e.id === img.id);
                const captionChanged = existingImg && existingImg.caption !== img.caption;
                
                if (coreInfoChanged || captionChanged) {
                    imagesToProcess.push(img.id);
                    await tx.catalogImage.update({
                        where: { id: img.id },
                        data: { caption: img.caption, order: img.order, status: "processing" }
                    });
                } else {
                    await tx.catalogImage.update({
                        where: { id: img.id },
                        data: { caption: img.caption, order: img.order }
                    });
                }
            } else {
                const newImg = await tx.catalogImage.create({
                    data: {
                        catalogItemId: itemId,
                        publicUrl: img.publicUrl,
                        caption: img.caption,
                        order: img.order,
                        status: "processing"
                    }
                });
                imagesToProcess.push(newImg.id);
            }
        }
    });

    if (imagesToProcess.length > 0) {
        await processImageEmbeddings(botId, itemId, title, description, normalizedTriggers, imagesToProcess);
    }

    revalidatePath(`/dashboard/bot/${botId}/catalog`);
    return { success: true };
}

export async function getVisualSets(botId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const items = await prisma.catalogItem.findMany({
        where: { botId, userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            images: {
                orderBy: { order: 'asc' }
            }
        }
    });

    return items;
}

export async function deleteVisualSet(itemId: string, botId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Fetch images before deletion for storage cleanup
    const item = await prisma.catalogItem.findUnique({
        where: { id: itemId, botId, userId: user.id },
        include: { images: true }
    });

    if (!item) return { success: false };

    await prisma.catalogItem.delete({
        where: { id: itemId, botId, userId: user.id }
    });

    // Cleanup storage
    try {
        const supabaseAdmin = createAdminClient();
        const pathsToDelete = item.images.map(img => {
            const urlObj = new URL(img.publicUrl);
            const pathParts = urlObj.pathname.split("/catalog-assets/");
            if (pathParts.length > 1) {
                return decodeURIComponent(pathParts[1]);
            }
            return null;
        }).filter(Boolean) as string[];

        if (pathsToDelete.length > 0) {
            await supabaseAdmin.storage.from("catalog-assets").remove(pathsToDelete);
        }
    } catch (e) {
        console.error("Failed to cleanup deleted Visual Set from storage", e);
    }

    revalidatePath(`/dashboard/bot/${botId}/catalog`);
    return { success: true };
}

export async function searchVisualSets(
    botId: string,
    query: string,
    matchCount: number = 5
) {
    const normalizedQuery = query.toLowerCase().trim();

    const allItems = await prisma.catalogItem.findMany({
        where: { botId, status: 'ready' },
        include: { images: { orderBy: { order: 'asc' } } }
    });

    let results: any[] = [];

    // 1 & 2. Trigger Matches & Keyword Matches
    for (const item of allItems) {
        const triggers = item.triggerQueries || [];
        
        // Exact trigger match
        if (triggers.some(t => t.toLowerCase() === normalizedQuery)) {
            results.push({ ...item, similarity: 1.0 });
            continue;
        }
        
        // Partial trigger match (e.g. "how to setup knowchat" contains "setup knowchat")
        // Only do partial match if the trigger is substantial (e.g. > 3 chars) to avoid false positives on tiny words
        if (triggers.some(t => t.length > 3 && (normalizedQuery.includes(t.toLowerCase()) || t.toLowerCase().includes(normalizedQuery)))) {
            results.push({ ...item, similarity: 0.95 });
            continue;
        }

        // Title/Description keyword match
        if (
            item.title.toLowerCase().includes(normalizedQuery) || 
            (item.description && item.description.toLowerCase().includes(normalizedQuery))
        ) {
            results.push({ ...item, similarity: 0.8 });
            continue;
        }
    }

    // Sort early so we can exclude top matches from semantic search
    results.sort((a, b) => b.similarity - a.similarity);
    if (results.length > matchCount) {
        results = results.slice(0, matchCount);
    }

    // 3. Gemini Vision Embedding Semantic Search (Strong Fallback)
    if (results.length < matchCount) {
        try {
            const queryEmbedding = await generateGeminiEmbedding({ text: query }, "RETRIEVAL_QUERY");
            const vectorString = `[${queryEmbedding.join(',')}]`;

            // Exclude already found items
            const excludeIds = results.map(r => `'${r.id}'`).join(',');
            const excludeClause = excludeIds ? `AND i.catalog_item_id NOT IN (${excludeIds})` : '';

            // Group by item_id and get the max similarity among its images
            const semanticMatches = await prisma.$queryRawUnsafe<any[]>(`
                SELECT i.catalog_item_id as "id", MAX(1 - (i.embedding <=> $1::vector)) as similarity
                FROM "catalog_images" i
                JOIN "catalog_items" t ON i.catalog_item_id = t.id
                WHERE t.bot_id = $2::uuid AND t.status = 'ready' AND i.status = 'ready' AND i.embedding IS NOT NULL ${excludeClause}
                GROUP BY i.catalog_item_id
                ORDER BY similarity DESC
                LIMIT $3
            `, vectorString, botId, matchCount - results.length);

            if (semanticMatches.length > 0) {
                const semanticIds = semanticMatches.map(sm => sm.id);
                const fetchedItems = await prisma.catalogItem.findMany({
                    where: { id: { in: semanticIds } },
                    include: {
                        images: {
                            orderBy: { order: 'asc' }
                        }
                    }
                });

                // Merge with similarity scores and maintain order
                const scoredItems = semanticMatches.map(sm => {
                    const item = fetchedItems.find(fi => fi.id === sm.id);
                    return item ? { ...item, similarity: sm.similarity } : null;
                }).filter(Boolean);

                results = [...results, ...scoredItems as any[]];
            }
        } catch (err) {
            console.error("Semantic search fallback failed:", err);
            // Non-fatal, just rely on the keyword matches found so far
        }
    }

    // Sort final results by similarity descending
    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, matchCount);
}
