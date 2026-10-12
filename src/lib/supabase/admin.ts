import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Polyfill WebSocket for Node runtime environments where native WebSocket is not present
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).WebSocket === 'undefined') {
    (globalThis as any).WebSocket = class WebSocket {
        constructor() {}
        addEventListener() {}
        removeEventListener() {}
        send() {}
        close() {}
    };
}

/**
 * Admin Supabase client using the service role key.
 * ⚠️  SERVER-ONLY — never import this in client components.
 * Bypasses RLS for administrative operations.
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
        );
    }

    return createSupabaseClient<Database>(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
        realtime: {
            createSocket: () => null as any,
        },
    });
}
