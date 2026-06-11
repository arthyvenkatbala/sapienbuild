"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  FolderOpen,
  Package,
  Receipt,
  ChevronDown,
  Camera,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  activeColor: string;
  children?: NavChild[];
}

const NAV: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    activeColor: "text-zinc-200",
  },
  {
    label: "CRM",
    href: "/crm",
    icon: Users,
    activeColor: "text-teal-400",
    children: [
      { label: "Leads",   href: "/crm/leads" },
      { label: "Clients", href: "/crm/clients" },
      { label: "Team",    href: "/crm/team" },
    ],
  },
  {
    label: "Workflow",
    href: "/workflow",
    icon: GitBranch,
    activeColor: "text-orange-400",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderOpen,
    activeColor: "text-blue-400",
  },
  {
    label: "Assets",
    href: "/assets",
    icon: Package,
    activeColor: "text-amber-400",
  },
  {
    label: "Accounts",
    href: "/accounts",
    icon: Receipt,
    activeColor: "text-green-400",
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [crmOpen, setCrmOpen] = useState(pathname.startsWith("/crm"));

  useEffect(() => {
    if (pathname.startsWith("/crm")) setCrmOpen(true);
  }, [pathname]);

  return (
    <aside className="w-60 shrink-0 bg-[#0d0d10] border-r border-white/[0.06] flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <Camera size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white leading-tight">One Thousand Tales</p>
            <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">OTT Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          const hasChildren = !!item.children?.length;

          return (
            <div key={item.href}>
              {hasChildren ? (
                <button
                  onClick={() => setCrmOpen((o) => !o)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all group ${
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon
                    size={15}
                    className={
                      isActive
                        ? item.activeColor
                        : "text-zinc-600 group-hover:text-zinc-400 transition-colors"
                    }
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={12}
                    className={`text-zinc-600 transition-transform duration-200 ${crmOpen ? "rotate-180" : ""}`}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all group ${
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon
                    size={15}
                    className={
                      isActive
                        ? item.activeColor
                        : "text-zinc-600 group-hover:text-zinc-400 transition-colors"
                    }
                  />
                  {item.label}
                </Link>
              )}

              {/* Sub-nav for CRM */}
              {hasChildren && crmOpen && (
                <div className="ml-6 mt-0.5 space-y-0.5 border-l border-white/[0.06] pl-3">
                  {item.children!.map((child) => {
                    const childActive =
                      pathname === child.href || pathname.startsWith(child.href + "/");
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onNavigate}
                        className={`block px-2 py-1.5 rounded-lg text-xs transition-all ${
                          childActive
                            ? "text-teal-400 bg-teal-500/10"
                            : "text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04]"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-black shrink-0">
            D
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">Dilip Kumar</p>
            <p className="text-[10px] text-zinc-600 truncate">Photography Studio</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function SidebarNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#111114] border border-white/[0.1] rounded-xl text-zinc-400 hover:text-white transition-colors"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      <div
        className={`md:hidden fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </div>
    </>
  );
}
