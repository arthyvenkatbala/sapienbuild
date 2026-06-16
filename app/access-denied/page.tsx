"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, Clock } from "lucide-react";

function AccessDeniedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const isAdminOnly = reason === "admin";

  return (
    <div className="min-h-screen bg-[#0a0a0d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
            {isAdminOnly ? (
              <ShieldAlert size={20} className="text-red-400" />
            ) : (
              <Clock size={20} className="text-amber-400" />
            )}
          </div>

          {isAdminOnly ? (
            <>
              <h1 className="text-sm font-semibold text-white">Admin access required</h1>
              <p className="text-xs text-zinc-500">
                This page is restricted to studio admins.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-sm font-semibold text-white">Account pending approval</h1>
              <p className="text-xs text-zinc-500">
                Your account hasn&apos;t been approved yet. Contact Dilip Kumar to get access.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0d]" />}>
      <AccessDeniedContent />
    </Suspense>
  );
}
