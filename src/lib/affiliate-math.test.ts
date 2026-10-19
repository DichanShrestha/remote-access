import test from 'node:test';
import assert from 'node:assert/strict';
import { addCalendarMonths, calculateCommission, calculateDiscount, calculateEligibleRevenue, isWithinCommissionWindow } from './affiliate-math';

test('customer discount is applied once and rounded in the payment currency', () => {
  assert.deepEqual(calculateDiscount(999, 10), { discountAmount: 99.9, finalAmount: 899.1 });
  assert.deepEqual(calculateDiscount(3499, 10), { discountAmount: 349.9, finalAmount: 3149.1 });
  assert.deepEqual(calculateDiscount(9, 0), { discountAmount: 0, finalAmount: 9 });
});

test('eligible revenue never exceeds the amount actually retained or the discounted invoice', () => {
  assert.equal(calculateEligibleRevenue(899.1, 899.1), 899.1);
  assert.equal(calculateEligibleRevenue(899.1, 850), 850);
  assert.equal(calculateEligibleRevenue(899.1, 1000), 899.1);
  assert.throws(() => calculateEligibleRevenue(10, -1));
});

test('commission is calculated from collected discounted revenue using the configured rate', () => {
  assert.equal(calculateCommission(899.1, 15), 134.87);
  assert.equal(calculateCommission(999, 15), 149.85);
  assert.equal(calculateCommission(29, 0), 0);
});

test('eligibility ends at the original calendar-month anniversary', () => {
  const firstPaid = new Date('2026-01-15T12:00:00.000Z');
  const end = addCalendarMonths(firstPaid, 12);
  assert.equal(end.toISOString(), '2027-01-15T12:00:00.000Z');
  assert.equal(isWithinCommissionWindow(end, firstPaid, 12), true);
  assert.equal(isWithinCommissionWindow(new Date(end.getTime() + 1), firstPaid, 12), false);
});

test('leap-day windows clamp to the matching last day of February', () => {
  const firstPaid = new Date('2024-02-29T00:00:00.000Z');
  assert.equal(addCalendarMonths(firstPaid, 12).toISOString(), '2025-02-28T00:00:00.000Z');
});

test('monthly and annual collection cadence share the same fixed 12-month clock', () => {
  const firstPaid = new Date('2026-03-01T00:00:00.000Z');
  assert.equal(isWithinCommissionWindow(new Date('2027-02-28T00:00:00.000Z'), firstPaid, 12), true);
  assert.equal(isWithinCommissionWindow(new Date('2027-03-02T00:00:00.000Z'), firstPaid, 12), false);
});
