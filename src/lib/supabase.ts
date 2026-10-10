import { createClient } from '@supabase/supabase-js';
import { prisma } from './prisma';
import { storageService } from './storage/service';

/**
 * KnoChat Unified Client Library
 * Handles both Prisma (ORM) and Supabase (Storage, Auth, Vault)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Service role key is private and should NEVER be used on the client
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 2. Supabase Clients
// Regular client for Auth and RLS-compliant operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend-only operations (Vault, Storage management, etc.)
// CAUTION: Only use in Server Components, API routes, or Server Actions.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// 3. Specialized Helpers
export const knoChat = {
    /**
     * Vector Search Helper (RAG)
     * Uses Prisma $queryRaw for high-performance pgvector similarity search
     */
    async vectorSearch(botId: string, queryEmbedding: number[], limit = 5, minSimilarity = 0.5) {
        // We use cosine similarity (1 - distance)
        const results = await prisma.$queryRaw`
      SELECT 
        id, 
        content, 
        metadata, 
        1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
      FROM document_chunks
      WHERE bot_id = ${botId}::uuid
      AND 1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) > ${minSimilarity}
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;
        return results;
    },

    /**
     * Storage Helpers
     */
    storage: {
        async uploadDocument(userId: string, fileName: string, body: Buffer | File) {
            const key = `${userId}/${fileName}`;
            try {
                await storageService.upload({ bucket: 'docs', key, contentType: body instanceof File ? body.type : 'application/octet-stream' }, body, true);
                return { data: { path: key }, error: null };
            } catch (error) { return { data: null, error }; }
        },

        async getPublicUrl(path: string) {
            return storageService.publicUrl({ bucket: 'docs', key: path });
        },
    },

    /**
     * Supabase Vault (BYOK) Helpers
     * Secrets are stored in the 'vault' schema, accessible via extension
     */
    vault: {
        async getSecret(secretId: string) {
            // Direct access to vault.decrypted_secrets for backend logic
            const { data, error } = await supabaseAdmin
                .from('decrypted_secrets')
                .select('decrypted_secret')
                .eq('id', secretId)
                .single();

            return { data: data?.decrypted_secret, error };
        }
    }
};
