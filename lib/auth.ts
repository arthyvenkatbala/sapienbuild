"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type UserRole = "admin" | "executive" | "member" | null;

export interface UserRoleState {
  role:    UserRole;
  loading: boolean;
  email:   string | null;
  name:    string | null;
}

// Client-side hook: returns the signed-in user's role from the `profiles` table.
// Returns { role: null } when there is no session (unauthenticated).
// Any new page that needs admin gating can call this hook and branch on `role`.
export function useUserRole(): UserRoleState {
  const [state, setState] = useState<UserRoleState>({ role: null, loading: true, email: null, name: null });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ role: null, loading: false, email: null, name: null });
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
        name:    user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? null,
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
