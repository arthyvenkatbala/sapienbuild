import "./globals.css";
import SidebarNav from "@/components/layout/SidebarNav";
import { ClientProvider } from "@/lib/client-context";
import { ToastProvider } from "@/lib/toast";

export const metadata = {
  title: "One Thousand Tales — OTT Platform",
  description: "Internal operations platform for One Thousand Tales photography studio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#0a0a0d] text-white antialiased">
        <ClientProvider>
          <ToastProvider>
            <div className="min-h-screen flex">
              <SidebarNav />
              <div className="flex-1 min-w-0 flex flex-col">
                {children}
              </div>
            </div>
          </ToastProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
