"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Article, LogEntry, RoleId, StateId } from "./types";
import { getState, TRANSITIONS } from "./permissions";
import { articlesApi, authApi, commentsApi, logsApi, ROLE_USERNAMES } from "./api/services";

const KHOA_VAI_TRO = "cms-tntp-vaitro";
const KHOA_GIAI_THICH = "cms-tntp-giaithich";

interface StoreValue {
  bai: Article[];
  nhatKy: LogEntry[];
  vaiTro: RoleId;
  cheDoGiaiThich: boolean;
  daTai: boolean;
  dangTaiDuLieu: boolean;
  datVaiTro: (v: RoleId) => void;
  batGiaiThich: (v: boolean) => void;
  chuyenTrangThai: (baiId: string, den: StateId, nhan: string, lyDo: string | null, kySo: boolean) => Promise<void>;
  luuNoiDung: (baiId: string, doan: string[], tieuDe: string, sapo: string) => Promise<void>;
  themBinhLuan: (baiId: string, noiDung: string, ganThe: RoleId | null, doanSo: number | null, laYeuCauSua?: boolean) => Promise<void>;
  danhDauXuLy: (baiId: string, binhLuanId: string) => Promise<void>;
  taiLenBanBong: (baiId: string, tenFile: string) => Promise<void>;
  khoiPhucMau: () => Promise<void>;
}

const Store = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [vaiTro, setVaiTroState] = useState<RoleId>("BTV");
  const [cheDoGiaiThich, setCheDoGiaiThich] = useState<boolean>(true);
  const [daKhoiTao, setDaKhoiTao] = useState<boolean>(false);

  // Khôi phục tùy chọn vai trò và cờ giải thích từ storage lúc mount
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(KHOA_VAI_TRO) as RoleId;
      if (v && ["PV", "BTV", "TKTS", "HOA_SI", "TBT", "NHA_IN", "ADMIN"].includes(v)) {
        setVaiTroState(v);
      }
      const gt = window.localStorage.getItem(KHOA_GIAI_THICH);
      if (gt !== null) {
        setCheDoGiaiThich(gt === "true");
      }
    } catch {
      // Bỏ qua lỗi truy cập storage
    }
  }, []);

  // Tự động đăng nhập session backend theo vai trò
  const dongBoPhien = useCallback(async (targetRole: RoleId) => {
    try {
      const username = ROLE_USERNAMES[targetRole] || "btv";
      await authApi.login(username, "123456");
    } catch (err) {
      console.warn("Lỗi đồng bộ phiên đăng nhập vai trò:", err);
    }
  }, []);

  // Khi khởi động hoặc khi vai trò thay đổi, đăng nhập session tương ứng và invalidate query
  useEffect(() => {
    let active = true;
    dongBoPhien(vaiTro).then(() => {
      if (active) {
        setDaKhoiTao(true);
        queryClient.invalidateQueries({ queryKey: ["articles"] });
        queryClient.invalidateQueries({ queryKey: ["logs"] });
        queryClient.invalidateQueries({ queryKey: ["article"] });
      }
    });
    return () => {
      active = false;
    };
  }, [vaiTro, dongBoPhien, queryClient]);

  const datVaiTro = useCallback(
    (v: RoleId) => {
      setVaiTroState(v);
      try {
        window.localStorage.setItem(KHOA_VAI_TRO, v);
      } catch {
        // Bỏ qua
      }
    },
    []
  );

  const batGiaiThich = useCallback((v: boolean) => {
    setCheDoGiaiThich(v);
    try {
      window.localStorage.setItem(KHOA_GIAI_THICH, String(v));
    } catch {
      // Bỏ qua
    }
  }, []);

  // Query: Lấy danh sách bài viết từ backend theo vai trò
  const { data: bai = [], isLoading: dangTaiBai } = useQuery({
    queryKey: ["articles", vaiTro],
    queryFn: () => articlesApi.getAll(),
    enabled: daKhoiTao,
  });

  // Query: Lấy danh sách nhật ký nếu có quyền xem
  const duocXemNhatKy = ["ADMIN", "TBT", "TKTS"].includes(vaiTro);
  const { data: logsData, isLoading: dangTaiLog } = useQuery({
    queryKey: ["logs", vaiTro],
    queryFn: () => logsApi.getAll(1, 100),
    enabled: daKhoiTao && duocXemNhatKy,
  });
  const nhatKy = useMemo(() => logsData?.data ?? [], [logsData]);

  // Mutations
  const transitionMutation = useMutation({
    mutationFn: ({
      baiId,
      den,
      lyDo,
      kySo,
    }: {
      baiId: string;
      den: StateId;
      lyDo: string | null;
      kySo: boolean;
    }) => articlesApi.transition(baiId, { den, lyDo, kySo }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", vars.baiId] });
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      baiId,
      doan,
      tieuDe,
      sapo,
    }: {
      baiId: string;
      doan: string[];
      tieuDe: string;
      sapo: string;
    }) => articlesApi.update(baiId, { doan, tieuDe, sapo }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", vars.baiId] });
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({
      baiId,
      noiDung,
      ganThe,
      doanSo,
      laYeuCauSua,
    }: {
      baiId: string;
      noiDung: string;
      ganThe: RoleId | null;
      doanSo: number | null;
      laYeuCauSua?: boolean;
    }) => commentsApi.create(baiId, { noiDung, ganThe, doanSo, laYeuCauSua }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", vars.baiId] });
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });

  const resolveCommentMutation = useMutation({
    mutationFn: ({ commentId }: { baiId: string; commentId: string }) =>
      commentsApi.resolve(commentId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", vars.baiId] });
    },
  });

  const uploadBanBongMutation = useMutation({
    mutationFn: ({ baiId, tenFile }: { baiId: string; tenFile: string }) =>
      articlesApi.uploadBanBong(baiId, tenFile),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", vars.baiId] });
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });

  const resetDemoMutation = useMutation({
    mutationFn: () => articlesApi.resetDemo(),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  // Action wrappers khớp giao diện cũ
  const chuyenTrangThai = useCallback(
    async (baiId: string, den: StateId, _nhan: string, lyDo: string | null, kySo: boolean) => {
      await transitionMutation.mutateAsync({ baiId, den, lyDo, kySo });
    },
    [transitionMutation]
  );

  const luuNoiDung = useCallback(
    async (baiId: string, doan: string[], tieuDe: string, sapo: string) => {
      await updateMutation.mutateAsync({ baiId, doan, tieuDe, sapo });
    },
    [updateMutation]
  );

  const themBinhLuan = useCallback(
    async (
      baiId: string,
      noiDung: string,
      ganThe: RoleId | null,
      doanSo: number | null,
      laYeuCauSua?: boolean
    ) => {
      await addCommentMutation.mutateAsync({ baiId, noiDung, ganThe, doanSo, laYeuCauSua });
    },
    [addCommentMutation]
  );

  const danhDauXuLy = useCallback(
    async (baiId: string, binhLuanId: string) => {
      await resolveCommentMutation.mutateAsync({ baiId, commentId: binhLuanId });
    },
    [resolveCommentMutation]
  );

  const taiLenBanBong = useCallback(
    async (baiId: string, tenFile: string) => {
      await uploadBanBongMutation.mutateAsync({ baiId, tenFile });
    },
    [uploadBanBongMutation]
  );

  const khoiPhucMau = useCallback(async () => {
    await resetDemoMutation.mutateAsync();
  }, [resetDemoMutation]);

  const value = useMemo<StoreValue>(
    () => ({
      bai,
      nhatKy,
      vaiTro,
      cheDoGiaiThich,
      daTai: daKhoiTao,
      dangTaiDuLieu: dangTaiBai || dangTaiLog,
      datVaiTro,
      batGiaiThich,
      chuyenTrangThai,
      luuNoiDung,
      themBinhLuan,
      danhDauXuLy,
      taiLenBanBong,
      khoiPhucMau,
    }),
    [
      bai,
      nhatKy,
      vaiTro,
      cheDoGiaiThich,
      daKhoiTao,
      dangTaiBai,
      dangTaiLog,
      datVaiTro,
      batGiaiThich,
      chuyenTrangThai,
      luuNoiDung,
      themBinhLuan,
      danhDauXuLy,
      taiLenBanBong,
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

// Hook hỗ trợ tải chi tiết bài viết qua TanStack Query
export function useArticleQuery(baiId: string) {
  return useQuery({
    queryKey: ["article", baiId],
    queryFn: () => articlesApi.getOne(baiId),
    enabled: !!baiId,
  });
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
