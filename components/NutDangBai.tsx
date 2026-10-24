"use client";

import Link from "next/link";
import { ROLES, coTheDangBai, diemVaoCuaVaiTro } from "@/lib/permissions";
import { useStore } from "@/lib/store";

/**
 * Nút vào màn hình đăng bài. Vai trò không đăng được thì ẩn; ở chế độ giải thích thì hiện
 * nút mờ kèm danh sách vai trò đăng được, đúng kiểu các nút hành động khác trong demo.
 */
export default function NutDangBai() {
  const { vaiTro, cheDoGiaiThich } = useStore();

  if (coTheDangBai(vaiTro)) {
    return (
      <Link href="/dang-bai" className="nut-chinh">
        + Đăng bài mới
      </Link>
    );
  }
  if (!cheDoGiaiThich) return null;

  const duocDang = ROLES.filter((r) => diemVaoCuaVaiTro(r.id).length > 0).map((r) => r.ten);
  return (
    <button type="button" disabled className="nut-tat" title={"Chỉ các vai trò sau đăng được bài: " + duocDang.join(", ")}>
      + Đăng bài mới
    </button>
  );
}
