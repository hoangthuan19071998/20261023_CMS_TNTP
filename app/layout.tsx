import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import { StoreProvider } from "@/lib/store";
import TopBar from "@/components/TopBar";
import DemoBanner from "@/components/DemoBanner";

export const metadata: Metadata = {
  title: "CMS Tòa soạn hội tụ — Bản demo phân quyền",
  description:
    "Hệ thống quy trình và phân quyền cho tòa soạn hội tụ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen antialiased">
        <QueryProvider>
          <StoreProvider>
            <DemoBanner />
            <TopBar />
            <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
            <footer className="mx-auto max-w-7xl px-4 pb-10 pt-4 text-xs text-ink-soft">
              Hệ thống kết nối Backend NestJS & PostgreSQL — Tòa soạn hội tụ.
            </footer>
          </StoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
