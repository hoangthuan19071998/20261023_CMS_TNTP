"use client";

import { HopGiaiThich } from "@/components/Bieutuong";
import { getRole } from "@/lib/permissions";
import { dinhDangThoiDiem, useStore } from "@/lib/store";

export default function Page() {
  const { vaiTro, nhatKy, bai, cheDoGiaiThich } = useStore();
  const role = getRole(vaiTro);

  // Theo ma trận, chỉ Quản trị hệ thống và PTBT/TBT được xem toàn bộ nhật ký;
  // Thư ký tòa soạn chỉ xem. Các vai còn lại không truy cập.
  const duocXem = ["ADMIN", "TBT", "TKTS"].includes(vaiTro);

  if (!duocXem) {
    return (
      <div className="the p-6">
        <h1 className="text-xl font-semibold">Nhật ký lưu vết</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Vai trò <strong>{role.ten}</strong> không có quyền xem nhật ký toàn hệ thống.
        </p>
        {cheDoGiaiThich && (
          <div className="mt-4">
            <HopGiaiThich>
              Theo bảng quyền chức năng hệ thống, chỉ Quản trị hệ thống và PTBT/TBT được xem nhật ký;
              Thư ký tòa soạn chỉ xem. Nhật ký chỉ ghi thêm, không sửa và không xóa được — đây là điều
              kiện để trả lời câu hỏi &quot;ai đã sửa câu này&quot; nêu trong tài liệu của tòa soạn.
            </HopGiaiThich>
          </div>
        )}
      </div>
    );
  }

  const tenBai = (id: string | null) => (id ? (bai.find((b) => b.id === id)?.maBai ?? id) : "—");

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Nhật ký lưu vết</h1>
      {cheDoGiaiThich && (
        <HopGiaiThich>
          Mọi thao tác bạn thực hiện trong phiên demo này đều được ghi lại ở đây. Nhật ký chỉ ghi
          thêm, không sửa, không xóa.
        </HopGiaiThich>
      )}

      <div className="the overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-bg text-left text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-2 font-semibold">Thời điểm</th>
              <th className="px-4 py-2 font-semibold">Vai trò</th>
              <th className="px-4 py-2 font-semibold">Hành động</th>
              <th className="px-4 py-2 font-semibold">Bài</th>
              <th className="px-4 py-2 font-semibold">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-line">
            {nhatKy.map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap px-4 py-2 text-ink-soft">{dinhDangThoiDiem(l.thoiDiem)}</td>
                <td className="whitespace-nowrap px-4 py-2">{getRole(l.vaiTro).ten}</td>
                <td className="px-4 py-2 font-medium">{l.hanhDong}</td>
                <td className="whitespace-nowrap px-4 py-2 font-mono text-xs">{tenBai(l.baiId)}</td>
                <td className="px-4 py-2 text-ink-soft">{l.chiTiet}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-ink-soft">
        Tổng {nhatKy.length} dòng nhật ký trong phiên demo này.
      </p>
    </div>
  );
}
