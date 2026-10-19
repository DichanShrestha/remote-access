const AFFILIATE_CODE_PATTERN = /^[A-Z0-9](?:[A-Z0-9-]{2,22})[A-Z0-9]$/;

export function normalizeAffiliateCode(value: string) {
  return value.trim().toUpperCase();
}

export function validateCustomAffiliateCode(value: string): { code?: string; error?: string } {
  const code = normalizeAffiliateCode(value);
  if (code.length < 4 || code.length > 24) return { error: 'Use 4 to 24 characters.' };
  if (!AFFILIATE_CODE_PATTERN.test(code)) return { error: 'Use letters, numbers, and hyphens. Start and end with a letter or number.' };
  return { code };
}
