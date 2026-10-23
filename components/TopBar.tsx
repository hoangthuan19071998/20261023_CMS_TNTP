"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { coTheDangBai, getRole } from "@/lib/permissions";
import { useStore, vaiTroGiuBai } from "@/lib/store";
import RoleSwitcher from "./RoleSwitcher";

const MENU = [
  { href: "/", nhan: "Bảng điều khiển" },
  { href: "/kho-bai", nhan: "Kho bài" },
  { href: "/nhat-ky", nhan: "Nhật ký" },
];

export default function TopBar() {
  const pathname = usePathname();
  const { vaiTro, bai, daTai } = useStore();
  const role = getRole(vaiTro);
  const menu = coTheDangBai(vaiTro)
    ? [...MENU.slice(0, 2), { href: "/dang-bai", nhan: "Đăng bài" }, ...MENU.slice(2)]
    : MENU;

  const soViecCho = daTai
    ? bai.filter((b) => vaiTroGiuBai(b.trangThai).includes(vaiTro)).length
    : 0;

  return (
    <header>
      <div className="bg-ink text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
          <Link href="/" className="text-base font-semibold">
            CMS Tòa soạn hội tụ
          </Link>
          <nav className="flex gap-1">
            {menu.map((m) => {
              const hoatDong = m.href === "/" ? pathname === "/" : pathname.startsWith(m.href);
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className={
                    "rounded px-3 py-1.5 text-sm transition " +
                    (hoatDong ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10")
                  }
                >
                  {m.nhan}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm" title="Số bài đang chờ vai trò này xử lý">
              <span aria-hidden>🔔</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">
                {soViecCho} việc chờ
              </span>
            </div>
            <div className="text-right text-xs leading-tight">
              <div className="font-medium">{role.nguoiDung}</div>
              <div className="text-white/70">{role.ten}</div>
            </div>
          </div>
        </div>
      </div>
      <RoleSwitcher />
    </header>
  );
}
