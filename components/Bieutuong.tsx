"use client";

import { CAP_LABEL, getPermission, getState } from "@/lib/permissions";
import type { RoleId, StateId } from "@/lib/types";

const MAU_TRANG_THAI: Record<string, string> = {
  S0: "bg-slate-100 text-slate-700",
  S1: "bg-sky-100 text-sky-800",
  S2: "bg-blue-100 text-blue-800",
  S3: "bg-indigo-100 text-indigo-800",
  S4: "bg-violet-100 text-violet-800",
  S5: "bg-fuchsia-100 text-fuchsia-800",
  S6: "bg-amber-100 text-amber-900",
  S7: "bg-emerald-100 text-emerald-800",
  S8: "bg-stone-200 text-stone-700",
  DINH_CHINH: "bg-rose-100 text-rose-800",
  LOAI_BO: "bg-gray-200 text-gray-600",
};

export function NhanTrangThai({ trangThai }: { trangThai: StateId }) {
  const st = getState(trangThai);
  return (
    <span className={"nhan " + (MAU_TRANG_THAI[trangThai] ?? "bg-gray-100 text-gray-700")} title={st.dienGiai}>
      {st.ten}
    </span>
  );
}

/** Hiển thị đúng mã trong ma trận, ví dụ "◆ E C A", kèm chú giải từng ký hiệu. */
export function TheQuyen({ vaiTro, trangThai }: { vaiTro: RoleId; trangThai: StateId }) {
  const q = getPermission(vaiTro, trangThai);
  const chuGiai = q.caps.map((c) => c + " = " + CAP_LABEL[c]).join(" · ");
  const title = q.dangGiuBai ? "◆ = đang giữ bài. " + chuGiai : chuGiai || "Không nhìn thấy bài ở trạng thái này";

  return (
    <span
      title={title}
      className={
        "nhan font-mono " +
        (q.dangGiuBai
          ? "bg-amber-200 text-amber-950"
          : q.thayBai
            ? "bg-ink-bg text-ink-soft"
            : "bg-gray-100 text-gray-400")
      }
    >
      {q.ma}
    </span>
  );
}

export function NhanAnPham({ anPham }: { anPham: "bao_in" | "bao_dien_tu" | "ca_hai" }) {
  const nhan = anPham === "bao_in" ? "Báo in" : anPham === "bao_dien_tu" ? "Báo điện tử" : "In + Điện tử";
  return <span className="nhan border border-ink-line bg-white text-ink-soft">{nhan}</span>;
}

export function HopGiaiThich({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-amber-300 bg-amber-50/70 px-3 py-2 text-xs leading-relaxed text-amber-900">
      {children}
    </div>
  );
}
