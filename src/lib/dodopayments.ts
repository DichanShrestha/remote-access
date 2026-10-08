import DodoPayments from 'dodopayments';

export const dodo = typeof window === 'undefined' ? new DodoPayments({
    bearerToken: process.env.DODO_API_KEY || 'mock_key',
    webhookKey: process.env.DODO_WEBHOOK_SECRET || process.env.DODO_PAYMENTS_WEBHOOK_KEY,
    // environment: process.env.NODE_ENV === 'production' ? 'live_mode' : 'test_mode',
    environment: "test_mode"
}) : null;
