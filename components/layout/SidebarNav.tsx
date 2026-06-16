"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  FolderOpen,
  Package,
  Receipt,
  ChevronDown,
  Menu,
  X,
  Globe,
  BarChart2,
  LogOut,
  LogIn,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useUserRole } from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

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
  {
    label: "Social",
    href: "/social",
    icon: Globe,
    activeColor: "text-pink-400",
  },
  {
    label: "Marketing",
    href: "/marketing",
    icon: BarChart2,
    activeColor: "text-sky-400",
  },
];

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const router        = useRouter();
  const { role, name } = useUserRole();
  const isSignedIn    = role !== null;
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const signOut = async () => {
    close();
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    onNavigate?.();
    router.push("/");
    router.refresh();
  };

  if (!isSignedIn) {
    return (
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <Link
          href="/"
          onClick={onNavigate}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-200 bg-white/[0.06] hover:bg-white/[0.1] transition-all"
        >
          <LogIn size={14} className="text-pink-400" />
          Login
        </Link>
      </div>
    );
  }

  const displayName = name ?? "Account";
  const initial      = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative px-3 py-3 border-t border-white/[0.06]">

      {/* Popup menu — appears above the footer trigger */}
      {open && (
        <>
          {/* invisible backdrop to catch outside clicks */}
          <div className="fixed inset-0 z-10" onClick={close} />
          <div className="absolute bottom-full left-3 right-3 mb-2 z-20 bg-[#1c1c21] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden">
            <Link
              href="/social/settings"
              onClick={() => { close(); onNavigate?.(); }}
              className="flex items-center gap-2.5 px-4 py-3 text-sm text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-all"
            >
              <Settings size={14} className="text-pink-400" />
              Settings
            </Link>
            <div className="mx-3 border-t border-white/[0.06]" />
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-zinc-300 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <LogOut size={14} />
              Log out
            </button>
          </div>
        </>
      )}

      {/* Footer trigger — shows the signed-in user's own name */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/[0.05] transition-all group"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-black shrink-0">
          {initial}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-xs font-medium text-white truncate">{displayName}</p>
          <p className="text-[10px] text-zinc-500 truncate capitalize">{role}</p>
        </div>
        <ChevronDown
          size={12}
          className={`text-zinc-600 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "/crm":       pathname.startsWith("/crm"),
    "/social":    pathname.startsWith("/social"),
    "/marketing": pathname.startsWith("/marketing"),
  });

  useEffect(() => {
    if (pathname.startsWith("/crm"))       setOpenSections((s) => ({ ...s, "/crm": true }));
    if (pathname.startsWith("/social"))    setOpenSections((s) => ({ ...s, "/social": true }));
    if (pathname.startsWith("/marketing")) setOpenSections((s) => ({ ...s, "/marketing": true }));
  }, [pathname]);

  const toggleSection = (href: string) => {
    setOpenSections((s) => ({ ...s, [href]: !s[href] }));
  };

  const CHILD_ACTIVE_COLOR: Record<string, string> = {
    "/crm":    "text-teal-400 bg-teal-500/10",
    "/social": "text-pink-400 bg-pink-500/10",
  };

  return (
    <aside className="w-60 shrink-0 bg-[#0d0d10] border-r border-white/[0.06] flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0">
            <Image src="/logo.jpg" alt="One Thousand Tales" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white leading-tight">One Thousand Tales</p>
            <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">Studio Operations Platform</p>
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
          const isOpen      = !!openSections[item.href];

          return (
            <div key={item.href}>
              {hasChildren ? (
                // Label/icon = Link (navigates); chevron = separate toggle button
                <div
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all group ${
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className="flex items-center gap-2.5 flex-1 min-w-0"
                  >
                    <Icon
                      size={15}
                      className={
                        isActive
                          ? item.activeColor
                          : "text-zinc-600 group-hover:text-zinc-400 transition-colors"
                      }
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                  <button
                    onClick={() => toggleSection(item.href)}
                    className="shrink-0 p-0.5 rounded hover:bg-white/[0.08] transition-colors"
                    aria-label={isOpen ? "Collapse" : "Expand"}
                  >
                    <ChevronDown
                      size={12}
                      className={`text-zinc-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
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

              {/* Sub-nav */}
              {hasChildren && isOpen && (
                <div className="ml-6 mt-0.5 space-y-0.5 border-l border-white/[0.06] pl-3">
                  {item.children!.map((child) => {
                    const childActive =
                      pathname === child.href || pathname.startsWith(child.href + "/");
                    const activeClass = CHILD_ACTIVE_COLOR[item.href] ?? "text-zinc-300 bg-white/[0.06]";
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onNavigate}
                        className={`block px-2 py-1.5 rounded-lg text-xs transition-all ${
                          childActive
                            ? activeClass
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

      {/* Footer — auth state */}
      <SidebarFooter onNavigate={onNavigate} />
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
