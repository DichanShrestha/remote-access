import { authService } from '@/services/auth';
import db from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight, LayoutTemplate } from 'lucide-react';

export default async function DashboardPage() {
  const user = await authService.requireUser();
  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    include: { page: true }
  });

  const hasConfiguredPage = profile?.page?.draftConfig && Object.keys(profile.page.draftConfig).length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Dashboard</h1>

      {!hasConfiguredPage ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <LayoutTemplate className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Create Your Page</h2>
          <p className="text-slate-500 mb-8 max-w-md">
            You don't have a Smart Page yet. Choose a premium template to get started instantly.
          </p>
          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
          >
            Browse Templates
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Dashboard Stats / Overview placeholder */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg mb-2 text-slate-900">Your Smart Page</h3>
            <p className="text-sm text-slate-500 mb-6">Your page is active. You can customize the content, change themes, or train your AI.</p>
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
            >
              Edit Your Page
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
            <p className="text-slate-400 text-sm">More dashboard widgets coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}
