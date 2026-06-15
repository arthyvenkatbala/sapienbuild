"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type UserRole = "admin" | "member" | null;

export interface UserRoleState {
  role:    UserRole;
  loading: boolean;
  email:   string | null;
}

// Client-side hook: returns the signed-in user's role from the `profiles` table.
// Returns { role: null } when there is no session (unauthenticated).
// Any new page that needs admin gating can call this hook and branch on `role`.
export function useUserRole(): UserRoleState {
  const [state, setState] = useState<UserRoleState>({ role: null, loading: true, email: null });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ role: null, loading: false, email: null });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setState({
        role:    (profile?.role as UserRole) ?? "member",
        loading: false,
        email:   user.email ?? null,
      });
    };

    load();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => { listener.subscription.unsubscribe(); };
  }, []);

  return state;
}

// Server-side helper: returns the role for the currently authenticated user.
// Import this ONLY in Server Components / Route Handlers (not client bundles).
// Usage:  const role = await getServerUserRole();
export async function getServerUserRole(): Promise<UserRole> {
  // Dynamic import to avoid pulling server-only modules into client bundles.
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (profile?.role as UserRole) ?? "member";
}
