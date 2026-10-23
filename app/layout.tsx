import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import TopBar from "@/components/TopBar";
import DemoBanner from "@/components/DemoBanner";

export const metadata: Metadata = {
  title: "CMS Tòa soạn hội tụ — Bản demo phân quyền",
  description:
    "Bản mô phỏng quy trình và phân quyền cho hệ thống tòa soạn hội tụ. Không phải sản phẩm thật.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen antialiased">
        <StoreProvider>
          <DemoBanner />
          <TopBar />
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
          <footer className="mx-auto max-w-7xl px-4 pb-10 pt-4 text-xs text-ink-soft">
            Bản demo mô phỏng — dữ liệu nằm trong trình duyệt, không có máy chủ, không có đăng nhập thật.
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
