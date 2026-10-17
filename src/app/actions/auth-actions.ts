"use server";

import { authService } from "@/services/auth";

/**
 * Checks password status for the authenticated user only.
 * Prevents anonymous user enumeration and memory exhaustion from listUsers().
 */
export async function checkUserPasswordStatus(_email?: string): Promise<{
    exists: boolean;
    hasPassword: boolean;
}> {
    try {
        const user = await authService.requireUser();
        return {
            exists: Boolean(user),
            hasPassword: true,
        };
    } catch {
        return { exists: false, hasPassword: false };
    }
}
