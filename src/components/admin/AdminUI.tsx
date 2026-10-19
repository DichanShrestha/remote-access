import type { ReactNode } from 'react';

export function AdminPageHeader({ title, description, eyebrow = 'ADMINISTRATION' }: { title: string; description: string; eyebrow?: string }) {
  return <header className="mb-8"><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#85877F]">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#20211D]">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#777972]">{description}</p></header>;
}

export function AdminCard({ title, value, detail }: { title: string; value: ReactNode; detail?: string }) {
  return <article className="rounded-2xl border border-[#E8E5DF] bg-white p-5 shadow-sm"><p className="text-sm text-[#777972]">{title}</p><div className="mt-3 text-2xl font-semibold tracking-tight text-[#20211D]">{value}</div>{detail && <p className="mt-1 text-xs text-[#8A8C84]">{detail}</p>}</article>;
}

export function AdminEmpty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-[#E8E5DF] bg-white p-5 text-sm text-[#777972]">{children}</p>;
}

export function AdminStatus({ value }: { value: string }) {
  const tone = value === 'active' || value === 'approved' || value === 'verified' || value === 'payable' || value === 'paid' ? 'bg-emerald-50 text-emerald-800' : value === 'suspended' || value === 'rejected' || value === 'canceled' || value === 'reversed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{value.replaceAll('_', ' ')}</span>;
}
