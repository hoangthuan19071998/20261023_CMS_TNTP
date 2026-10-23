"use client";

// Hộp "Lịch sử bài viết": bảng ghi mọi thao tác đã thực hiện trên một bài —
// ai làm, lúc nào, hành động gì, mô tả, gắn với phiên bản nào. Có bộ lọc theo
// hành động để tra nhanh, giống màn hình lịch sử tài liệu của phần mềm quy trình.

import { useMemo, useState } from "react";
import { getRole } from "@/lib/permissions";
import { dinhDangThoiDiem } from "@/lib/store";
import type { Article, LogEntry } from "@/lib/types";
import { AnhDaiDien } from "./Bieutuong";

export default function LichSuTaiLieu({
  bai,
  nhatKy,
  onDong,
}: {
  bai: Article;
  nhatKy: LogEntry[];
  onDong: () => void;
}) {
  const [locHanhDong, setLocHanhDong] = useState("Tất cả");

  const cuaBai = useMemo(
    () =>
      nhatKy
        .filter((e) => e.baiId === bai.id)
        .slice()
        .sort((a, b) => a.thoiDiem.localeCompare(b.thoiDiem)),
    [nhatKy, bai.id]
  );

  const cacHanhDong = useMemo(
    () => ["Tất cả", ...Array.from(new Set(cuaBai.map((e) => e.hanhDong)))],
    [cuaBai]
  );

  const hien = locHanhDong === "Tất cả" ? cuaBai : cuaBai.filter((e) => e.hanhDong === locHanhDong);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Lịch sử bài viết"
      onClick={onDong}
    >
      <div
        className="w-full max-w-5xl rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-ink-line px-5 py-3.5">
          <h2 className="text-base font-semibold">Lịch sử bài viết</h2>
          <label className="flex items-center gap-1.5 text-sm">
            <span className="text-ink-soft">Hành động:</span>
            <select
              value={locHanhDong}
              onChange={(e) => setLocHanhDong(e.target.value)}
              className="rounded border border-ink-line bg-white px-2 py-1 text-sm font-medium"
            >
              {cacHanhDong.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
          <span className="font-mono text-xs text-ink-soft">{bai.maBai}</span>
          <button onClick={onDong} className="ml-auto text-xl leading-none text-ink-soft hover:text-ink" aria-label="Đóng">
            ×
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-ink-bg text-left text-xs text-ink-soft">
              <tr>
                <th className="px-5 py-2.5 font-medium">Người dùng</th>
                <th className="px-3 py-2.5 font-medium">Thời gian</th>
                <th className="px-3 py-2.5 font-medium">Hành động</th>
                <th className="px-3 py-2.5 font-medium">Mô tả</th>
                <th className="px-5 py-2.5 font-medium">Phiên bản</th>
              </tr>
            </thead>
            <tbody>
              {hien.map((e) => {
                const r = getRole(e.vaiTro);
                const tenNguoi = e.tenNguoi ?? r.nguoiDung;
                return (
                  <tr key={e.id} className="border-t border-ink-line align-top">
                    <td className="px-5 py-2.5">
                      <span className="flex items-center gap-2">
                        <AnhDaiDien ten={tenNguoi} co={22} />
                        <span>
                          <span className="block leading-tight">{tenNguoi}</span>
                          <span className="block text-[11px] leading-tight text-ink-soft">{r.ten}</span>
                        </span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{dinhDangThoiDiem(e.thoiDiem)}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-medium">{e.hanhDong}</td>
                    <td className="px-3 py-2.5 text-ink-soft">{e.chiTiet}</td>
                    <td className="whitespace-nowrap px-5 py-2.5 font-mono text-xs text-ink-soft">
                      {e.phienBan ? e.phienBan.split("-").pop() : "—"}
                    </td>
                  </tr>
                );
              })}
              {hien.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-ink-soft">
                    Không có thao tác nào khớp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-ink-line px-5 py-3 text-sm">
          <span className="text-ink-soft">
            Tổng: <strong className="text-ink">{hien.length}</strong> thao tác
          </span>
          <span className="text-xs text-ink-soft">
            Nhật ký chỉ ghi thêm, không ai sửa hay xóa được dòng đã ghi.
          </span>
          <button onClick={onDong} className="nut-chinh ml-auto">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
