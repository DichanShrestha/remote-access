import { authService } from "@/services/auth";
import db from "@/lib/prisma";
import Link from "next/link";
import { CreditCard, Zap, Calendar, AlertCircle } from "lucide-react";
import { createCheckoutSession, startFreeTrial, cancelManualSubscription, createCustomerPortalSession } from "@/app/actions/billing-actions";
import { getSmartPageEntitlement } from "@/lib/tier-limits";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BillingPage() {
  const user = await authService.requireUser();
  const sub = await db.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const account = await db.user.findUnique({ where: { id: user.id }, include: { subscriptions: { orderBy: { updatedAt: 'desc' }, take: 1 }, usage: true } });
  const entitlement = account ? getSmartPageEntitlement(account) : null;
  const aiCount = entitlement?.limits.aiReplies || 0;
  const sourceCount = await db.dataSource.count({ where: { userId: user.id, type: { not: 'qa' }, status: { not: 'error' } } });
  const faqCount = await db.qAPair.count({ where: { userId: user.id } });
  const mediaBytes = Number(account?.usage?.pageMediaBytes || 0);
  const plan = entitlement?.plan || 'trial';
  const knowledgeRetentionDeadline = new Date((sub?.aiAccessEndedAt || sub?.trialEnd || new Date()).getTime() + 30 * 86400000);

  const now = new Date();
  
  let statusText = "No active subscription";
  let showSubscribe = true;
  let statusColor = "bg-slate-100 text-slate-700 border-slate-200";
  let trialRemaining = 0;
  
  if (sub) {
    if (sub.status === "trialing" && sub.trialEnd) {
      const diffMs = sub.trialEnd.getTime() - now.getTime();
      trialRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      if (trialRemaining > 0) {
        statusText = `14-day trial (${trialRemaining} days remaining)`;
        statusColor = "bg-[#292A25] text-[#FDFCF8] border-[#292A25]";
      } else {
        statusText = "Trial expired";
        statusColor = "bg-[#FDF3F3] text-[#D14F4F] border-[#FADCDC]";
      }
    } else if (sub.status === "active") {
      showSubscribe = plan !== 'smart_page_ai';
      if (sub.cancelAtPeriodEnd) {
        statusText = `Cancels on ${sub.currentPeriodEnd?.toLocaleDateString()}`;
        statusColor = "bg-[#F3F2EA] text-[#777970] border-[#E8E7E1]";
      } else {
        statusText = "Active";
        statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
      }
    } else if (sub.status === "past_due") {
      statusText = "Past due";
      statusColor = "bg-[#FDF3F3] text-[#D14F4F] border-[#FADCDC]";
    } else if (sub.status === "canceled" || sub.status === "expired") {
      statusText = "Canceled";
      statusColor = "bg-slate-100 text-slate-600 border-slate-200";
    }
  }

  let planDisplayName = "Free";
  if (entitlement?.trialExpired) {
    planDisplayName = "Trial expired";
  } else if (sub && (sub.status === "active" || sub.status === "trialing" || sub.status === "past_due")) {
    const rawPlan = (sub.planId || sub.tier || "").toLowerCase();
    if (rawPlan.includes("ai") || rawPlan.includes("knowchat")) {
      planDisplayName = "Smart Page + AI";
    } else {
      planDisplayName = "Smart Page";
    }
  }

  return (
    <div className="max-w-6xl animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-[32px] font-semibold tracking-tight text-[#292A25] mb-2 font-serif">Billing & Plans</h1>
        <p className="text-[#777970] text-[15px]">Manage your subscription, billing method, and plan details.</p>
      </div>
      {sub?.status === 'trialing' && trialRemaining <= 3 && <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Your trial ends {trialRemaining <= 1 ? 'within 24 hours' : `in ${trialRemaining} days`}. Choose a plan to keep AI access and avoid interruption.</div>}
      {sub?.status === 'past_due' && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Your latest payment failed. Update your payment method in the billing portal to keep paid features available. No new AI replies will be added until Dodo confirms renewal.</div>}

      <div className="grid gap-6 md:grid-cols-2 mb-16">
        {/* Current Plan Card */}
        <div className="bg-[#FDFCF8] border border-[#E8E7E1] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-[#A1A299] uppercase tracking-[0.15em]">Current Plan</h2>
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColor}`}>
                {statusText}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[32px] font-bold text-[#292A25]">
                {planDisplayName}
              </span>
            </div>
            <p className="text-[#777970] text-sm mb-6">
              {sub?.billingMethod === "manual" ? "Manually managed via local payment." : sub?.billingMethod === "dodo" ? "Managed via Dodo Payments." : "14-day trial active."}
            </p>
          </div>
          
          <div className="pt-6 border-t border-[#E8E7E1] space-y-3">
            {sub?.status === "active" && sub.currentPeriodEnd && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#777970] flex items-center gap-2"><Calendar className="w-4 h-4" /> Next billing date</span>
                <span className="font-medium text-[#292A25]">{sub.currentPeriodEnd.toLocaleDateString()}</span>
              </div>
            )}
            
            {sub?.billingMethod === "manual" && sub?.status === "active" && !sub.cancelAtPeriodEnd && (
              <form action={cancelManualSubscription}>
                <button type="submit" className="w-full mt-4 px-4 py-2.5 text-sm font-medium text-[#D14F4F] bg-[#FDF3F3] hover:bg-[#FADCDC] rounded-xl transition-colors">
                  Cancel Subscription
                </button>
              </form>
            )}
            
            {sub?.billingMethod === "dodo" && ["active", "past_due"].includes(sub.status) && (
               <form action={async () => {
                 "use server";
                 const { url } = await createCustomerPortalSession();
                 const { redirect } = await import("next/navigation");
                 redirect(url);
               }}>
                 <button type="submit" className="w-full mt-4 px-4 py-2.5 text-sm font-medium text-[#292A25] bg-[#F3F2EA] hover:bg-[#E8E7E1] rounded-xl transition-colors">Manage in Dodo Portal</button>
               </form>
            )}
          </div>
        </div>
      </div>

      <section className="mb-12 rounded-2xl border border-[#E8E7E1] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#292A25]">Usage and included limits</h2>
        <p className="mt-1 text-sm text-[#777970]">{plan === 'trial' ? `Trial ends ${entitlement?.trialEnd.toLocaleString()}.` : plan === 'smart_page_ai' ? `AI replies reset with the confirmed billing period${sub?.currentPeriodEnd ? ` ending ${sub.currentPeriodEnd.toLocaleDateString()}` : ''}.` : 'AI is not included with Smart Page.'}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="rounded-xl bg-[#F7F6F1] p-4"><strong>AI replies</strong><p className="mt-1 text-[#777970]">{plan === 'smart_page' ? 'Not included' : `${sub?.aiRepliesUsed || 0} used · ${Math.max(0, aiCount - (sub?.aiRepliesUsed || 0))} remaining`}</p></div>
          <div className="rounded-xl bg-[#F7F6F1] p-4"><strong>Knowledge sources</strong><p className="mt-1 text-[#777970]">{plan === 'smart_page' ? 'Not included' : `${sourceCount} / ${entitlement?.limits.knowledgeSources}`}</p></div>
          <div className="rounded-xl bg-[#F7F6F1] p-4"><strong>Knowledge storage</strong><p className="mt-1 text-[#777970]">{plan === 'smart_page' ? `Not included · AI data retained until ${knowledgeRetentionDeadline.toLocaleDateString()}` : `${(Number(account?.usage?.knowledgeBytes || 0) / 1048576).toFixed(1)} / ${(Number(entitlement?.limits.knowledgeBytes || 0) / 1048576).toFixed(0)} MB`}</p></div>
          <div className="rounded-xl bg-[#F7F6F1] p-4"><strong>Indexed text</strong><p className="mt-1 text-[#777970]">{plan === 'smart_page' ? 'Not included' : `${(account?.usage?.indexedTokens || 0).toLocaleString()} / ${(entitlement?.limits.indexedTokens || 0).toLocaleString()} tokens`}</p></div>
          <div className="rounded-xl bg-[#F7F6F1] p-4"><strong>FAQs</strong><p className="mt-1 text-[#777970]">{plan === 'smart_page' ? 'Not included' : `${faqCount} / ${entitlement?.limits.faqEntries}`}</p></div>
          <div className="rounded-xl bg-[#F7F6F1] p-4"><strong>Page media</strong><p className="mt-1 text-[#777970]">{(mediaBytes / 1048576).toFixed(1)} / 250 MB · 10 MB max each</p></div>
        </div>
        {[
          aiCount > 0 && (sub?.aiRepliesUsed || 0) / aiCount >= .8,
          entitlement && entitlement.limits.knowledgeSources > 0 && sourceCount / entitlement.limits.knowledgeSources >= .8,
          entitlement && entitlement.limits.knowledgeBytes > 0 && Number(account?.usage?.knowledgeBytes || 0) / entitlement.limits.knowledgeBytes >= .8,
          entitlement && entitlement.limits.indexedTokens > 0 && (account?.usage?.indexedTokens || 0) / entitlement.limits.indexedTokens >= .8,
          faqCount > 0 && entitlement && entitlement.limits.faqEntries > 0 && faqCount / entitlement.limits.faqEntries >= .8,
          mediaBytes / (250 * 1024 * 1024) >= .8,
        ].some(Boolean) && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">You are using about 80% or more of at least one included limit.</p>}
        {plan === 'smart_page' && <p className="mt-4 text-sm text-amber-800">AI knowledge files and FAQs are retained until {knowledgeRetentionDeadline.toLocaleDateString()} after AI access ends.</p>}
      </section>

      {showSubscribe && (
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-[#292A25] mb-2 font-serif">Available Plans</h2>
            <p className="text-[#777970] text-[15px]">Choose the right plan to grow your presence.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Smart Page Plan */}
            <div className="bg-[#FDFCF8] border border-[#E8E7E1] rounded-2xl p-8 shadow-sm flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#292A25] mb-2">Smart Page</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#292A25]">$9</span>
                  <span className="text-[#A1A299]">/ month</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1 text-sm text-[#777970]">
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-[#A1A299]" /> Business / Creator templates</li>
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-[#A1A299]" /> Customization & branding</li>
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-[#A1A299]" /> Unlimited links & components</li>
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-[#A1A299]" /> Custom profile URL & QR code</li>
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-[#A1A299]" /> Basic analytics (Views, clicks, CTR)</li>
              </ul>

              {!sub && !account?.trialGrantedAt ? (
                <form action={async () => {
                  "use server";
                  await startFreeTrial("smart_page");
                }}>
                  <button type="submit" className="w-full px-4 py-3 text-sm font-semibold text-[#FDFCF8] bg-[#292A25] hover:bg-[#3C3D37] rounded-xl transition-colors">
                    Start 14-day free trial
                  </button>
                </form>
              ) : plan === 'smart_page' && ['active', 'past_due'].includes(sub?.status || '') ? (
                <button disabled className="w-full cursor-default rounded-xl border border-[#E8E7E1] px-4 py-3 text-sm font-semibold text-[#777970]">Current plan</button>
              ) : (
                <form action={async () => {
                  "use server";
                  const productId = process.env.DODO_PRODUCT_SMART_PAGE!;
                  const { payment_link } = await createCheckoutSession(productId, "smart_page");
                  if (payment_link) {
                     const { redirect } = await import("next/navigation");
                     redirect(payment_link);
                  }
                }}>
                  <button type="submit" className="w-full px-4 py-3 text-sm font-semibold text-[#FDFCF8] bg-[#292A25] hover:bg-[#3C3D37] rounded-xl transition-colors">
                    {plan === 'smart_page' ? 'Current plan' : 'Subscribe to Smart Page'}
                  </button>
                </form>
              )}
            </div>

            {/* Smart Page + AI Plan */}
            <div className="bg-[#292A25] border border-[#3C3D37] rounded-2xl p-8 shadow-xl flex flex-col text-[#FDFCF8]">
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold mb-2">Smart Page + AI</h3>
                  <span className="px-3 py-1 text-[10px] font-semibold tracking-wider uppercase bg-[#FDFCF8] text-[#292A25] rounded-full">Recommended</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$29</span>
                  <span className="text-[#A1A299]">/ month</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1 text-sm text-[#DEDDD6]">
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-amber-400" /> Everything in Smart Page</li>
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-amber-400" /> AI conversational chatbot</li>
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-amber-400" /> Automated lead capture</li>
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-amber-400" /> Lead & contact inbox</li>
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-amber-400" /> AI-powered visual responses</li>
                <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-amber-400" /> Email lead notifications</li>
              </ul>

              {!sub && !account?.trialGrantedAt ? (
                <form action={async () => {
                  "use server";
                  await startFreeTrial("smart_page_ai");
                }}>
                  <button type="submit" className="w-full px-4 py-3 text-sm font-semibold text-[#292A25] bg-[#FDFCF8] hover:bg-white rounded-xl transition-colors shadow-lg">
                    Start 14-day free trial
                  </button>
                  <p className="text-center text-xs text-[#A1A299] mt-3">No credit card required.</p>
                </form>
              ) : plan === 'smart_page_ai' && ['active', 'past_due'].includes(sub?.status || '') ? (
                <button disabled className="w-full cursor-default rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white/70">Current plan</button>
              ) : (
                <form action={async () => {
                  "use server";
                  const productId = process.env.DODO_PRODUCT_SMART_PAGE_AI!;
                  const { payment_link } = await createCheckoutSession(productId, "smart_page_ai");
                  if (payment_link) {
                     const { redirect } = await import("next/navigation");
                     redirect(payment_link);
                  }
                }}>
                  <button type="submit" className="w-full px-4 py-3 text-sm font-semibold text-[#292A25] bg-[#FDFCF8] hover:bg-white rounded-xl transition-colors shadow-lg">
                    {plan === 'smart_page_ai' ? 'Current plan' : 'Subscribe to Smart Page + AI'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
