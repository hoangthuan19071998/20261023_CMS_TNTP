"use client";

import { useState } from "react";
import { getRole } from "@/lib/permissions";
import { dinhDangThoiDiem } from "@/lib/store";
import type { Article } from "@/lib/types";

export default function LichSuPhienBan({ bai }: { bai: Article }) {
  const [moSoSanh, setMoSoSanh] = useState(false);
  const pb = bai.phienBan;
  const cuoi = pb[pb.length - 1];
  const truocDo = pb.length > 1 ? pb[pb.length - 2] : null;

  return (
    <section className="the p-4">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold">Lịch sử chỉnh sửa</h2>
        <span className="nhan bg-ink-bg text-ink-soft">{pb.length} phiên bản</span>
      </div>

      <ol className="space-y-2 text-sm">
        {pb
          .slice()
          .reverse()
          .map((v, i) => (
            <li key={v.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-mono text-xs text-ink-soft">{v.id.split("-").pop()}</span>
              <strong>{v.tenNguoi}</strong>
              <span className="text-xs text-ink-soft">{getRole(v.tacGia).ten}</span>
              <span className="text-xs text-ink-soft">· {dinhDangThoiDiem(v.thoiDiem)}</span>
              <span className="text-xs text-ink-soft">· {v.soTuThayDoi} từ thay đổi</span>
              {i === 0 && <span className="nhan bg-emerald-100 text-emerald-800">Bản hiện tại</span>}
              <span className="w-full text-xs text-ink-soft">{v.ghiChu}</span>
            </li>
          ))}
      </ol>

      {truocDo && (
        <div className="mt-3 border-t border-ink-line pt-3">
          <button onClick={() => setMoSoSanh(!moSoSanh)} className="nut-phu">
            {moSoSanh ? "Đóng so sánh" : "So sánh hai bản gần nhất"}
          </button>
          {moSoSanh && (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded border border-ink-line bg-ink-bg/40 p-3 text-xs">
                <div className="mb-1 font-semibold">{truocDo.tenNguoi} — {dinhDangThoiDiem(truocDo.thoiDiem)}</div>
                <p className="text-ink-soft">{truocDo.ghiChu}</p>
              </div>
              <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-xs">
                <div className="mb-1 font-semibold">{cuoi.tenNguoi} — {dinhDangThoiDiem(cuoi.thoiDiem)}</div>
                <p className="text-emerald-900">{cuoi.ghiChu}</p>
              </div>
              <p className="md:col-span-2 text-xs text-ink-soft">
                Bản demo hiển thị mức tóm tắt. Mức chi tiết cần chốt ở câu hỏi số 53: lưu phiên bản và
                so sánh hai bản, hay hiện vết sửa trực tiếp trên văn bản như Google Docs.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
