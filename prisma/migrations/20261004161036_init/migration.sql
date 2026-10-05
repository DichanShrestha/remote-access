CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('CREATOR', 'BUSINESS');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "type" "ProfileType" NOT NULL DEFAULT 'CREATOR',
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "draftConfig" JSONB NOT NULL DEFAULT '{}',
    "publishedConfig" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "botId" UUID,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3),
    "dodoSubscriptionId" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "credit_wallet" INTEGER NOT NULL DEFAULT 0,
    "monthly_reset_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usage" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "pageGenerations" INTEGER NOT NULL DEFAULT 0,
    "aiEdits" INTEGER NOT NULL DEFAULT 0,
    "chatMessages" INTEGER NOT NULL DEFAULT 0,
    "monthly_messages" INTEGER NOT NULL DEFAULT 0,
    "storage_used_bytes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "componentType" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "message" TEXT,
    "customData" JSONB,
    "source" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bots" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "system_prompt" TEXT NOT NULL DEFAULT '',
    "welcome_message" TEXT NOT NULL DEFAULT 'Hi! How can I help you today?',
    "welcome_messages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatar_emoji" TEXT NOT NULL DEFAULT 'bot',
    "collect_leads" BOOLEAN NOT NULL DEFAULT false,
    "color_theme" TEXT NOT NULL DEFAULT '#6366f1',
    "purpose" TEXT NOT NULL DEFAULT 'general',
    "remove_watermark" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "tone" TEXT NOT NULL DEFAULT 'friendly',
    "avatar_url" TEXT,
    "booking_link" TEXT,
    "lead_gen_config" JSONB,
    "lead_capture_config" JSONB,
    "rate_limit_message" TEXT NOT NULL DEFAULT 'Too many messages in a row',
    "rate_limit_messages" INTEGER NOT NULL DEFAULT 20,
    "rate_limit_window" INTEGER NOT NULL DEFAULT 240,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,

    CONSTRAINT "bots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_sources" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "bot_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "file_path" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_chunks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "bot_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_source_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_api_keys" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'openai',
    "encrypted_key" TEXT NOT NULL,
    "key_hint" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "bot_id" UUID NOT NULL,
    "session_id" TEXT NOT NULL,
    "visitor_id" TEXT,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_leads" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "bot_id" UUID NOT NULL,
    "visitor_id" TEXT,
    "name" TEXT,
    "email" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversation_snippet" TEXT,
    "phone" TEXT,

    CONSTRAINT "bot_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_pairs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "bot_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "questions" TEXT[],
    "answer" TEXT NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qa_pairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_items" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "bot_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled',
    "description" TEXT,
    "trigger_queries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DOUBLE PRECISION,
    "currency" TEXT,
    "public_url" TEXT,
    "redirect_url" TEXT,

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_images" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "catalog_item_id" UUID NOT NULL,
    "public_url" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "embedding" vector(3072),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalog_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_events" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "bot_id" UUID NOT NULL,
    "event" TEXT NOT NULL,
    "session_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Page_profileId_key" ON "Page"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_botId_key" ON "Page"("botId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_dodoSubscriptionId_key" ON "Subscription"("dodoSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Usage_userId_key" ON "Usage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_eventId_key" ON "WebhookEvent"("eventId");

-- CreateIndex
CREATE INDEX "Lead_pageId_createdAt_idx" ON "Lead"("pageId", "createdAt");

-- CreateIndex
CREATE INDEX "bots_user_id_updated_at_idx" ON "bots"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "bots_status_idx" ON "bots"("status");

-- CreateIndex
CREATE INDEX "data_sources_bot_id_user_id_idx" ON "data_sources"("bot_id", "user_id");

-- CreateIndex
CREATE INDEX "data_sources_status_idx" ON "data_sources"("status");

-- CreateIndex
CREATE INDEX "document_chunks_bot_id_idx" ON "document_chunks"("bot_id");

-- CreateIndex
CREATE INDEX "document_chunks_data_source_id_idx" ON "document_chunks"("data_source_id");

-- CreateIndex
CREATE INDEX "document_chunks_user_id_idx" ON "document_chunks"("user_id");

-- CreateIndex
CREATE INDEX "user_api_keys_user_id_idx" ON "user_api_keys"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_api_keys_user_id_provider_key" ON "user_api_keys"("user_id", "provider");

-- CreateIndex
CREATE INDEX "chat_messages_bot_id_session_id_created_at_idx" ON "chat_messages"("bot_id", "session_id", "created_at");

-- CreateIndex
CREATE INDEX "chat_messages_bot_id_idx" ON "chat_messages"("bot_id");

-- CreateIndex
CREATE INDEX "chat_messages_bot_id_visitor_id_idx" ON "chat_messages"("bot_id", "visitor_id");

-- CreateIndex
CREATE INDEX "bot_leads_bot_id_idx" ON "bot_leads"("bot_id");

-- CreateIndex
CREATE INDEX "bot_leads_created_at_idx" ON "bot_leads"("created_at");

-- CreateIndex
CREATE INDEX "bot_leads_bot_id_visitor_id_idx" ON "bot_leads"("bot_id", "visitor_id");

-- CreateIndex
CREATE INDEX "qa_pairs_bot_id_user_id_idx" ON "qa_pairs"("bot_id", "user_id");

-- CreateIndex
CREATE INDEX "catalog_items_bot_id_idx" ON "catalog_items"("bot_id");

-- CreateIndex
CREATE INDEX "catalog_items_user_id_idx" ON "catalog_items"("user_id");

-- CreateIndex
CREATE INDEX "catalog_images_catalog_item_id_idx" ON "catalog_images"("catalog_item_id");

-- CreateIndex
CREATE INDEX "booking_events_bot_id_event_idx" ON "booking_events"("bot_id", "event");

-- CreateIndex
CREATE INDEX "booking_events_bot_id_created_at_idx" ON "booking_events"("bot_id", "created_at");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_botId_fkey" FOREIGN KEY ("botId") REFERENCES "bots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bots" ADD CONSTRAINT "bots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_sources" ADD CONSTRAINT "data_sources_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_sources" ADD CONSTRAINT "data_sources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "data_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_api_keys" ADD CONSTRAINT "user_api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_leads" ADD CONSTRAINT "bot_leads_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_pairs" ADD CONSTRAINT "qa_pairs_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_pairs" ADD CONSTRAINT "qa_pairs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_images" ADD CONSTRAINT "catalog_images_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_events" ADD CONSTRAINT "booking_events_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
