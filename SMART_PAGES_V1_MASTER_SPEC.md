# Smart Pages — V1 Product & Engineering Master Specification

**Status:** Build-ready V1 specification  
**Audience:** Antigravity / coding agent + founder  
**Build mode:** Incremental chunks; implement only the requested chunk at a time  
**Product concept:** AI-powered, social-first Smart Pages for creators and businesses  
**Primary V1 objective:** Turn social traffic into useful actions: conversations, leads, bookings, purchases, and contact.

---

## 0. Read This Before Writing Code

This document is the product contract for V1. Do not reinterpret the product into a generic website builder, a Linktree clone, or a full CRM.

The product is a **Smart Page**: a beautiful, highly customizable, mobile-first page that can look like a creator profile, landing page, mini business website, or lead-conversion page. It is powered by a controlled component system and an AI composer/editor. Its key differentiation is that the page can also host an AI assistant powered by the founder's existing product, **KnowChat**, and can capture/show conversations and leads.

### Core product statement

> **Smart Pages are beautiful social-first pages that don't just display information; they help visitors get answers, take action, and become leads.**

### Creator positioning hypothesis

> **Don't let important opportunities disappear in your DMs.**
>
> Give your audience one place to learn about you, ask questions, discover your work, and reach you. Let AI handle repetitive questions and surface conversations worth your attention.

### Business positioning hypothesis

> **Turn your Instagram into a 24/7 customer page.**
>
> Explain your services, answer common questions, capture qualified leads, and send visitors toward booking/contact — even when the business is busy.

### Important product boundary

The V1 is **not** a general-purpose website/CMS platform. It should be intentionally optimized for a single-page social destination and conversion workflows.

Do not add feature scope merely because generic website builders have it.

---

# 1. Product Principles

1. **Value before configuration.** The user should see a useful page as early as possible.
2. **AI composes; the application renders.** Never make the LLM generate arbitrary production HTML/CSS as the primary implementation.
3. **Beautiful defaults, deep customization.** Strong design-system constraints create quality; users can still customize almost everything relevant.
4. **One codebase, modular architecture.** Build a maintainable modular monolith, not a premature microservice architecture.
5. **Feature-oriented boundaries.** Business logic should live near the feature/domain that owns it, not in a giant `utils` or `services` folder.
6. **API/provider isolation.** KnowChat and Dodo Payments must be behind adapters/services so the rest of the application does not depend on vendor-specific code.
7. **Every public-page mutation must be safe and versionable.** Auto-save, draft state, published snapshot, undo/redo strategy, and validation matter.
8. **Never trust AI output or browser input.** Validate all structured AI output and all untrusted request data.
9. **Measure outcomes.** Page views, CTA clicks, chat starts, conversations, and leads matter more than pages created.
10. **No hidden magic.** Important asynchronous operations need loading, success, error, retry, and empty states.

---

# 2. Target Users / V1 ICP

## 2.1 Creator ICP

Prioritize creators who already have audience demand and something to monetize or receive inquiries about:

- Sponsorships
- Brand collaborations
- Coaching / consulting
- Courses
- Digital products
- Affiliate links
- Newsletter/community
- Booking
- Business inquiries

The product should still support smaller creators, but marketing should initially prioritize creators with meaningful audience activity because the lead/opportunity problem is stronger there.

## 2.2 Business ICP

Prioritize social-heavy service businesses where a visitor may need information and then take an action:

- Tattoo studios
- Beauty/salon businesses
- Education consultancies
- Photographers
- Event/wedding businesses
- Fitness/personal training
- Other appointment or inquiry-driven services

V1 supports generic businesses, but templates and copy should make the first few verticals feel unusually purpose-built.

---

# 3. The User Journey

## 3.1 Marketing-to-signup

```text
Marketing page
  ↓
Interactive product example / demo
  ↓
Value understood
  ↓
Create Smart Page
  ↓
Authentication
```

The marketing site is intentionally built **last**. Before the marketing site exists, the application itself must be fully usable in development.

## 3.2 Onboarding

```text
Signup
  ↓
Choose profile type: Creator / Business
  ↓
Choose primary goal
  ↓
Provide existing information
  ↓
AI builds first Smart Page
  ↓
Live editor
  ↓
AI-assisted editing
  ↓
Guided AI assistant setup
  ↓
Test AI assistant
  ↓
Configure lead capture
  ↓
Publish
  ↓
Copy page URL
  ↓
User places URL in social bio
  ↓
First visitor interaction
```

The onboarding should feel like product use, not a tutorial.

## 3.3 Returning-user flow

```text
Login
  ↓
Dashboard
  ↓
See page performance / setup status
  ↓
Edit / review conversations / review leads / manage billing
```

## 3.4 Visitor flow

```text
Instagram / TikTok / YouTube / QR / direct URL
  ↓
Smart Page
  ↓
Understand who they are / what is offered
  ↓
Choose a CTA OR ask AI
  ↓
AI answers / qualifies / routes
  ↓
Lead / booking / purchase / contact / content destination
```

## 3.5 Creator opportunity flow

```text
Audience member
  ↓
Asks question in AI chat
  ↓
AI answers
  ↓
If high-value intent detected:
  ↓
Collect details
  ↓
Create lead + preserve conversation
  ↓
Surface in lead inbox
```

Examples:

- Sponsorship
- Collaboration
- Coaching
- Hiring
- Podcast invitation
- Speaking request
- Partnership

## 3.6 Business lead flow

```text
Visitor
  ↓
Service/FAQ question
  ↓
AI answers
  ↓
Qualifies if relevant
  ↓
Collect contact/details
  ↓
Create lead
  ↓
Optional booking/contact CTA
  ↓
Business sees lead + conversation
```

---

# 4. Product-Led Onboarding Model

The onboarding should follow three practical milestones:

### Moment of Value Perception

The user understands what the product can do by seeing an interactive Smart Page and ideally interacting with its AI assistant.

### Moment of Value Experience

The user's own page is generated and they can test it immediately.

### Moment of Value Adoption

The user publishes the page, puts it into their social bio, and begins receiving visitor interactions/leads.

Therefore:

- Do not begin with a blank dashboard.
- Do not force a long setup wizard.
- Do not teach every feature before the user sees the result.
- Do not ask for information that can be inferred or imported later.

---

# 5. V1 Feature Set

## 5.1 Authentication

- Email/password or the auth system already present in the repository.
- Google login may be supported if already configured, but auth provider choices must not block the product.
- Protected dashboard routes.
- Public pages must be accessible without authentication.
- Proper session handling.
- Logout.
- Password/account recovery if email auth is used.

## 5.2 Workspace / profile setup

Every user has a primary Smart Page in V1.

Profile data:

- Display name
- Username/slug
- Profile image
- Short bio/description
- Category/type
- Location (optional)
- Social links
- Contact details (optional)
- External links

V1 should architect data models so multiple pages/workspaces can be added later, but only one active user-owned page needs to be exposed in the UI.

## 5.3 Page builder

The builder is the core of the product.

### Supported V1 sections/components

- Hero / profile
- Rich text
- Image
- Image gallery
- Video/embed
- Link / CTA button
- Social links
- Services
- Products / offers
- Testimonials
- FAQ
- Lead form
- Booking CTA
- Location/map link
- AI assistant / chat
- Divider / spacer

Do not create 50+ sections. Build a smaller set of high-quality components with variants.

## 5.4 Templates

Start with 4–5 polished templates:

1. Creator
2. General service business
3. Tattoo / beauty
4. Education consultancy
5. Personal consultant / professional

Templates should be JSON/config-driven, not hard-coded page implementations.

Each template should define:

- Initial section composition
- Default section order
- Layout variants
- Recommended CTA
- Theme
- Typography pairing
- Suggested assistant placement
- Suggested conversion goal

## 5.5 AI page composer

The AI receives:

- User type
- Primary goal
- User-provided information
- Optional source content
- Available component catalogue
- Component schemas
- Design constraints

The AI returns **validated structured page configuration**, not arbitrary frontend code.

Example concept:

```json
{
  "sections": [
    { "type": "hero", "variant": "split" },
    { "type": "gallery", "variant": "masonry" },
    { "type": "services", "variant": "cards" },
    { "type": "testimonials", "variant": "quote-grid" },
    { "type": "ai_chat", "variant": "floating" },
    { "type": "booking", "variant": "primary" }
  ],
  "theme": {
    "style": "premium-minimal",
    "radius": "medium",
    "density": "comfortable"
  }
}
```

Actual schemas should be TypeScript/Zod-defined and validated on the server.

## 5.6 Conversational editor

Provide an AI assistant inside the editor.

Examples:

- “Make this more premium.”
- “Move booking above testimonials.”
- “Remove the FAQ.”
- “Add a section for my YouTube videos.”
- “Make the main CTA more prominent.”
- “Use a darker visual style.”

The AI should produce a **small, deterministic page patch/operation list whenever possible**, not regenerate the complete page for every small edit.

Example operation concepts:

```text
add_section
remove_section
move_section
update_section_content
update_section_style
update_page_theme
update_cta
```

Every AI operation must be validated before applying it.

## 5.7 Manual visual editor

Users must be able to manually customize the page without AI.

They should be able to edit:

- Text
- Images
- Links
- Section visibility
- Section order
- Colors
- Typography choices
- Font sizes within supported bounds
- Spacing
- Alignment
- Backgrounds
- Button styles
- Radius
- Shadows
- Layout variants
- Media settings
- CTA behavior
- Chat visibility/placement

The editor should avoid becoming a complete Webflow clone. Offer useful controls, not arbitrary CSS.

## 5.8 Preview and publishing

Editor states:

- Draft
- Published snapshot

Requirements:

- Autosave
- Save status indicator
- Preview
- Publish
- Unpublish
- Published version does not change until publish is clicked
- Draft edits can continue while published page remains live

## 5.9 Public Smart Page

Public page requirements:

- Mobile-first
- Very fast
- Responsive
- Excellent typography
- High-quality spacing/hierarchy
- Accessible
- SEO metadata
- Open Graph image/title/description
- Share-friendly URL
- No dashboard chrome
- No unnecessary platform branding

The page must feel like a high-end, professionally designed mini-site, not a generic link list.

## 5.10 KnowChat-powered AI assistant

KnowChat is an existing first-party product owned by the founder.

Smart Pages must integrate KnowChat through a provider/service abstraction.

The customer should see:

> **AI Assistant**

not a confusing third-party integration experience.

Required capabilities:

- Configure assistant knowledge/context
- Define assistant goals
- Enable/disable assistant
- Choose placement/style
- Test assistant in dashboard
- Display assistant on public page
- Store or reference conversation IDs safely
- Retrieve conversation/lead information needed for the dashboard
- Respect plan/usage limits

Do not invent the exact KnowChat API contract. Inspect the available KnowChat API/docs/code before implementation. If unavailable, implement a clean `KnowChatProvider` interface and a typed adapter with the real endpoints filled in only after verification.

## 5.11 Guided assistant configuration

Do not create a second long onboarding wizard.

Instead, inside the dashboard/editor provide a guided checklist:

```text
AI Assistant

✓ Basic information
✓ Services / products
✓ FAQs / useful knowledge
□ Define what it should help with
□ Configure lead capture
□ Configure human handoff

[Test Assistant]
```

The assistant should be able to operate with sensible defaults before every optional setting is completed.

## 5.12 Lead capture

A lead may be created from:

- Direct form submission
- AI conversation qualification
- CTA flow

Lead fields:

- Name
- Email
- Phone
- Source/page
- Intent/type
- Message
- Custom fields
- Status
- Created timestamp
- Conversation reference

V1 lead statuses:

- New
- Contacted
- Qualified
- Closed
- Not a fit

The lead inbox must show the relevant conversation when one exists.

## 5.13 Conversations

Provide a conversation list and conversation detail view.

Conversation list:

- Contact/visitor identifier when available
- Last message preview
- Updated time
- Lead status if converted
- Important/high-intent indicator if available
- Read/unread state

Conversation detail:

- Full chat history from the integration/data available to Smart Pages
- Lead information if associated
- Actions to update lead status
- Manual notes can be deferred unless trivial

## 5.14 Basic analytics

V1 analytics:

- Page views
- CTA clicks
- Chat starts
- Conversations
- Leads

Track useful event metadata without collecting unnecessary personal data.

V1 dashboard can show:

```text
Visitors
CTA clicks
Chat starts
Leads
```

and simple trends.

## 5.15 Billing / Dodo Payments

Use **Dodo Payments**.

The intended offer:

- 14-day trial
- Card required to start full trial
- Automatically converts to paid subscription after trial unless canceled

Dodo's current documentation provides SDK/API access for payments/subscriptions/customer portal and webhook support. Keep payment state synchronized through server-side webhooks, not by trusting browser redirects. Verify webhook signatures using the current official Dodo mechanism. See official docs in the Sources section.

Billing requirements:

- Product/plan configuration
- Checkout
- Subscription creation
- Trial state
- Active subscription state
- Cancellation state
- Payment failure state
- Webhook processing
- Idempotent webhook handling
- Customer portal / subscription management where supported
- Server-side entitlement checks

## 5.16 Usage / AI limits

The highest variable cost is public AI usage, not basic page composition.

V1 should support plan-based usage limits even if the initial limits are generous.

Track at minimum:

- Page generations
- AI editor operations
- Chat conversations / messages or the billable unit exposed by KnowChat

Never hard-code business limits in multiple frontend components. Store limits centrally in plan/entitlement configuration.

## 5.17 Email notifications

V1:

- New lead notification
- Important inquiry notification if supported
- Trial/subscription notifications can be delegated to billing provider where appropriate

The email system must be isolated behind an interface.

---

# 6. Pricing / Packaging for V1

Exact prices should remain configurable rather than embedded in business logic.

Initial hypothesis:

### Free

- Basic Smart Page
- Limited usage
- Basic customization

### Creator

Approximately `$4/month` initially.

Potential inclusions:

- AI-assisted page creation
- Full customization
- AI assistant with controlled usage
- Lead inbox
- Basic analytics

### Business

Higher-priced plan.

Potential inclusions:

- More AI usage
- Lead capture
- Booking CTA
- Business-oriented components
- Advanced assistant configuration
- Higher limits
- Done-for-you setup as a sales/service offer

Important:

- Do not hard-code `$4` as a permanent business rule.
- Put prices/product IDs in environment/configuration.
- Do not make unlimited AI the V1 promise.

---

# 7. Trial Behavior

Intended flow:

```text
User creates account
  ↓
Can see/build/preview useful value
  ↓
Chooses paid plan
  ↓
Dodo checkout collects card
  ↓
14-day trial begins
  ↓
User can publish/use paid features
  ↓
Trial ends
  ↓
Subscription automatically bills
```

Recommended fallback on trial expiration/payment failure:

- Keep the basic public page available if the product plan permits it.
- Disable or limit paid/AI features according to entitlement state.
- Show clear upgrade/reactivation UI.

Do not immediately delete customer content.

---

# 8. Editor UX Specification

## 8.1 Core layout

Desktop editor:

```text
┌───────────────────────────────────────────────────────────────┐
│ Top bar: Back | Save status | Preview | Publish              │
├───────────────┬───────────────────────────────┬───────────────┤
│ Sections /     │                               │ AI + Settings │
│ add components │       Live page preview       │               │
│               │                               │               │
│ drag/reorder   │                               │               │
└───────────────┴───────────────────────────────┴───────────────┘
```

The exact proportions can evolve during implementation.

## 8.2 Editor interactions

- Drag/reorder sections.
- Add section from component catalogue.
- Click section to edit.
- Duplicate section where sensible.
- Hide/show section.
- Delete section with undo opportunity.
- Undo/redo.
- AI edit request.
- Preview desktop/mobile.
- Publish.

## 8.3 AI panel

The AI panel should feel like a design copilot, not a generic chat app.

Include suggested commands based on state:

- Make it more premium
- Simplify this page
- Improve the CTA
- Add a booking section
- Remove this section
- Reorder this page for conversions

Conversation should retain relevant page context during the current editing session.

## 8.4 Section settings

A section should expose a focused set of controls.

Example:

```text
Hero
-----------------
Content
  Title
  Subtitle
  Button

Visual
  Image
  Alignment

Layout
  Variant
  Width

Style
  Background
  Text style
  Spacing
```

Avoid presenting dozens of low-value toggles at once.

## 8.5 Quality rules

- No layout jumps when editing.
- Save state visible.
- Keyboard-friendly where practical.
- Strong focus states.
- No destructive action without clear recovery.
- Fast interaction even when preview is complex.

---

# 9. Page Data Model

Use a structured, versionable JSON document for page configuration.

Conceptual model:

```ts
type PageDocument = {
  version: number;
  theme: ThemeConfig;
  settings: PageSettings;
  sections: PageSection[];
};

type PageSection = {
  id: string;
  type: SectionType;
  variant?: string;
  visible: boolean;
  data: Record<string, unknown>;
  style?: SectionStyle;
};
```

In actual code, do **not** use broad `Record<string, unknown>` everywhere. Define discriminated unions for each section type.

Example concept:

```ts
type PageSection =
  | HeroSection
  | TextSection
  | GallerySection
  | ServicesSection
  | TestimonialsSection
  | FAQSection
  | LeadFormSection
  | BookingSection
  | AIChatSection;
```

Every section type should have:

- runtime validation schema
- TypeScript type
- renderer
- editor settings component
- default config
- migration/version strategy if schema changes

---

# 10. Architecture

## 10.1 Recommended architectural style

Use a **modular monolith**.

Keep a clean separation between:

- UI
- application/use cases
- domain logic
- persistence
- external integrations

Do not create microservices for V1.

## 10.2 Recommended stack if creating from scratch

Use the project's existing stack when one already exists.

If the repository is empty/new, a sensible default is:

- Next.js App Router
- React
- TypeScript with strict mode
- PostgreSQL
- Prisma or the repository's established typed ORM
- Zod for runtime validation
- Tailwind CSS or the established styling system
- A well-supported accessible component primitive system
- Vitest for unit/integration tests
- Playwright for browser/E2E tests

Next.js officially supports full-stack React applications and App Router-based organization. TypeScript's `strict` option enables stronger static guarantees. Zod provides runtime validation with TypeScript inference. See sources below.

Do not blindly upgrade dependencies. Pin compatible stable versions and use the versions already present in an existing repository unless there is a compelling reason to change them.

---

# 11. Recommended Folder Structure

If starting with Next.js App Router:

```text
src/
├── app/
│   ├── (marketing)/
│   │   └── ...                 # built LAST
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       ├── editor/
│   │       ├── leads/
│   │       ├── conversations/
│   │       ├── analytics/
│   │       └── settings/
│   ├── (public)/
│   │   └── [username]/
│   │       └── page.tsx
│   └── api/
│       ├── ai/
│       ├── billing/
│       ├── leads/
│       ├── knowchat/
│       ├── analytics/
│       └── webhooks/
│           └── dodo/
│
├── components/
│   ├── ui/                     # low-level reusable UI primitives
│   ├── layout/                 # app shell, top bar, sidebars
│   └── shared/                 # cross-feature reusable components
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── server/
│   │   ├── schemas.ts
│   │   └── types.ts
│   ├── onboarding/
│   ├── pages/
│   │   ├── components/
│   │   ├── domain/
│   │   ├── server/
│   │   ├── schemas/
│   │   ├── templates/
│   │   └── types/
│   ├── editor/
│   │   ├── components/
│   │   ├── commands/
│   │   ├── domain/
│   │   ├── server/
│   │   └── schemas/
│   ├── assistant/
│   │   ├── components/
│   │   ├── server/
│   │   ├── adapters/
│   │   └── schemas/
│   ├── leads/
│   ├── conversations/
│   ├── analytics/
│   ├── billing/
│   │   ├── server/
│   │   ├── adapters/
│   │   └── entitlements/
│   └── media/
│
├── lib/
│   ├── db/
│   ├── env/
│   ├── auth/
│   ├── logging/
│   ├── rate-limit/
│   ├── errors/
│   └── utils/
│
├── providers/
│   ├── knowchat/
│   ├── dodo/
│   └── email/
│
└── styles/
```

The exact route layout can differ, but the principles are non-negotiable:

- Domain ownership belongs to features.
- Shared UI is genuinely shared.
- Vendor-specific code is isolated.
- Generic helpers do not become a dumping ground.

Next.js's own examples demonstrate route/application code, reusable UI, and libraries under a structured app layout. Use current official guidance rather than treating this exact tree as sacred.

---

# 12. Senior Engineering Rules

## 12.1 Reusable components

Never duplicate the same UI for creator and business when behavior is the same.

For example:

```text
<SectionRenderer />
<SectionToolbar />
<LeadStatusBadge />
<ConversationList />
<AnalyticsCard />
<AiChatPanel />
```

Templates should configure existing components instead of creating duplicate components per template.

## 12.2 Keep business logic out of UI components

Bad:

```text
React component
  → fetch database
  → apply entitlement rules
  → call Dodo
  → mutate page
  → format billing logic
```

Better:

```text
React UI
  ↓
Action / use case
  ↓
Domain/application logic
  ↓
Repository/provider
```

## 12.3 Use typed use cases

Examples:

```text
CreateSmartPage
GeneratePageWithAI
ApplyPagePatch
PublishPage
ConfigureAssistant
CreateLead
GetConversation
GetDashboardAnalytics
CreateCheckoutSession
HandleDodoWebhook
```

A use case should have a clear input and output.

## 12.4 Repository pattern only where useful

Do not create pointless abstraction layers for every database query.

Use repositories/adapters around boundaries where they improve testing, portability, or domain clarity.

## 12.5 External integrations behind adapters

Example:

```ts
interface KnowChatProvider {
  createAssistant(input: CreateAssistantInput): Promise<CreateAssistantResult>;
  sendMessage(input: SendMessageInput): Promise<SendMessageResult>;
  getConversation(input: GetConversationInput): Promise<ConversationResult>;
}
```

Then:

```text
features/assistant
   ↓
KnowChatProvider interface
   ↓
providers/knowchat/KnowChatApiAdapter
```

Same concept for Dodo, email, and future integrations.

## 12.6 Runtime validation

Validate:

- API request bodies
- URL parameters when needed
- AI output
- page document JSON
- webhook payloads
- forms
- environment variables

Use Zod or an equivalent typed runtime validation library. Never assume TypeScript types validate network input at runtime.

## 12.7 Error handling

Create a consistent application error model:

```text
ValidationError
UnauthorizedError
ForbiddenError
NotFoundError
ConflictError
RateLimitError
ExternalServiceError
InternalError
```

UI should show human-readable messages; logs should contain developer diagnostics.

## 12.8 Logging

Structured server logs should include:

- request/event identifier
- user/page identifier when safe
- feature/action
- severity
- external provider operation
- duration where useful

Never log:

- API keys
- webhook secrets
- passwords
- full payment details
- unnecessary private conversation contents

## 12.9 Secrets

All provider secrets belong in environment variables / secret manager.

Never expose server-only secrets to client bundles.

Never commit secrets.

## 12.10 Database migrations

Every schema change must be represented by a migration.

Use transactions for multi-write business operations where atomicity is required. Current Prisma guidance explicitly recommends transactions when a business operation spans multiple writes.

Do not casually use destructive schema commands against production.

---

# 13. Database Model

Use UUID/CUID-style stable IDs as appropriate for the chosen ORM/database.

Conceptual entities:

```text
User
Profile
Page
PageVersion / Draft
PageSection is embedded in version JSON or normalized only if justified
Template
Lead
Conversation
ConversationLeadLink
AnalyticsEvent
Subscription
UsageRecord
NotificationPreference
MediaAsset
```

A pragmatic V1 can store the page structure as JSON inside the page/version record while keeping high-value/query-heavy entities relational.

## Suggested relationships

```text
User
  ├── Profile
  ├── Page
  │     ├── Draft document
  │     └── Published document/version
  ├── Lead[]
  ├── Conversation[] / provider references
  ├── AnalyticsEvent[]
  ├── MediaAsset[]
  └── Subscription
```

## Important fields

### User

- id
- email
- name
- createdAt
- updatedAt

### Profile

- id
- userId
- type: creator | business
- displayName
- username
- bio
- avatarUrl
- metadata JSON

### Page

- id
- userId
- profileId
- status
- draftDocument JSON
- publishedDocument JSON or publishedVersionId
- publishedAt
- createdAt
- updatedAt

### Lead

- id
- userId
- pageId
- name
- email
- phone
- message
- intent/type
- status
- source
- conversationId/reference
- metadata JSON
- createdAt
- updatedAt

### Conversation reference

Store the provider conversation ID plus safe metadata needed by the application. Avoid duplicating full provider state unnecessarily unless required for product behavior.

### AnalyticsEvent

- id
- pageId
- type
- anonymous/session identifier when appropriate
- targetId/linkId when relevant
- metadata JSON
- createdAt

### Subscription

- userId
- provider customer ID
- provider subscription ID
- product/plan reference
- status
- trial end
- current period start/end
- cancelAtPeriodEnd if provider exposes it
- timestamps

### UsageRecord

Track billable/limited AI activity.

Examples:

- page_generation
- ai_edit
- chat_message / conversation, depending on KnowChat billing unit

Do not design usage around an assumption that can differ from KnowChat's actual API billing unit. Make the metric configurable.

---

# 14. AI Architecture

## 14.1 Three AI jobs

### A. Page Composer

Input:

```text
User goal
User profile/content
Component catalogue
Design rules
```

Output:

```text
Validated PageDocument
```

### B. Conversational Editor

Input:

```text
Current PageDocument
User instruction
Component constraints
```

Output:

```text
Validated list of page operations
```

### C. Visitor Assistant

Handled through KnowChat.

Smart Pages owns the integration, permissions, presentation, and lead linkage.

## 14.2 AI safety rules

- Validate output.
- Reject unsupported components.
- Reject unknown section fields.
- Never allow AI to execute arbitrary database queries.
- Never let AI decide authorization.
- Never let AI directly call privileged internal APIs without controlled tool interfaces.
- Never trust model-generated URLs without validation/sanitization.
- Maintain a maximum operation count per edit request.

## 14.3 AI cost controls

Page generation:

- Small model is acceptable.
- Keep prompts compact.
- Use structured output.
- Prefer patches for small edits.

Visitor chat:

- Apply plan limits.
- Meter usage.
- Rate limit abuse.
- Do not allow a single user/page to exhaust the application's AI budget.

---

# 15. Component System

Every component must have five layers:

```text
1. Domain schema
2. Default data
3. Public renderer
4. Editor configuration UI
5. AI metadata / generation instructions
```

Example:

```text
components/sections/hero/
├── schema.ts
├── defaults.ts
├── HeroRenderer.tsx
├── HeroEditor.tsx
└── ai.ts
```

Do the same for gallery, services, testimonials, etc.

The AI should have a machine-readable component catalogue derived from these definitions where practical.

Example metadata:

```ts
{
  type: 'booking',
  allowedProfiles: ['business', 'creator'],
  goals: ['book', 'contact'],
  requiredData: [],
  variants: ['primary', 'compact'],
  supportsAIPlacement: true
}
```

This prevents prompt instructions from drifting away from the actual component library.

---

# 16. Design System / High-End SaaS UX

The visual quality is a core product requirement.

## 16.1 Design goals

The product should feel:

- Premium
- Calm
- Modern
- Editorial rather than overly “AI-looking”
- Fast
- Precise
- Minimal but expressive

Avoid:

- Excessive gradients
- Random glassmorphism
- Overuse of cards
- Tiny dense controls
- Inconsistent corner radii
- Too many colors
- Generic dashboard boilerplate
- “AI” badges everywhere

## 16.2 Dashboard

The dashboard should feel closer to a polished modern SaaS product than an admin panel.

Prioritize:

- clear hierarchy
- whitespace
- excellent typography
- subtle state changes
- strong empty states
- useful defaults
- responsive behavior

## 16.3 Public page

The public page matters more than the dashboard aesthetically.

A stranger should open the URL and immediately understand:

1. Who is this?
2. What do they offer?
3. What should I do next?
4. Where can I ask something?

## 16.4 Accessibility

Meet sensible WCAG-oriented practices:

- keyboard navigation
- visible focus states
- semantic headings
- labels for form inputs
- alt text
- sufficient contrast
- reduced-motion support
- screen-reader friendly interactive elements

---

# 17. Public Page Templates

## Creator template

Recommended default composition:

```text
Hero
→ Featured content
→ Main links/products
→ About
→ Social proof
→ Work with me
→ AI assistant
→ Social links
```

## Business template

```text
Hero
→ Services
→ Portfolio/gallery
→ Why choose us / differentiators
→ Testimonials
→ FAQ
→ AI assistant
→ Lead/booking CTA
→ Location/contact
```

## Tattoo / beauty template

```text
Hero
→ Gallery
→ Services
→ Pricing/starting price
→ Reviews
→ AI assistant
→ Booking
→ Location
```

## Consultancy template

```text
Hero
→ Destinations/services
→ Requirements/info
→ Success stories
→ FAQ
→ AI assistant
→ Free consultation CTA
→ Contact
```

The AI may add/remove/reorder components based on user goal.

---

# 18. Instagram / Social URL Handling

V1 must **not depend on Instagram API access**.

Allow the user to paste:

```text
https://instagram.com/username
```

Use it as:

- profile link
- optional source/context
- CTA destination

Optionally allow users to provide their own business/creator content manually.

A future “Connect Instagram” flow can be added later after verifying Meta's current permissions and API capabilities.

Do not build unofficial scraping as a required core dependency.

---

# 19. Booking in V1

Do not build a full native booking engine.

Provide a Booking CTA component that supports:

- external booking URL
- calendar URL
- WhatsApp/contact URL
- other user-provided destination

Build native booking only after validated demand.

---

# 20. Lead Inbox UX

Dashboard route:

`/dashboard/leads`

### List

Columns/cards:

- Lead name
- Intent
- Source
- Status
- Date
- Short message

Filters:

- status
- type/intent
- date

### Detail

- lead details
- linked conversation
- status actions
- source/page
- contact actions

Keep V1 intentionally simple.

---

# 21. Conversation Inbox UX

Dashboard route:

`/dashboard/conversations`

Two-pane desktop layout:

```text
Conversation list | Conversation detail
```

Each conversation should make it obvious whether it is:

- informational
- lead
- high intent
- already closed

Use data actually available from KnowChat rather than inventing intent labels when the integration does not provide them.

---

# 22. Analytics UX

Dashboard route:

`/dashboard/analytics`

V1 cards:

```text
Visitors
CTA clicks
Chat starts
Leads
```

Basic time range:

- 7 days
- 30 days

Keep event naming consistent throughout the application.

Suggested event types:

```text
page_view
cta_click
chat_start
lead_created
booking_click
```

---

# 23. Security Requirements

Minimum V1 requirements:

- Authentication on protected routes
- Server-side authorization for every owned resource
- Prevent cross-user page access
- Validate all external inputs
- Rate limit public chat/lead endpoints as appropriate
- Validate uploaded files
- Restrict upload size/type
- Signed/secure media URLs where needed
- Verify Dodo webhooks
- Idempotent webhook processing
- Protect provider secrets
- CSRF/XSS-safe rendering strategy
- Sanitize user-generated rich text/URLs

Never rely on client-side hiding for authorization.

---

# 24. SEO / Sharing for Public Pages

V1:

- Dynamic title
- Meta description
- Open Graph title/description/image
- Canonical URL where appropriate
- Basic robots handling
- Social preview

Do not overbuild SEO tooling.

---

# 25. Media Handling

V1 needs:

- image upload
- image preview
- replacement
- deletion
- sensible compression/optimization
- maximum file size
- allowed MIME types

Use the project's existing storage provider if present. Otherwise choose one compatible with deployment and isolate it behind a storage interface.

---

# 26. Empty / Loading / Error States

Every major screen must explicitly handle:

### Empty

- No page yet
- No leads
- No conversations
- No analytics
- No media

### Loading

- AI generation
- AI edit
- page save
- publish
- lead list
- conversation list
- Dodo checkout creation

### Error

- AI unavailable
- KnowChat unavailable
- invalid page configuration
- publish failed
- payment failed
- webhook issue
- file upload failed

Avoid generic “Something went wrong” where a useful action can be provided.

---

# 27. Observability / Reliability

Implement enough instrumentation to answer:

- Did page generation fail?
- Did publish fail?
- Did KnowChat request fail?
- Did Dodo webhook fail?
- How long do page generation requests take?
- How many AI messages are consumed per customer?

Add provider request IDs where available.

Webhook handlers must be safe to retry.

Background/asynchronous work should be idempotent.

---

# 28. Testing Strategy

## Unit tests

Test:

- page document validation
- page operations
- section ordering
- template application
- entitlement logic
- usage-limit logic
- lead status transitions
- analytics event normalization
- webhook event mapping

## Integration tests

Test:

- auth protected operations
- create/update/publish page
- AI response parsing
- lead creation
- KnowChat adapter behavior with mocked provider
- Dodo webhook handling with fixture payloads

## E2E tests

At minimum:

### Flow 1
Signup → onboarding → generated page → publish

### Flow 2
Edit page → save → publish → public page reflects published version

### Flow 3
Visitor → AI chat → lead capture → lead appears in dashboard

### Flow 4
Checkout/trial flow in test mode

### Flow 5
Dodo webhook updates subscription/entitlements

Vitest supports TypeScript tests without a separate Jest-style setup; Playwright is appropriate for browser-level end-to-end testing.

---

# 29. API / Server Design

Use clear server-side operations/routes.

Examples:

```text
POST   /api/pages/generate
POST   /api/pages/ai-edit
PATCH  /api/pages/draft
POST   /api/pages/publish
POST   /api/pages/unpublish
GET    /api/pages/me

POST   /api/assistant/configure
POST   /api/assistant/test
GET    /api/conversations
GET    /api/conversations/:id

GET    /api/leads
POST   /api/leads
PATCH  /api/leads/:id

GET    /api/analytics

POST   /api/billing/checkout
GET    /api/billing/subscription
POST   /api/billing/portal
POST   /api/webhooks/dodo
```

The exact mechanism may be route handlers, server actions, or a mix, depending on the existing project architecture. Keep public/server boundaries explicit.

---

# 30. Entitlements

Create a single entitlement service.

Conceptually:

```ts
canUseFeature(user, 'ai_assistant')
canUseFeature(user, 'lead_inbox')
canUseFeature(user, 'advanced_analytics')
getUsageRemaining(user, 'chat_messages')
```

Do not scatter plan checks throughout JSX.

Example anti-pattern:

```tsx
if (subscription?.plan === 'pro') ...
```

in dozens of components.

Instead use:

```ts
const entitlements = await getUserEntitlements(userId);
```

and consume those decisions at application boundaries.

---

# 31. Billing State Machine

Model billing states explicitly.

Conceptually:

```text
none
  ↓
trialing
  ↓
active
  ↓
(cancel_at_period_end?)
  ↓
canceled
```

And error states such as:

```text
past_due / payment_failed
```

must map to a clear application entitlement state.

Do not assume the frontend redirect means the payment succeeded. The Dodo webhook is authoritative for server-side subscription state.

---

# 32. Admin / Internal Operations V1

A minimal internal/admin capability is useful, but do not build a giant admin panel.

At minimum, the system should allow the developer to inspect:

- user
- page
- subscription status
- usage
- lead count
- error status / integration failures

This can initially be developer-only tooling or database/admin-provider inspection rather than a polished product screen.

---

# 33. Demo / Seed Data

Seed the local development environment with:

### Creator demo

A realistic creator page with:

- profile
- featured content
- digital product
- sponsorship CTA
- AI chat
- sample lead/conversation

### Tattoo demo

- portfolio
- services
- pricing
- booking
- FAQ
- AI
- sample leads

### Consultancy demo

- services
- study destinations
- FAQs
- consultation CTA
- AI

This makes UI development and testing much easier.

---

# 34. V1 Scope Exclusions

Do NOT build in V1:

- full CMS
- blog platform
- multi-page websites
- full ecommerce platform
- native payment collection from page visitors
- native booking engine
- email marketing platform
- social media scheduler
- Instagram posting API
- automatic Instagram DM automation
- advanced CRM
- team collaboration
- white-label mode
- agency multi-client management
- custom code blocks
- arbitrary CSS editor
- complex page animations system
- dozens of templates
- full custom domain management unless trivially supported by the infrastructure
- advanced A/B testing
- revenue attribution
- native social account syncing

Architect for future expansion but do not implement these features.

---

# 35. Product Metrics

## Activation

Primary V1 activation event:

> **Page published + first meaningful visitor interaction**

Secondary milestones:

- AI assistant configured
- first chat
- first CTA click
- first lead

## Creator value metrics

- conversations
- high-intent conversations
- leads
- sponsorship/collaboration inquiries
- CTA actions

## Business value metrics

- leads
- booking clicks
- contact actions
- AI interactions
- conversion actions

## SaaS health metrics

- trial starts
- trial-to-paid conversion
- activation rate
- monthly recurring revenue
- churn
- AI usage/customer
- support incidents

Do not optimize only for page creation count.

---

# 36. Unit Economics Instrumentation

From day one, collect enough usage information to estimate:

```text
Revenue/customer
- Dodo/payment costs
- LLM cost
- KnowChat usage cost
- email cost
- storage
- database/compute
= gross contribution
```

The page generation/editor AI is expected to be relatively inexpensive when using structured output and small models. Public assistant usage is the main variable-cost risk.

Therefore the system must meter AI usage by customer/page and enforce configurable limits.

---

# 37. Brand / Naming

The current product concept should use:

# **Smart Pages**

Avoid locking the company into “Link in Bio” language in the product architecture or domain.

The page can replace a link-in-bio tool today, but the brand should still make sense if the product grows into:

```text
Smart Page
  ↓
AI assistant
  ↓
Lead inbox
  ↓
Conversation intelligence
  ↓
Business/creator relationship layer
```

Do not pick a final domain inside this engineering spec. Domain/trademark research is a separate decision.

---

# 38. Chunked Implementation Plan

The user will tell Antigravity which chunk to implement, e.g.:

> “Implement Chunk 3.”

When a chunk is requested:

1. Read this entire specification.
2. Inspect the current repository and existing implementation.
3. Verify dependencies already created by prior chunks.
4. Implement only the requested chunk and strictly required supporting changes.
5. Do not rebuild unrelated features.
6. Run relevant tests/typecheck/lint/build.
7. Fix issues caused by the chunk.
8. Summarize files changed and what remains.
9. Do not invent new product decisions unless this specification explicitly leaves the decision open; prefer the least-scope choice.

## Chunk 0 — Repository audit + implementation contract

**Goal:** Understand existing repository before modifying it.

Tasks:

- Inspect current stack.
- Inspect package manager.
- Inspect existing auth/database/components.
- Inspect current env configuration.
- Determine whether project is empty or existing.
- Identify conflicts with this specification.
- Recommend exact implementation adjustments only when necessary.
- Create/update a `docs/ARCHITECTURE.md` if useful.
- Do not build product UI yet.

Acceptance:

- Clear architecture documented.
- No unnecessary dependency churn.
- Existing good code preserved.

## Chunk 1 — Foundation / project architecture

**Goal:** Establish maintainable engineering foundation.

Tasks:

- TypeScript strict configuration.
- Environment validation.
- database connection.
- migrations.
- core error model.
- logging.
- shared UI primitives.
- feature module structure.
- base app layout.
- authentication integration or foundation.
- testing infrastructure.

Acceptance:

- App starts cleanly.
- DB connects.
- Typecheck passes.
- Tests run.
- Folder boundaries established.

## Chunk 2 — Data model + auth + profiles

**Goal:** Users can create an account and own a Smart Page profile.

Tasks:

- User model.
- Profile model.
- Page model.
- subscription/usage models scaffolded.
- authentication.
- authorization helpers.
- creator/business profile type.
- username uniqueness/reserved-name handling.

Acceptance:

- User can sign up/login.
- User gets profile.
- User can create/retrieve own page.
- Another user cannot access it.

## Chunk 3 — Page document engine + component registry

**Goal:** Build the reusable page system before building the visual editor.

Tasks:

- PageDocument schema.
- discriminated section types.
- validation.
- component registry.
- section defaults.
- template schema.
- renderer interface.
- versioning strategy.
- page operations.
- unit tests for page transformations.

Acceptance:

- A valid PageDocument can render.
- Add/remove/move/update operations work.
- Invalid documents are rejected.
- Components are registry-driven.

## Chunk 4 — Public page renderer + templates

**Goal:** Beautiful public Smart Pages work without the editor.

Tasks:

- Build all V1 public section renderers.
- Build 4–5 templates.
- Responsive design.
- Mobile-first behavior.
- SEO/share metadata.
- public `/:username` route.
- sample seeded pages.

Acceptance:

- Creator template looks premium.
- Business template looks premium.
- Tattoo/beauty template works.
- Consultancy template works.
- Public page is fast and responsive.

## Chunk 5 — Editor shell + page manipulation

**Goal:** Users can visually edit the page.

Tasks:

- editor route.
- three-column or equivalent editor layout.
- page preview.
- section list.
- add/remove/reorder.
- select section.
- save draft.
- autosave.
- publish/unpublish.
- draft vs published behavior.
- undo/redo.

Acceptance:

- User can take template and fully edit it.
- Draft edits don't alter published page until publish.
- Save state is reliable.

## Chunk 6 — Section editors + deep customization

**Goal:** Make the editor genuinely customizable.

Tasks:

- Hero editor.
- text editor.
- image/gallery editor.
- links/social editor.
- services/products.
- testimonials.
- FAQ.
- CTA.
- booking.
- lead form.
- location.
- assistant section.
- theme controls.
- typography controls.
- spacing/layout controls.

Acceptance:

- Every V1 component has an editor.
- No component requires direct JSON editing by the user.
- Design controls preserve page quality.

## Chunk 7 — AI page composer

**Goal:** User can provide intent/content and receive a complete first page.

Tasks:

- AI composer service.
- structured output.
- Zod validation.
- component catalogue prompt/context.
- template recommendation.
- page generation API/action.
- usage accounting.
- loading/error/retry states.
- generated page preview.

Acceptance:

- Creator prompt generates creator-appropriate page.
- Business prompt generates business-appropriate page.
- Invalid model output never reaches renderer.
- AI cannot invent unsupported components.

## Chunk 8 — Conversational AI editor

**Goal:** User can modify the page through natural language.

Tasks:

- AI editor panel.
- page context builder.
- patch/operation schema.
- command validation.
- operation preview where useful.
- apply changes.
- undo.
- usage tracking.
- suggested prompts.

Acceptance:

- “Move booking up” works.
- “Remove testimonials” works.
- “Make it premium” modifies supported style tokens.
- Unsafe/invalid changes are rejected cleanly.

## Chunk 9 — KnowChat integration + assistant configuration

**Goal:** AI assistant works on page and in dashboard.

Tasks:

- verify KnowChat API/docs.
- implement typed adapter.
- assistant configuration model.
- guided dashboard configuration.
- test assistant UI.
- public assistant UI.
- conversation reference storage.
- failure fallback.
- rate limiting/usage enforcement.

Acceptance:

- Public assistant can answer through KnowChat.
- Dashboard test works.
- KnowChat failure does not break entire page.
- Customer never needs to understand internal provider architecture.

## Chunk 10 — Lead inbox + conversations + notifications

**Goal:** Turn conversations into visible opportunities.

Tasks:

- leads schema.
- lead creation from form.
- lead creation from assistant flow as supported by KnowChat integration.
- lead list.
- lead detail.
- status changes.
- conversation list/detail.
- email notification for new lead.
- permission checks.

Acceptance:

- User sees lead and linked conversation.
- Status changes persist.
- No cross-user leakage.

## Chunk 11 — Analytics

**Goal:** Show product outcomes.

Tasks:

- event ingestion.
- page view tracking.
- CTA tracking.
- chat start tracking.
- lead tracking.
- analytics dashboard.
- 7-day / 30-day ranges.

Acceptance:

- Public traffic creates events.
- Dashboard numbers are consistent.
- Analytics do not expose visitor private message content unnecessarily.

## Chunk 12 — Dodo Payments + trial + entitlements

**Goal:** Monetization is production-grade.

Tasks:

- Dodo product configuration support.
- checkout creation.
- 14-day trial.
- card-required trial flow.
- subscription state sync.
- webhook signature verification.
- idempotency.
- trial expiration behavior.
- cancellation.
- payment failure behavior.
- customer portal where supported.
- entitlement service.
- usage limits.
- billing settings UI.

Acceptance:

- Test mode full subscription flow works.
- Browser redirects are not treated as the authority for subscription state.
- Replayed webhook does not duplicate records.
- Feature access follows current entitlement state.

## Chunk 13 — Media + polish + reliability

**Goal:** Harden the core product.

Tasks:

- image upload.
- compression/optimization.
- media deletion.
- accessibility pass.
- loading states.
- error states.
- empty states.
- security review.
- rate limiting review.
- logging/observability.
- performance pass.

Acceptance:

- Major failure modes have recoverable UX.
- No obvious security hole.
- Public pages remain usable if AI is unavailable.

## Chunk 14 — Complete QA / E2E / launch readiness

**Goal:** Verify the complete product before marketing.

Tasks:

- E2E suite.
- onboarding E2E.
- publish E2E.
- AI edit E2E.
- KnowChat flow E2E/mocked integration tests.
- Dodo test flow.
- mobile browser QA.
- accessibility QA.
- build/deploy validation.
- environment variable audit.
- documentation/runbook.

Acceptance:

- Clean production build.
- All critical journeys pass.
- Known limitations documented.

## Chunk 15 — Marketing landing page LAST

**Important:** Do not implement the marketing landing page until all core product chunks are completed and manually tested.

Goal:

Build a high-end SaaS marketing site that sells the actual product experience, not hypothetical features.

Required sections:

1. Hero
2. Interactive/live Smart Page demo
3. Problem
4. Before/after
5. How it works
6. Creator use case
7. Business use case
8. AI assistant demo
9. Lead inbox demo
10. Editor demo
11. Templates/use cases
12. Pricing
13. Trial CTA
14. FAQ
15. Footer

The landing page should make the visitor understand the value in seconds.

Do not use generic claims that cannot be proven.

---

# 39. Antigravity Working Rules

When implementing any chunk:

### Rule 1 — Inspect before editing

Always inspect related existing files first.

### Rule 2 — Reuse before creating

Reuse existing components, utilities, types, providers, and database abstractions before adding duplicates.

### Rule 3 — No giant files

Split components/services when they develop distinct responsibilities.

Avoid:

```text
Editor.tsx = 2,000 lines
```

Prefer feature-specific composition.

### Rule 4 — No `any`

Do not introduce `any` to silence TypeScript. Fix the type model.

### Rule 5 — Validate boundaries

Validate network, database-untrusted, user, AI, and webhook inputs.

### Rule 6 — Keep provider code isolated

No random Dodo or KnowChat API calls sprinkled throughout UI files.

### Rule 7 — Server authorization

Every mutation verifies ownership/permission on the server.

### Rule 8 — Preserve working behavior

A later chunk must not break an earlier chunk.

### Rule 9 — Run checks after every chunk

At minimum:

```text
lint
 typecheck
 unit/integration tests
 production build
```

Run relevant E2E tests when a user journey changes.

### Rule 10 — No speculative abstraction

Do not build abstractions for hypothetical future requirements. Build reusable boundaries where repeated behavior already exists or where a true provider/domain boundary exists.

### Rule 11 — No scope creep

Do not implement excluded V1 features.

### Rule 12 — Keep AI deterministic

AI should output structured operations/configuration constrained by schemas.

### Rule 13 — No secrets in source

Use environment variables.

### Rule 14 — Don't hide errors

Never add broad silent catches that make the UI appear successful when the operation failed.

### Rule 15 — Quality over speed

The editor and public page are flagship surfaces. Do not ship rough generic UI merely because functionality works.

---

# 40. Definition of Done

A V1 chunk is complete only when:

- Implementation matches this specification.
- Code follows the architecture.
- No known TypeScript errors.
- Relevant tests pass.
- Relevant user flow works in the browser.
- Loading/empty/error states exist.
- Authorization is enforced.
- No secrets are leaked.
- Database migrations are included when schema changed.
- Existing features remain functional.
- The code is modular and reusable.
- The implementation does not add excluded V1 features.

---

# 41. Final V1 Product Flow

The entire V1 should feel like this:

```text
                SMART PAGES
                     │
          ┌──────────┴──────────┐
          │                     │
       CREATOR              BUSINESS
          │                     │
          └──────────┬──────────┘
                     ↓
                SIGN UP
                     ↓
               PICK GOAL
                     ↓
            GIVE AI RAW MATERIAL
                     ↓
              AI BUILDS PAGE
                     ↓
         VISUAL + AI EDITOR
                     ↓
           CONFIGURE ASSISTANT
                     ↓
               TEST AI
                     ↓
             CONFIGURE LEADS
                     ↓
                  PUBLISH
                     ↓
       INSTAGRAM / SOCIAL TRAFFIC
                     ↓
                 SMART PAGE
                     ↓
            ┌────────┴────────┐
            ↓                 ↓
          CTA               AI CHAT
            ↓                 ↓
       BOOK / BUY /      ANSWER / QUALIFY
        CONTACT               ↓
            │              LEAD
            └────────┬────────┘
                     ↓
                 LEAD INBOX
                     ↓
                  ANALYTICS
                     ↓
                  RETENTION
                     ↓
                    BILLING
```

---

# 42. Product Definition in One Sentence

> **Smart Pages lets creators and businesses turn social-media traffic into a beautiful, interactive destination where visitors can understand the brand, get AI-powered answers, and take actions such as becoming a lead, booking, buying, or contacting the owner.**

---

# 43. Engineering Definition in One Sentence

> **Build a modular, type-safe, schema-validated Next.js-style modular monolith whose page system is data-driven, whose AI is constrained to structured page operations, whose external providers are isolated behind adapters, and whose core user journeys are covered by automated tests.**

---

# 44. Sources / Current Engineering References

Use official documentation as the source of truth when implementation details differ from this document.

### Next.js

- Next.js official docs: https://nextjs.org/docs
- App Router/dashboard structure example: https://nextjs.org/learn/dashboard-app/getting-started

### TypeScript

- Strict mode: https://www.typescriptlang.org/tsconfig/strict

### Zod

- Official docs: https://zod.dev/

### Prisma / database engineering

- Migrations: https://www.prisma.io/docs/orm/migrations/how-migrations-work
- Transactions: https://www.prisma.io/docs/orm/fundamentals/transactions

### Testing

- Vitest guide: https://main.vitest.dev/guide/learn/writing-tests
- Playwright docs: https://playwright.dev/

### Dodo Payments

- Official documentation: https://docs.dodopayments.com/
- Official Next.js/Supabase subscription starter: https://docs.dodopayments.com/vi/developer-resources/supabase-boilerplate
- Dodo webhook/API documentation should be rechecked at implementation time.

### KnowChat

KnowChat is first-party to this product. Use the current internal/API documentation available to the project. Do not invent endpoints, authentication schemes, or billing units.

---

# 45. Build Command Convention

The founder will issue commands like:

> `Implement Chunk 3.`

or:

> `Implement Chunk 9.`

Antigravity must then execute only that chunk and its strictly required dependencies.

For a multi-chunk command, for example:

> `Implement Chunks 5 and 6.`

implement them in dependency order and run checks between them where practical.

When the founder says:

> `We are ready for the next chunk.`

inspect the current repository state first; do not assume previous chunk implementation exactly matches the expected state.

---

# 46. Final Non-Negotiables

1. **Landing page is last.**
2. **Public page quality is flagship-level.**
3. **Editor is AI-first but fully manually editable.**
4. **AI only uses supported components and validated operations.**
5. **KnowChat powers the public assistant through an isolated adapter.**
6. **Leads and conversations are first-class V1 objects.**
7. **Dodo Payments owns billing events; webhooks synchronize application state.**
8. **Usage limits prevent AI-cost abuse.**
9. **The application remains useful even when AI is unavailable.**
10. **No generic website-builder scope creep.**
11. **No duplicated creator/business code when a shared abstraction is appropriate.**
12. **No giant monolithic files or catch-all utility/service modules.**
13. **No secrets in source.**
14. **All external inputs and AI outputs are runtime-validated.**
15. **Every user-facing flow has loading, empty, success, and error states.**
16. **Test every critical journey before considering V1 complete.**

