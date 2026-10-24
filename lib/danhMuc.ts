// Các danh mục chọn khi đăng bài mới.

import type { AnPham, LoaiNoiDung } from "./types";

/** Lấy theo các chuyên mục đang có trong dữ liệu mẫu. */
export const CHUYEN_MUC = ["Thời sự", "Kinh tế", "Đô thị", "Văn hóa", "Giáo dục", "Thể thao", "Phóng sự"];

export const LOAI_NOI_DUNG: { id: LoaiNoiDung; nhan: string }[] = [
  { id: "tin", nhan: "Tin" },
  { id: "bai", nhan: "Bài" },
  { id: "longform", nhan: "Longform" },
  { id: "video", nhan: "Video" },
  { id: "infographic", nhan: "Infographic" },
];

export const AN_PHAM: { id: AnPham; nhan: string }[] = [
  { id: "bao_dien_tu", nhan: "Báo điện tử" },
  { id: "bao_in", nhan: "Báo in" },
  { id: "ca_hai", nhan: "In + Điện tử" },
];
