import assert from 'node:assert/strict';
import test from 'node:test';
import { getSmartPageEntitlement } from './tier-limits';
import { getCrossedQuotaThresholds, getGrowthAIOperation, GROWTH_LIMITS } from './billing/growth-quota-policy';

test('Growth quotas and operation costs match the published allowance', () => {
  assert.deepEqual(GROWTH_LIMITS, { pages: 10, blogPosts: 20, articleGenerations: 20, writingCredits: 40 });
  assert.deepEqual(getGrowthAIOperation('article'), { kind: 'articleGenerations', amount: 1 });
  assert.deepEqual(getGrowthAIOperation('search'), { kind: 'writingCredits', amount: 2 });
  for (const action of ['rewrite', 'improve', 'expand', 'shorten', 'clarify', 'proofread', 'continue', 'excerpt', 'faqs', 'seo']) {
    assert.deepEqual(getGrowthAIOperation(action), { kind: 'writingCredits', amount: 1 });
  }
});

test('quota notices fire only when crossing 80 and 100 percent', () => {
  assert.deepEqual(getCrossedQuotaThresholds(31, 32, 40), [80]);
  assert.deepEqual(getCrossedQuotaThresholds(39, 40, 40), [100]);
  assert.deepEqual(getCrossedQuotaThresholds(32, 35, 40), []);
  assert.deepEqual(getCrossedQuotaThresholds(38, 40, 40), [100]);
});

const account = (status: string, currentPeriodEnd: Date, cancelAtPeriodEnd = false) => ({
  createdAt: new Date('2025-01-01T00:00:00Z'),
  subscriptions: [{ planId: 'smart_page_ai', tier: 'smart_page_ai', status, currentPeriodStart: new Date('2026-10-03T00:00:00Z'), currentPeriodEnd, cancelAtPeriodEnd }],
});

test('active Growth remains active until cycle end and scheduled cancellation does not get payment grace', () => {
  const end = new Date('2026-11-10T00:00:00Z');
  const active = getSmartPageEntitlement(account('active', end), new Date('2026-11-09T00:00:00Z'));
  assert.equal(active.plan, 'smart_page_ai');
  assert.equal(active.paidActive, true);
  const cancelled = getSmartPageEntitlement(account('expired', end, true), new Date('2026-11-11T00:00:00Z'));
  assert.equal(cancelled.paymentGraceActive, false);
  assert.equal(cancelled.trialExpired, true);
});

test('overdue payments pause AI immediately, keep public access for seven days, and expire afterwards', () => {
  const end = new Date('2026-11-01T00:00:00Z');
  const inGrace = getSmartPageEntitlement(account('past_due', end), new Date('2026-11-05T00:00:00Z'));
  assert.equal(inGrace.plan, 'smart_page_ai');
  assert.equal(inGrace.aiEnabled, false);
  assert.equal(inGrace.paymentGraceActive, true);
  assert.equal(inGrace.trialExpired, false);
  const expired = getSmartPageEntitlement(account('expired', end), new Date('2026-11-09T00:00:00Z'));
  assert.equal(expired.paymentGraceActive, false);
  assert.equal(expired.trialExpired, true);
});

test('successful renewal restores paid access and Growth plan entitlements', () => {
  const renewed = getSmartPageEntitlement(account('active', new Date('2026-12-01T00:00:00Z')), new Date('2026-11-05T00:00:00Z'));
  assert.equal(renewed.plan, 'smart_page_ai');
  assert.equal(renewed.aiEnabled, true);
  assert.equal(renewed.paidActive, true);
});
