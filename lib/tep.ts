// Quy tắc về tệp tải lên: được nhận loại nào, tối đa bao nhiêu, kiểm tra ra sao.
// Chỉ có hàm thuần, dùng được cả ở máy chủ lẫn trình duyệt.

import type { LoaiTep } from "./types";

/** Dung lượng tối đa mỗi tệp. Con số của bản demo, hệ thống thật cần tòa soạn chốt. */
export const DUNG_LUONG_TOI_DA = 25 * 1024 * 1024;

export const DUOI_TEP: Record<LoaiTep, string[]> = {
  pdf: ["pdf"],
  word: ["doc", "docx"],
  anh: ["jpg", "jpeg", "png", "gif", "webp"],
  zip: ["zip"],
};

export const NHAN_LOAI_TEP: Record<LoaiTep, string> = {
  pdf: "PDF",
  word: "Word",
  anh: "Ảnh",
  zip: "ZIP",
};

/** Giá trị cho thuộc tính accept của ô chọn tệp, để hộp thoại chỉ gợi ý đúng loại. */
export const CHUOI_ACCEPT = Object.values(DUOI_TEP)
  .flat()
  .map((d) => "." + d)
  .join(",");

export const MO_TA_DINH_DANG = "PDF, Word (.doc, .docx), ảnh (JPG, PNG, GIF, WebP), ZIP";

export function dinhDangDungLuong(byte: number): string {
  if (byte < 1024) return byte + " B";
  if (byte < 1024 * 1024) return (byte / 1024).toFixed(byte < 10 * 1024 ? 1 : 0) + " KB";
  return (byte / (1024 * 1024)).toFixed(1) + " MB";
}

export function loaiTepTuTen(ten: string): LoaiTep | null {
  const cham = ten.lastIndexOf(".");
  if (cham < 0 || cham === ten.length - 1) return null;
  const duoi = ten.slice(cham + 1).toLowerCase();
  const loai = (Object.keys(DUOI_TEP) as LoaiTep[]).find((l) => DUOI_TEP[l].includes(duoi));
  return loai ?? null;
}

export type KetQuaKiemTra = { ok: true; loai: LoaiTep } | { ok: false; lyDo: string };

/**
 * Kiểm tra theo đuôi tệp và dung lượng. Bản demo không đọc nội dung bên trong;
 * hệ thống thật phải kiểm tra nội dung và quét mã độc, nhất là với tệp ZIP.
 */
export function kiemTraTep(tep: { name: string; size: number }): KetQuaKiemTra {
  const loai = loaiTepTuTen(tep.name);
  if (!loai) {
    return { ok: false, lyDo: "“" + tep.name + "”: định dạng không được nhận. Chỉ nhận " + MO_TA_DINH_DANG + "." };
  }
  if (tep.size === 0) {
    return { ok: false, lyDo: "“" + tep.name + "”: tệp rỗng." };
  }
  if (tep.size > DUNG_LUONG_TOI_DA) {
    return {
      ok: false,
      lyDo:
        "“" + tep.name + "”: nặng " + dinhDangDungLuong(tep.size) + ", vượt mức tối đa " +
        dinhDangDungLuong(DUNG_LUONG_TOI_DA) + " mỗi tệp.",
    };
  }
  return { ok: true, loai };
}
