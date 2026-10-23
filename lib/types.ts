// Kiểu dữ liệu dùng chung cho bản demo mô phỏng quy trình tòa soạn hội tụ.

export type RoleId =
  | "PV"
  | "CTV"
  | "TRUONG_BAN"
  | "BTV"
  | "TKTS"
  | "HOA_SI"
  | "TBT"
  | "KE_TOAN"
  | "NHA_IN"
  | "ADMIN";

export type StateId =
  | "S0"
  | "S1"
  | "S2"
  | "S3"
  | "S4"
  | "S5"
  | "S6"
  | "S7"
  | "S8"
  | "DINH_CHINH"
  | "LOAI_BO";

/** Mã năng lực, khớp với quy ước ký hiệu trong Ma trận phân quyền. */
export type Cap = "R" | "C" | "E" | "L" | "A" | "K" | "D";

export interface Role {
  id: RoleId;
  ten: string;
  vietTat: string;
  nguoiDung: string;
  moTa: string;
}

export interface StateDef {
  id: StateId;
  ten: string;
  dienGiai: string;
  /** Hạn xử lý tính bằng giờ. null = không áp hạn. */
  slaGio: number | null;
  /** Nội dung văn bản bị khóa ở trạng thái này (sau khi TKTS chốt). */
  khoaNoiDung: boolean;
  /** Trạng thái nằm ngoài đường ống chính (nhánh phụ). */
  nhanhPhu?: boolean;
}

export type LoaiNoiDung = "tin" | "bai" | "longform" | "video" | "infographic";
export type AnPham = "bao_in" | "bao_dien_tu" | "ca_hai";

export interface Version {
  id: string;
  thoiDiem: string;
  tacGia: RoleId;
  tenNguoi: string;
  ghiChu: string;
  soTuThayDoi: number;
}

export interface Comment {
  id: string;
  thoiDiem: string;
  tacGia: RoleId;
  tenNguoi: string;
  noiDung: string;
  /** Gắn thẻ vai trò cần xử lý. */
  ganThe: RoleId | null;
  /** Đoạn văn bản mà bình luận gắn vào (chỉ số đoạn), null = bình luận cả bài. */
  doanSo: number | null;
  daXuLy: boolean;
  /** Bình luận sinh ra từ nút "Tạo yêu cầu sửa" khi văn bản đã khóa. */
  laYeuCauSua?: boolean;
}

export interface LogEntry {
  id: string;
  thoiDiem: string;
  vaiTro: RoleId;
  hanhDong: string;
  baiId: string | null;
  chiTiet: string;
  /** Bước chuyển, chỉ có khi hành động làm bài đổi trạng thái. */
  tu?: StateId;
  den?: StateId;
  /** Lý do / ghi chú người thực hiện nhập khi chuyển bài. */
  ghiChu?: string | null;
  /** Phiên bản nội dung gắn với thao tác này, nếu có. */
  phienBan?: string;
}

export interface Article {
  id: string;
  maBai: string;
  tieuDe: string;
  sapo: string;
  doan: string[];
  chuyenMuc: string;
  anPham: AnPham;
  loai: LoaiNoiDung;
  tacGia: string;
  trangThai: StateId;
  /** Thời điểm bài bước vào trạng thái hiện tại, dùng để tính quá hạn. */
  vaoTrangThaiLuc: string;
  taoLuc: string;
  phienBan: Version[];
  binhLuan: Comment[];
  /** File bản bông do họa sĩ tải lên (mô phỏng). */
  fileBanBong: string | null;
  /** Đã ký số ở bước duyệt cuối hay chưa. */
  daKySo: boolean;
  /** Lý do khi bài bị trả lại hoặc bị loại. */
  lyDoGanNhat: string | null;
}
