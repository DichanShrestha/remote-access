export type TriggerReason =
    | "pricing_keyword"
    | "demo_keyword"
    | "support_escalation"
    | "booking"
    | "generic_interest"
    | "message_threshold"
    | "on_open";

export interface KeywordTriggerGroup {
    keywords: string[];
    intentCategory: TriggerReason;
}

export interface LeadCaptureContent {
    icon: string; // Lucide icon name mapping logic is handled in the component
    headline: string;
    body: string;
    buttonText: string;
    fieldLabel: string;
    placeholder: string;
}

export function getContent(reason: TriggerReason, botName: string): LeadCaptureContent {
    const defaultPlaceholder = "you@company.com";
    const defaultFieldLabel = "Email Address";

    switch (reason) {
        case "pricing_keyword":
            return {
                icon: "Tag",
                headline: "Get a Custom Quote",
                body: `I can have the ${botName} sales team reach out with detailed pricing options tailored to your needs.`,
                buttonText: "Request Pricing",
                fieldLabel: defaultFieldLabel,
                placeholder: defaultPlaceholder,
            };
        case "demo_keyword":
            return {
                icon: "Calendar",
                headline: "See It in Action",
                body: "Want to see how this works for your specific use case? Let's get you set up with a personalized demo.",
                buttonText: "Request Demo",
                fieldLabel: defaultFieldLabel,
                placeholder: defaultPlaceholder,
            };
        case "support_escalation":
            return {
                icon: "Headset",
                headline: "Talk to a Human",
                body: "Sometimes it's just easier to talk to a person. I can pass this conversation to our support team right now.",
                buttonText: "Connect to Support",
                fieldLabel: defaultFieldLabel,
                placeholder: defaultPlaceholder,
            };
        case "booking":
            return {
                icon: "CalendarCheck",
                headline: "Schedule a Call",
                body: `I can send you a direct link to book a time with the ${botName} team that works best for you.`,
                buttonText: "Get Booking Link",
                fieldLabel: defaultFieldLabel,
                placeholder: defaultPlaceholder,
            };
        case "generic_interest":
            return {
                icon: "Bell",
                headline: "Stay in the Loop",
                body: "Drop your email below and we'll keep you updated with the latest news and insights.",
                buttonText: "Subscribe",
                fieldLabel: defaultFieldLabel,
                placeholder: defaultPlaceholder,
            };
        case "message_threshold":
            return {
                icon: "MessageCircle",
                headline: "Enjoying the Chat?",
                body: `Leave your email so the ${botName} team can follow up and provide even better assistance.`,
                buttonText: "Stay Connected",
                fieldLabel: defaultFieldLabel,
                placeholder: defaultPlaceholder,
            };
        case "on_open":
            return {
                icon: "Bell",
                headline: "Welcome!",
                body: "To get the most out of your experience, please provide your email address before we begin.",
                buttonText: "Start Chatting",
                fieldLabel: defaultFieldLabel,
                placeholder: defaultPlaceholder,
            };
        default:
            return {
                icon: "Zap",
                headline: "Quick Check-in",
                body: "We'd love to know who we're chatting with to provide better service.",
                buttonText: "Continue",
                fieldLabel: defaultFieldLabel,
                placeholder: defaultPlaceholder,
            };
    }
}

export const KEYWORD_SUGGESTION_MAP: Record<string, TriggerReason> = {
    price: "pricing_keyword",
    pricing: "pricing_keyword",
    cost: "pricing_keyword",
    quote: "pricing_keyword",
    estimate: "pricing_keyword",
    demo: "demo_keyword",
    trial: "demo_keyword",
    free: "demo_keyword",
    contact: "support_escalation",
    "talk to human": "support_escalation",
    support: "support_escalation",
    help: "support_escalation",
    buy: "booking",
    schedule: "booking",
    book: "booking",
    call: "booking",
    meeting: "booking"
};
