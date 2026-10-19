export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateDiscount(originalAmount: number, percent: number) {
  const discountAmount = roundCurrency(originalAmount * percent / 100);
  return { discountAmount, finalAmount: roundCurrency(originalAmount - discountAmount) };
}

export function calculateEligibleRevenue(expectedAmount: number, actuallyCollected: number) {
  if (expectedAmount < 0 || actuallyCollected < 0) throw new Error('Amounts cannot be negative.');
  return roundCurrency(Math.min(expectedAmount, actuallyCollected));
}

export function calculateCommission(eligibleRevenue: number, percent: number) {
  return roundCurrency(eligibleRevenue * percent / 100);
}

export function addCalendarMonths(date: Date, months: number) {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

export function isWithinCommissionWindow(paymentAt: Date, firstPaidAt: Date, eligibilityMonths: number) {
  return paymentAt <= addCalendarMonths(firstPaidAt, eligibilityMonths);
}

export function fromMinorUnits(amount: number, currency: string) {
  const zeroDecimal = new Set(['BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF', 'KRW', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF']);
  const threeDecimal = new Set(['BHD', 'JOD', 'KWD', 'OMR', 'TND']);
  const exponent = zeroDecimal.has(currency.toUpperCase()) ? 0 : threeDecimal.has(currency.toUpperCase()) ? 3 : 2;
  return roundCurrency(amount / (10 ** exponent));
}
