"use server";

import { authService } from "@/services/auth";
import db from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { storageService } from '@/lib/storage/service';

/**
 * Settings Server Actions
 * Handles:
 * 1. Debounced Username Availability Check
 * 2. Account Name & Username Updates
 * 3. Permanent Page Deletion
 * 4. Permanent Account Deletion
 * 5. Helper export for API chat key lookup
 */

export async function checkUsernameAvailability(username: string): Promise<{ state: "available" | "unavailable" | "current" | "invalid" }> {
  try {
    const user = await authService.requireUser();
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 30) {
      return { state: "invalid" };
    }

    if (user.profile && cleanUsername === user.profile.username) {
      return { state: "current" };
    }

    const available = await authService.isUsernameAvailable(cleanUsername);
    return { state: available ? "available" : "unavailable" };
  } catch {
    return { state: "unavailable" };
  }
}

export async function exportAccountData() {
  const user = await authService.requireUser();
  const data = await db.user.findUnique({ where: { id: user.id }, include: {
    profile: { include: { pages: { include: { leads: true } }, website: true } },
    subscriptions: { select: { planId: true, status: true, trialStart: true, trialEnd: true, currentPeriodStart: true, currentPeriodEnd: true, cancelAtPeriodEnd: true, aiRepliesUsed: true } },
    usage: { select: { pageMediaBytes: true, knowledgeBytes: true, indexedTokens: true } },
    bots: { include: { dataSources: { select: { id: true, type: true, source: true, status: true, metadata: true, filePath: true, createdAt: true } }, chunks: { select: { content: true, metadata: true } }, qaPairs: true, chatMessages: true, leads: true } },
  } });
  if (!data) throw new Error('Account data not found');
  const bots = await Promise.all(data.bots.map(async (bot) => ({
    ...bot,
    dataSources: await Promise.all(bot.dataSources.map(async (source) => ({
      ...source,
      downloadUrl: source.filePath ? await storageService.signedUrl({ bucket: 'docs', key: source.filePath }, 3600).catch(() => null) : null,
      filePath: undefined,
    }))),
  })));
  return JSON.parse(JSON.stringify({ ...data, bots }, (_key, value) => typeof value === 'bigint' ? value.toString() : value));
}

export async function updateAccountProfile(data: { name: string; username: string }): Promise<{ success?: boolean; error?: string }> {
  try {
    const user = await authService.requireUser();
    const trimmedName = data.name.trim();
    const newUsername = data.username.trim().toLowerCase();

    if (!trimmedName) {
      return { error: "Name cannot be empty." };
    }
    if (trimmedName.length > 80) {
      return { error: "Name cannot exceed 80 characters." };
    }

    if (!user.profile) {
      await db.user.update({ where: { id: user.id }, data: { name: trimmedName } });
      revalidatePath("/dashboard/settings");
      return { success: true };
    }

    // Validate username if changed
    if (newUsername !== user.profile.username) {
      const isAvailable = await authService.isUsernameAvailable(newUsername);
      if (!isAvailable) {
        return { error: "Username is unavailable, reserved, or invalid (use 3–30 letters, numbers, dashes, or underscores)." };
      }
    }

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { name: trimmedName },
      });

      await tx.profile.update({
        where: { id: user.profile!.id },
        data: { 
          displayName: trimmedName,
          username: newUsername,
        },
      });
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    revalidatePath(`/${newUsername}`);
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Failed to update profile." };
  }
}

export async function updateAccountName(name: string): Promise<{ success?: boolean; error?: string }> {
  return updateAccountProfile({ name, username: "" });
}

export async function deleteUserPage(): Promise<{ success?: boolean; error?: string }> {
  try {
    const user = await authService.requireUser();
    
    if (!user.profile) {
      return { error: "No profile found for this account." };
    }

    const pageCount = await db.page.count({ where: { profileId: user.profile.id } });
    if (!pageCount) {
      return { error: "No page found to delete." };
    }

    const media = await db.pageMediaAsset.findMany({ where: { userId: user.id } });
    if (media.length) await storageService.delete(media.map((asset) => ({ bucket: asset.bucket, key: asset.objectKey })));
    await db.pageMediaAsset.deleteMany({ where: { userId: user.id } });
    await db.usage.updateMany({ where: { userId: user.id }, data: { pageMediaBytes: 0 } });

    await db.$transaction([
      db.page.deleteMany({ where: { profileId: user.profile.id } }),
      db.website.deleteMany({ where: { profileId: user.profile.id } }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pages");
    revalidatePath("/dashboard/settings");
    revalidatePath(`/${user.profile.username}`);
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Failed to delete page." };
  }
}

export async function deleteUserAccount(): Promise<{ success?: boolean; error?: string }> {
  try {
    const user = await authService.requireUser();

    const [media, sources, catalog] = await Promise.all([
      db.pageMediaAsset.findMany({ where: { userId: user.id } }),
      db.dataSource.findMany({ where: { userId: user.id, filePath: { not: null } }, select: { filePath: true } }),
      db.catalogItem.findMany({ where: { userId: user.id }, include: { images: { select: { publicUrl: true } } } }),
    ]);
    const objects = media.map((asset) => ({ bucket: asset.bucket, key: asset.objectKey }));
    for (const source of sources) if (source.filePath) objects.push({ bucket: 'docs', key: source.filePath });
    for (const image of catalog.flatMap((item) => item.images)) {
      const key = storageService.keyFromPublicUrl('catalog-assets', image.publicUrl);
      if (key) objects.push({ bucket: 'catalog-assets', key });
    }
    if (objects.length) await storageService.delete(objects);

    // Permanently delete user from Prisma DB.
    // Cascades to Profile, Page, Subscriptions, Usage, Bots, Leads, etc.
    await db.user.delete({
      where: { id: user.id },
    });

    // Cleanly delete from Supabase Auth so no orphaned auth credentials remain
    try {
      const supabaseAdmin = createAdminClient();
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    } catch (authErr) {
      console.warn("Could not delete Supabase auth user:", authErr);
    }

    // Log the user out from Supabase Auth session
    const supabase = await createClient();
    await supabase.auth.signOut();

    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Failed to delete account." };
  }
}

/**
 * Helper exported for chat route compatibility
 */
export async function getUserApiKey(_userId: string): Promise<string | null> {
  return null;
}
