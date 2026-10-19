'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ClipboardList, CreditCard, LayoutDashboard, Settings, ShieldCheck, Users, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const groups = [
  { label: 'OVERVIEW', items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }] },
  { label: 'USER MANAGEMENT', items: [{ label: 'Users', href: '/admin/users', icon: Users }, { label: 'Subscriptions & Plans', href: '/admin/subscriptions', icon: CreditCard }] },
  { label: 'AFFILIATE PROGRAM', items: [{ label: 'Affiliates', href: '/admin/affiliates', icon: ShieldCheck }, { label: 'Commissions & Payouts', href: '/admin/commissions', icon: Wallet }] },
  { label: 'SYSTEM', items: [{ label: 'Audit Logs', href: '/admin/audit', icon: ClipboardList }, { label: 'Settings', href: '/admin/settings', icon: Settings }] },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return <aside className="flex w-full shrink-0 flex-col border-b border-[#E8E5DF] bg-white md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r">
    <Link href="/admin" className="flex h-16 items-center gap-3 border-b border-[#E8E5DF] px-5">
      <Image src="/logo.png" alt="Pageory" width={30} height={30} className="rounded-lg object-contain" priority />
      <span className="font-semibold tracking-tight text-[#171717]">Pageory Admin</span>
    </Link>
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3 md:space-y-6">
      {groups.map((group) => <div key={group.label} className="min-w-max md:min-w-0">
        <h2 className="hidden px-3 pb-2 text-[10px] font-semibold tracking-[.14em] text-[#8C8D85] md:block">{group.label}</h2>
        <div className="flex flex-col gap-1">{group.items.map((item) => {
          const active = item.href === '/admin' ? pathname === item.href : pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return <Link key={item.href} href={item.href} className={cn('flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors', active ? 'bg-[#F2EFE9] font-medium text-[#171717]' : 'text-[#666862] hover:bg-[#F6F4EE] hover:text-[#171717]')}><Icon size={16} />{item.label}</Link>;
        })}</div>
      </div>)}
    </nav>
    <Link href="/dashboard" className="flex h-12 shrink-0 items-center gap-3 border-t border-[#E8E5DF] px-5 text-sm text-[#666862] hover:bg-[#F6F4EE] hover:text-[#171717]"><ArrowLeft size={16} />Back to Creator Dashboard</Link>
  </aside>;
}
