"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function LoginContent() {
  const searchParams = useSearchParams();
  const next         = searchParams.get("next") ?? "/dashboard";
  const isError      = searchParams.get("error") === "auth_failed";

  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Pass `next` through the callback so the user lands on the right page.
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    // Page navigates away; loading stays true.
  };

  return (
    <div className="min-h-screen bg-[#0a0a0d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl overflow-hidden mb-4">
            <Image src="/logo.jpg" alt="One Thousand Tales" width={56} height={56} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold text-white">One Thousand Tales</h1>
          <p className="text-sm text-zinc-500 mt-1">Studio Operations Platform</p>
        </div>

        {/* Card */}
        <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-sm font-semibold text-white">Sign in required</h2>
            <p className="text-xs text-zinc-500 mt-1.5">
              Sign in with your Google account to access the platform.
            </p>
          </div>

          {isError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-xs text-red-400 text-center">Sign-in failed — please try again.</p>
            </div>
          )}

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 disabled:opacity-60 text-zinc-900 font-medium text-sm px-4 py-3 rounded-xl transition-all"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin text-zinc-600" />
            ) : (
              // Google "G" logo mark
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" />
              </svg>
            )}
            {loading ? "Redirecting to Google…" : "Sign in with Google"}
          </button>
        </div>

        <p className="text-center text-[11px] text-zinc-700 mt-6">
          New accounts need approval before they can access the platform.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0d] flex items-center justify-center">
        <Loader2 size={22} className="text-zinc-600 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
