import { isAxiosError } from "axios";
import { apiClient } from "./client";
import type { AnPham, Article, Comment, LoaiNoiDung, LogEntry, RoleId, StateId, TaiLieu } from "@/lib/types";

/** Lấy câu báo lỗi từ phản hồi của máy chủ (NestJS trả `message` dạng chuỗi hoặc mảng). */
export function thongBaoLoi(err: unknown, macDinh = "Máy chủ không xử lý được yêu cầu."): string {
  if (isAxiosError(err)) {
    const m = (err.response?.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(m)) return m.join(" ");
    if (m) return m;
    if (!err.response) return "Không kết nối được máy chủ.";
  }
  return macDinh;
}

export const ROLE_USERNAMES: Record<RoleId, string> = {
  PV: "pv",
  BTV: "btv",
  TKTS: "tkts",
  HOA_SI: "hoasi",
  TBT: "tbt",
  NHA_IN: "nhain",
  ADMIN: "admin",
};

export interface CurrentUserResponse {
  id: string;
  username: string;
  hoTen: string;
  vaiTro: RoleId;
}

export const authApi = {
  async login(username: string, password = "123456"): Promise<CurrentUserResponse> {
    const res = await apiClient.post<{ message: string; user: CurrentUserResponse }>("/auth/login", {
      username,
      password,
    });
    return res.data.user;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async getMe(): Promise<CurrentUserResponse> {
    const res = await apiClient.get<CurrentUserResponse>("/auth/me");
    return res.data;
  },
};

export const articlesApi = {
  async getAll(params?: { trangThai?: StateId; chuyenMuc?: string }): Promise<Article[]> {
    const res = await apiClient.get<Article[]>("/articles", { params });
    return res.data;
  },

  async getOne(id: string): Promise<Article> {
    const res = await apiClient.get<Article>(`/articles/${id}`);
    return res.data;
  },

  async create(data: {
    tieuDe: string;
    sapo: string;
    doan: string[];
    chuyenMuc: string;
    anPham: AnPham;
    loai: LoaiNoiDung;
    buoc: StateId;
  }): Promise<Article> {
    const res = await apiClient.post<Article>("/articles", data);
    return res.data;
  },

  async update(
    id: string,
    data: { tieuDe?: string; sapo?: string; doan?: string[] }
  ): Promise<Article> {
    const res = await apiClient.patch<Article>(`/articles/${id}`, data);
    return res.data;
  },

  async transition(
    id: string,
    data: { den: StateId; lyDo?: string | null; kySo?: boolean }
  ): Promise<Article> {
    const res = await apiClient.post<Article>(`/articles/${id}/transition`, data);
    return res.data;
  },

};

export const taiLieuApi = {
  async taiLen(articleId: string, tep: File[], banBong = false): Promise<{ taiLieu: TaiLieu[]; loi: string[] }> {
    const form = new FormData();
    tep.forEach((f) => form.append("tep", f));
    // Phải ghi đè Content-Type JSON mặc định, nếu không axios đổi FormData thành JSON.
    const res = await apiClient.post<{ taiLieu: TaiLieu[]; loi: string[] }>(`/articles/${articleId}/tai-lieu`, form, {
      params: banBong ? { banBong: "true" } : undefined,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async layNoiDung(id: string): Promise<Blob> {
    const res = await apiClient.get<Blob>(`/tai-lieu/${id}/noi-dung`, { responseType: "blob" });
    return res.data;
  },
};

export const commentsApi = {
  async getByArticle(articleId: string): Promise<Comment[]> {
    const res = await apiClient.get<Comment[]>(`/articles/${articleId}/comments`);
    return res.data;
  },

  async create(
    articleId: string,
    data: {
      noiDung: string;
      ganThe?: RoleId | null;
      doanSo?: number | null;
      laYeuCauSua?: boolean;
    }
  ): Promise<Comment> {
    const res = await apiClient.post<Comment>(`/articles/${articleId}/comments`, data);
    return res.data;
  },

  async resolve(commentId: string): Promise<Comment> {
    const res = await apiClient.patch<Comment>(`/comments/${commentId}/resolve`);
    return res.data;
  },
};

export const logsApi = {
  async getAll(page = 1, limit = 100): Promise<{ data: LogEntry[]; total: number; page: number; totalPages: number }> {
    const res = await apiClient.get<{ data: LogEntry[]; total: number; page: number; totalPages: number }>("/logs", {
      params: { page, limit },
    });
    return res.data;
  },

  async getByArticle(articleId: string): Promise<LogEntry[]> {
    const res = await apiClient.get<LogEntry[]>(`/articles/${articleId}/logs`);
    return res.data;
  },
};
