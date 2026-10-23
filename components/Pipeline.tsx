"use client";

import { PIPELINE, getState } from "@/lib/permissions";
import type { StateId } from "@/lib/types";

export default function Pipeline({ hienTai }: { hienTai: StateId }) {
  const nhanhPhu = getState(hienTai).nhanhPhu;
  const viTri = PIPELINE.indexOf(hienTai);

  return (
    <div className="the p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        Tiến trình bài
      </div>
      <ol className="flex flex-wrap gap-1.5">
        {PIPELINE.map((s, i) => {
          const daQua = viTri >= 0 && i < viTri;
          const dangO = s === hienTai;
          return (
            <li key={s} className="flex items-center gap-1.5">
              <span
                title={getState(s).dienGiai}
                className={
                  "rounded px-2.5 py-1 text-xs font-medium " +
                  (dangO
                    ? "bg-ink text-white"
                    : daQua
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-ink-bg text-ink-soft")
                }
              >
                {s}
              </span>
              {i < PIPELINE.length - 1 && <span className="text-ink-line">›</span>}
            </li>
          );
        })}
      </ol>
      {nhanhPhu && (
        <p className="mt-3 rounded bg-rose-50 px-3 py-2 text-xs text-rose-800">
          Bài đang ở nhánh phụ: <strong>{getState(hienTai).ten}</strong> — {getState(hienTai).dienGiai}
        </p>
      )}
      <p className="mt-3 text-xs text-ink-soft">{getState(hienTai).dienGiai}</p>
    </div>
  );
}
