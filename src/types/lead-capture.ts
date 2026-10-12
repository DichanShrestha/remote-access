export interface LeadCaptureSettings {
    enabled: boolean;
    mode: "first" | "keywords" | "threshold";
    triggerKeywords: string[];
    thresholdType: "message_count" | "word_count";
    thresholdValue: number;
    title: string;
    subtitle: string;
    askName: boolean;
    askEmail: boolean;
    askPhone: boolean;
    bookingLink?: string;
    bookingKeywords?: string[];
    showBookingCard?: boolean;
}

export const DEFAULT_LEAD_CAPTURE_SETTINGS: LeadCaptureSettings = {
    enabled: false,
    mode: "first",
    triggerKeywords: ["pricing", "cost", "quote", "demo", "contact", "talk to sales", "buy"],
    thresholdType: "message_count",
    thresholdValue: 3,
    title: "Before we continue, how can we reach you?",
    subtitle: "Leave your contact details so our team can follow up with you.",
    askName: true,
    askEmail: true,
    askPhone: false,
    bookingLink: "",
    bookingKeywords: ["book", "schedule", "call", "meeting", "appointment", "demo", "calendar", "consultation"],
    showBookingCard: true,
};
