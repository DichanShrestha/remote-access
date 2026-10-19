export type PaymentSubmissionState = 'verified' | 'rejected' | 'submitted' | 'waiting';

export function getPaymentSubmissionState(status: string, confirmedAt: string | null, paymentReference: string | null): PaymentSubmissionState {
  if (status === 'verified') return 'verified';
  if (status === 'rejected') return 'rejected';
  if (confirmedAt || paymentReference) return 'submitted';
  return 'waiting';
}
