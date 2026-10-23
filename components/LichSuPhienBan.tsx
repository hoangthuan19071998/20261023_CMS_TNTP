"use client";

import { useState } from "react";
import { getRole } from "@/lib/permissions";
import { dinhDangThoiDiem } from "@/lib/store";
import type { Article } from "@/lib/types";
import XemDiff from "./XemDiff";

export default function LichSuPhienBan({ bai }: { bai: Article }) {
  const [xemDiffIdx, setXemDiffIdx] = useState<number | null>(null);
  const pb = bai.phienBan;
  const cuoiIdx = pb.length - 1;
  const coNhieuBan = pb.length > 1;

  return (
    <section className="the p-4 flex flex-col justify-between">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Lịch sử chỉnh sửa</h2>
            <span className="nhan bg-ink-bg text-ink-soft">{pb.length} phiên bản</span>
          </div>
          <span className="text-[11px] text-ink-soft hidden sm:inline">
            Nhấn vào phiên bản để xem diff
          </span>
        </div>

        <ol className="space-y-2.5 text-sm">
          {pb
            .slice()
            .reverse()
            .map((v, i) => {
              const realIdx = pb.length - 1 - i;
              const laBanDau = realIdx === 0;

              return (
                <li
                  key={v.id}
                  className="group rounded-md border border-transparent p-2 transition hover:border-ink-line hover:bg-ink-bg/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="font-mono text-xs font-semibold text-ink-soft bg-ink/5 px-1.5 py-0.5 rounded">
                        {v.id.split("-").pop()?.toUpperCase()}
                      </span>
                      <strong>{v.tenNguoi}</strong>
                      <span className="text-xs text-ink-soft">{getRole(v.tacGia).ten}</span>
                      <span className="text-xs text-ink-soft">· {dinhDangThoiDiem(v.thoiDiem)}</span>
                      <span className="text-xs text-ink-soft">· {v.soTuThayDoi} từ thay đổi</span>
                      {i === 0 && (
                        <span className="nhan bg-emerald-100 text-emerald-800">Bản hiện tại</span>
                      )}
                    </div>

                    <button
                      onClick={() => setXemDiffIdx(realIdx)}
                      className="nut-phu text-xs py-1 px-2.5 flex items-center gap-1 group-hover:border-ink/30"
                      title={laBanDau ? "Xem toàn bộ nội dung bản gốc" : "Xem thay đổi so với bản trước đó"}
                    >
                      <span aria-hidden>{laBanDau ? "📄" : "🔍"}</span>
                      {laBanDau ? "Xem bản gốc" : "Xem thay đổi"}
                    </button>
                  </div>

                  <p className="mt-1 text-xs text-ink-soft pl-0.5">
                    {v.ghiChu}
                  </p>
                </li>
              );
            })}
        </ol>
      </div>

      {coNhieuBan && (
        <div className="mt-4 border-t border-ink-line pt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-ink-soft">
            Hỗ trợ xem thay đổi chi tiết cấp từ (tiêu đề, sa pô, thân bài) dạng inline diff kiểu GitHub.
          </p>
          <button
            onClick={() => setXemDiffIdx(cuoiIdx)}
            className="nut-phu text-xs whitespace-nowrap py-1.5 px-3 shrink-0"
          >
            So sánh hai bản gần nhất
          </button>
        </div>
      )}

      {xemDiffIdx !== null && (
        <XemDiff
          bai={bai}
          phienBanIdx={xemDiffIdx}
          onDong={() => setXemDiffIdx(null)}
        />
      )}
    </section>
  );
}
