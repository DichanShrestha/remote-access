'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { startCurrentFreeTrial } from '@/app/onboarding/actions';

type Limits = { 
  bots: number; 
  characterLimit: number; 
  messages: number; 
  catalogImages: number; 
  catalogSearchResults: number 
};

export function PlanSelection({ 
  username, 
  domain, 
  endsAt, 
  limits 
}: { 
  username: string; 
  domain: string; 
  endsAt: string; 
  limits: Limits 
}) {
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const endDate = new Date(endsAt).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric', 
    timeZone: 'UTC' 
  });

  const handleSelectPlan = (planId: string) => {
    setPendingPlan(planId);
    setError('');
    startTransition(async () => {
      const result = await startCurrentFreeTrial(planId);
      if (result?.error) {
        setError(result.error);
        setPendingPlan(null);
      }
    });
  };

  return (
    <main className="plan-page min-h-screen bg-[#F8F7F2] text-[#292A25] font-sans pb-16">
      {/* Top Header */}
      <header className="onboard-top max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#E8E7E1]/60">
        <Link href="/onboarding/claim" className="onboard-back flex items-center gap-2 text-xs text-[#777970] hover:text-[#292A25] transition-colors">
          <ArrowLeft size={15}/> Back to Username
        </Link>
        <a href="/" className="onboard-brand text-sm font-semibold tracking-tight text-[#292A25]">
          <span className="onboard-mark text-emerald-600 font-bold">s.</span> Smart Page
        </a>
        <span className="text-[11px] font-mono tracking-widest text-[#92938A] uppercase flex items-center gap-1.5">
          YOUR PAGE <i className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></i> READY
        </span>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-8">
        {/* Page Title & Copy */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="onboard-kicker text-[11px] font-mono uppercase tracking-[0.2em] text-[#898A82] mb-3">
            ONE LAST STEP BEFORE THE WORLD SEES IT
          </p>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-[#292A25] mb-4">
            Choose how to <em>begin.</em>
          </h1>
          <p className="text-sm md:text-base text-[#777970] leading-relaxed mb-6">
            Both plans include a <strong>14-day free trial</strong> with <strong>no credit card required</strong>. Your page will publish live immediately.
          </p>

          <div className="inline-flex items-center gap-2 bg-[#FDFCF8] border border-[#E8E7E1] px-4 py-2.5 rounded-xl shadow-xs text-xs text-[#777970]">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#A1A299]">Live address:</span>
            <strong className="text-[#292A25] font-medium">{domain}/<span className="font-semibold text-emerald-700">{username}</span></strong>
          </div>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs text-center">
            {error}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch mb-12">
          
          {/* Plan 1: Smart Page ($9/mo) */}
          <div className="bg-[#FDFCF8] border border-[#E5E3DB] rounded-2xl p-8 shadow-sm flex flex-col justify-between hover:border-[#D1CFB5] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono tracking-wider text-[#92938A] uppercase font-semibold">Standard Plan</span>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  14 Days Free
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#292A25] mb-2 font-serif">Smart Page</h2>
              <p className="text-xs text-[#777970] mb-6">For creators & businesses wanting a clean, high-converting digital storefront.</p>

              <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-[#E8E7E1]">
                <span className="text-4xl font-bold text-[#292A25]">$9</span>
                <span className="text-xs text-[#898A82]">/ month after trial</span>
                <span className="ml-auto text-xs font-semibold text-[#292A25] bg-[#F3F2EA] px-2.5 py-1 rounded-lg">$0 today</span>
              </div>

              <div className="space-y-3.5 mb-8 text-xs text-[#55574E]">
                <div className="font-semibold text-[11px] font-mono text-[#92938A] uppercase tracking-wider mb-2">What's Included:</div>
                <div className="flex items-center gap-2.5">
                  <Check size={15} className="text-emerald-600 shrink-0" />
                  <span>Business / Creator templates</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={15} className="text-emerald-600 shrink-0" />
                  <span>Customization & full branding</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={15} className="text-emerald-600 shrink-0" />
                  <span>Unlimited links & components</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={15} className="text-emerald-600 shrink-0" />
                  <span>Custom profile URL & QR code</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={15} className="text-emerald-600 shrink-0" />
                  <span>Basic analytics (views, clicks, CTR)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('smart_page')}
              disabled={isPending}
              className="w-full py-3.5 px-5 bg-[#292A25] hover:bg-[#3C3D37] text-[#FDFCF8] font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending && pendingPlan === 'smart_page' ? (
                'Publishing your page…'
              ) : (
                <>
                  Start 14-Day Free Trial
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>

          {/* Plan 2: Smart Page + AI ($29/mo) */}
          <div className="bg-[#292A25] text-[#FDFCF8] border border-[#3C3D37] rounded-2xl p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono tracking-wider text-amber-300 uppercase font-semibold flex items-center gap-1">
                  <Sparkles size={13} className="text-amber-300" /> RECOMMENDED
                </span>
                <span className="text-[11px] font-medium text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                  14 Days Free
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#FDFCF8] mb-2 font-serif">Smart Page + AI</h2>
              <p className="text-xs text-[#A1A299] mb-6">For brands that want an automated AI assistant capturing leads 24/7.</p>

              <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-[#3C3D37]">
                <span className="text-4xl font-bold text-[#FDFCF8]">$29</span>
                <span className="text-xs text-[#A1A299]">/ month after trial</span>
                <span className="ml-auto text-xs font-semibold text-[#FDFCF8] bg-[#3C3D37] px-2.5 py-1 rounded-lg">$0 today</span>
              </div>

              <div className="space-y-3.5 mb-8 text-xs text-[#DEDDD6]">
                <div className="font-semibold text-[11px] font-mono text-[#A1A299] uppercase tracking-wider mb-2">Everything in Smart Page, plus:</div>
                <div className="flex items-center gap-2.5">
                  <Zap size={15} className="text-amber-400 shrink-0" />
                  <span>AI conversational chatbot & assistant</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Zap size={15} className="text-amber-400 shrink-0" />
                  <span>Automated lead capture & contact inbox</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Zap size={15} className="text-amber-400 shrink-0" />
                  <span>AI visual product responses</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Zap size={15} className="text-amber-400 shrink-0" />
                  <span>Email notifications for new leads</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={15} className="text-emerald-400 shrink-0" />
                  <span>Up to {limits.messages.toLocaleString()} AI messages during trial</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('smart_page_ai')}
              disabled={isPending}
              className="w-full py-3.5 px-5 bg-[#FDFCF8] hover:bg-white text-[#292A25] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isPending && pendingPlan === 'smart_page_ai' ? (
                'Publishing your page…'
              ) : (
                <>
                  Start 14-Day Trial with AI
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>

        </div>

        {/* Cardless Guarantee Bar */}
        <div className="max-w-2xl mx-auto bg-[#F5F4EE] border border-[#E8E6DE] rounded-xl p-4 flex items-start gap-3 text-xs text-[#777970]">
          <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-[#292A25] block mb-0.5">14-Day Guarantee & Cardless Start</strong>
            <p className="leading-relaxed">
              Your free trial runs through <strong>{endDate}</strong>. No credit card is collected today, and you will not be charged automatically. You can switch plans or upgrade anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
