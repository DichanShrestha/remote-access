"use server";

import { authService } from "@/services/auth";
import db from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
      return { error: "Profile not found." };
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

    // Server-side authorization check: verify ownership of page
    const page = await db.page.findUnique({
      where: { profileId: user.profile.id },
    });

    if (!page) {
      return { error: "No page found to delete." };
    }

    await db.page.delete({
      where: { id: page.id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Failed to delete page." };
  }
}

export async function deleteUserAccount(): Promise<{ success?: boolean; error?: string }> {
  try {
    const user = await authService.requireUser();

    // Permanently delete user from Prisma DB.
    // Cascades to Profile, Page, Subscriptions, Usage, Bots, Leads, etc.
    await db.user.delete({
      where: { id: user.id },
    });

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
