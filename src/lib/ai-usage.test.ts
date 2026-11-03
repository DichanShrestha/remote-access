import test from 'node:test';
import assert from 'node:assert/strict';
import { addAiUsage, formatAiCost, readAiUsage, EMPTY_AI_USAGE } from './ai/usage';

test('reads token usage and OpenRouter-reported cost', () => {
  const usage = readAiUsage(
    { inputTokens: 1200, outputTokens: 340, totalTokens: 1540 } as never,
    { openrouter: { usage: { cost: 0.0042 } } },
  );
  assert.deepEqual(usage, {
    inputTokens: 1200,
    outputTokens: 340,
    totalTokens: 1540,
    estimatedCostUsd: 0.0042,
  });
});

test('never invents a cost when the provider does not report one', () => {
  const usage = readAiUsage({ inputTokens: 10, outputTokens: 5 } as never);
  assert.equal(usage.estimatedCostUsd, null);
  assert.equal(usage.totalTokens, 15);
});

test('accumulates session usage without turning missing values into zero', () => {
  const first = addAiUsage(EMPTY_AI_USAGE, {
    inputTokens: 100,
    outputTokens: 50,
    totalTokens: 150,
    estimatedCostUsd: null,
  });
  const second = addAiUsage(first, null);
  assert.deepEqual(second, first);

  const third = addAiUsage(first, {
    inputTokens: 20,
    outputTokens: 10,
    totalTokens: 30,
    estimatedCostUsd: 0.01,
  });
  assert.equal(third.totalTokens, 180);
  assert.equal(third.estimatedCostUsd, 0.01);
});

test('formats small costs without rounding them to zero', () => {
  assert.equal(formatAiCost(null), null);
  assert.equal(formatAiCost(0), '$0.00');
  assert.equal(formatAiCost(0.0042), '$0.0042');
  assert.equal(formatAiCost(0.42), '$0.420');
  assert.equal(formatAiCost(2.5), '$2.50');
});
