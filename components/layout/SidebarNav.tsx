"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart2,
  Brain,
  Image,
  TrendingUp,
  Megaphone,
  Users,
  FileText,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard",  href: "/",          icon: LayoutDashboard },
      { label: "Analytics",  href: "/analytics", icon: BarChart2 },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { label: "AI Strategy",         href: "/ai-strategy",  icon: Brain },
      { label: "Media Insights",      href: "/media",        icon: Image },
      { label: "Campaign Intel",      href: "/campaigns",    icon: TrendingUp },
      { label: "Performance Reports", href: "/reports",      icon: Megaphone },
    ],
  },
  {
    group: "CRM",
    items: [
      { label: "Leads",  href: "/leads",  icon: Users },
      { label: "Quotes", href: "/quotes", icon: FileText },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-[#0d0d10] border-r border-white/[0.06] flex-col hidden md:flex">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">OTT CRM</p>
            <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">Marketing Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV.map((group) => (
          <div key={group.group}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-3 mb-2">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
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
                          ? "text-purple-400"
                          : "text-zinc-600 group-hover:text-zinc-400 transition-colors"
                      }
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
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
