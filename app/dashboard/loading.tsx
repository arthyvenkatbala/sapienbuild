export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-[65px] border-b border-white/[0.06]" />
      <main className="flex-1 px-6 md:px-8 py-8 max-w-[1400px] w-full mx-auto space-y-6">

        {/* Stats strip skeleton */}
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

        {/* Charts row skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Donut */}
          <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 animate-pulse">
            <div className="h-4 w-32 bg-white/[0.06] rounded mb-1" />
            <div className="h-3 w-48 bg-white/[0.03] rounded mb-4" />
            <div className="flex items-center justify-center h-[188px]">
              <div className="w-[164px] h-[164px] rounded-full border-[28px] border-white/[0.05]" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-3 bg-white/[0.03] rounded" />
              ))}
            </div>
          </div>
          {/* Horizontal bar */}
          <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 animate-pulse">
            <div className="h-4 w-28 bg-white/[0.06] rounded mb-1" />
            <div className="h-3 w-40 bg-white/[0.03] rounded mb-4" />
            <div className="h-[188px] space-y-4 pt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-16 bg-white/[0.03] rounded shrink-0" />
                  <div className="h-3.5 bg-white/[0.05] rounded flex-1" style={{ maxWidth: `${(5 - i) * 18}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.05] flex justify-between">
              <div className="h-3 w-24 bg-white/[0.03] rounded" />
              <div className="h-3 w-16 bg-white/[0.05] rounded" />
            </div>
          </div>
          {/* Grouped bar */}
          <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 animate-pulse">
            <div className="h-4 w-36 bg-white/[0.06] rounded mb-1" />
            <div className="h-3 w-36 bg-white/[0.03] rounded mb-4" />
            <div className="h-[188px] flex items-end justify-around gap-4 px-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-end gap-1.5">
                  <div className="w-5 bg-white/[0.06] rounded-t" style={{ height: `${40 + i * 28}px` }} />
                  <div className="w-5 bg-white/[0.04] rounded-t" style={{ height: `${28 + i * 20}px` }} />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.05] flex justify-between">
              <div className="h-3 w-28 bg-white/[0.03] rounded" />
              <div className="h-3 w-16 bg-white/[0.05] rounded" />
            </div>
          </div>
        </div>

        {/* Bottom row skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 animate-pulse">
            <div className="h-4 w-32 bg-white/[0.06] rounded mb-5" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-white/[0.04]">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 bg-white/[0.05] rounded" />
                  <div className="h-3 w-24 bg-white/[0.03] rounded" />
                </div>
                <div className="h-3 w-14 bg-white/[0.04] rounded" />
              </div>
            ))}
          </div>
          <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 animate-pulse">
            <div className="h-4 w-28 bg-white/[0.06] rounded mb-5" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/[0.03] rounded-xl" />
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
