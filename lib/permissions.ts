// ---------------------------------------------------------------------------
// MA TRẬN PHÂN QUYỀN — NGUỒN SỰ THẬT DUY NHẤT CỦA BẢN DEMO
//
// Toàn bộ giao diện đọc quyền từ file này. Muốn đổi phân quyền thì sửa ở đây,
// không sửa trong từng màn hình. Bảng MA_TRAN bên dưới chép đúng 1:1 tab
// "Ma trận phân quyền" trong Google Sheet đã gửi tòa soạn.
//
// Quy ước ký hiệu (giống hệt bản Sheet):
//   ◆  vai trò đang giữ bài — bài chỉ đi tiếp khi vai trò này bấm nút
//   R  xem bài
//   C  bình luận nội bộ
//   E  sửa nội dung văn bản (có lưu vết)
//   L  sửa phần trình bày / tải lên file bản in
//   A  có nút chuyển trạng thái
//   K  ký số
//   D  tải file thành phẩm
//   —  không nhìn thấy bài
// ---------------------------------------------------------------------------

import type { Cap, Role, RoleId, StateDef, StateId } from "./types";

export const ROLES: Role[] = [
  { id: "PV", ten: "Phóng viên", vietTat: "PV", nguoiDung: "Nguyễn Thị Mai", moTa: "Đăng ký đề tài, viết bài, theo dõi bài của mình" },
  { id: "CTV", ten: "Cộng tác viên", vietTat: "CTV", nguoiDung: "Trần Quốc Bảo", moTa: "Gửi bài từ bên ngoài, không thấy thảo luận nội bộ" },
  { id: "TRUONG_BAN", ten: "Trưởng ban", vietTat: "TB", nguoiDung: "Lê Văn Hùng", moTa: "Duyệt đề tài, biên tập, điều phối bài trong ban" },
  { id: "BTV", ten: "Biên tập viên", vietTat: "BTV", nguoiDung: "Phạm Thu Hà", moTa: "Biên tập nội dung, trả bài, để lại ghi chú" },
  { id: "TKTS", ten: "Thư ký tòa soạn", vietTat: "TKTS", nguoiDung: "Đỗ Minh Khoa", moTa: "Chốt nội dung, xếp trang, chốt bản bông (super editor)" },
  { id: "HOA_SI", ten: "Họa sĩ / Thiết kế", vietTat: "HS", nguoiDung: "Vũ Hoàng Nam", moTa: "Dàn trang báo in, thiết kế đồ họa, longform" },
  { id: "TBT", ten: "Phó TBT / TBT", vietTat: "TBT", nguoiDung: "Hoàng Anh Tuấn", moTa: "Duyệt xuất bản, ký số, đình bản" },
  { id: "KE_TOAN", ten: "Kế toán", vietTat: "KT", nguoiDung: "Ngô Bích Liên", moTa: "Nhận dữ liệu nhuận bút, không can thiệp nội dung" },
  { id: "NHA_IN", ten: "Nhà in", vietTat: "NI", nguoiDung: "Xưởng in Tiền Phong", moTa: "Chỉ tải file đã duyệt cuối, không thấy nội dung nội bộ" },
  { id: "ADMIN", ten: "Quản trị hệ thống", vietTat: "QT", nguoiDung: "Bùi Đức Thắng", moTa: "Quản lý tài khoản, cấu hình, xem nhật ký" },
];

export const ROLE_IDS: RoleId[] = ROLES.map((r) => r.id);

export function getRole(id: RoleId): Role {
  const r = ROLES.find((x) => x.id === id);
  if (!r) throw new Error("Không tìm thấy vai trò: " + id);
  return r;
}

export const STATES: StateDef[] = [
  { id: "S0", ten: "S0 — Đề tài", dienGiai: "PV đăng ký đề tài, Trưởng ban duyệt hoặc từ chối", slaGio: 24, khoaNoiDung: false },
  { id: "S1", ten: "S1 — Bản thảo", dienGiai: "PV viết bài, đính kèm ảnh/video, bấm Gửi biên tập", slaGio: 48, khoaNoiDung: false },
  { id: "S2", ten: "S2 — Biên tập nội dung", dienGiai: "BTV/Trưởng ban sửa chữa. Trả lại PV hoặc duyệt. Đặt hàng thiết kế chạy song song từ đây", slaGio: 12, khoaNoiDung: false },
  { id: "S3", ten: "S3 — Chốt nội dung", dienGiai: "TKTS rà soát lần cuối về nội dung. Duyệt = khóa văn bản, hệ thống tự chuyển sang Họa sĩ", slaGio: 8, khoaNoiDung: false },
  { id: "S4", ten: "S4 — Trình bày", dienGiai: "Họa sĩ dàn trang / thiết kế. Văn bản đã khóa: muốn sửa chữ phải tạo Yêu cầu sửa", slaGio: 16, khoaNoiDung: true },
  { id: "S5", ten: "S5 — Soát bản bông", dienGiai: "TKTS và BTV cùng soát trên bản preview. Yêu cầu sửa (về Họa sĩ) hoặc Trình duyệt", slaGio: 6, khoaNoiDung: true },
  { id: "S6", ten: "S6 — Chờ duyệt xuất bản", dienGiai: "PTBT/TBT đọc duyệt lần cuối, ký số. Hoặc trả bài về đích tự chọn", slaGio: 4, khoaNoiDung: true },
  { id: "S7", ten: "S7 — Đã xuất bản", dienGiai: "Báo điện tử: tự đẩy theo lịch. Báo in: khóa file, xuất PDF giao Nhà in", slaGio: null, khoaNoiDung: true },
  { id: "S8", ten: "S8 — Lưu trữ / lưu chiểu", dienGiai: "Đóng gói, bất biến hóa bản ghi. Chỉ tra cứu, không ai sửa được", slaGio: null, khoaNoiDung: true },
  { id: "DINH_CHINH", ten: "Nhánh — Đính chính / gỡ bài", dienGiai: "Từ S7. Ai cũng đề nghị được, chỉ TBT quyết định. Bản gốc giữ nguyên trong nhật ký", slaGio: 4, khoaNoiDung: true, nhanhPhu: true },
  { id: "LOAI_BO", ten: "Nhánh — Bài bị loại / để dành", dienGiai: "Từ bất kỳ trạng thái nào trước S7. Bài không xóa, chuyển sang kho tồn", slaGio: null, khoaNoiDung: true, nhanhPhu: true },
];

export const PIPELINE: StateId[] = ["S0", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];

export function getState(id: StateId): StateDef {
  const s = STATES.find((x) => x.id === id);
  if (!s) throw new Error("Không tìm thấy trạng thái: " + id);
  return s;
}

// --- Bảng ma trận, chép nguyên văn từ Google Sheet ------------------------

type MatrixRow = Record<RoleId, string>;

export const MA_TRAN: Record<StateId, MatrixRow> = {
  S0:  { PV: "E A",   CTV: "E A", TRUONG_BAN: "◆ R C A", BTV: "R C",   TKTS: "R C",     HOA_SI: "—",       TBT: "R",         KE_TOAN: "—", NHA_IN: "—", ADMIN: "R" },
  S1:  { PV: "◆ E A", CTV: "◆ E A", TRUONG_BAN: "R C",   BTV: "R C",   TKTS: "R C",     HOA_SI: "—",       TBT: "R",         KE_TOAN: "—", NHA_IN: "—", ADMIN: "R" },
  S2:  { PV: "R C",   CTV: "R",   TRUONG_BAN: "◆ E C A", BTV: "◆ E C A", TKTS: "E C",   HOA_SI: "R C",     TBT: "R C",       KE_TOAN: "—", NHA_IN: "—", ADMIN: "R" },
  S3:  { PV: "R C",   CTV: "R",   TRUONG_BAN: "R C",     BTV: "R C",   TKTS: "◆ E C A", HOA_SI: "R C D",   TBT: "R C",       KE_TOAN: "—", NHA_IN: "—", ADMIN: "R" },
  S4:  { PV: "R",     CTV: "R",   TRUONG_BAN: "R C",     BTV: "R C",   TKTS: "R C",     HOA_SI: "◆ L C A", TBT: "R C",       KE_TOAN: "—", NHA_IN: "—", ADMIN: "R" },
  S5:  { PV: "R",     CTV: "R",   TRUONG_BAN: "R C",     BTV: "R C A", TKTS: "◆ R C A", HOA_SI: "R C",     TBT: "R C",       KE_TOAN: "—", NHA_IN: "—", ADMIN: "R" },
  S6:  { PV: "R",     CTV: "R",   TRUONG_BAN: "R",       BTV: "R C",   TKTS: "R C",     HOA_SI: "R",       TBT: "◆ R C A K", KE_TOAN: "—", NHA_IN: "—", ADMIN: "R" },
  S7:  { PV: "R",     CTV: "R",   TRUONG_BAN: "R",       BTV: "R",     TKTS: "R A",     HOA_SI: "R",       TBT: "R A",       KE_TOAN: "R", NHA_IN: "D", ADMIN: "R" },
  S8:  { PV: "R",     CTV: "R",   TRUONG_BAN: "R",       BTV: "R",     TKTS: "R",       HOA_SI: "R",       TBT: "R",         KE_TOAN: "R", NHA_IN: "—", ADMIN: "R" },
  DINH_CHINH: { PV: "C", CTV: "—", TRUONG_BAN: "C", BTV: "C A", TKTS: "C A", HOA_SI: "R", TBT: "◆ C A K", KE_TOAN: "—", NHA_IN: "—", ADMIN: "R" },
  LOAI_BO:    { PV: "R", CTV: "R", TRUONG_BAN: "A", BTV: "A",   TKTS: "A",   HOA_SI: "R", TBT: "A",       KE_TOAN: "—", NHA_IN: "—", ADMIN: "R" },
};

export interface Permission {
  /** Mã gốc trong ma trận, ví dụ "◆ E C A". Hiển thị nguyên văn cho khách đối chiếu. */
  ma: string;
  caps: Cap[];
  dangGiuBai: boolean;
  thayBai: boolean;
}

const CAP_SET: Cap[] = ["R", "C", "E", "L", "A", "K", "D"];

export function getPermission(vaiTro: RoleId, trangThai: StateId): Permission {
  const ma = MA_TRAN[trangThai][vaiTro];
  const dangGiuBai = ma.startsWith("◆");
  if (ma.trim() === "—") {
    return { ma, caps: [], dangGiuBai: false, thayBai: false };
  }
  const caps = ma
    .replace("◆", "")
    .trim()
    .split(/\s+/)
    .filter((t): t is Cap => (CAP_SET as string[]).includes(t));
  // Giữ bài hoặc có bất kỳ năng lực nào đều hàm ý nhìn thấy bài.
  return { ma, caps, dangGiuBai, thayBai: caps.length > 0 };
}

export function coQuyen(vaiTro: RoleId, trangThai: StateId, cap: Cap): boolean {
  return getPermission(vaiTro, trangThai).caps.includes(cap);
}

export const CAP_LABEL: Record<Cap, string> = {
  R: "Xem bài",
  C: "Bình luận nội bộ",
  E: "Sửa nội dung (có lưu vết)",
  L: "Sửa trình bày / tải file bản in",
  A: "Chuyển trạng thái",
  K: "Ký số",
  D: "Tải file thành phẩm",
};

// --- Chuyển trạng thái ----------------------------------------------------

export type KieuHanhDong = "tien" | "tra_lai" | "loai" | "nhanh";

export interface Transition {
  id: string;
  nhan: string;
  tu: StateId;
  den: StateId;
  vaiTro: RoleId[];
  kieu: KieuHanhDong;
  /** Bắt buộc nhập lý do khi trả bài hoặc loại bài. */
  batBuocLyDo?: boolean;
  /** Người trả bài được chọn đích đến (đề xuất số 10 trong danh sách câu hỏi). */
  chonDich?: StateId[];
  /** Hành động kèm ký số. */
  kySo?: boolean;
  giaiThich?: string;
}

export const TRANSITIONS: Transition[] = [
  { id: "s0-duyet", nhan: "Duyệt đề tài", tu: "S0", den: "S1", vaiTro: ["TRUONG_BAN"], kieu: "tien", giaiThich: "Đề tài được chấp nhận, phóng viên bắt đầu viết." },
  { id: "s0-tuchoi", nhan: "Từ chối đề tài", tu: "S0", den: "LOAI_BO", vaiTro: ["TRUONG_BAN"], kieu: "loai", batBuocLyDo: true },
  { id: "s0-rut", nhan: "Rút đề tài", tu: "S0", den: "LOAI_BO", vaiTro: ["PV", "CTV"], kieu: "nhanh", batBuocLyDo: true, giaiThich: "Ma trận cho phóng viên quyền A ở S0; đây là hành động tương ứng — tự rút đề tài trước khi Trưởng ban duyệt." },

  { id: "s1-gui", nhan: "Gửi biên tập", tu: "S1", den: "S2", vaiTro: ["PV", "CTV"], kieu: "tien" },

  { id: "s2-duyet", nhan: "Duyệt & chuyển Thư ký tòa soạn", tu: "S2", den: "S3", vaiTro: ["BTV", "TRUONG_BAN"], kieu: "tien" },
  { id: "s2-tra", nhan: "Trả lại phóng viên", tu: "S2", den: "S1", vaiTro: ["BTV", "TRUONG_BAN"], kieu: "tra_lai", batBuocLyDo: true },

  {
    id: "s3-duyet",
    nhan: "Chốt nội dung & khóa văn bản",
    tu: "S3",
    den: "S4",
    vaiTro: ["TKTS"],
    kieu: "tien",
    giaiThich: "Đề xuất số 5 và 9: văn bản bị khóa, hệ thống tự chuyển thẳng sang Họa sĩ thay vì nhờ BTV bấm nút.",
  },
  { id: "s3-tra", nhan: "Trả lại biên tập viên", tu: "S3", den: "S2", vaiTro: ["TKTS"], kieu: "tra_lai", batBuocLyDo: true },

  { id: "s4-gui", nhan: "Gửi bản bông", tu: "S4", den: "S5", vaiTro: ["HOA_SI"], kieu: "tien" },

  {
    id: "s5-trinh",
    nhan: "Trình duyệt",
    tu: "S5",
    den: "S6",
    vaiTro: ["TKTS"],
    kieu: "tien",
    giaiThich: "Đề xuất số 4: nút này không có trong tài liệu gốc, khiến bản bông đạt vẫn không có đường đi tiếp.",
  },
  { id: "s5-sua", nhan: "Yêu cầu sửa trình bày", tu: "S5", den: "S4", vaiTro: ["TKTS", "BTV"], kieu: "tra_lai", batBuocLyDo: true },

  {
    id: "s6-duyet",
    nhan: "Ký số & duyệt xuất bản",
    tu: "S6",
    den: "S7",
    vaiTro: ["TBT"],
    kieu: "tien",
    kySo: true,
    giaiThich: "Đề xuất số: ký số là bắt buộc ở bước này, không phải lựa chọn thay thế cho nút duyệt.",
  },
  {
    id: "s6-tra",
    nhan: "Trả bài",
    tu: "S6",
    den: "S2",
    vaiTro: ["TBT"],
    kieu: "tra_lai",
    batBuocLyDo: true,
    chonDich: ["S1", "S2", "S3", "S4"],
    giaiThich: "Đề xuất số 10: người trả bài chọn đích đến thay vì gửi lại cho tất cả.",
  },

  { id: "s7-luutru", nhan: "Đưa vào lưu trữ / lưu chiểu", tu: "S7", den: "S8", vaiTro: ["TKTS"], kieu: "tien" },
  {
    id: "s7-dinhchinh",
    nhan: "Đề nghị đính chính / gỡ bài",
    tu: "S7",
    den: "DINH_CHINH",
    vaiTro: ["TKTS", "TBT"],
    kieu: "nhanh",
    batBuocLyDo: true,
    giaiThich: "Đề xuất số 8: tài liệu gốc có quyền Đình bản nhưng không có luồng đi kèm. Ở S7 chỉ TKTS và TBT có quyền A nên chỉ hai vai này khởi tạo được nhánh; BTV nêu ý kiến bằng bình luận nội bộ.",
  },

  { id: "dc-rut", nhan: "Rút đề nghị đính chính", tu: "DINH_CHINH", den: "S7", vaiTro: ["BTV", "TKTS"], kieu: "nhanh", batBuocLyDo: true, giaiThich: "Người đề nghị rút lại khi xác minh xong, bài trở về trạng thái đã xuất bản." },
  { id: "dc-duyet", nhan: "Duyệt đính chính & đăng lại", tu: "DINH_CHINH", den: "S7", vaiTro: ["TBT"], kieu: "tien", kySo: true },
  { id: "dc-go", nhan: "Gỡ bài khỏi trang", tu: "DINH_CHINH", den: "LOAI_BO", vaiTro: ["TBT"], kieu: "loai", batBuocLyDo: true },

  { id: "lb-khoiphuc", nhan: "Khôi phục về bản thảo", tu: "LOAI_BO", den: "S1", vaiTro: ["TKTS", "TBT"], kieu: "nhanh" },
];

/** Hành động "Loại bài" áp dụng cho mọi trạng thái trước S7. */
const TRANG_THAI_CO_THE_LOAI: StateId[] = ["S1", "S2", "S3", "S4", "S5", "S6"];

export function getTransitions(trangThai: StateId, vaiTro: RoleId): Transition[] {
  const ketQua = TRANSITIONS.filter((t) => t.tu === trangThai && t.vaiTro.includes(vaiTro));
  if (TRANG_THAI_CO_THE_LOAI.includes(trangThai) && ["TRUONG_BAN", "BTV", "TKTS", "TBT"].includes(vaiTro)) {
    ketQua.push({
      id: "loai-bai",
      nhan: "Loại bài / chuyển kho tồn",
      tu: trangThai,
      den: "LOAI_BO",
      vaiTro: ["TRUONG_BAN", "BTV", "TKTS", "TBT"],
      kieu: "loai",
      batBuocLyDo: true,
    });
  }
  return ketQua;
}

/** Mọi hành động có thể có ở trạng thái này, bất kể vai trò — dùng cho chế độ giải thích. */
export function getAllTransitions(trangThai: StateId): Transition[] {
  const ketQua = TRANSITIONS.filter((t) => t.tu === trangThai);
  if (TRANG_THAI_CO_THE_LOAI.includes(trangThai)) {
    ketQua.push({
      id: "loai-bai",
      nhan: "Loại bài / chuyển kho tồn",
      tu: trangThai,
      den: "LOAI_BO",
      vaiTro: ["TRUONG_BAN", "BTV", "TKTS", "TBT"],
      kieu: "loai",
      batBuocLyDo: true,
    });
  }
  return ketQua;
}
