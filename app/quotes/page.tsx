export default function QuotesPage() {
  return (

      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold mb-2">
          Create Quote
        </h1>

        <p className="text-zinc-400 mb-8">
          Generate custom photography quotations
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">

          <div>
            <label className="block mb-2 text-sm text-zinc-400">
              Client Name
            </label>

            <input
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3"
              placeholder="Enter client name"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-zinc-400">
              Event Type
            </label>

            <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3">
              <option>Wedding</option>
              <option>Pre-Wedding</option>
              <option>Birthday</option>
              <option>Corporate Event</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm text-zinc-400">
              Package
            </label>

            <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3">
              <option>Silver Package - ₹45,000</option>
              <option>Gold Package - ₹75,000</option>
              <option>Premium Package - ₹1,20,000</option>
            </select>
          </div>

          <div className="bg-black rounded-xl p-6 border border-zinc-800">

            <p className="text-zinc-400 text-sm mb-2">
              Estimated Total
            </p>

            <h2 className="text-4xl font-bold">
              ₹90,000
            </h2>

          </div>

          <div className="flex gap-4">

            <button className="bg-white text-black px-6 py-3 rounded-xl font-medium">
              Generate PDF
            </button>

            <button className="bg-zinc-800 px-6 py-3 rounded-xl font-medium">
              Save Draft
            </button>

          </div>

        </div>

      </div>
  );
}