"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AnPham, Article, Comment, LoaiNoiDung, LogEntry, RoleId, StateId, TaiLieu, Version } from "./types";
import { taoDuLieuMau, taoNhatKyMau } from "./seed";
import { coQuyen, coTheDangBai, coTheGoTep, coTheTaiTepLen, getRole, getState, TRANSITIONS } from "./permissions";
import { kiemTraTep } from "./tep";
import { luuTep, xoaHetTep, xoaTep } from "./tepStore";

const KHOA_LUU = "cms-tntp-demo-v2";

function migratedRole(value: unknown): RoleId {
  if (value === "CTV") return "PV";
  if (value === "TRUONG_BAN") return "BTV";
  return typeof value === "string" && ["PV", "BTV", "TKTS", "HOA_SI", "TBT", "NHA_IN", "ADMIN"].includes(value)
    ? (value as RoleId)
    : "PV";
}

function legacyRoleName(value: unknown): string | undefined {
  if (value === "CTV") return "Trần Quốc Bảo";
  if (value === "TRUONG_BAN") return "Lê Văn Hùng";
  if (value === "KE_TOAN") return "Ngô Bích Liên";
  return undefined;
}

function migrateStoredData(parsed: Partial<LuuTru>): LuuTru {
  const bai = Array.isArray(parsed.bai) ? (parsed.bai as Article[]).map((b) => {
    const phienBan = (b.phienBan ?? []).map((v) => ({ ...v, tacGia: migratedRole(v.tacGia) }));
    if (phienBan.length === 0) {
      phienBan.push({
        id: `${b.id}-v1`,
        thoiDiem: b.taoLuc || b.vaoTrangThaiLuc || new Date().toISOString(),
        tacGia: "PV",
        tenNguoi: b.tacGia || getRole("PV").nguoiDung,
        ghiChu: "Khôi phục phiên bản từ dữ liệu demo cũ",
        soTuThayDoi: 0,
      });
    }
    return {
      ...b,
      phienBan,
      taiLieu: b.taiLieu ?? [],
      binhLuan: (b.binhLuan ?? []).map((c) => ({
        ...c,
        tacGia: migratedRole(c.tacGia),
        ganThe: c.ganThe ? migratedRole(c.ganThe) : null,
      })),
    };
  }) : taoDuLieuMau();
  const nhatKy = Array.isArray(parsed.nhatKy)
    ? (parsed.nhatKy as LogEntry[]).map((l) => ({
        ...l,
        tenNguoi: l.tenNguoi ?? legacyRoleName(l.vaiTro) ?? getRole(migratedRole(l.vaiTro)).nguoiDung,
        vaiTro: migratedRole(l.vaiTro),
      }))
    : [];
  return { bai, nhatKy, vaiTro: migratedRole(parsed.vaiTro), cheDoGiaiThich: parsed.cheDoGiaiThich ?? true };
}

interface LuuTru {
  bai: Article[];
  nhatKy: LogEntry[];
  vaiTro: RoleId;
  cheDoGiaiThich: boolean;
}

/** Nội dung một bài mới do người dùng nhập ở màn hình đăng bài. */
export interface NhapBai {
  tieuDe: string;
  sapo: string;
  doan: string[];
  chuyenMuc: string;
  anPham: AnPham;
  loai: LoaiNoiDung;
  /** Bước bài bắt đầu, phải nằm trong DIEM_VAO của vai trò đang đăng. */
  buoc: StateId;
}

/** `id` là null khi không đăng được. `loi` gồm cả tệp bị từ chối lẫn cảnh báo lưu tệp. */
export interface KetQuaDangBai {
  id: string | null;
  loi: string[];
}

export interface KetQuaTaiLen {
  soTep: number;
  loi: string[];
}

interface StoreValue extends LuuTru {
  daTai: boolean;
  datVaiTro: (v: RoleId) => void;
  batGiaiThich: (v: boolean) => void;
  chuyenTrangThai: (baiId: string, den: StateId, nhan: string, lyDo: string | null, kySo: boolean) => void;
  luuNoiDung: (baiId: string, doan: string[], tieuDe: string, sapo: string) => void;
  themBinhLuan: (baiId: string, noiDung: string, ganThe: RoleId | null, doanSo: number | null, laYeuCauSua?: boolean) => void;
  danhDauXuLy: (baiId: string, binhLuanId: string) => void;
  dangBai: (nhap: NhapBai, tep: File[]) => Promise<KetQuaDangBai>;
  themTaiLieu: (baiId: string, tep: File[], banBong?: boolean) => Promise<KetQuaTaiLen>;
  goTaiLieu: (baiId: string, tepId: string) => void;
  khoiPhucMau: () => void;
}

function taoId(tienTo: string): string {
  const ngauNhien =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return tienTo + "-" + Date.now().toString(36) + "-" + ngauNhien;
}

/**
 * Kiểm tra từng tệp rồi cất nội dung vào kho của trình duyệt. Tệp không hợp lệ bị bỏ và
 * ghi lý do vào `loi`; tệp hợp lệ nhưng không cất được vẫn được ghi nhận tên, kèm cảnh báo.
 */
async function xuLyTep(
  tep: File[],
  boiCanh: { vaiTro: RoleId; tenNguoi: string; buoc: StateId; banBong?: boolean }
): Promise<{ taiLieu: TaiLieu[]; loi: string[] }> {
  const taiLieu: TaiLieu[] = [];
  const loi: string[] = [];
  for (const f of tep) {
    const kt = kiemTraTep(f);
    if (!kt.ok) {
      loi.push(kt.lyDo);
      continue;
    }
    const id = taoId("tep");
    const luuDuoc = await luuTep(id, f);
    if (!luuDuoc) {
      loi.push(
        "“" + f.name + "”: trình duyệt không cho lưu nội dung tệp (có thể đang ở chế độ riêng tư hoặc hết chỗ), chỉ ghi nhận tên tệp."
      );
    }
    taiLieu.push({
      id,
      ten: f.name,
      loai: kt.loai,
      dungLuong: f.size,
      mime: f.type || "application/octet-stream",
      vaiTro: boiCanh.vaiTro,
      tenNguoi: boiCanh.tenNguoi,
      taiLuc: new Date().toISOString(),
      buoc: boiCanh.buoc,
      banBong: boiCanh.banBong ? true : undefined,
      coNoiDung: luuDuoc,
    });
  }
  return { taiLieu, loi };
}

const Store = createContext<StoreValue | null>(null);

function moi(): LuuTru {
  return { bai: taoDuLieuMau(), nhatKy: taoNhatKyMau(), vaiTro: "BTV", cheDoGiaiThich: true };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LuuTru>(() => moi());
  const [daTai, setDaTai] = useState(false);

  // Các hàm bất đồng bộ (cất tệp rồi mới ghi bài) cần biết vai trò và bài hiện tại
  // tại thời điểm bấm nút, không phải tại thời điểm hàm được tạo.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Đọc dữ liệu đã lưu sau khi mount, tránh lệch giữa máy chủ và trình duyệt.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KHOA_LUU);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<LuuTru>;
        if (parsed && Array.isArray(parsed.bai) && parsed.bai.length > 0) {
          setState(migrateStoredData(parsed));
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
        tenNguoi: getRole(vaiTro).nguoiDung,
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
          ghiChu:
            bai.trangThai === "S6"
              ? "Sửa khi chờ duyệt xuất bản — Họa sĩ cần kiểm tra lại dàn trang"
              : "Sửa trực tiếp trên hệ thống",
          soTuThayDoi: Math.abs(soTuMoi - soTuCu) + 1,
        snapshot: {
          tieuDe,
          sapo,
          doan,
        },
        };
        const phienBanCapNhat = bai.phienBan.map((p, idx) => {
          if (idx === bai.phienBan.length - 1 && !p.snapshot) {
            return { ...p, snapshot: { tieuDe: bai.tieuDe, sapo: bai.sapo, doan: bai.doan } };
          }
          return p;
        });
        const baiMoi = s.bai.map((b) =>
          b.id === baiId ? { ...b, doan, tieuDe, sapo, phienBan: [...phienBanCapNhat, pb] } : b
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

  const dangBai = useCallback(
    async (nhap: NhapBai, tep: File[]): Promise<KetQuaDangBai> => {
      const { vaiTro } = stateRef.current;
      if (!coTheDangBai(vaiTro, nhap.buoc)) {
        return {
          id: null,
          loi: ["Vai trò " + getRole(vaiTro).ten + " không đăng được bài vào " + getState(nhap.buoc).ten + "."],
        };
      }
      const tieuDe = nhap.tieuDe.trim();
      if (!tieuDe) return { id: null, loi: ["Bài chưa có tiêu đề."] };

      const tenNguoi = getRole(vaiTro).nguoiDung;
      const baiId = taoId("bai");
      const { taiLieu, loi } = await xuLyTep(tep, { vaiTro, tenNguoi, buoc: nhap.buoc });

      setState((s) => {
        const soLonNhat = s.bai.reduce((max, b) => {
          const m = /(\d+)$/.exec(b.maBai);
          return m ? Math.max(max, parseInt(m[1], 10)) : max;
        }, 0);
        const maBai = "TNTP-" + String(soLonNhat + 1).padStart(4, "0");
        const bayGio = new Date().toISOString();
        const sapo = nhap.sapo.trim();
        const soTu = [sapo, ...nhap.doan].join(" ").split(/\s+/).filter(Boolean).length;

        const v1: Version = {
          id: baiId + "-v1",
          thoiDiem: bayGio,
          tacGia: vaiTro,
          tenNguoi,
          ghiChu: "Bản đăng đầu tiên",
          soTuThayDoi: soTu,
          snapshot: { tieuDe, sapo, doan: nhap.doan },
        };
        const baiMoi: Article = {
          id: baiId,
          maBai,
          tieuDe,
          sapo,
          doan: nhap.doan,
          chuyenMuc: nhap.chuyenMuc,
          anPham: nhap.anPham,
          loai: nhap.loai,
          tacGia: tenNguoi,
          trangThai: nhap.buoc,
          vaoTrangThaiLuc: bayGio,
          taoLuc: bayGio,
          phienBan: [v1],
          binhLuan: [],
          fileBanBong: null,
          daKySo: false,
          lyDoGanNhat: null,
          taiLieu,
        };
        const chiTiet =
          "Đăng bài vào " +
          getState(nhap.buoc).ten +
          (taiLieu.length > 0 ? ", kèm " + taiLieu.length + " tệp: " + taiLieu.map((t) => t.ten).join(", ") : "");
        return {
          ...s,
          bai: [baiMoi, ...s.bai],
          nhatKy: ghiNhatKy(s.nhatKy, vaiTro, "Đăng bài", baiId, chiTiet, { den: nhap.buoc, phienBan: v1.id }),
        };
      });
      return { id: baiId, loi };
    },
    [ghiNhatKy]
  );

  const themTaiLieu = useCallback(
    async (baiId: string, tep: File[], banBong = false): Promise<KetQuaTaiLen> => {
      const { vaiTro, bai } = stateRef.current;
      const b = bai.find((x) => x.id === baiId);
      if (!b) return { soTep: 0, loi: ["Không tìm thấy bài."] };
      const duocPhep = banBong ? coQuyen(vaiTro, b.trangThai, "L") : coTheTaiTepLen(vaiTro, b.trangThai);
      if (!duocPhep) {
        return {
          soTep: 0,
          loi: ["Vai trò " + getRole(vaiTro).ten + " không được tải tệp lên ở " + getState(b.trangThai).ten + "."],
        };
      }

      const tenNguoi = getRole(vaiTro).nguoiDung;
      // Bản bông luôn là một tệp: tệp mới thay cho tệp đang hiện, các bản cũ vẫn nằm trong hồ sơ.
      const { taiLieu, loi } = await xuLyTep(banBong ? tep.slice(0, 1) : tep, {
        vaiTro,
        tenNguoi,
        buoc: b.trangThai,
        banBong,
      });
      if (taiLieu.length === 0) return { soTep: 0, loi };

      setState((s) => {
        if (!s.bai.some((x) => x.id === baiId)) return s;
        const ten = taiLieu.map((t) => t.ten).join(", ");
        return {
          ...s,
          bai: s.bai.map((x) =>
            x.id === baiId
              ? {
                  ...x,
                  taiLieu: [...x.taiLieu, ...taiLieu],
                  fileBanBong: banBong ? taiLieu[0].ten : x.fileBanBong,
                }
              : x
          ),
          nhatKy: ghiNhatKy(
            s.nhatKy,
            vaiTro,
            banBong ? "Tải lên bản bông" : "Tải lên tài liệu",
            baiId,
            banBong ? "Thêm tệp bản bông " + ten : "Thêm " + taiLieu.length + " tệp: " + ten
          ),
        };
      });
      return { soTep: taiLieu.length, loi };
    },
    [ghiNhatKy]
  );

  const goTaiLieu = useCallback(
    (baiId: string, tepId: string) => {
      const { vaiTro, bai } = stateRef.current;
      const b = bai.find((x) => x.id === baiId);
      const t = b?.taiLieu.find((x) => x.id === tepId);
      if (!b || !t || !coTheGoTep(vaiTro, b.trangThai, t)) return;
      void xoaTep(t.id);
      setState((s) => ({
        ...s,
        bai: s.bai.map((x) => (x.id === baiId ? { ...x, taiLieu: x.taiLieu.filter((y) => y.id !== tepId) } : x)),
        nhatKy: ghiNhatKy(s.nhatKy, vaiTro, "Gỡ tài liệu", baiId, "Gỡ tệp " + t.ten),
      }));
    },
    [ghiNhatKy]
  );

  const khoiPhucMau = useCallback(() => {
    void xoaHetTep();
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
      dangBai,
      themTaiLieu,
      goTaiLieu,
      khoiPhucMau,
    }),
    [
      state,
      daTai,
      datVaiTro,
      batGiaiThich,
      chuyenTrangThai,
      luuNoiDung,
      themBinhLuan,
      danhDauXuLy,
      dangBai,
      themTaiLieu,
      goTaiLieu,
      khoiPhucMau,
    ]
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
