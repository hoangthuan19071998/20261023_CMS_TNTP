// Nơi giữ nội dung tệp thật trong trình duyệt (IndexedDB).
//
// Bản demo không có máy chủ, nên tệp tải lên nằm ở máy người xem: localStorage chỉ
// đủ chỗ cho thông tin mô tả tệp, còn nội dung tệp (có thể hàng chục MB) phải vào
// IndexedDB. Chỉ gọi từ trình duyệt. Mọi lỗi (chế độ riêng tư, hết chỗ, trình duyệt
// chặn) trả về kết quả thất bại chứ không ném lỗi, để giao diện báo lại cho người dùng.

import type { TaiLieu } from "./types";

const TEN_DB = "cms-tntp-demo-tep";
const TEN_KHO = "tep";

function moKho(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Trình duyệt không có IndexedDB"));
      return;
    }
    const yeuCau = indexedDB.open(TEN_DB, 1);
    yeuCau.onupgradeneeded = () => {
      yeuCau.result.createObjectStore(TEN_KHO);
    };
    yeuCau.onsuccess = () => resolve(yeuCau.result);
    yeuCau.onerror = () => reject(yeuCau.error);
  });
}

async function chay<T>(che: IDBTransactionMode, viec: (kho: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await moKho();
  return new Promise<T>((resolve, reject) => {
    const giaoDich = db.transaction(TEN_KHO, che);
    const yeuCau = viec(giaoDich.objectStore(TEN_KHO));
    giaoDich.oncomplete = () => {
      db.close();
      resolve(yeuCau.result);
    };
    giaoDich.onerror = giaoDich.onabort = () => {
      db.close();
      reject(giaoDich.error);
    };
  });
}

/** Lưu nội dung tệp. Trả false nếu trình duyệt không cho lưu. */
export async function luuTep(id: string, tep: Blob): Promise<boolean> {
  try {
    await chay("readwrite", (kho) => kho.put(tep, id));
    return true;
  } catch {
    return false;
  }
}

export async function layTep(id: string): Promise<Blob | null> {
  try {
    const kq = await chay<Blob | undefined>("readonly", (kho) => kho.get(id));
    return kq ?? null;
  } catch {
    return null;
  }
}

export async function xoaTep(id: string): Promise<void> {
  try {
    await chay("readwrite", (kho) => kho.delete(id));
  } catch {
    // Bỏ qua: còn sót nội dung không ảnh hưởng gì, vì không còn mô tả nào trỏ tới.
  }
}

export async function xoaHetTep(): Promise<void> {
  try {
    await chay("readwrite", (kho) => kho.clear());
  } catch {
    // Như trên.
  }
}

/** Cho trình duyệt tải tệp xuống. "khong_co_noi_dung" với tệp mẫu hoặc tệp đã mất khỏi kho. */
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
