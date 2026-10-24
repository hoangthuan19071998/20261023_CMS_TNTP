import { apiClient } from "./client";
import type { Article, Comment, LogEntry, RoleId, StateId } from "@/lib/types";

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

  async uploadBanBong(id: string, tenFile: string): Promise<Article> {
    const res = await apiClient.post<Article>(`/articles/${id}/upload`, { tenFile });
    return res.data;
  },

  async resetDemo(): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>("/articles/reset-demo");
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
