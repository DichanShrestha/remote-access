'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateAffiliateConfig } from '@/app/actions/affiliate-actions';
import { AdminPageHeader } from './AdminUI';

export function AdminSettingsClient({ config }: { config: { discount: number; commission: number; months: number } }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return <main><AdminPageHeader title="Settings" description="Manage the existing affiliate program rates. Changes apply to new eligible purchases and commissions." />
    <form className="flex flex-wrap items-end gap-4 rounded-2xl border border-[#E8E5DF] bg-white p-5" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const reason = String(form.get('reason') || '').trim(); if (reason.length < 5) { toast.error('Enter a reason of at least 5 characters.'); return; } const toastId = toast.loading('Saving settings…'); startTransition(async () => { try { await updateAffiliateConfig(Number(form.get('discount')), Number(form.get('commission')), Number(form.get('months')), reason); toast.success('Settings saved.', { id: toastId }); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save settings.', { id: toastId }); } }); }}>
      <label className="text-sm">Customer discount (%)<input required name="discount" type="number" min="0" max="100" step="0.01" defaultValue={config.discount} className="mt-1 block w-40 rounded-lg border border-[#D9D6CE] p-2.5" /></label>
      <label className="text-sm">Commission (%)<input required name="commission" type="number" min="0" max="100" step="0.01" defaultValue={config.commission} className="mt-1 block w-40 rounded-lg border border-[#D9D6CE] p-2.5" /></label>
      <label className="text-sm">Eligibility (months)<input required name="months" type="number" min="1" max="60" step="1" defaultValue={config.months} className="mt-1 block w-40 rounded-lg border border-[#D9D6CE] p-2.5" /></label>
      <label className="text-sm">Reason<input required minLength={5} maxLength={1000} name="reason" placeholder="Why are these settings changing?" className="mt-1 block w-64 rounded-lg border border-[#D9D6CE] p-2.5" /></label>
      <button disabled={pending} className="min-h-10 rounded-lg bg-[#292A25] px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{pending ? 'Saving…' : 'Save settings'}</button>
    </form>
    <p className="mt-4 text-xs text-[#777972]">Settings are shared with the existing affiliate purchase and commission workflows. No extra configuration has been created.</p>
  </main>;
}
