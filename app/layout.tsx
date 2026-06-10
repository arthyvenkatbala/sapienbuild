import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Photography CRM Solution",
  description: "AI powered CRM for photography businesses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white">

        <main className="min-h-screen flex">

          {/* Sidebar */}

          <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 hidden md:block">

            <h1 className="text-2xl font-bold mb-10">
              OTT CRM
            </h1>

            <nav className="space-y-3">

              <Link
                href="/"
                className="block px-4 py-3 rounded-xl hover:bg-zinc-800"
              >
                Dashboard
              </Link>

              <Link
                href="/quotes"
                className="block px-4 py-3 rounded-xl hover:bg-zinc-800"
              >
                Quotes
              </Link>

              <div className="text-zinc-400 px-4 py-3">
                Leads
              </div>

              <div className="text-zinc-400 px-4 py-3">
                Campaigns
              </div>

              <div className="text-zinc-400 px-4 py-3">
                AI Assistant
              </div>

              <div className="text-zinc-400 px-4 py-3">
                Settings
              </div>

            </nav>

          </aside>

          {/* Page Content */}

          <div className="flex-1 p-6">
            {children}
          </div>

        </main>

      </body>
    </html>
  );
}