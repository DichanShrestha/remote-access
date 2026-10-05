/**
 * KnowChat type definitions.
 * Re-exports Prisma-generated types plus custom application types.
 */

import type { KeywordTriggerGroup } from "@/lib/lead-capture/config";

// Re-export all Prisma-generated model types
export type {
    Profile,
    Bot,
    DataSource,
    DocumentChunk,
    UserApiKey,
    ChatMessage,
    Lead as PrismaLead, // Export Prisma Lead as well so we don't conflict, actually maybe we can just alias it to be safe
} from "@prisma/client";

// Import Lead from Prisma generated client instead of defining our own type, to ensure they match
// and if we need custom fields we can extend it
import type { Lead as GeneratedLead } from "@prisma/client";

export type Lead = GeneratedLead & {
    source?: string | null;
};

// ─── Lead Generation Types ────────────────────────────────
export type LeadFieldConfig = {
    enabled: boolean;
    required: boolean;
};

export type LeadGenTriggerType = "always" | "after_messages" | "on_keywords";

export type LeadGenConfig = {
    name: LeadFieldConfig;
    email: LeadFieldConfig;
    phone: LeadFieldConfig;
    trigger: LeadGenTriggerType;
    triggerMessagesCount?: number; // e.g. 3-5
    triggerKeywords?: string[]; // e.g. ["price", "demo"]
    successMessage: string;
    dismissMessage: string;
};

// ─── Custom Enum Types ─────────────────────────────────────
// These map to the string columns in the Prisma schema

export type BotStatus = "draft" | "training" | "active" | "error";
export type BotTone = "friendly" | "professional" | "fun" | "expert";
export type BotPurpose =
    | "customer_support"
    | "product_faq"
    | "booking_assistant"
    | "bilingual"
    | "lead_generation"
    | "general";

export type DataSourceType = "url" | "file";
export type DataSourceStatus =
    | "pending"
    | "crawling"
    | "chunking"
    | "embedding"
    | "complete"
    | "error";

export type MessageRole = "user" | "assistant" | "system";

// ─── Onboarding Wizard Types ───────────────────────────────

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

export type BotPurposePreset = {
    id: BotPurpose;
    label: string;
    description: string;
    emoji: string;
};

export type ToneOption = {
    id: BotTone;
    label: string;
    emoji: string;
};

// ─── Chat Types ────────────────────────────────────────────

export type ChatMessageUI = {
    id: string;
    role: MessageRole;
    content: string;
    createdAt?: Date;
};

export type MatchedDocument = {
    id: string;
    content: string;
    metadata: Record<string, unknown>;
    similarity: number;
};

// ─── Form Data Types ───────────────────────────────────────

export type BotFormData = {
    name: string;
    description: string;
    purpose: BotPurpose;
    avatarEmoji: string;
    faviconUrl?: string;
    websiteUrl?: string;
    colorTheme: string;
    welcomeMessage: string;
    welcomeMessages: string[];
    tone: BotTone;
    removeWatermark: boolean;
    collectLeads: boolean;
    leadGenConfig?: LeadGenConfig;
    leadCaptureConfig?: { triggers: KeywordTriggerGroup[] } | null;
    temperature?: number;
    rateLimitMessages?: number;
    rateLimitWindow?: number;
    rateLimitMessage?: string;
    systemPrompt?: string;
    bookingLink?: string | null;
};

// Dummy database type to appease @supabase/ssr wrapping
export type Database = any;
