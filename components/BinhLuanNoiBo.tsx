"use client";

import { useState } from "react";
import { ROLES, getPermission, getRole } from "@/lib/permissions";
import { dinhDangThoiDiem, useStore } from "@/lib/store";
import type { Article, RoleId } from "@/lib/types";
import { HopGiaiThich } from "./Bieutuong";

export default function BinhLuanNoiBo({ bai }: { bai: Article }) {
  const { vaiTro, cheDoGiaiThich, themBinhLuan, danhDauXuLy } = useStore();
  const quyen = getPermission(vaiTro, bai.trangThai);
  const duocBinhLuan = quyen.caps.includes("C");

  const [noiDung, setNoiDung] = useState("");
  const [ganThe, setGanThe] = useState<RoleId | "">("");
  const [doanSo, setDoanSo] = useState<string>("");

  // Nhà in chỉ tiếp cận file thành phẩm, không thấy thảo luận nội bộ.
  const anHoanToan = vaiTro === "NHA_IN";

  function gui() {
    if (noiDung.trim().length < 2) return;
    themBinhLuan(
      bai.id,
      noiDung.trim(),
      ganThe === "" ? null : (ganThe as RoleId),
      doanSo === "" ? null : Number(doanSo)
    );
    setNoiDung("");
    setGanThe("");
    setDoanSo("");
  }

  if (anHoanToan) {
    return (
      <section className="the p-4">
        <h2 className="text-sm font-semibold">Bình luận nội bộ</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Vai trò {getRole(vaiTro).ten} không xem được thảo luận nội bộ của tòa soạn.
        </p>
      </section>
    );
  }

  return (
    <section className="the p-4">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold">Bình luận nội bộ</h2>
        <span className="nhan bg-ink-bg text-ink-soft">{bai.binhLuan.length}</span>
      </div>

      {bai.binhLuan.length === 0 && (
        <p className="mb-3 text-sm text-ink-soft">Chưa có bình luận nào trên bài này.</p>
      )}

      <ul className="mb-4 space-y-3">
        {bai.binhLuan.map((c) => (
          <li
            key={c.id}
            className={
              "rounded-md border px-3 py-2 text-sm " +
              (c.laYeuCauSua
                ? "border-amber-300 bg-amber-50"
                : c.daXuLy
                  ? "border-ink-line bg-ink-bg/50"
                  : "border-ink-line bg-white")
            }
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
              <strong className="text-ink">{c.tenNguoi}</strong>
              <span>{getRole(c.tacGia).ten}</span>
              <span>·</span>
              <span>{dinhDangThoiDiem(c.thoiDiem)}</span>
              {c.doanSo !== null && <span className="nhan bg-ink-bg">Đoạn {c.doanSo}</span>}
              {c.ganThe && <span className="nhan bg-sky-100 text-sky-800">@{getRole(c.ganThe).ten}</span>}
              {c.laYeuCauSua && <span className="nhan bg-amber-200 text-amber-950">Yêu cầu sửa</span>}
              {c.daXuLy && <span className="nhan bg-emerald-100 text-emerald-800">Đã xử lý</span>}
            </div>
            <p className="mt-1.5">{c.noiDung}</p>
            {!c.daXuLy && duocBinhLuan && (
              <button
                onClick={() => danhDauXuLy(bai.id, c.id)}
                className="mt-2 text-xs font-medium text-ink underline underline-offset-2"
              >
                Đánh dấu đã xử lý
              </button>
            )}
          </li>
        ))}
      </ul>

      {duocBinhLuan ? (
        <div className="space-y-2 border-t border-ink-line pt-3">
          <textarea
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value)}
            rows={2}
            placeholder="Ghi chú cho đồng nghiệp, ví dụ: cắt ảnh này theo tỷ lệ 16:9."
            className="w-full rounded border border-ink-line px-2 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={ganThe}
              onChange={(e) => setGanThe(e.target.value as RoleId | "")}
              className="rounded border border-ink-line px-2 py-1.5 text-sm"
              aria-label="Gắn thẻ vai trò"
            >
              <option value="">Không gắn thẻ ai</option>
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  @{r.ten}
                </option>
              ))}
            </select>
            <select
              value={doanSo}
              onChange={(e) => setDoanSo(e.target.value)}
              className="rounded border border-ink-line px-2 py-1.5 text-sm"
              aria-label="Gắn vào đoạn"
            >
              <option value="">Bình luận cả bài</option>
              {bai.doan.map((_, i) => (
                <option key={i} value={i + 1}>
                  Đoạn {i + 1}
                </option>
              ))}
            </select>
            <button onClick={gui} className="nut-chinh ml-auto">
              Gửi bình luận
            </button>
          </div>
        </div>
      ) : (
        <p className="border-t border-ink-line pt-3 text-sm text-ink-soft">
          Vai trò {getRole(vaiTro).ten} chỉ đọc được bình luận ở trạng thái này, không viết được.
        </p>
      )}

      {cheDoGiaiThich && (
        <div className="mt-3">
          <HopGiaiThich>
            Tài liệu của tòa soạn mô tả &quot;khung chat hoặc comment&quot; — đây là hai chức năng khác
            nhau. Bản demo dựng theo phương án comment gắn theo từng đoạn, có gắn thẻ người nhận và
            đánh dấu đã xử lý (câu hỏi số 60 trong danh sách làm rõ).
          </HopGiaiThich>
        </div>
      )}
    </section>
  );
}
