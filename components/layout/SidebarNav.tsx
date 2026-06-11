"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart2,
  Brain,
  Building2,
  Check,
  ChevronDown,
  FileText,
  Image,
  LayoutDashboard,
  Megaphone,
  Plus,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useClientContext } from "@/lib/client-context";
import type { Client } from "@/lib/clients-types";

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
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Analytics", href: "/analytics", icon: BarChart2 },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { label: "AI Strategy",         href: "/ai-strategy", icon: Brain },
      { label: "Media Insights",      href: "/media",       icon: Image },
      { label: "Campaign Intel",      href: "/campaigns",   icon: TrendingUp },
      { label: "Performance Reports", href: "/reports",     icon: Megaphone },
    ],
  },
  {
    group: "CRM",
    items: [
      { label: "Clients", href: "/clients", icon: Building2 },
      { label: "Leads",   href: "/leads",   icon: Users },
      { label: "Quotes",  href: "/quotes",  icon: FileText },
    ],
  },
  {
    group: "System",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

function platformLabel(p: string) {
  if (p === "meta")   return "Meta";
  if (p === "google") return "Google";
  return p;
}

function ClientSelector() {
  const { clients, selectedClient, setSelectedClient, loading } =
    useClientContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return (
      <div className="h-[52px] rounded-xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
    );
  }

  const noClients = clients.length === 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-left ${
          open
            ? "bg-white/[0.06] border-white/[0.15]"
            : "bg-[#0a0a0d] border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.03]"
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${
            selectedClient
              ? "bg-purple-500/20 border border-purple-500/30 text-purple-300"
              : "bg-white/[0.06] border border-white/[0.08] text-zinc-500"
          }`}
        >
          {selectedClient ? initials(selectedClient.business_name) : "—"}
        </div>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate leading-tight">
            {selectedClient?.business_name ?? "No client selected"}
          </p>
          <p className="text-[9px] text-zinc-600 truncate leading-tight mt-0.5">
            {selectedClient
              ? selectedClient.connected_platforms.length > 0
                ? selectedClient.connected_platforms
                    .map(platformLabel)
                    .join(" · ")
                : "No platforms connected"
              : noClients
              ? "Create a client first"
              : "Select a client"}
          </p>
        </div>

        <ChevronDown
          size={12}
          className={`text-zinc-600 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#18181b] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
          {/* Client list */}
          {clients.length === 0 ? (
            <div className="px-3 py-3 text-[11px] text-zinc-500 text-center">
              No clients yet
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {clients.map((c: Client) => {
                const active = selectedClient?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedClient(c);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors text-left ${
                      active
                        ? "bg-purple-500/10"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        active
                          ? "bg-purple-500/25 border border-purple-500/40 text-purple-300"
                          : "bg-white/[0.06] border border-white/[0.08] text-zinc-400"
                      }`}
                    >
                      {initials(c.business_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{c.business_name}</p>
                      {c.connected_platforms.length > 0 && (
                        <div className="flex gap-1.5 mt-0.5">
                          {c.connected_platforms.includes("meta") && (
                            <span className="text-[9px] font-medium text-blue-400 leading-none">
                              Meta
                            </span>
                          )}
                          {c.connected_platforms.includes("google") && (
                            <span className="text-[9px] font-medium text-green-400 leading-none">
                              Google
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {active && (
                      <Check size={11} className="text-purple-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <Link
            href="/clients"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 border-t border-white/[0.06] text-[11px] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] transition-colors"
          >
            <Plus size={11} />
            Manage Clients
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SidebarNav() {
  const pathname = usePathname();
  const { selectedClient } = useClientContext();

  return (
    <aside className="w-60 shrink-0 bg-[#0d0d10] border-r border-white/[0.06] flex-col hidden md:flex">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">SapienBuildCRM</p>
            <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">
              {selectedClient ? selectedClient.business_name : "No client selected"}
            </p>
          </div>
        </div>
      </div>

      {/* Client selector */}
      <div className="px-3 pt-3 pb-1">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-600 px-1 mb-1.5">
          Active Client
        </p>
        <ClientSelector />
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {NAV.map((group) => (
          <div key={group.group}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-3 mb-2">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
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
