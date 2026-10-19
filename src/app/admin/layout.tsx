import React from 'react';
import { notFound } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { requireAffiliateAdmin } from '@/services/affiliates';

export default async function AffiliateAdminLayout({ children }: { children: React.ReactNode }) {
  try { await requireAffiliateAdmin(); } catch {
    notFound();
  }
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <AdminSidebar />
      <main className="h-screen flex-1 overflow-y-auto bg-[#FBF9F5] text-[#292A25] selection:bg-[#292A25] selection:text-white">
        <div className="mx-auto w-full max-w-[1500px] p-5 sm:p-7 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
