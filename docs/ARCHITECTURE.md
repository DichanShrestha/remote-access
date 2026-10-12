# Architecture & Repository Audit (Chunk 0)

## Current Stack
- **Framework:** Next.js (App Router) v16+ with React 19
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Package Manager:** npm

## Database & Authentication
- **ORM:** Prisma v7 with `@prisma/adapter-pg` (PostgreSQL)
- **Auth & DB Provider:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **Current Schema:** Contains a `User` model (linked via UUID to Supabase auth) and a `WebhookEvent` model.

## Integrations
- **Payments:** Dodo Payments (`dodopayments` SDK is present)
- **AI & LLM Engine:** OpenRouter (via OpenAI SDK compatible endpoint `https://openrouter.ai/api/v1`)
  - Primary Chat Model: `anthropic/claude-haiku-5.5` (configurable via `AI_CHAT_MODEL`)
  - Embeddings Model: `openai/text-embedding-3-small` (configurable via `AI_EMBEDDING_MODEL`)
  - Authentication: `OPENROUTER_API_KEY`
  - Re-embedding Migration: `src/lib/ai/re-embed.ts` tracks embedding model in chunk metadata to safely prevent model mixing.

## Current Configuration
- The `.env.example` file documents all required environment variables.
- Project name in `package.json` is `builderstory`, but the specification refers to the product as **Smart Pages**.

## Alignment with Master Specification
- The repository is set up with a modular structure (`src/app`, `src/components`, `src/lib`, `src/services`, `src/db`), which aligns perfectly with the spec's directive to build a "modular monolith."
- The base foundation is established with OpenRouter configured across chatbot responses, RAG embeddings, and editor generation.

