import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-white selection:bg-[#292A25] selection:text-white">
        <div className="flex-1 p-6 lg:px-14 lg:py-12 max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
