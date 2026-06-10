import "./globals.css";
import SidebarNav from "@/components/layout/SidebarNav";

export const metadata = {
  title: "One Thousand Tales — Marketing Intelligence",
  description: "AI-powered photography marketing CRM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#0a0a0d] text-white antialiased">
        <div className="min-h-screen flex">
          <SidebarNav />
          <div className="flex-1 min-w-0 flex flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
