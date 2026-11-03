import type { LanguageModelUsage } from 'ai';

/**
 * Token and cost accounting for AI actions.
 *
 * Token counts come from the AI SDK. Cost is only reported when it can be
 * determined honestly:
 *   1. OpenRouter usage accounting in provider metadata, or
 *   2. an explicit per-million-token price configured by the deployment.
 *
 * We never guess a model's price. When neither source is available the UI
 * shows tokens only.
 */

export type AiUsageSummary = {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  estimatedCostUsd: number | null;
};

export const EMPTY_AI_USAGE: AiUsageSummary = {
  inputTokens: null,
  outputTokens: null,
  totalTokens: null,
  estimatedCostUsd: null,
};

function finiteNumber(value: unknown): number | null {
  const num = typeof value === 'string' ? Number(value) : value;
  return typeof num === 'number' && Number.isFinite(num) ? num : null;
}

function readPath(source: unknown, path: string[]): unknown {
  let current: unknown = source;
  for (const key of path) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function readProviderCost(providerMetadata: unknown): number | null {
  const candidates = [
    ['openrouter', 'usage', 'cost'],
    ['openrouter', 'usage', 'total_cost'],
    ['openrouter', 'cost'],
    ['openrouter', 'usage', 'totalCost'],
    ['gateway', 'cost'],
  ];

  for (const path of candidates) {
    const cost = finiteNumber(readPath(providerMetadata, path));
    if (cost !== null && cost >= 0) return cost;
  }
  return null;
}

function readPricedCost(inputTokens: number | null, outputTokens: number | null): number | null {
  const inputPrice = finiteNumber(process.env.BLOG_AI_INPUT_USD_PER_MTOK);
  const outputPrice = finiteNumber(process.env.BLOG_AI_OUTPUT_USD_PER_MTOK);
  if (inputPrice === null && outputPrice === null) return null;

  const inputCost = inputTokens !== null && inputPrice !== null ? (inputTokens / 1_000_000) * inputPrice : 0;
  const outputCost = outputTokens !== null && outputPrice !== null ? (outputTokens / 1_000_000) * outputPrice : 0;
  return inputCost + outputCost;
}

export function readAiUsage(
  usage: LanguageModelUsage | undefined | null,
  providerMetadata?: unknown,
): AiUsageSummary {
  const inputTokens = finiteNumber(usage?.inputTokens);
  const outputTokens = finiteNumber(usage?.outputTokens);
  const totalTokens = finiteNumber(usage?.totalTokens)
    ?? (inputTokens !== null || outputTokens !== null ? (inputTokens ?? 0) + (outputTokens ?? 0) : null);

  const estimatedCostUsd = readProviderCost(providerMetadata) ?? readPricedCost(inputTokens, outputTokens);

  return { inputTokens, outputTokens, totalTokens, estimatedCostUsd };
}

export function addAiUsage(current: AiUsageSummary, next: AiUsageSummary | null | undefined): AiUsageSummary {
  if (!next) return current;
  const add = (a: number | null, b: number | null) => (a === null && b === null ? null : (a ?? 0) + (b ?? 0));
  return {
    inputTokens: add(current.inputTokens, next.inputTokens),
    outputTokens: add(current.outputTokens, next.outputTokens),
    totalTokens: add(current.totalTokens, next.totalTokens),
    estimatedCostUsd: add(current.estimatedCostUsd, next.estimatedCostUsd),
  };
}

export function formatAiCost(cost: number | null): string | null {
  if (cost === null || !Number.isFinite(cost)) return null;
  if (cost === 0) return '$0.00';
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}
