"use server";
import { authService } from "@/services/auth";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

/**
 * Settings server actions.
 * Handles BYOK (Bring Your Own Key) encrypted storage and profile updates.
 */

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret) throw new Error("ENCRYPTION_SECRET not configured");
    // Create a 32-byte key from the secret
    return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt an API key before storing.
 */
function encryptKey(plainKey: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plainKey, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    // Store as: iv:authTag:encrypted
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypt a stored API key.
 */
function decryptKey(encryptedData: string): string {
    const key = getEncryptionKey();
    const [ivHex, authTagHex, encrypted] = encryptedData.split(":");

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

/**
 * Save a user's OpenAI API key (encrypted).
 */
export async function saveApiKey(apiKey: string) {

    const user = await authService.requireUser();



    // Validate key format
    if (!apiKey.startsWith("sk-") || apiKey.length < 20) {
        throw new Error("Invalid OpenAI API key format");
    }

    const encrypted = encryptKey(apiKey);
    const hint = `sk-...${apiKey.slice(-4)}`; // Show only last 4 chars

    await prisma.userApiKey.upsert({
        where: {
            userId_provider: {
                userId: user.id,
                provider: "openai",
            },
        },
        create: {
            userId: user.id,
            provider: "openai",
            encryptedKey: encrypted,
            keyHint: hint,
        },
        update: {
            encryptedKey: encrypted,
            keyHint: hint,
        },
    });

    revalidatePath("/dashboard");
    return { success: true, hint };
}

/**
 * Get the user's API key hint (not the actual key).
 */
export async function getApiKeyHint() {

    const user = await authService.requireUser();



    const key = await prisma.userApiKey.findUnique({
        where: {
            userId_provider: {
                userId: user.id,
                provider: "openai",
            },
        },
        select: { keyHint: true },
    });

    return key?.keyHint ?? null;
}

/**
 * Get the decrypted API key for internal use (server-side only).
 */
export async function getUserApiKey(userId: string): Promise<string | null> {
    const key = await prisma.userApiKey.findUnique({
        where: {
            userId_provider: {
                userId,
                provider: "openai",
            },
        },
    });

    if (!key) return null;

    try {
        return decryptKey(key.encryptedKey);
    } catch {
        console.error("[Settings] Failed to decrypt API key for user:", userId);
        return null;
    }
}

/**
 * Delete the user's stored API key.
 */
export async function deleteApiKey() {

    const user = await authService.requireUser();



    await prisma.userApiKey.deleteMany({
        where: { userId: user.id, provider: "openai" },
    });

    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * Update user profile.
 */
export async function updateProfile(data: { fullName?: string }) {

    const user = await authService.requireUser();



    await prisma.profile.update({
        where: { id: user.id },
        data: {
            ...(data.fullName && { fullName: data.fullName }),
        },
    });

    revalidatePath("/dashboard");
    return { success: true };
}
