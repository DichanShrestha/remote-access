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
  PanelLeftOpen
} from 'lucide-react';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
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
          className="md:hidden fixed inset-0 bg-slate-900/20 z-10" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "group fixed md:sticky top-0 left-0 z-30 h-screen flex-col border-r bg-slate-50/50 backdrop-blur-xl md:flex transition-[width] duration-300 ease-in-out overflow-hidden",
          mobileOpen ? "translate-x-0 w-64 bg-white" : "-translate-x-full md:translate-x-0",
          visuallyCollapsed 
            ? (isEditor ? "md:w-16 md:hover:w-64" : "md:w-16") 
            : "md:w-64"
        )}
      >
        <div className={cn("hidden md:flex h-16 items-center px-4 border-b transition-all", visuallyCollapsed ? (isEditor ? "group-hover:px-6 justify-center group-hover:justify-start" : "justify-center") : "px-6")}>
          <div className={cn("w-8 h-8 rounded bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold", visuallyCollapsed && !isEditor && "mx-auto")}>
            S
          </div>
          <span className={cn(
            "font-bold text-lg tracking-tight ml-3 whitespace-nowrap transition-opacity duration-300", 
            visuallyCollapsed ? (isEditor ? "opacity-0 group-hover:opacity-100" : "opacity-0 hidden") : "opacity-100"
          )}>
            Smart Page
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3 no-scrollbar flex flex-col gap-6">
          {NAV_GROUPS.map((group, i) => (
            <div key={i} className="flex flex-col gap-1">
              <h4 className={cn(
                "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 whitespace-nowrap overflow-hidden transition-all duration-300",
                visuallyCollapsed 
                  ? (isEditor ? "opacity-0 group-hover:opacity-100 px-3 h-0 group-hover:h-auto" : "opacity-0 h-0") 
                  : "px-3 opacity-100"
              )}>
                {group.label}
              </h4>
              <div className="flex flex-col space-y-1">
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
                        "flex items-center rounded-md text-sm font-medium transition-colors h-10",
                        visuallyCollapsed ? (isEditor ? "px-0 justify-center group-hover:px-3 group-hover:justify-start" : "px-0 justify-center") : "px-3 gap-3",
                        isActive 
                          ? "bg-slate-900 text-white shadow-sm" 
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <Icon size={18} className={cn(
                        "flex-shrink-0",
                        isActive ? "text-slate-300" : "text-slate-400",
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

        <div className="p-3 border-t flex flex-col gap-2">
          {!isEditor && (
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center justify-center h-10 rounded-md text-slate-500 hover:bg-slate-100 transition-colors w-full"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          )}

          <div className={cn(
            "flex items-center h-12 rounded-md transition-all",
            visuallyCollapsed ? (isEditor ? "justify-center group-hover:justify-start group-hover:px-3" : "justify-center") : "px-3 gap-3"
          )}>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-slate-600">
              U
            </div>
            <div className={cn(
              "flex-col overflow-hidden transition-all duration-300",
              visuallyCollapsed ? (isEditor ? "opacity-0 w-0 hidden group-hover:flex group-hover:w-auto group-hover:opacity-100 group-hover:ml-3" : "hidden") : "flex"
            )}>
              <span className="text-sm font-medium leading-none whitespace-nowrap">User Account</span>
              <span className="text-xs text-slate-500 mt-1 whitespace-nowrap">Pro Plan</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
