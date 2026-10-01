import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
}
