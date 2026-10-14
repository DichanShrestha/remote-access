export type PricingMode = "nepal" | "international";
export type PaidPlanId = "smart_page" | "smart_page_ai";

export const PRICING_MODE_COOKIE = "pageory_pricing_mode";
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9779861332293").replace(/\D/g, "");

export const PAID_PLANS = {
  smart_page: {
    id: "smart_page",
    name: "Starter",
    international: { currency: "USD", amount: 9, display: "$9" },
    nepal: { currency: "NPR", amount: 999, display: "NPR 999" },
    whatsappMessage: (price: string) => `Hi, I'm interested in Pageory Starter in Nepal at ${price}/month. Please share the payment and subscription details.`,
  },
  smart_page_ai: {
    id: "smart_page_ai",
    name: "Growth",
    international: { currency: "USD", amount: 29, display: "$29" },
    nepal: { currency: "NPR", amount: 3499, display: "NPR 3,499" },
    whatsappMessage: (price: string) => `Hi, I'm interested in Pageory Growth in Nepal at ${price}/month. Please share the payment and subscription details.`,
  },
} as const;

export function normalizePricingMode(value?: string | null): PricingMode | null {
  return value === "nepal" || value === "international" ? value : null;
}

export function getPricingModeCookie(mode: PricingMode): string {
  return `${PRICING_MODE_COOKIE}=${mode}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function getInitialPricingMode(saved: string | null | undefined, countryCode: string | null | undefined): PricingMode {
  return normalizePricingMode(saved) ?? (countryCode?.toUpperCase() === "NP" ? "nepal" : "international");
}

export function getWhatsAppUrl(message: string, number = WHATSAPP_NUMBER): string | null {
  const digits = number.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
}

export function getPlanPrice(planId: PaidPlanId, mode: PricingMode) {
  return PAID_PLANS[planId][mode];
}

export const NEPAL_TRIAL_MESSAGE = "Hi, I'd like to request a Pageory free trial in Nepal. Please explain the requirements and how to get started.";
