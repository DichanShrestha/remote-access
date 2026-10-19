import Link from 'next/link';

export default function AccountSuspendedPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#FBF9F5] p-6 text-[#292A25]"><section className="w-full max-w-lg rounded-2xl border border-[#E8E5DF] bg-white p-8 text-center"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#777972]">Account access</p><h1 className="mt-3 text-2xl font-semibold">This account is temporarily suspended</h1><p className="mt-3 text-sm leading-6 text-[#777972]">Dashboard access is unavailable while the account is suspended. Please contact Pageory support if you need help.</p><Link href="/" className="mt-6 inline-flex rounded-xl bg-[#292A25] px-4 py-2.5 text-sm font-medium text-white">Return to Pageory</Link></section></main>;
}
