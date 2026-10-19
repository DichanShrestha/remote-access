'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, LoaderCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { confirmManualPaymentSent } from '@/app/actions/affiliate-actions';
import { getWhatsAppUrl } from '@/lib/pricing';
import { getPaymentSubmissionState } from '@/lib/payment-submission-state';

type Props = {
  purchaseId: string;
  planName: string;
  currency: string;
  amount: number;
  status: string;
  confirmedAt: string | null;
  paymentReference: string | null;
  resolutionNote: string | null;
};

export function PaymentSubmission({ purchaseId, planName, currency, amount, status, confirmedAt: initialConfirmedAt, paymentReference, resolutionNote }: Props) {
  const [confirmedAt, setConfirmedAt] = useState(initialConfirmedAt);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const message = `Hi Pageory, I've sent payment for my ${planName} subscription.\nRequest ID: ${purchaseId}\nAmount: ${currency} ${amount.toFixed(2)}\nPlease find my payment screenshot attached.`;
  const whatsappUrl = getWhatsAppUrl(message);
  const state = getPaymentSubmissionState(status, confirmedAt, paymentReference);
  const confirmSent = () => {
    if (pending || confirmedAt) return;
    const toastId = toast.loading('Sending payment confirmation…');
    startTransition(async () => {
      try {
        const result = await confirmManualPaymentSent(purchaseId);
        if ('error' in result) throw new Error(result.error);
        setConfirmedAt(new Date().toISOString());
        toast.success('Payment confirmation sent to Pageory for review.', { id: toastId });
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not send confirmation. Please try again.', { id: toastId });
      }
    });
  };

  if (state === 'verified') return <div role="status" className="mt-6 flex items-start gap-3 rounded-2xl bg-green-50 p-4 text-sm text-green-800"><CheckCircle2 size={19} className="mt-0.5 shrink-0" /><div><strong>Payment verified</strong><p className="mt-1">Your {planName} subscription is active.</p></div></div>;

  if (state === 'rejected') return <div role="alert" className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800"><strong>Payment needs attention</strong><p className="mt-1">{resolutionNote || 'Please contact Pageory support to resolve this payment.'}</p></div>;

  if (state === 'submitted') return <div role="status" className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><strong>Payment confirmation sent</strong><p className="mt-1">Pageory support will check your WhatsApp screenshot and verify the amount. Your subscription stays pending until an administrator verifies it.</p>{confirmedAt && <p className="mt-2 text-xs text-amber-800">Request {purchaseId} · sent {new Date(confirmedAt).toLocaleString()}</p>}{paymentReference && <p className="mt-1 text-xs">Transaction reference: {paymentReference}</p>}</div>;

  return <div className="mt-6 space-y-4">
    <div className="rounded-2xl border border-[#E8E5DF] bg-white p-5 sm:p-6">
      <h2 className="font-semibold">Send your payment screenshot</h2>
      <p className="mt-1 text-sm leading-6 text-[#777972]">Pay the exact amount shown above. Then open WhatsApp, attach your payment screenshot, and send the message with this request ID and amount.</p>
      {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-black hover:bg-[#1FB95A]"><MessageCircle size={17} />Send payment screenshot via WhatsApp</a> : <p className="mt-4 text-sm text-red-700">WhatsApp support is not configured. Contact Pageory support with request ID {purchaseId}.</p>}
      <div className="mt-5 border-t border-[#EEECE6] pt-5">
        <p className="text-sm text-[#62645E]">After you have sent the screenshot, confirm below. This sends your request to the admin for payment verification.</p>
        <button type="button" onClick={confirmSent} disabled={pending || !whatsappUrl} className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#292A25] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {pending && <LoaderCircle size={16} className="animate-spin" />}
          {pending ? 'Sending confirmation…' : "I've Sent the Payment"}
        </button>
      </div>
    </div>
  </div>;
}
