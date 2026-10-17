import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, Lock, Eye, Database, FileText, CheckCircle2, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Pageory collects, uses, and safeguards your personal data, knowledge base content, and visitor interactions.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 17, 2026";

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#292A25] font-sans antialiased selection:bg-[#deddd6] selection:text-[#292A25]">
      {/* Top Header */}
      <header className="border-b border-[#E8E7E1] bg-[#FDFCF8]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="Pageory"
              width={26}
              height={26}
              className="rounded-md object-contain"
            />
            <span className="font-semibold text-base tracking-tight text-[#292A25]">
              Pageory
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#777970] hover:text-[#292A25] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-[#E8E7E1] bg-gradient-to-b from-[#F5F4EE] to-[#FDFCF8] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E7E1] text-[#565850] text-[11px] font-medium tracking-wide uppercase mb-4">
            <Shield size={13} className="text-[#292A25]" /> Legal & Compliance
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#292A25] leading-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-[#777970] leading-relaxed max-w-2xl">
            At Pageory, we believe in radical transparency. This policy outlines exactly what data we collect from creators and visitors, how our AI features operate, and how your information is safeguarded.
          </p>
          <p className="text-xs text-[#8C8D85] mt-4 font-mono">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid gap-12 text-[#3C3D37]">
          {/* Quick Summary Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E7E1] shadow-xs">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#777970] mb-4">
              Key Highlights at a Glance
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-xs leading-relaxed text-[#565850]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#292A25] shrink-0 mt-0.5" />
                <span><strong>Creator Ownership:</strong> You retain 100% ownership of your content, media, and knowledge bases.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#292A25] shrink-0 mt-0.5" />
                <span><strong>No Model Training:</strong> Your private documents and chat logs are never used to train public foundation models.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#292A25] shrink-0 mt-0.5" />
                <span><strong>Complete Deletion:</strong> Deleting your account permanently wipes your pages, bots, vectors, and files.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#292A25] shrink-0 mt-0.5" />
                <span><strong>No Ad Tracking:</strong> We do not sell your personal data or track your visitors across third-party websites.</span>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-[#292A25] flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E8E7E1] text-[#565850]">01</span>
              Who We Are
            </h2>
            <p className="text-sm leading-relaxed">
              Pageory (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), accessible via <strong>pageory.app</strong>, is a platform designed to help creators, professionals, and businesses present their work through customizable web pages equipped with an AI conversational assistant.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-[#292A25] flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E8E7E1] text-[#565850]">02</span>
              Information We Collect
            </h2>
            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold text-[#292A25] mb-1">A. Creator Account & Profile Information</h3>
                <p>
                  When you register for Pageory, we collect your email address, display name, profile avatar, and account credentials through our authentication provider (Supabase Auth). We also record the custom username handle you claim (e.g., <code>pageory.app/username</code>).
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[#292A25] mb-1">B. Page Content, Media & Knowledge Base Data</h3>
                <p>
                  To build your page and train your AI chatbot, you may provide biographies, social links, images, pricing catalogs, and training documents (such as uploaded PDFs, text documents, custom Q&amp;As, or external website URLs you submit for indexing).
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[#292A25] mb-1">C. Visitor & Lead Capture Data</h3>
                <p>
                  When visitors interact with a creator&rsquo;s published page, our system records visitor interactions. If a visitor submits an inquiry or lead capture form via the chat widget, we store their submitted details (such as name, email, phone number, and conversation snippet) on behalf of that creator so they can respond.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[#292A25] mb-1">D. Usage & Analytics Information</h3>
                <p>
                  We collect operational metrics such as page views, button/link clicks, AI token consumption, and booking link click-throughs to provide creators with engagement insights in their dashboard.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-[#292A25] flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E8E7E1] text-[#565850]">03</span>
              How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>To provide, maintain, and render your custom Pageory web page and interactive preview tools.</li>
              <li>To generate semantic vector embeddings and deliver accurate AI responses based solely on your configured knowledge sources.</li>
              <li>To deliver lead notifications and display aggregated conversation history in your private dashboard.</li>
              <li>To process subscription payments and calculate usage tiers.</li>
              <li>To protect against abuse, brute-force login attempts, spam, and denial-of-service attacks via rate limiting.</li>
              <li>To send essential transactional notifications (such as billing receipts and password reset links).</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-[#292A25] flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E8E7E1] text-[#565850]">04</span>
              AI Processing & Third-Party Subprocessors
            </h2>
            <p className="text-sm leading-relaxed">
              We partner with specialized, security-audited infrastructure providers to operate the service. We only share data strictly necessary to fulfill each function:
            </p>
            <div className="grid gap-3 text-xs sm:text-sm">
              <div className="p-4 rounded-xl border border-[#E8E7E1] bg-white">
                <span className="font-semibold text-[#292A25]">AI Providers (OpenRouter, Google Gemini, Anthropic Claude):</span>
                <p className="text-[#565850] mt-1">
                  Processes user questions against retrieved knowledge context snippets. In accordance with commercial API terms, customer prompts and training vectors are not used to train public foundation AI models.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[#E8E7E1] bg-white">
                <span className="font-semibold text-[#292A25]">Database & Storage (Supabase & PostgreSQL / pgvector):</span>
                <p className="text-[#565850] mt-1">
                  Secures user authentication sessions, relational application tables, vector embeddings, and uploaded image/document files with encryption in transit and at rest.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[#E8E7E1] bg-white">
                <span className="font-semibold text-[#292A25]">Payment Processing (Dodo Payments):</span>
                <p className="text-[#565850] mt-1">
                  Handles credit card billing and checkout sessions. Pageory never collects, views, or stores raw payment card numbers.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[#E8E7E1] bg-white">
                <span className="font-semibold text-[#292A25]">Web Ingestion (Jina AI Reader):</span>
                <p className="text-[#565850] mt-1">
                  Extracts clean markdown from public website URLs that creators explicitly choose to index into their chatbot assistant.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-[#292A25] flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E8E7E1] text-[#565850]">05</span>
              Data Retention, Export & Deletion
            </h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                <strong>Exporting Your Data:</strong> Creators can download a full JSON archive of their profile, pages, bot configurations, conversation summaries, and leads directly from the Account Settings panel at any time.
              </p>
              <p>
                <strong>Permanent Account Deletion:</strong> When you delete your account in Settings, our system permanently purges your user profile, published pages, document storage objects, vector embeddings, and leads from our primary database and Supabase authentication systems.
              </p>
              <p>
                <strong>Automated Inactive Knowledge Purging:</strong> To prevent indefinite retention of unused files, knowledge sources and document embeddings belonging to inactive or lapsed trial accounts are automatically purged 30 days after subscription expiration.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-[#292A25] flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E8E7E1] text-[#565850]">06</span>
              Cookies & Storage
            </h2>
            <p className="text-sm leading-relaxed">
              We use strictly necessary first-party cookies for authentication, maintaining your logged-in session, and protecting against CSRF attacks. We do not use third-party behavioral advertising cookies or tracking pixels.
            </p>
          </section>

          {/* Section 8 */}
          <section className="p-6 rounded-2xl bg-[#F5F4EE] border border-[#E8E7E1] space-y-3">
            <h2 className="font-serif text-xl text-[#292A25] flex items-center gap-2">
              <Mail size={18} /> Contact Our Privacy Team
            </h2>
            <p className="text-xs sm:text-sm text-[#565850] leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or how your data is handled, please reach out to us at:
            </p>
            <p className="text-sm font-medium text-[#292A25]">
              <a href="mailto:privacy@pageory.app" className="underline hover:text-black">
                privacy@pageory.app
              </a>{" "}
              or{" "}
              <a href="mailto:support@pageory.app" className="underline hover:text-black">
                support@pageory.app
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E7E1] py-8 text-center text-xs text-[#777970] bg-[#FDFCF8]">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Pageory. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-[#292A25] transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="font-semibold text-[#292A25]">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-[#292A25] transition-colors">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
