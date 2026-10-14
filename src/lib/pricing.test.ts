import test from 'node:test';
import assert from 'node:assert/strict';
import { getInitialPricingMode, getPlanPrice, getPricingModeCookie, getWhatsAppUrl, NEPAL_TRIAL_MESSAGE, PAID_PLANS } from './pricing';

test('pricing mode uses the saved choice before country detection', () => {
  assert.equal(getInitialPricingMode('international', 'NP'), 'international');
  assert.equal(getInitialPricingMode('nepal', 'US'), 'nepal');
  assert.equal(getInitialPricingMode(null, 'NP'), 'nepal');
  assert.equal(getInitialPricingMode(null, null), 'international');
  assert.equal(getPricingModeCookie('nepal'), 'pageory_pricing_mode=nepal; Path=/; Max-Age=31536000; SameSite=Lax');
});

test('plans expose the configured monthly prices in both modes', () => {
  assert.equal(getPlanPrice('smart_page', 'nepal').display, 'NPR 999');
  assert.equal(getPlanPrice('smart_page_ai', 'nepal').display, 'NPR 3,499');
  assert.equal(getPlanPrice('smart_page', 'international').display, '$9');
  assert.equal(getPlanPrice('smart_page_ai', 'international').display, '$29');
});

test('WhatsApp URLs encode the selected plan price and trial request', () => {
  const starterUrl = getWhatsAppUrl(PAID_PLANS.smart_page.whatsappMessage(getPlanPrice('smart_page', 'nepal').display));
  assert.ok(starterUrl);
  assert.match(starterUrl, /^https:\/\/wa\.me\/9779861332293\?text=/);
  assert.equal(new URL(starterUrl).searchParams.get('text'), "Hi, I'm interested in Pageory Starter in Nepal at NPR 999/month. Please share the payment and subscription details.");

  const growthUrl = getWhatsAppUrl(PAID_PLANS.smart_page_ai.whatsappMessage(getPlanPrice('smart_page_ai', 'nepal').display));
  assert.ok(growthUrl);
  assert.equal(new URL(growthUrl).searchParams.get('text'), "Hi, I'm interested in Pageory Growth in Nepal at NPR 3,499/month. Please share the payment and subscription details.");
  const trialUrl = getWhatsAppUrl(NEPAL_TRIAL_MESSAGE);
  assert.ok(trialUrl);
  assert.equal(new URL(trialUrl).searchParams.get('text'), NEPAL_TRIAL_MESSAGE);
  assert.equal(getWhatsAppUrl('hello', ''), null);
});
