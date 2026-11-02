import { createClient } from '@/lib/supabase/server';
import db from '@/lib/prisma';
import { AccountSuspendedError, UnauthorizedError } from '@/lib/errors';
import { z } from 'zod';

const RESERVED_USERNAMES = new Set([
  'admin', 'root', 'support', 'help', 'api', 'app', 'dashboard', 'login', 'signup',
  'settings', 'profile', 'billing', 'pricing', 'about', 'contact', 'terms', 'privacy',
]);

const usernameSchema = z.string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be less than 30 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and dashes");

export const authService = {
  async ensureActive(userId: string) {
    const account = await db.user.findUnique({ where: { id: userId }, select: { suspendedAt: true } });
    if (account?.suspendedAt) throw new AccountSuspendedError();
  },

  async requireUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      throw new UnauthorizedError('User not authenticated');
    }

    // Ensure user exists in our DB
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });

    if (!dbUser) {
      // Create user if they just signed up via Supabase but aren't in Prisma yet
      return await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
        include: { profile: true },
      });
    }

    if (dbUser.suspendedAt) throw new AccountSuspendedError();

    return dbUser;
  },

  async requireCreator() {
    const user = await this.requireUser();
    if (!user.profile) throw new UnauthorizedError('Creator access required');
    return user;
  },

  async isUsernameAvailable(username: string): Promise<boolean> {
    const lowerUsername = username.toLowerCase();

    if (RESERVED_USERNAMES.has(lowerUsername)) {
      return false;
    }

    const parsed = usernameSchema.safeParse(lowerUsername);
    if (!parsed.success) {
      return false;
    }

    const existing = await db.profile.findUnique({
      where: { username: lowerUsername },
    });

    return !existing;
  },

  async createProfile(userId: string, data: { username: string; displayName: string; type: 'CREATOR' | 'BUSINESS' }) {
    const isAvailable = await this.isUsernameAvailable(data.username);
    if (!isAvailable) {
      throw new Error('Username is not available or invalid');
    }

    return await db.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: {
          userId,
          username: data.username.toLowerCase(),
          displayName: data.displayName,
          type: data.type,
        },
      });

      // Auto-create their homepage. Additional pages are created from the
      // dashboard once the business is ready.
      await tx.page.create({
        data: {
          profileId: profile.id,
          title: data.displayName,
          slug: '',
          pageType: 'HOME',
          navOrder: 0,
          draftConfig: {},
        },
      });

      return profile;
    });
  }
};
