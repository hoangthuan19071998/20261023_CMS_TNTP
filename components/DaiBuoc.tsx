"use client";

// Dải bước ngang đặt ngay dưới tiêu đề bài: nhìn một cái là biết bài đang đứng ở
// đâu trong chín bước, đã qua mấy bước và còn mấy bước nữa mới xuất bản.

import { PIPELINE, getRole, getState } from "@/lib/permissions";
import { vaiTroGiuBai } from "@/lib/store";
import type { StateId } from "@/lib/types";

function tenNgan(id: StateId): string {
  const ten = getState(id).ten;
  const i = ten.indexOf("—");
  return i >= 0 ? ten.slice(i + 1).trim() : ten;
}

export default function DaiBuoc({ hienTai }: { hienTai: StateId }) {
  const viTri = PIPELINE.indexOf(hienTai);
  const nhanhPhu = getState(hienTai).nhanhPhu;

  return (
    <div className="the overflow-x-auto p-4">
      {nhanhPhu && (
        <p className="mb-3 rounded bg-rose-50 px-3 py-2 text-xs text-rose-800">
          Bài đang ở nhánh phụ <strong>{getState(hienTai).ten}</strong>, nằm ngoài chín bước chính.
        </p>
      )}
      <ol className="flex min-w-[720px] items-start">
        {PIPELINE.map((s, i) => {
          const daQua = viTri >= 0 && i < viTri;
          const dangO = s === hienTai;
          const giu = vaiTroGiuBai(s).map((v) => getRole(v).vietTat).join(" / ");
          return (
            <li key={s} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <span
                  className={
                    "h-0.5 flex-1 " + (i === 0 ? "bg-transparent" : daQua || dangO ? "bg-emerald-500" : "bg-ink-line")
                  }
                />
                <span
                  title={getState(s).dienGiai}
                  className={
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                    (dangO
                      ? "bg-ink text-white ring-4 ring-amber-200"
                      : daQua
                        ? "bg-emerald-500 text-white"
                        : "border border-ink-line bg-white text-ink-soft")
                  }
                >
                  {daQua ? "✓" : i}
                </span>
                <span
                  className={
                    "h-0.5 flex-1 " +
                    (i === PIPELINE.length - 1 ? "bg-transparent" : daQua ? "bg-emerald-500" : "bg-ink-line")
                  }
                />
              </div>
              <span
                className={
                  "mt-1.5 px-1 text-center text-[11px] leading-tight " +
                  (dangO ? "font-semibold text-ink" : daQua ? "text-emerald-800" : "text-ink-soft")
                }
              >
                {tenNgan(s)}
              </span>
              <span className="mt-0.5 text-[10px] leading-tight text-ink-line">{giu}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
