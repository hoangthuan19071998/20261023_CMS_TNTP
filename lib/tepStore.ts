// Đọc nội dung tệp đính kèm từ máy chủ. Tệp nằm trên đĩa của backend, ai có quyền
// đều tải được, không còn phụ thuộc trình duyệt đã tải lên. Mọi lỗi (mất kết nối, không
// có quyền, tệp mẫu chưa có nội dung) trả về kết quả thất bại chứ không ném lỗi, để
// giao diện báo lại cho người dùng.

import { taiLieuApi } from "./api/services";
import type { TaiLieu } from "./types";

export async function layTep(id: string): Promise<Blob | null> {
  try {
    return await taiLieuApi.layNoiDung(id);
  } catch {
    return null;
  }
}

/** Cho trình duyệt tải tệp xuống. "khong_co_noi_dung" với tệp mẫu hoặc khi máy chủ không trả được tệp. */
export async function taiXuongTep(tep: TaiLieu): Promise<"ok" | "khong_co_noi_dung"> {
  if (!tep.coNoiDung) return "khong_co_noi_dung";
  const noiDung = await layTep(tep.id);
  if (!noiDung) return "khong_co_noi_dung";

  const url = URL.createObjectURL(noiDung);
  const a = document.createElement("a");
  a.href = url;
  a.download = tep.ten;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Chờ một nhịp rồi mới thu hồi, để trình duyệt kịp bắt đầu tải.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return "ok";
}
