"use client";

import { usePathname } from "next/navigation";
import SidebarNav from "@/components/layout/SidebarNav";

// The root welcome/sign-in screen is a standalone full-screen view —
// no sidebar chrome around it.
const NO_SIDEBAR_PATHS = ["/"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (NO_SIDEBAR_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex">
      <SidebarNav />
      <div className="flex-1 min-w-0 flex flex-col">
        {children}
      </div>
    </div>
  );
}
