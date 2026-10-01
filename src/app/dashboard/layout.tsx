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
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-white">
        <div className="flex-1 p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
