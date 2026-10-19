import test from 'node:test';
import assert from 'node:assert/strict';
import { buildComplimentaryGrant } from './admin-access';

test('admin trial access is complimentary, time-limited, and not recorded as paid billing', () => {
  const start = new Date('2026-10-19T00:00:00.000Z');
  const grant = buildComplimentaryGrant('trial', 14, start);
  assert.equal(grant.billingMethod, 'admin_comp');
  assert.equal(grant.status, 'trialing');
  assert.equal(grant.trialEverGranted, true);
  assert.equal(grant.currentPeriodEnd.toISOString(), '2026-11-02T00:00:00.000Z');
});

test('admin Starter and Growth grants activate access without fabricating a payment or trial', () => {
  const start = new Date('2026-10-19T00:00:00.000Z');
  for (const plan of ['smart_page', 'smart_page_ai'] as const) {
    const grant = buildComplimentaryGrant(plan, 30, start);
    assert.equal(grant.billingMethod, 'admin_comp');
    assert.equal(grant.status, 'active');
    assert.equal(grant.trialStart, null);
    assert.equal('trialEverGranted' in grant, false);
  }
});
