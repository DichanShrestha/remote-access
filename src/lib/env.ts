import { z } from 'zod';

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  DODO_API_KEY: z.string().min(1),
  DODO_WEBHOOK_SECRET: z.string().min(1),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENROUTER_BASE_URL: z.string().url().optional(),
  AI_CHAT_MODEL: z.string().optional(),
  AI_EMBEDDING_MODEL: z.string().optional(),
}).refine(data => !!(data.OPENROUTER_API_KEY || data.OPENAI_API_KEY), {
  message: "OPENROUTER_API_KEY must be provided (or OPENAI_API_KEY for legacy fallback)",
  path: ["OPENROUTER_API_KEY"],
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
  const invalidVars = Object.keys(clientParsed.error.flatten().fieldErrors).join(', ');
  console.error('❌ Invalid client environment variables:', clientParsed.error.format());
  throw new Error(`Invalid client environment variables: ${invalidVars}`);
}

// Validate server variables (only on server)
let serverData: z.infer<typeof serverSchema> = {} as any;
if (isServer) {
  const serverParsed = serverSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DODO_API_KEY: process.env.DODO_API_KEY,
    DODO_WEBHOOK_SECRET: process.env.DODO_WEBHOOK_SECRET,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL,
    AI_CHAT_MODEL: process.env.AI_CHAT_MODEL,
    AI_EMBEDDING_MODEL: process.env.AI_EMBEDDING_MODEL,
  });

  if (!serverParsed.success) {
    const invalidVars = Object.keys(serverParsed.error.flatten().fieldErrors).join(', ');
    console.error('❌ Invalid server environment variables:', serverParsed.error.format());
    throw new Error(`Invalid server environment variables: ${invalidVars}`);
  }
  serverData = serverParsed.data;
}

export const env = {
  ...clientParsed.data,
  ...serverData,
  NODE_ENV: process.env.NODE_ENV || 'development',
};
