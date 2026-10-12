/**
 * Centralized AI provider configuration.
 *
 * All chat and completion requests route through OpenRouter via the OpenAI SDK compatible endpoint.
 *
 * Model IDs:
 *   - Chat default: anthropic/claude-haiku-5.5 (configurable via AI_CHAT_MODEL)
 *
 * Environment variables:
 *   OPENROUTER_API_KEY    — OpenRouter API key
 *   OPENROUTER_BASE_URL   — OpenRouter compatible base URL (default: https://openrouter.ai/api/v1)
 *   AI_CHAT_MODEL         — Primary chat response model ID
 */

import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

// ─── Configuration ────────────────────────────────────────────────────────────

export const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
export const DEFAULT_CHAT_MODEL = process.env.AI_CHAT_MODEL || "anthropic/claude-haiku-5.5";

// Backward compatibility alias for existing route usages
export const GEMINI_DEFAULT_MODEL = DEFAULT_CHAT_MODEL;
export const OPENAI_FALLBACK_MODEL = DEFAULT_CHAT_MODEL;

// ─── OpenRouter Provider Factory ─────────────────────────────────────────────

/**
 * Creates an OpenRouter provider instance using the OpenAI-compatible SDK.
 */
export function getOpenRouterProvider(apiKey?: string) {
    const key = apiKey || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    return createOpenAI({
        baseURL: OPENROUTER_BASE_URL,
        apiKey: key,
    });
}

/**
 * Returns the default chat model (anthropic/claude-haiku-5.5 or process.env.AI_CHAT_MODEL).
 * Used by public chat, authenticated chat, and editor actions.
 */
export function getDefaultChatModel(modelId?: string, apiKey?: string): LanguageModel {
    const provider = getOpenRouterProvider(apiKey);
    const targetModel = modelId || process.env.AI_CHAT_MODEL || DEFAULT_CHAT_MODEL;
    return provider(targetModel);
}

/**
 * Returns the fallback model (preserves function signature for BYOK flows).
 */
export function getOpenAIFallbackModel(modelId?: string, apiKey?: string): LanguageModel {
    return getDefaultChatModel(modelId, apiKey);
}

/**
 * Resolves which model to use for authenticated chat:
 * - If user provides custom BYOK key, uses it with the target model
 * - Otherwise uses the primary configured OpenRouter model
 */
export function resolveChatModel(hasOpenAIByok?: boolean, modelId?: string, apiKey?: string): LanguageModel {
    return getDefaultChatModel(modelId, apiKey);
}

/**
 * Resolves which model to use for the playground.
 * If the caller passes an explicit model ID it is used directly on OpenRouter.
 * Otherwise defaults to the primary chat model.
 */
export function resolvePlaygroundModel(modelId?: string, apiKey?: string): LanguageModel {
    return getDefaultChatModel(modelId, apiKey);
}

