/**
 * Centralized AI provider configuration.
 *
 * Gemini is the default provider. OpenAI is kept as a secondary provider
 * (used when a user has a stored BYOK OpenAI key, or for explicit opt-in).
 *
 * Model IDs:
 *   - Default: gemini-2.5-flash-lite  (Gemini — fast, cost-efficient)
 *   - Fallback: gpt-4o-mini           (OpenAI — used for BYOK flows)
 *
 * Environment variables required:
 *   GOOGLE_GENERATIVE_AI_API_KEY — Gemini API key (for default provider)
 *   OPENAI_API_KEY               — OpenAI API key (for BYOK / fallback)
 */

import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

// ─── Model IDs ───────────────────────────────────────────────────────────────

export const GEMINI_DEFAULT_MODEL = "gemini-2.5-flash-lite";
export const OPENAI_FALLBACK_MODEL = process.env.AI_CHAT_MODEL || "gpt-4o-mini";

// ─── Provider factories ───────────────────────────────────────────────────────

/**
 * Returns the default Gemini model for chat.
 * Used by public chat, authenticated chat, and playground (unless overridden).
 */
export function getDefaultChatModel(): LanguageModel {
    const modelId = process.env.AI_CHAT_MODEL || GEMINI_DEFAULT_MODEL;
    return modelId.startsWith("gemini-") ? google(modelId) : openai(modelId);
}

/**
 * Returns the OpenAI fallback model.
 * Used when the user has a BYOK OpenAI key configured.
 */
export function getOpenAIFallbackModel(modelId?: string): LanguageModel {
    return openai(modelId ?? OPENAI_FALLBACK_MODEL);
}

/**
 * Resolves which model to use for authenticated chat:
 * - If the user has a BYOK OpenAI key, use OpenAI (preserves existing behaviour)
 * - Otherwise use the default Gemini model
 */
export function resolveChatModel(hasOpenAIByok: boolean, modelId?: string): LanguageModel {
    if (hasOpenAIByok) {
        return getOpenAIFallbackModel(modelId);
    }
    return getDefaultChatModel();
}

/**
 * Resolves which model to use for the playground.
 * The playground supports model selection — if the caller passes an explicit
 * model ID it is used. Otherwise defaults to Gemini.
 *
 * Model ID routing:
 *   - Any ID starting with "gemini-" → Gemini provider
 *   - Anything else → OpenAI provider (backward compat for playground UI)
 */
export function resolvePlaygroundModel(modelId?: string): LanguageModel {
    if (!modelId) {
        return getDefaultChatModel();
    }
    if (modelId.startsWith("gemini-")) {
        return google(modelId);
    }
    return openai(modelId);
}
