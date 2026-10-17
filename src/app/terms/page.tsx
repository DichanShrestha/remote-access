import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Scale, AlertCircle, Sparkles, CreditCard, ShieldCheck, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the Pageory Terms of Service governing your use of our website builder, AI chatbot, and subscription plans.",
  alternates: { canonical: "/terms" },
};

export default function TermsOfServicePage() {
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
            <Scale size={13} className="text-[#292A25]" /> Legal Agreement
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#292A25] leading-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-[#777970] leading-relaxed max-w-2xl">
            Please read these Terms carefully before using Pageory. By creating an account or accessing the platform, you agree to be bound by these provisions.
          </p>
          <p className="text-xs text-[#8C8D85] mt-4 font-mono">
            Effective Date: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid gap-12 text-[#3C3D37]">
          {/* Executive Overview */}
          <div className="p-6 rounded-2xl bg-white border border-[#E8E7E1] shadow-xs space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#777970]">
              Summary of What You Agree To
            </h2>
            <p className="text-xs sm:text-sm text-[#565850] leading-relaxed">
              You own your content and knowledge documents. You are responsible for the materials you publish and the accuracy of the information provided to your AI assistant. We provide reliable hosting, AI technology, and page builder tools subject to lawful and respectful use.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-[#292A25] flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E8E7E1] text-[#565850]">01</span>
              Acceptance of Terms
            </h2>
            <p className="text-sm leading-relaxed">
              These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and Pageory (&ldquo;Pageory,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), governing your access to and use of <strong>pageory.app</strong> and all related applications, APIs, widgets, and services (collectively, the &ldquo;Service&rdquo;).
            </p>
            <p className="text-sm leading-relaxed">
              If you do not agree to these Terms, you may not register for or use the Service. If you are entering into these Terms on behalf of an entity or organization, you represent that you possess the authority to bind that entity.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-[#292A25] flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E8E7E1] text-[#565850]">02</span>
              Account Registration & Security
            </h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                To create a public page or configure an assistant, you must register for an account using a valid email address. You agree to provide true, accurate, and current information during registration.
              </p>
              <p>
                You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access or security breach.
              </p>
              <p>
                <strong>Username Handles:</strong> Pageory grants you a revocable license to use your chosen username URL handle (e.g., <code>pageory.app/username</code>). We reserve the right to reclaim or reassign handles that infringe upon trademarks, impersonate public figures, violate reserved naming policies, or remain inactive for extended durations.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-[#292A25] flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E8E7E1] text-[#565850]">03</span>
              Acceptable Use & Prohibited Conduct
            </h2>
            <p className="text-sm leading-relaxed">
              You agree to use Pageory solely for lawful purposes. You agree NOT to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Publish, upload, or transmit any content that is illegal, defamatory, obscene, harassing, threatening, or fraudulent.</li>
              <li>Upload malicious code, viruses, or exploit scripts, or attempt to compromise server security or perform unauthorized penetration testing.</li>
              <li>Scrape, index, or harvest user data, email addresses, or platform assets without authorization.</li>
              <li>Use the AI chatbot or knowledge ingestion tools to generate phishing lures, spam, deceptive impersonations, or hate speech.</li>
              <li>Upload confidential documents, trade secrets, or copyrighted materials that you do not hold rights or licenses to publish or process.</li>
              <li>Interfere with or circumvent rate limits, quotas, billing mechanisms, or server stability.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-[#292A25] flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E8E7E1] text-[#565850]">04</span>
              AI Chatbot & Conversational Assistant Terms
            </h2>
            <div className="p-4 rounded-xl border border-[#E8E7E1] bg-[#F5F4EE] space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-semibold text-[#292A25]">
                <Sparkles size={16} /> Important Notice Regarding AI Features
              </div>
              <p className="text-[#565850] leading-relaxed">
                Pageory utilizes probabilistic artificial intelligence models (such as Claude, Gemini, and OpenAI via OpenRouter) to generate conversational responses from your uploaded files and FAQs.
              </p>
            </div>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                <strong>Accuracy & Creator Responsibility:</strong> You understand that AI models may occasionally produce incomplete, inaccurate, or unexpected responses (&ldquo;hallucinations&rdquo;). You are solely responsible for writing accurate system prompts, auditing your knowledge sources, and reviewing conversation history.
              </p>
              <p>
                <strong>No Professional Advice:</strong> Pageory&rsquo;s AI chatbot is not a licensed attorney, doctor, financial advisor, or accredited professional. You may not deploy the assistant to give binding legal, medical, or financial advice.
              </p>
              <p>
                <strong>Visitor Notification:</strong> The widget is configured to engage visitors transparently. You agree not to disguise or falsely represent AI chatbot responses as live human conversations when asked directly by visitors.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-[#292A25] flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E8E7E1] text-[#565850]">05</span>
              Subscriptions, Billing & Free Trials
            </h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                <strong>Free Trials:</strong> We offer a 14-day free trial on selected plans to allow new users to experience Pageory. Free trials are limited to one per user/organization. At the conclusion of your trial, continued access to premium features requires choosing an active plan.
              </p>
              <p>
                <strong>Subscription Plans:</strong> Paid subscriptions (Starter and Growth) are billed in advance on a recurring monthly basis through our payment provider, <strong>Dodo Payments</strong>.
              </p>
              <p>
                <strong>Cancellation:</strong> You may cancel your subscription at any time via your Dashboard Settings. Upon cancellation, your subscription remains active until the end of your current paid billing period.
              </p>
              <p>
                <strong>Refunds:</strong> Payments are generally non-refundable except where required by applicable consumer law or in the case of technical billing errors promptly reported to our support team.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-[#292A25] flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E8E7E1] text-[#565850]">06</span>
              Intellectual Property Rights
            </h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                <strong>Your Content:</strong> You retain full copyright and ownership of all text, photographs, graphics, trademarks, documents, and knowledge items you upload to Pageory. You grant Pageory a non-exclusive, worldwide, royalty-free license solely to host, parse, generate embeddings for, and display your content to provide the Service.
              </p>
              <p>
                <strong>Pageory Property:</strong> Pageory and its licensors retain all right, title, and interest in and to the platform, including page templates, source code, UI designs, brand marks, and documentation.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-[#292A25] flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E8E7E1] text-[#565850]">07</span>
              Termination & Suspension
            </h2>
            <p className="text-sm leading-relaxed">
              You may terminate your account at any time via the Settings dashboard. We reserve the right to suspend or terminate your access immediately, without prior notice, if you breach these Terms, commit fraudulent payment activity, or engage in abusive behavior that threatens the security or stability of the platform.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-[#292A25] flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E8E7E1] text-[#565850]">08</span>
              Disclaimers & Limitation of Liability
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-[#565850]">
              <p>
                THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, PAGEORY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, DATA, USE, OR GOODWILL ARISING FROM OR RELATED TO YOUR USE OF THE SERVICE OR ANY ACTIONS TAKEN BY VISITORS OR THIRD PARTIES.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-[#292A25] flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#E8E7E1] text-[#565850]">09</span>
              Modifications to These Terms
            </h2>
            <p className="text-sm leading-relaxed">
              We may revise these Terms from time to time. When changes are made, we will update the &ldquo;Effective Date&rdquo; at the top of this page. For significant updates, we will provide notice via your account email or through a banner notification in the dashboard.
            </p>
          </section>

          {/* Section 10 */}
          <section className="p-6 rounded-2xl bg-[#F5F4EE] border border-[#E8E7E1] space-y-3">
            <h2 className="font-serif text-xl text-[#292A25] flex items-center gap-2">
              <Mail size={18} /> Contact & Legal Inquiries
            </h2>
            <p className="text-xs sm:text-sm text-[#565850] leading-relaxed">
              If you have any questions about these Terms of Service, please contact our legal and support team at:
            </p>
            <p className="text-sm font-medium text-[#292A25]">
              <a href="mailto:legal@pageory.app" className="underline hover:text-black">
                legal@pageory.app
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
            <Link href="/terms" className="font-semibold text-[#292A25]">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-[#292A25] transition-colors">
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
