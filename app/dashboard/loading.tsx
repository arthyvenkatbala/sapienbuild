export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-[65px] border-b border-white/[0.06]" />
      <main className="flex-1 px-6 md:px-8 py-8 max-w-[1400px] w-full mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
                <div className="w-4 h-4 rounded bg-white/[0.03]" />
              </div>
              <div className="h-8 w-20 bg-white/[0.06] rounded-lg mb-2" />
              <div className="h-3 w-24 bg-white/[0.03] rounded" />
              <div className="h-3 w-28 bg-white/[0.03] rounded mt-2" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#111114] border border-white/[0.07] rounded-2xl p-6 animate-pulse">
            <div className="h-5 w-36 bg-white/[0.06] rounded mb-6" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-white/[0.04]">
                <div className="w-2 h-2 rounded-full bg-white/[0.06] shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-48 bg-white/[0.05] rounded" />
                  <div className="h-3 w-24 bg-white/[0.03] rounded" />
                </div>
                <div className="h-3 w-12 bg-white/[0.03] rounded" />
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6 animate-pulse">
              <div className="h-5 w-32 bg-white/[0.06] rounded mb-5" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-white/[0.04]">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 bg-white/[0.05] rounded" />
                    <div className="h-3 w-20 bg-white/[0.03] rounded" />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6 animate-pulse">
              <div className="h-5 w-28 bg-white/[0.06] rounded mb-5" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-white/[0.03] rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
