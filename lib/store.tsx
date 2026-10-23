"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Article, Comment, LogEntry, RoleId, StateId, Version } from "./types";
import { taoDuLieuMau, taoNhatKyMau } from "./seed";
import { getRole, getState, TRANSITIONS } from "./permissions";

const KHOA_LUU = "cms-tntp-demo-v1";

interface LuuTru {
  bai: Article[];
  nhatKy: LogEntry[];
  vaiTro: RoleId;
  cheDoGiaiThich: boolean;
}

interface StoreValue extends LuuTru {
  daTai: boolean;
  datVaiTro: (v: RoleId) => void;
  batGiaiThich: (v: boolean) => void;
  chuyenTrangThai: (baiId: string, den: StateId, nhan: string, lyDo: string | null, kySo: boolean) => void;
  luuNoiDung: (baiId: string, doan: string[], tieuDe: string, sapo: string) => void;
  themBinhLuan: (baiId: string, noiDung: string, ganThe: RoleId | null, doanSo: number | null, laYeuCauSua?: boolean) => void;
  danhDauXuLy: (baiId: string, binhLuanId: string) => void;
  taiLenBanBong: (baiId: string, tenFile: string) => void;
  khoiPhucMau: () => void;
}

const Store = createContext<StoreValue | null>(null);

function moi(): LuuTru {
  return { bai: taoDuLieuMau(), nhatKy: taoNhatKyMau(), vaiTro: "BTV", cheDoGiaiThich: true };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LuuTru>(() => moi());
  const [daTai, setDaTai] = useState(false);

  // Đọc dữ liệu đã lưu sau khi mount, tránh lệch giữa máy chủ và trình duyệt.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KHOA_LUU);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<LuuTru>;
        if (parsed && Array.isArray(parsed.bai) && parsed.bai.length > 0) {
          setState({
            bai: parsed.bai as Article[],
            nhatKy: (parsed.nhatKy as LogEntry[]) ?? [],
            vaiTro: (parsed.vaiTro as RoleId) ?? "BTV",
            cheDoGiaiThich: parsed.cheDoGiaiThich ?? true,
          });
        }
      }
    } catch {
      // Trình duyệt chặn localStorage thì vẫn chạy được với dữ liệu mẫu.
    }
    setDaTai(true);
  }, []);

  useEffect(() => {
    if (!daTai) return;
    try {
      window.localStorage.setItem(KHOA_LUU, JSON.stringify(state));
    } catch {
      // Bỏ qua: bản demo không phụ thuộc vào việc lưu được.
    }
  }, [state, daTai]);

  const ghiNhatKy = useCallback(
    (
      nhatKy: LogEntry[],
      vaiTro: RoleId,
      hanhDong: string,
      baiId: string | null,
      chiTiet: string,
      them?: Partial<Pick<LogEntry, "tu" | "den" | "ghiChu" | "phienBan">>
    ): LogEntry[] => {
      const entry: LogEntry = {
        id: "log-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
        thoiDiem: new Date().toISOString(),
        vaiTro,
        hanhDong,
        baiId,
        chiTiet,
        ...them,
      };
      return [entry, ...nhatKy];
    },
    []
  );

  const datVaiTro = useCallback((v: RoleId) => setState((s) => ({ ...s, vaiTro: v })), []);
  const batGiaiThich = useCallback((v: boolean) => setState((s) => ({ ...s, cheDoGiaiThich: v })), []);

  const chuyenTrangThai = useCallback(
    (baiId: string, den: StateId, nhan: string, lyDo: string | null, kySo: boolean) => {
      setState((s) => {
        const bai = s.bai.find((b) => b.id === baiId);
        if (!bai) return s;
        const tu = bai.trangThai;
        const bayGio = new Date().toISOString();
        const baiMoi = s.bai.map((b) =>
          b.id === baiId
            ? {
                ...b,
                trangThai: den,
                vaoTrangThaiLuc: bayGio,
                lyDoGanNhat: lyDo,
                daKySo: kySo ? true : b.daKySo,
              }
            : b
        );
        const chiTiet =
          "Chuyển " + tu + " → " + den + (lyDo ? ', lý do: "' + lyDo + '"' : "") + (kySo ? " — có ký số" : "");
        return {
          ...s,
          bai: baiMoi,
          nhatKy: ghiNhatKy(s.nhatKy, s.vaiTro, nhan, baiId, chiTiet, { tu, den, ghiChu: lyDo }),
        };
      });
    },
    [ghiNhatKy]
  );

  const luuNoiDung = useCallback(
    (baiId: string, doan: string[], tieuDe: string, sapo: string) => {
      setState((s) => {
        const bai = s.bai.find((b) => b.id === baiId);
        if (!bai) return s;
        const soTuCu = bai.doan.join(" ").split(/\s+/).length;
        const soTuMoi = doan.join(" ").split(/\s+/).length;
        const pb: Version = {
          id: baiId + "-v" + (bai.phienBan.length + 1),
          thoiDiem: new Date().toISOString(),
          tacGia: s.vaiTro,
          tenNguoi: getRole(s.vaiTro).nguoiDung,
          ghiChu: "Sửa trực tiếp trên hệ thống",
          soTuThayDoi: Math.abs(soTuMoi - soTuCu) + 1,
        };
        const baiMoi = s.bai.map((b) =>
          b.id === baiId ? { ...b, doan, tieuDe, sapo, phienBan: [...b.phienBan, pb] } : b
        );
        return {
          ...s,
          bai: baiMoi,
          nhatKy: ghiNhatKy(s.nhatKy, s.vaiTro, "Sửa nội dung", baiId, "Cập nhật nội dung bài viết", {
            phienBan: pb.id,
          }),
        };
      });
    },
    [ghiNhatKy]
  );

  const themBinhLuan = useCallback(
    (baiId: string, noiDung: string, ganThe: RoleId | null, doanSo: number | null, laYeuCauSua?: boolean) => {
      setState((s) => {
        const bai = s.bai.find((b) => b.id === baiId);
        if (!bai) return s;
        const c: Comment = {
          id: baiId + "-c" + Date.now(),
          thoiDiem: new Date().toISOString(),
          tacGia: s.vaiTro,
          tenNguoi: getRole(s.vaiTro).nguoiDung,
          noiDung,
          ganThe,
          doanSo,
          daXuLy: false,
          laYeuCauSua,
        };
        const baiMoi = s.bai.map((b) => (b.id === baiId ? { ...b, binhLuan: [...b.binhLuan, c] } : b));
        return {
          ...s,
          bai: baiMoi,
          nhatKy: ghiNhatKy(
            s.nhatKy,
            s.vaiTro,
            laYeuCauSua ? "Tạo yêu cầu sửa" : "Bình luận nội bộ",
            baiId,
            (laYeuCauSua ? "Yêu cầu sửa: " : "Ghi chú: ") + '"' + noiDung + '"',
            { ghiChu: noiDung }
          ),
        };
      });
    },
    [ghiNhatKy]
  );

  const danhDauXuLy = useCallback((baiId: string, binhLuanId: string) => {
    setState((s) => ({
      ...s,
      bai: s.bai.map((b) =>
        b.id === baiId
          ? { ...b, binhLuan: b.binhLuan.map((c) => (c.id === binhLuanId ? { ...c, daXuLy: true } : c)) }
          : b
      ),
    }));
  }, []);

  const taiLenBanBong = useCallback(
    (baiId: string, tenFile: string) => {
      setState((s) => {
        const bai = s.bai.find((b) => b.id === baiId);
        if (!bai) return s;
        return {
          ...s,
          bai: s.bai.map((b) => (b.id === baiId ? { ...b, fileBanBong: tenFile } : b)),
          nhatKy: ghiNhatKy(s.nhatKy, s.vaiTro, "Tải lên bản bông", baiId, "Thêm tệp đính kèm " + tenFile),
        };
      });
    },
    [ghiNhatKy]
  );

  const khoiPhucMau = useCallback(() => {
    const m = moi();
    setState((s) => ({ ...m, vaiTro: s.vaiTro, cheDoGiaiThich: s.cheDoGiaiThich }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      daTai,
      datVaiTro,
      batGiaiThich,
      chuyenTrangThai,
      luuNoiDung,
      themBinhLuan,
      danhDauXuLy,
      taiLenBanBong,
      khoiPhucMau,
    }),
    [state, daTai, datVaiTro, batGiaiThich, chuyenTrangThai, luuNoiDung, themBinhLuan, danhDauXuLy, taiLenBanBong, khoiPhucMau]
  );

  return <Store.Provider value={value}>{children}</Store.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(Store);
  if (!ctx) throw new Error("useStore phải nằm trong StoreProvider");
  return ctx;
}

// --- Tiện ích dùng chung --------------------------------------------------

export function quaHan(bai: Article, bayGio: number): { quaHan: boolean; gio: number; slaGio: number | null } {
  const st = getState(bai.trangThai);
  const gio = (bayGio - new Date(bai.vaoTrangThaiLuc).getTime()) / 3600000;
  if (st.slaGio === null) return { quaHan: false, gio, slaGio: null };
  return { quaHan: gio > st.slaGio, gio, slaGio: st.slaGio };
}

export function dinhDangGio(gio: number): string {
  if (gio < 1) return Math.max(1, Math.round(gio * 60)) + " phút";
  if (gio < 48) return Math.round(gio) + " giờ";
  return Math.round(gio / 24) + " ngày";
}

export function dinhDangThoiDiem(iso: string): string {
  const d = new Date(iso);
  const hai = (n: number) => String(n).padStart(2, "0");
  return hai(d.getDate()) + "/" + hai(d.getMonth() + 1) + " " + hai(d.getHours()) + ":" + hai(d.getMinutes());
}

/** Vai trò nào đang giữ bài ở trạng thái của bài đó. */
export function vaiTroGiuBai(trangThai: StateId): RoleId[] {
  const ds = TRANSITIONS.filter((t) => t.tu === trangThai && t.kieu === "tien");
  const r = new Set<RoleId>();
  ds.forEach((t) => t.vaiTro.forEach((v) => r.add(v)));
  return Array.from(r);
}
