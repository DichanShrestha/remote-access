import { notFound } from 'next/navigation';
import db from '@/lib/prisma';
import { authService } from '@/services/auth';
import { PaymentSubmission } from '@/components/onboarding/PaymentSubmission';

export const dynamic = 'force-dynamic';

export default async function OnboardingPaymentPage({ params }: { params: Promise<{ purchaseId: string }> }) {
  const user = await authService.requireUser();
  const { purchaseId } = await params;
  const purchase = await db.affiliatePurchase.findFirst({ where: { id: purchaseId, customerId: user.id }, include: { referral: { include: { code: true } } } });
  if (!purchase) notFound();
  const subscription = await db.subscription.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' }, select: { status: true, currentPeriodEnd: true } });
  const planName = purchase.planId === 'smart_page_ai' ? 'Growth' : 'Starter';
  const paymentInstructions = process.env.NEPAL_PAYMENT_INSTRUCTIONS || 'Please contact Pageory support to receive the current payment instructions.';
  const trialContinues = subscription?.status === 'trialing' && Boolean(subscription.currentPeriodEnd && subscription.currentPeriodEnd > new Date());
  return <main className="min-h-screen bg-[#FBF9F5] px-5 py-10 text-[#292A25] sm:py-14"><section className="mx-auto max-w-2xl rounded-3xl border border-[#E8E5DF] bg-white p-6 shadow-sm sm:p-10">
    <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#777972]">Subscription request</p>
    <h1 className="mt-2 text-3xl font-semibold">Upgrade to {planName}</h1>
    {trialContinues && <p className="mt-2 text-sm leading-6 text-[#777972]">Your trial continues until your paid subscription is activated, subject to your existing trial rules.</p>}
    <div className="mt-7 rounded-2xl bg-[#F8F7F2] p-5 sm:p-6">
      <p className="mb-4 text-sm font-semibold">{planName} plan</p>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between gap-4"><span className="text-[#62645E]">Plan price</span><strong>{purchase.currency} {Number(purchase.originalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
        {Number(purchase.discountAmount) > 0 && <div className="flex justify-between gap-4"><span className="text-[#62645E]">Affiliate discount ({purchase.referral?.code.code || 'applied'})</span><strong>− {purchase.currency} {Number(purchase.discountAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>}
        <div className="flex justify-between gap-4 border-t border-[#E0DDD5] pt-4 text-base"><span className="font-medium">Total to pay</span><strong className="text-lg">{purchase.currency} {Number(purchase.expectedAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
      </div>
    </div>
    <div className="mt-6 rounded-2xl border border-[#E8E5DF] p-5 sm:p-6"><h2 className="font-semibold">Payment instructions</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#62645E]">{paymentInstructions}</p><p className="mt-3 rounded-xl bg-[#F8F7F2] p-3 text-xs leading-5 text-[#62645E]">Pay the exact amount shown above, then send your payment screenshot to Pageory support using WhatsApp.</p></div>
    <div className="mt-4 rounded-xl border border-[#EEECE6] px-4 py-3 text-xs text-[#777972]">Subscription request ID: <span className="font-mono font-medium text-[#292A25]">{purchase.id}</span></div>
    <PaymentSubmission purchaseId={purchase.id} planName={planName} currency={purchase.currency} amount={Number(purchase.expectedAmount)} status={purchase.status} confirmedAt={purchase.customerConfirmedAt?.toISOString() || null} paymentReference={purchase.paymentReference} resolutionNote={purchase.resolutionNote} />
  </section></main>;
}
