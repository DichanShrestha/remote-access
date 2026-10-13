"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Globe,
  PenTool,
  MessageSquare,
  Users,
  UserCheck,
  Brain,
  LineChart,
  Settings,
  CreditCard,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const NAV_GROUPS = [
  {
    label: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'BUILD & STYLE',
    items: [
      { name: 'Page Editor', href: '/editor', icon: PenTool },
      { name: 'Templates', href: '/dashboard/templates', icon: Globe },
    ]
  },
  {
    label: 'AI & INBOX',
    items: [
      { name: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare },
      { name: 'Leads & Triggers', href: '/dashboard/leads', icon: Users },
      { name: 'Knowledge Base', href: '/dashboard/knowledge', icon: Brain },
    ]
  },
  {
    label: 'INSIGHTS',
    items: [
      { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart },
    ]
  },
  {
    label: 'ACCOUNT',
    items: [
      { name: 'Settings & Billing', href: '/dashboard/settings', icon: Settings },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const isEditor = pathname?.startsWith('/editor');

  // Determine actual visual state
  const visuallyCollapsed = isEditor ? true : isCollapsed;

  return (
    <>
      {/* Mobile Header & Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#E8E5DF] bg-[#FBF9F5] z-20 relative">
        <div className="font-bold text-xl tracking-tight text-[#171717]">Smart Page</div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 -mr-2 rounded-md text-[#737373] hover:bg-[#F2EFE9]"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar overlay for mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-[#292A25]/20 z-10 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "group fixed md:sticky top-0 left-0 z-30 h-screen flex flex-col border-r bg-[#FBF9F5] border-[#E8E5DF] transition-[width] duration-300 ease-in-out overflow-hidden",
          mobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full md:translate-x-0",
          visuallyCollapsed
            ? (isEditor ? "md:w-16 md:hover:w-64" : "md:w-16")
            : "md:w-64"
        )}
      >
        <div className={cn("hidden md:flex h-16 items-center px-4 border-b border-[#E8E5DF] bg-[#FBF9F5] transition-all flex-shrink-0", visuallyCollapsed ? (isEditor ? "group-hover:px-6 justify-center group-hover:justify-start" : "justify-center") : "px-6")}>
          <div className={cn("w-8 h-8 rounded-lg bg-[#171717] flex-shrink-0 flex items-center justify-center text-[#FBF9F5] font-bold text-sm", visuallyCollapsed && !isEditor && "mx-auto")}>
            S
          </div>
          <span className={cn(
            "font-bold text-lg tracking-tight ml-3 whitespace-nowrap text-[#171717] transition-opacity duration-300",
            visuallyCollapsed ? (isEditor ? "opacity-0 group-hover:opacity-100" : "opacity-0 hidden") : "opacity-100"
          )}>
            Smart Page
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 no-scrollbar flex flex-col gap-6">
          {NAV_GROUPS.map((group, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <h4 className={cn(
                "text-[10px] font-semibold text-[#8C8D85] uppercase tracking-[0.14em] mb-0.5 whitespace-nowrap overflow-hidden transition-all duration-300",
                visuallyCollapsed
                  ? (isEditor ? "opacity-0 group-hover:opacity-100 px-3 h-0 group-hover:h-auto" : "opacity-0 h-0")
                  : "px-3 opacity-100"
              )}>
                {group.label}
              </h4>
              <div className="flex flex-col space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname === item.href ||
                    (item.href === '/dashboard/settings' && pathname === '/dashboard/billing') ||
                    (item.href === '/dashboard/leads' && pathname?.startsWith('/dashboard/leads')) ||
                    (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={visuallyCollapsed ? item.name : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "relative flex items-center rounded-xl text-[13px] transition-all duration-200 h-9",
                        visuallyCollapsed ? (isEditor ? "px-0 justify-center group-hover:px-3 group-hover:justify-start" : "px-0 justify-center") : "px-3 gap-3",
                        isActive
                          ? "bg-[#F2EFE9] text-[#171717] font-medium before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#171717] before:rounded-r"
                          : "text-[#666862] hover:text-[#171717] hover:bg-[#F6F4EE]"
                      )}
                    >
                      <Icon size={16} strokeWidth={isActive ? 2.3 : 1.9} className={cn(
                        "flex-shrink-0 transition-colors",
                        isActive ? "text-[#171717]" : "text-[#8C8D85]",
                        visuallyCollapsed && !isEditor ? "" : (isEditor ? "group-hover:mr-3" : "")
                      )} />
                      <span className={cn(
                        "whitespace-nowrap transition-all duration-300",
                        visuallyCollapsed ? (isEditor ? "opacity-0 w-0 hidden group-hover:block group-hover:w-auto group-hover:opacity-100" : "hidden") : "opacity-100"
                      )}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Workspace Panel */}
        <div className="mt-auto sticky bottom-0 bg-[#FBF9F5] border-t border-[#E8E5DF] p-4 flex flex-col gap-2 z-10 flex-shrink-0">
          {!isEditor && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center justify-center h-8 rounded-lg text-[#8C8D85] hover:text-[#171717] hover:bg-[#F2EFE9] transition-colors w-full"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </button>
          )}



          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center h-8 rounded-lg text-[#8C8D85] hover:text-[#D14F4F] hover:bg-[#FDF3F3] transition-colors w-full",
              visuallyCollapsed ? (isEditor ? "justify-center group-hover:justify-start group-hover:px-2" : "justify-center") : "px-2 gap-3"
            )}
            title="Log out"
          >
            <LogOut size={15} className="flex-shrink-0" />
            <span className={cn(
              "whitespace-nowrap text-[12px] font-medium transition-all duration-300",
              visuallyCollapsed ? (isEditor ? "opacity-0 w-0 hidden group-hover:inline group-hover:w-auto group-hover:opacity-100 group-hover:ml-3" : "hidden") : "opacity-100"
            )}>
              Log out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
