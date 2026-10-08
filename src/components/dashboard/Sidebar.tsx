"use client";
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
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Page',
    items: [
      { name: 'My Page', href: '/dashboard/my-page', icon: Globe },
      { name: 'Editor', href: '/editor', icon: PenTool },
    ]
  },
  {
    label: 'Engage',
    items: [
      { name: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare },
      { name: 'Leads', href: '/dashboard/leads', icon: Users },
      { name: 'AI Knowledge', href: '/dashboard/knowledge', icon: Brain },
    ]
  },
  {
    label: 'Insights',
    items: [
      { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart },
    ]
  },
  {
    label: 'Account',
    items: [
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
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
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-white z-20 relative">
        <div className="font-bold text-xl tracking-tight">Smart Page</div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 -mr-2 rounded-md text-slate-500 hover:bg-slate-100"
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
          "group fixed md:sticky top-0 left-0 z-30 h-screen flex-col border-r bg-[#FDFCF8] border-[#E8E7E1] md:flex transition-[width] duration-300 ease-in-out overflow-hidden",
          mobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full md:translate-x-0",
          visuallyCollapsed 
            ? (isEditor ? "md:w-16 md:hover:w-64" : "md:w-16") 
            : "md:w-64"
        )}
      >
        <div className={cn("hidden md:flex h-16 items-center px-4 border-b border-[#E8E7E1] transition-all", visuallyCollapsed ? (isEditor ? "group-hover:px-6 justify-center group-hover:justify-start" : "justify-center") : "px-6")}>
          <div className={cn("w-8 h-8 rounded bg-[#292A25] flex-shrink-0 flex items-center justify-center text-[#FDFCF8] font-bold text-sm", visuallyCollapsed && !isEditor && "mx-auto")}>
            S
          </div>
          <span className={cn(
            "font-bold text-lg tracking-tight ml-3 whitespace-nowrap text-[#292A25] transition-opacity duration-300", 
            visuallyCollapsed ? (isEditor ? "opacity-0 group-hover:opacity-100" : "opacity-0 hidden") : "opacity-100"
          )}>
            Smart Page
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8 px-4 no-scrollbar flex flex-col gap-8">
          {NAV_GROUPS.map((group, i) => (
            <div key={i} className="flex flex-col gap-2">
              <h4 className={cn(
                "text-[10px] font-semibold text-[#A1A299] uppercase tracking-[0.15em] mb-1 whitespace-nowrap overflow-hidden transition-all duration-300",
                visuallyCollapsed 
                  ? (isEditor ? "opacity-0 group-hover:opacity-100 px-3 h-0 group-hover:h-auto" : "opacity-0 h-0") 
                  : "px-3 opacity-100"
              )}>
                {group.label}
              </h4>
              <div className="flex flex-col space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      title={visuallyCollapsed ? item.name : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center rounded-lg text-[13px] font-medium transition-all duration-200 h-9",
                        visuallyCollapsed ? (isEditor ? "px-0 justify-center group-hover:px-3 group-hover:justify-start" : "px-0 justify-center") : "px-3 gap-3",
                        isActive 
                          ? "bg-[#292A25] text-[#FDFCF8] shadow-sm" 
                          : "text-[#777970] hover:text-[#292A25] hover:bg-[#F3F2EA]"
                      )}
                    >
                      <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={cn(
                        "flex-shrink-0 transition-colors",
                        isActive ? "text-[#FDFCF8]" : "text-[#A1A299] group-hover:text-[#777970]",
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

        <div className="p-4 border-t border-[#E8E7E1] flex flex-col gap-2 bg-[#FAF9F5]">
          {!isEditor && (
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center justify-center h-9 rounded-lg text-[#A1A299] hover:text-[#292A25] hover:bg-[#F3F2EA] transition-colors w-full"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          )}

          <div className={cn(
            "flex items-center h-12 rounded-lg transition-all",
            visuallyCollapsed ? (isEditor ? "justify-center group-hover:justify-start group-hover:px-3" : "justify-center") : "px-3 gap-3"
          )}>
            <div className="w-8 h-8 rounded-full bg-[#E8E7E1] flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-[#777970]">
              SP
            </div>
            <div className={cn(
              "flex-col overflow-hidden transition-all duration-300",
              visuallyCollapsed ? (isEditor ? "opacity-0 w-0 hidden group-hover:flex group-hover:w-auto group-hover:opacity-100 group-hover:ml-3" : "hidden") : "flex"
            )}>
              <span className="text-[13px] font-semibold text-[#292A25] leading-none whitespace-nowrap">Your Workspace</span>
              <span className="text-[11px] text-[#A1A299] mt-1.5 whitespace-nowrap">Smart Page</span>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className={cn(
              "flex items-center h-9 rounded-lg text-[#A1A299] hover:text-[#D14F4F] hover:bg-[#FDF3F3] transition-colors w-full mt-1",
              visuallyCollapsed ? (isEditor ? "justify-center group-hover:justify-start group-hover:px-3" : "justify-center") : "px-3 gap-3"
            )}
            title="Log out"
          >
            <LogOut size={16} className="flex-shrink-0" />
            <span className={cn(
              "whitespace-nowrap text-[13px] font-medium transition-all duration-300",
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
