"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { STATES, getPermission, getRole } from "@/lib/permissions";
import { dinhDangGio, quaHan, useStore, vaiTroGiuBai } from "@/lib/store";
import type { Article, StateId } from "@/lib/types";
import { NhanAnPham, NhanTrangThai, TheQuyen } from "./Bieutuong";

interface Props {
  tieuDe: string;
  loc?: (b: Article) => boolean;
  moTaTrong?: string;
  hienBoLoc?: boolean;
}

export default function DanhSachBai({ tieuDe, loc, moTaTrong, hienBoLoc = false }: Props) {
  const { bai, vaiTro } = useStore();
  const [locTrangThai, setLocTrangThai] = useState<StateId | "tat_ca">("tat_ca");
  const [locChuyenMuc, setLocChuyenMuc] = useState<string>("tat_ca");
  const [bayGio, setBayGio] = useState<number | null>(null);

  // Tính giờ sau khi mount để máy chủ và trình duyệt không dựng lệch nhau.
  useEffect(() => {
    setBayGio(Date.now());
  }, []);

  const chuyenMucs = useMemo(
    () => Array.from(new Set(bai.map((b) => b.chuyenMuc))).sort(),
    [bai]
  );

  const danhSach = useMemo(() => {
    return bai
      .filter((b) => getPermission(vaiTro, b.trangThai).thayBai)
      .filter((b) => (loc ? loc(b) : true))
      .filter((b) => (locTrangThai === "tat_ca" ? true : b.trangThai === locTrangThai))
      .filter((b) => (locChuyenMuc === "tat_ca" ? true : b.chuyenMuc === locChuyenMuc));
  }, [bai, vaiTro, loc, locTrangThai, locChuyenMuc]);

  return (
    <section className="the overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-ink-line px-4 py-3">
        <h2 className="text-sm font-semibold">{tieuDe}</h2>
        <span className="nhan bg-ink-bg text-ink-soft">{danhSach.length} bài</span>

        {hienBoLoc && (
          <div className="ml-auto flex flex-wrap gap-2">
            <select
              value={locTrangThai}
              onChange={(e) => setLocTrangThai(e.target.value as StateId | "tat_ca")}
              className="rounded border border-ink-line bg-white px-2 py-1 text-sm"
              aria-label="Lọc theo trạng thái"
            >
              <option value="tat_ca">Mọi trạng thái</option>
              {STATES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ten}
                </option>
              ))}
            </select>
            <select
              value={locChuyenMuc}
              onChange={(e) => setLocChuyenMuc(e.target.value)}
              className="rounded border border-ink-line bg-white px-2 py-1 text-sm"
              aria-label="Lọc theo chuyên mục"
            >
              <option value="tat_ca">Mọi chuyên mục</option>
              {chuyenMucs.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {danhSach.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-ink-soft">
          {moTaTrong ?? "Không có bài nào mà vai trò này nhìn thấy ở bộ lọc hiện tại."}
        </p>
      ) : (
        <ul className="divide-y divide-ink-line">
          {danhSach.map((b) => {
            const nguoiGiu = vaiTroGiuBai(b.trangThai);
            const tinhHan = bayGio === null ? null : quaHan(b, bayGio);
            const toiDangGiu = nguoiGiu.includes(vaiTro);
            return (
              <li key={b.id} className="px-4 py-3 hover:bg-ink-bg/60">
                <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                  <div className="min-w-0 flex-1">
                    <Link href={"/bai-viet/" + b.id} className="block">
                      <span className="font-mono text-xs text-ink-soft">{b.maBai}</span>
                      <h3 className="truncate font-medium hover:underline">{b.tieuDe}</h3>
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <NhanTrangThai trangThai={b.trangThai} />
                      <NhanAnPham anPham={b.anPham} />
                      <span className="nhan bg-ink-bg text-ink-soft">{b.chuyenMuc}</span>
                      <span className="text-xs text-ink-soft">{b.tacGia}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 text-right">
                    <TheQuyen vaiTro={vaiTro} trangThai={b.trangThai} />
                    <span className="text-xs text-ink-soft">
                      {nguoiGiu.length > 0
                        ? "Đang ở: " + nguoiGiu.map((r) => getRole(r).ten).join(" / ")
                        : "Không ai phải xử lý"}
                    </span>
                    {tinhHan && tinhHan.slaGio !== null && (
                      <span
                        className={
                          "nhan " +
                          (tinhHan.quaHan ? "bg-rose-100 text-rose-800" : "bg-emerald-50 text-emerald-800")
                        }
                        title={"Hạn xử lý của trạng thái này là " + tinhHan.slaGio + " giờ"}
                      >
                        {tinhHan.quaHan ? "Quá hạn " : "Đã chờ "}
                        {dinhDangGio(tinhHan.gio)}
                      </span>
                    )}
                    {toiDangGiu && (
                      <span className="nhan bg-amber-200 text-amber-950">Bạn đang giữ bài này</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
