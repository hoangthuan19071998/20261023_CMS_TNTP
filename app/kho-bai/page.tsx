"use client";

import DanhSachBai from "@/components/DanhSachBai";
import { HopGiaiThich } from "@/components/Bieutuong";
import NutDangBai from "@/components/NutDangBai";
import { getRole } from "@/lib/permissions";
import { useStore } from "@/lib/store";

export default function Page() {
  const { vaiTro, cheDoGiaiThich, khoiPhucMau } = useStore();
  const role = getRole(vaiTro);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">Kho bài</h1>
        <div className="ml-auto flex flex-wrap gap-2">
          <NutDangBai />
          <button onClick={khoiPhucMau} className="nut-phu">
            Khôi phục dữ liệu mẫu
          </button>
        </div>
      </div>

      {cheDoGiaiThich && (
        <HopGiaiThich>
          Danh sách chỉ hiển thị những bài mà <strong>{role.ten}</strong> nhìn thấy theo ma trận phân
          quyền. Đổi vai trò ở thanh phía trên để thấy danh sách thay đổi. Ô mã bên phải mỗi bài là
          mã quyền nguyên văn trong ma trận, ví dụ <span className="font-mono">◆ E C A</span>.
        </HopGiaiThich>
      )}

      <DanhSachBai tieuDe={"Bài mà " + role.ten + " nhìn thấy"} hienBoLoc />
    </div>
  );
}
