"use client";

import { useMemo, useState } from "react";
import type { Change } from "diff";
import type { Article } from "@/lib/types";
import { getRole } from "@/lib/permissions";
import { dinhDangThoiDiem } from "@/lib/store";
import { soSanhHaiSnapshot } from "@/lib/diff";
import { AnhDaiDien } from "./Bieutuong";

interface XemDiffProps {
  bai: Article;
  phienBanIdx: number;
  onDong: () => void;
}

function RenderDiffChunk({ chunk }: { chunk: Change }) {
  if (chunk.added) {
    return (
      <mark
        className="rounded bg-emerald-100 text-emerald-950 px-1 py-0.5 font-medium not-italic no-underline inline"
        title="Thêm mới trong phiên bản này"
      >
        {chunk.value}
      </mark>
    );
  }
  if (chunk.removed) {
    return (
      <del
        className="rounded bg-rose-100 text-rose-900 line-through px-1 py-0.5 opacity-85 not-italic inline"
        title="Đã xóa so với phiên bản trước"
      >
        {chunk.value}
      </del>
    );
  }
  return <span>{chunk.value}</span>;
}

function RenderDiffSection({
  changes,
  className = "",
}: {
  changes: Change[];
  className?: string;
}) {
  return (
    <div className={`whitespace-pre-wrap leading-relaxed ${className}`}>
      {changes.map((c, i) => (
        <RenderDiffChunk key={i} chunk={c} />
      ))}
    </div>
  );
}

export default function XemDiff({ bai, phienBanIdx, onDong }: XemDiffProps) {
  const pb = bai.phienBan;
  const [soSanhVoiIdx, setSoSanhVoiIdx] = useState<number>(
    phienBanIdx > 0 ? phienBanIdx - 1 : 0
  );

  const banHienTai = pb[phienBanIdx];
  const laBanDauTien = phienBanIdx === 0;

  const banSoSanh = laBanDauTien && soSanhVoiIdx === 0 ? null : pb[soSanhVoiIdx];

  const roleHienTai = getRole(banHienTai.tacGia);
  const ketQuaDiff = useMemo(() => {
    if (!banHienTai.snapshot) return null;
    return soSanhHaiSnapshot(banSoSanh?.snapshot ?? null, banHienTai.snapshot);
  }, [banHienTai, banSoSanh]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:p-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="So sánh thay đổi phiên bản"
      onClick={onDong}
    >
      <div
        className="w-full max-w-4xl rounded-xl bg-white shadow-2xl border border-ink-line my-4 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-ink-line bg-ink-bg/60 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-ink">
                Chi tiết thay đổi phiên bản
              </span>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-ink/10 text-ink">
                {banHienTai.id.split("-").pop()?.toUpperCase()}
              </span>
              <span className="text-xs text-ink-soft">· {bai.maBai}</span>
            </div>

            <div className="flex items-center gap-2">
              {ketQuaDiff && (
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  {ketQuaDiff.thongKe.soTuThem > 0 && (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                      +{ketQuaDiff.thongKe.soTuThem} từ thêm
                    </span>
                  )}
                  {ketQuaDiff.thongKe.soTuXoa > 0 && (
                    <span className="rounded bg-rose-100 px-2 py-0.5 font-semibold text-rose-800">
                      -{ketQuaDiff.thongKe.soTuXoa} từ xóa
                    </span>
                  )}
                </div>
              )}
              <button
                onClick={onDong}
                className="h-8 w-8 rounded-md flex items-center justify-center text-ink-soft hover:bg-black/5 hover:text-ink text-lg leading-none transition"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
          </div>

          {/* Version Details & Commit Bar */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-line bg-white p-3 text-sm">
            <div className="flex items-center gap-3">
              <AnhDaiDien ten={banHienTai.tenNguoi} co={34} />
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-ink">{banHienTai.tenNguoi}</strong>
                  <span className="nhan bg-ink-bg text-ink-soft">{roleHienTai.ten}</span>
                  <span className="text-xs text-ink-soft">
                    lúc {dinhDangThoiDiem(banHienTai.thoiDiem)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-soft italic">
                  &ldquo;{banHienTai.ghiChu}&rdquo;
                </p>
              </div>
            </div>

            {/* So sánh với selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-ink-soft whitespace-nowrap">So sánh với:</span>
              <select
                value={soSanhVoiIdx}
                onChange={(e) => setSoSanhVoiIdx(Number(e.target.value))}
                className="rounded border border-ink-line bg-ink-bg/30 px-2.5 py-1 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-ink"
              >
                {pb.map((v, i) => {
                  if (i === phienBanIdx) return null;
                  return (
                    <option key={v.id} value={i}>
                      {v.id.split("-").pop()?.toUpperCase()} ({v.tenNguoi} — {getRole(v.tacGia).ten})
                    </option>
                  );
                })}
                {laBanDauTien && (
                  <option value={0}>Không so sánh (Xem toàn bộ bản gốc)</option>
                )}
              </select>
            </div>
          </div>

          {/* Quick Legend Bar */}
          <div className="mt-2.5 flex items-center gap-4 text-xs text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-rose-200"></span>
              Đã xóa (bản cũ)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-emerald-200"></span>
              Thêm mới (bản này)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-stone-200"></span>
              Chữ đen: giữ nguyên
            </span>
          </div>
        </div>

        {/* Diff Body */}
        <div className="max-h-[65vh] overflow-y-auto p-5 space-y-5 bg-[#fafbfc]">
          {!banHienTai.snapshot ? (
            <div className="rounded-lg border border-dashed border-ink-line bg-white p-8 text-center">
              <p className="text-sm font-medium text-ink">
                Phiên bản này chưa có dữ liệu lưu trữ nội dung chi tiết để hiển thị diff.
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                Các phiên bản lưu mới sau này sẽ tự động lưu lại toàn bộ snapshot bài viết.
              </p>
            </div>
          ) : !ketQuaDiff ? null : (
            <>
              {/* Section 1: Tiêu đề */}
              <div className="the overflow-hidden bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-ink-line bg-ink-bg/50 px-4 py-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                    <span>📰</span> Tiêu đề bài viết
                  </span>
                  <span className="font-mono text-[11px] text-ink-soft">tieuDe</span>
                </div>
                <div className="p-4 text-base font-semibold">
                  <RenderDiffSection changes={ketQuaDiff.tieuDe} />
                </div>
              </div>

              {/* Section 2: Sa pô */}
              <div className="the overflow-hidden bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-ink-line bg-ink-bg/50 px-4 py-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                    <span>📑</span> Sa pô (Tóm tắt)
                  </span>
                  <span className="font-mono text-[11px] text-ink-soft">sapo</span>
                </div>
                <div className="p-4 text-sm text-ink-soft italic">
                  <RenderDiffSection changes={ketQuaDiff.sapo} />
                </div>
              </div>

              {/* Section 3: Thân bài */}
              <div className="the overflow-hidden bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-ink-line bg-ink-bg/50 px-4 py-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                    <span>📝</span> Nội dung thân bài
                  </span>
                  <span className="font-mono text-[11px] text-ink-soft">
                    {banHienTai.snapshot.doan.length} đoạn văn
                  </span>
                </div>
                <div className="p-4 text-sm leading-relaxed space-y-4">
                  <RenderDiffSection changes={ketQuaDiff.than} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-ink-line bg-white px-5 py-3">
          <div className="text-xs text-ink-soft">
            {banSoSanh ? (
              <span>
                Đang so sánh: <strong>{banHienTai.id.split("-").pop()?.toUpperCase()}</strong>{" "}
                với <strong>{banSoSanh.id.split("-").pop()?.toUpperCase()}</strong> ({banSoSanh.tenNguoi})
              </span>
            ) : (
              <span>Hiển thị nội dung đầy đủ của bản đầu tiên</span>
            )}
          </div>
          <button onClick={onDong} className="nut-chinh text-xs px-4 py-1.5">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
