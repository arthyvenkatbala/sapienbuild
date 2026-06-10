import { supabase } from "@/lib/supabase";
export default async function Home() {
  const { data: realLeads, error } = await supabase
  .from("leads")
  .select("*");

console.log(realLeads);
console.log(error);
  
    const leads =
  realLeads?.map((lead) => ({
    name: lead.clientname,
    source: lead.source,
    status: lead.eventtype,
    color: "green",
  })) || [];

  return (
    <>

      {/* Header */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          One Thousand Tales CRM
        </h1>

        <p className="text-zinc-400 mt-2">
          AI-powered photography business dashboard
        </p>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-zinc-400 text-sm">
            Total Leads
          </h2>

          <p className="text-4xl font-bold mt-2">
            124
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-zinc-400 text-sm">
            Revenue Generated
          </h2>

          <p className="text-4xl font-bold mt-2">
            ₹4.8L
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-zinc-400 text-sm">
            Active Campaigns
          </h2>

          <p className="text-4xl font-bold mt-2">
            12
          </p>
        </div>

      </div>

      {/* Recent Leads */}
<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-semibold">
      Recent Leads
    </h2>

    <button className="bg-white text-black px-4 py-2 rounded-xl font-medium">
      Add Lead
    </button>
  </div>

  <div className="space-y-4">
    {leads.map((lead, index) => (
      <div
        key={index}
        className="flex items-center justify-between border-b border-zinc-800 pb-4"
      >
        <div>
          <p className="font-medium">
            {lead.name}
          </p>

          <p className="text-zinc-400 text-sm">
            {lead.source}
          </p>
        </div>

        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
          {lead.status}
        </span>
      </div>
    ))}
  </div>
</div>
      {/* AI Insights */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">
              AI Insights Assistant
            </h2>

            <p className="text-zinc-400 text-sm mt-1">
              Business insights powered by AI
            </p>
          </div>

          <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
            Live
          </div>
        </div>

        <div className="space-y-4">

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <p className="text-sm text-zinc-400 mb-2">
              AI Insight
            </p>

            <p className="text-lg">
              Wedding Gold Campaign generated 42% more leads this week compared to last week.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <p className="text-sm text-zinc-400 mb-2">
              AI Recommendation
            </p>

            <p className="text-lg">
              Increase Instagram Reel ads budget by 20% to improve wedding inquiries.
            </p>
          </div>

        </div>

      </div>

    </>
  );
}