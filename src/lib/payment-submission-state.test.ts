import test from 'node:test';
import assert from 'node:assert/strict';
import { getPaymentSubmissionState } from './payment-submission-state';

test('customer confirmation queues a payment without activating the subscription', () => {
  assert.equal(getPaymentSubmissionState('pending', '2026-10-19T00:00:00.000Z', null), 'submitted');
  assert.equal(getPaymentSubmissionState('pending', null, 'legacy-transfer-ref'), 'submitted');
  assert.equal(getPaymentSubmissionState('pending', null, null), 'waiting');
  assert.equal(getPaymentSubmissionState('verified', '2026-10-19T00:00:00.000Z', 'transfer-ref'), 'verified');
});
