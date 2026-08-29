import { z } from 'zod';

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  DODO_API_KEY: z.string().min(1),
  DODO_WEBHOOK_SECRET: z.string().min(1),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const isServer = typeof window === 'undefined';

// Validate client variables (always)
const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!clientParsed.success) {
  console.error('❌ Invalid client environment variables:', clientParsed.error.format());
  throw new Error('Invalid client environment variables');
}

// Validate server variables (only on server)
let serverData: z.infer<typeof serverSchema> = {} as any;
if (isServer) {
  const serverParsed = serverSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DODO_API_KEY: process.env.DODO_API_KEY,
    DODO_WEBHOOK_SECRET: process.env.DODO_WEBHOOK_SECRET,
  });

  if (!serverParsed.success) {
    console.error('❌ Invalid server environment variables:', serverParsed.error.format());
    throw new Error('Invalid server environment variables');
  }
  serverData = serverParsed.data;
}

export const env = {
  ...clientParsed.data,
  ...serverData,
  NODE_ENV: process.env.NODE_ENV || 'development',
};
