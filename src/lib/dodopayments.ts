import DodoPayments from 'dodopayments';

export const dodo = typeof window === 'undefined' ? new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY || 'mock_key',
    environment: process.env.NODE_ENV === 'production' ? 'live_mode' : 'test_mode',
}) : null;
