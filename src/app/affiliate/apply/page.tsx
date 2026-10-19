import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import db from '@/lib/prisma';
import { AffiliateDashboard } from '@/components/dashboard/AffiliateDashboard';
import { AuthButton } from '@/components/auth-button';

export const dynamic = 'force-dynamic';

export default async function AffiliateApplyPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return <main className="min-h-screen bg-[#FBF9F5] px-5 py-16 text-[#292A25]"><section className="mx-auto max-w-xl rounded-3xl border border-[#E8E5DF] bg-white p-8 text-center sm:p-12"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#777972]">Pageory partners</p><h1 className="mt-3 text-3xl font-semibold">Become an affiliate</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6E7069]">Sign in or create a Pageory account, then send your affiliate application. You do not need to create a Pageory page or choose a subscription.</p><div className="mt-7 flex justify-center"><AuthButton user={null} label="Continue with Google" nextPath="/affiliate/apply" className="rounded-xl bg-[#292A25] px-5 py-3 text-sm font-semibold text-white" /></div><Link href="/" className="mt-6 inline-block text-sm text-[#777972] underline">Back to Pageory</Link></section></main>;

  const user = await db.user.upsert({ where: { id: authUser.id }, create: { id: authUser.id, email: authUser.email, name: authUser.user_metadata?.full_name || authUser.user_metadata?.name }, update: { email: authUser.email } });
  const application = await db.affiliateApplication.findUnique({ where: { userId: user.id }, select: { status: true, reviewNote: true } });
  if (application?.status === 'approved') redirect('/dashboard/affiliate');
  return <main className="min-h-screen bg-[#FBF9F5] px-5 py-12 text-[#292A25]"><div className="mx-auto mb-6 flex max-w-3xl justify-between"><Link href="/" className="text-sm text-[#777972]">← Pageory</Link><Link href="/dashboard/affiliate" className="text-sm text-[#777972]">Affiliate area</Link></div><div className="mx-auto max-w-3xl"><AffiliateDashboard application={application ? { status: application.status, reviewNote: application.reviewNote } : null} referrals={[]} commissions={[]} payouts={[]} totals={[]} /></div></main>;
}
