import "./globals.css";
import AppShell from "@/components/layout/AppShell";
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
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
