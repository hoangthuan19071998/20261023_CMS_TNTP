import { PIPELINE, TRANSITIONS } from "./permissions";
import type { Article, LogEntry, RoleId, StateId } from "./types";

// Dữ liệu mẫu: 14 bài rải đều trên các trạng thái để mở demo là thấy ngay
// bài ở mọi bước của quy trình.

const BASE = new Date("2026-10-23T09:00:00+07:00").getTime();

/** Trả về mốc thời gian lùi về quá khứ số giờ cho trước. */
function truoc(gio: number): string {
  return new Date(BASE - gio * 3600 * 1000).toISOString();
}

const DOAN_MAU = [
  "Sáng 22/10, tại Hà Nội, hội thảo về chuyển đổi số trong lĩnh vực báo chí đã thu hút hơn 200 đại biểu đến từ các cơ quan báo chí trung ương và địa phương.",
  "Theo báo cáo được công bố tại hội thảo, tỷ lệ cơ quan báo chí đã triển khai tòa soạn hội tụ ở mức một phần ba, phần lớn tập trung ở các đơn vị có quy mô lớn.",
  "Đại diện ban tổ chức cho biết khó khăn lớn nhất không nằm ở công nghệ mà ở việc thay đổi thói quen làm việc, khi nhiều khâu vẫn được xử lý trên giấy.",
  "Phiên thảo luận buổi chiều tập trung vào bài toán quy trình: làm thế nào rút ngắn thời gian từ lúc phóng viên gửi bài đến khi bài được xuất bản mà vẫn giữ đủ các lớp kiểm soát.",
];

function doanCho(tieuDe: string): string[] {
  return [
    tieuDe + " — nội dung mô phỏng phục vụ demo quy trình, không phải bài báo thật.",
    ...DOAN_MAU,
  ];
}

interface SeedSpec {
  maBai: string;
  tieuDe: string;
  chuyenMuc: string;
  anPham: Article["anPham"];
  loai: Article["loai"];
  tacGia: string;
  trangThai: StateId;
  gioTrongTrangThai: number;
  fileBanBong?: string | null;
  daKySo?: boolean;
  lyDoGanNhat?: string | null;
  /** Đường bài đã thực sự đi. Bỏ trống thì mặc định chạy thẳng S0 đến trạng thái hiện tại. */
  duongDi?: StateId[];
}

const SPECS: SeedSpec[] = [
  { maBai: "TNTP-1041", tieuDe: "Đề xuất mở rộng tuyến buýt điện nội đô", chuyenMuc: "Đô thị", anPham: "bao_dien_tu", loai: "tin", tacGia: "Nguyễn Thị Mai", trangThai: "S0", gioTrongTrangThai: 30 },
  { maBai: "TNTP-1042", tieuDe: "Loạt bài: Người trẻ và nghề thủ công truyền thống", chuyenMuc: "Văn hóa", anPham: "ca_hai", loai: "longform", tacGia: "Nguyễn Thị Mai", trangThai: "S0", gioTrongTrangThai: 6 },
  { maBai: "TNTP-1038", tieuDe: "Giá vật liệu xây dựng tăng trở lại sau ba tháng", chuyenMuc: "Kinh tế", anPham: "bao_dien_tu", loai: "bai", tacGia: "Trần Quốc Bảo", trangThai: "S1", gioTrongTrangThai: 20 },
  { maBai: "TNTP-1035", tieuDe: "Trường học vùng cao xoay xở với thiếu giáo viên tiếng Anh", chuyenMuc: "Giáo dục", anPham: "ca_hai", loai: "bai", tacGia: "Nguyễn Thị Mai", trangThai: "S1", gioTrongTrangThai: 52, lyDoGanNhat: "Cần bổ sung số liệu cụ thể của ba tỉnh và trích dẫn từ Sở Giáo dục.", duongDi: ["S0", "S1", "S2", "S1"] },
  { maBai: "TNTP-1030", tieuDe: "Chuyển đổi số báo chí: công nghệ không phải rào cản lớn nhất", chuyenMuc: "Thời sự", anPham: "ca_hai", loai: "bai", tacGia: "Trần Quốc Bảo", trangThai: "S2", gioTrongTrangThai: 4 },
  { maBai: "TNTP-1029", tieuDe: "Hồ sơ: Mười năm một con đường ven sông", chuyenMuc: "Phóng sự", anPham: "bao_in", loai: "bai", tacGia: "Nguyễn Thị Mai", trangThai: "S2", gioTrongTrangThai: 19 },
  { maBai: "TNTP-1026", tieuDe: "Nông sản xuất khẩu và bài toán truy xuất nguồn gốc", chuyenMuc: "Kinh tế", anPham: "ca_hai", loai: "bai", tacGia: "Trần Quốc Bảo", trangThai: "S3", gioTrongTrangThai: 3 },
  { maBai: "TNTP-1022", tieuDe: "Infographic: Bản đồ ngập úng nội thành mùa mưa 2026", chuyenMuc: "Đô thị", anPham: "bao_dien_tu", loai: "infographic", tacGia: "Nguyễn Thị Mai", trangThai: "S4", gioTrongTrangThai: 9 },
  { maBai: "TNTP-1021", tieuDe: "Trang chuyên đề: Thể thao học đường sau một năm", chuyenMuc: "Thể thao", anPham: "bao_in", loai: "bai", tacGia: "Trần Quốc Bảo", trangThai: "S4", gioTrongTrangThai: 21, fileBanBong: null },
  { maBai: "TNTP-1018", tieuDe: "Ký sự: Những người giữ rừng mùa khô", chuyenMuc: "Phóng sự", anPham: "bao_in", loai: "bai", tacGia: "Nguyễn Thị Mai", trangThai: "S5", gioTrongTrangThai: 2, fileBanBong: "TNTP-1018_banbong_v3.pdf" },
  { maBai: "TNTP-1015", tieuDe: "Longform: Thành phố và những khoảng xanh còn lại", chuyenMuc: "Đô thị", anPham: "bao_dien_tu", loai: "longform", tacGia: "Trần Quốc Bảo", trangThai: "S5", gioTrongTrangThai: 8, fileBanBong: "TNTP-1015_preview_web.html" },
  { maBai: "TNTP-1011", tieuDe: "Chính sách hỗ trợ nhà ở xã hội: ba điểm nghẽn", chuyenMuc: "Thời sự", anPham: "ca_hai", loai: "bai", tacGia: "Nguyễn Thị Mai", trangThai: "S6", gioTrongTrangThai: 1, fileBanBong: "TNTP-1011_banbong_v2.pdf" },
  { maBai: "TNTP-1004", tieuDe: "Hội thảo chuyển đổi số: tòa soạn hội tụ vẫn còn chậm", chuyenMuc: "Thời sự", anPham: "bao_dien_tu", loai: "tin", tacGia: "Trần Quốc Bảo", trangThai: "S7", gioTrongTrangThai: 26, fileBanBong: "TNTP-1004_final.pdf", daKySo: true },
  { maBai: "TNTP-0990", tieuDe: "Số đặc biệt tháng 9: Chân dung người lao động trẻ", chuyenMuc: "Văn hóa", anPham: "bao_in", loai: "bai", tacGia: "Nguyễn Thị Mai", trangThai: "S8", gioTrongTrangThai: 500, fileBanBong: "TNTP-0990_luuchieu.pdf", daKySo: true },
];

export function taoDuLieuMau(): Article[] {
  return SPECS.map((s, i) => {
    const vaoLuc = truoc(s.gioTrongTrangThai);
    const baiId = "bai-" + (i + 1);
    return {
      id: baiId,
      maBai: s.maBai,
      tieuDe: s.tieuDe,
      sapo:
        "Bản tóm tắt mô phỏng cho bài " +
        s.maBai +
        ", dùng để minh họa màn hình soạn thảo và các bước duyệt trong quy trình.",
      doan: doanCho(s.tieuDe),
      chuyenMuc: s.chuyenMuc,
      anPham: s.anPham,
      loai: s.loai,
      tacGia: s.tacGia,
      trangThai: s.trangThai,
      vaoTrangThaiLuc: vaoLuc,
      taoLuc: truoc(s.gioTrongTrangThai + 36),
      phienBan: taoPhienBan(baiId, s),
      binhLuan: taoBinhLuan(baiId, s),
      fileBanBong: s.fileBanBong ?? null,
      daKySo: s.daKySo ?? false,
      lyDoGanNhat: s.lyDoGanNhat ?? null,
    };
  });
}

/** Đường bài đã thực sự đi. Bỏ trống thì chạy thẳng S0 đến trạng thái hiện tại. */
function duongDiCua(s: SeedSpec): StateId[] {
  if (s.duongDi) return s.duongDi;
  const i = PIPELINE.indexOf(s.trangThai);
  return i >= 0 ? PIPELINE.slice(0, i + 1) : [s.trangThai];
}

/**
 * Số giờ lùi về quá khứ của mỗi lần chuyển bước, rải đều từ lúc tạo bài đến
 * lúc bài vào trạng thái hiện tại. Dùng chung cho cả phiên bản lẫn nhật ký để
 * hai nơi không lệch nhau.
 */
function mocChuyenBuoc(s: SeedSpec): number[] {
  const duong = duongDiCua(s);
  const soBuoc = duong.length - 1;
  const batDau = s.gioTrongTrangThai + 36;
  return duong.slice(0, -1).map((_, k) => batDau - ((batDau - s.gioTrongTrangThai) * (k + 1)) / soBuoc);
}

/** Thời điểm bài rời khỏi một bước, tính bằng số giờ lùi về quá khứ. */
function roiBuoc(s: SeedSpec, buoc: StateId): number | null {
  const duong = duongDiCua(s);
  const moc = mocChuyenBuoc(s);
  const k = duong.indexOf(buoc);
  return k >= 0 && k < moc.length ? moc[k] : null;
}

function taoPhienBan(baiId: string, s: SeedSpec): Article["phienBan"] {
  const ds: Article["phienBan"] = [
    {
      id: baiId + "-v1",
      thoiDiem: truoc(s.gioTrongTrangThai + 36),
      tacGia: "PV",
      tenNguoi: s.tacGia,
      ghiChu: "Bản viết đầu tiên",
      soTuThayDoi: 820,
    },
  ];
  const thuTu: StateId[] = ["S2", "S3", "S4", "S5", "S6", "S7", "S8"];
  if (thuTu.includes(s.trangThai)) {
    ds.push({
      id: baiId + "-v2",
      thoiDiem: truoc((roiBuoc(s, "S2") ?? s.gioTrongTrangThai + 14) + 0.5),
      tacGia: "BTV",
      tenNguoi: "Phạm Thu Hà",
      ghiChu: "Biên tập: rút gọn sa pô, sửa 4 lỗi chính tả, chuẩn hóa tên riêng",
      soTuThayDoi: 96,
    });
  }
  if (["S4", "S5", "S6", "S7", "S8"].includes(s.trangThai)) {
    ds.push({
      id: baiId + "-v3",
      thoiDiem: truoc((roiBuoc(s, "S3") ?? s.gioTrongTrangThai + 5) + 0.5),
      tacGia: "TKTS",
      tenNguoi: "Đỗ Minh Khoa",
      ghiChu: "Chốt nội dung, khóa văn bản trước khi chuyển trình bày",
      soTuThayDoi: 23,
    });
  }
  return ds;
}

function taoBinhLuan(baiId: string, s: SeedSpec): Article["binhLuan"] {
  const ds: Article["binhLuan"] = [];
  if (["S2", "S3", "S4", "S5", "S6"].includes(s.trangThai)) {
    ds.push({
      id: baiId + "-c1",
      thoiDiem: truoc(s.gioTrongTrangThai + 10),
      tacGia: "BTV",
      tenNguoi: "Phạm Thu Hà",
      noiDung: "Đoạn 3 cần kiểm tra lại số liệu, nguồn hiện chưa rõ là báo cáo nào.",
      ganThe: "PV",
      doanSo: 3,
      daXuLy: s.trangThai !== "S2",
    });
  }
  if (["S4", "S5"].includes(s.trangThai)) {
    ds.push({
      id: baiId + "-c2",
      thoiDiem: truoc(s.gioTrongTrangThai + 2),
      tacGia: "TKTS",
      tenNguoi: "Đỗ Minh Khoa",
      noiDung: "Ảnh mở bài cắt theo tỷ lệ 16:9, chừa chỗ cho tít chạy hai dòng.",
      ganThe: "HOA_SI",
      doanSo: null,
      daXuLy: false,
    });
  }
  if (s.trangThai === "S7") {
    ds.push({
      id: baiId + "-c3",
      thoiDiem: truoc(s.gioTrongTrangThai - 2),
      tacGia: "TKTS",
      tenNguoi: "Đỗ Minh Khoa",
      noiDung: "Bài đã lên trang chủ lúc 7h00, đã kiểm tra hiển thị trên di động.",
      ganThe: null,
      doanSo: null,
      daXuLy: true,
    });
  }
  return ds;
}

// --- Vết duyệt mẫu --------------------------------------------------------
//
// Mỗi bài mẫu được dựng lại cả đường đã đi, để màn hình "Thông tin duyệt" và
// "Lịch sử bài viết" có vết thật thay vì trống trơn khi mở demo.

/** Vai trò bấm nút ở mỗi bước, dùng để ghi tên người vào vết duyệt. */
const NGUOI_BAM: Record<string, RoleId> = {
  S0: "TRUONG_BAN",
  S1: "PV",
  S2: "BTV",
  S3: "TKTS",
  S4: "HOA_SI",
  S5: "TKTS",
  S6: "TBT",
  S7: "TKTS",
};

const GHI_CHU_BUOC: Record<string, string> = {
  S0: "Đề tài rõ, triển khai ngay trong tuần này.",
  S1: "Nhờ anh chị biên tập xem giúp em ạ.",
  S2: "Đã rút gọn sa pô và chuẩn hóa tên riêng, chuyển Thư ký tòa soạn.",
  S3: "Nội dung đạt, khóa văn bản và chuyển sang trình bày.",
  S4: "Đã dàn hai trang, chừa chỗ cho tít chạy hai dòng.",
  S5: "Bản bông đạt, trình duyệt xuất bản.",
  S6: "Đồng ý xuất bản, đã ký số.",
  S7: "Đóng gói lưu chiểu theo quy định.",
};

function nhanChuyen(tu: StateId, den: StateId): string {
  const tien = TRANSITIONS.find((t) => t.tu === tu && t.den === den && t.kieu === "tien");
  if (tien) return tien.nhan;
  const lui = TRANSITIONS.find((t) => t.tu === tu && t.den === den);
  return lui ? lui.nhan : "Chuyển bước";
}

export function taoNhatKyMau(): LogEntry[] {
  const ds: LogEntry[] = [];

  SPECS.forEach((s, idx) => {
    const baiId = "bai-" + (idx + 1);
    const duong = duongDiCua(s);
    const moc = mocChuyenBuoc(s);

    duong.slice(0, -1).forEach((tu, k) => {
      const den = duong[k + 1];
      const lui = PIPELINE.indexOf(den) < PIPELINE.indexOf(tu);
      const gio = moc[k];
      const ghiChu = lui ? (s.lyDoGanNhat ?? "Cần chỉnh lại trước khi duyệt.") : GHI_CHU_BUOC[tu];
      ds.push({
        id: baiId + "-log-" + (k + 1),
        thoiDiem: truoc(gio),
        vaiTro: NGUOI_BAM[tu] ?? "TKTS",
        hanhDong: nhanChuyen(tu, den),
        baiId,
        chiTiet: lui ? 'Lý do: "' + ghiChu + '"' : 'Ghi chú: "' + ghiChu + '"',
        tu,
        den,
        ghiChu,
      });
    });

    // Mỗi lần lưu nội dung cũng là một dòng trong lịch sử, kèm mã phiên bản.
    taoPhienBan(baiId, s).forEach((v, k) => {
      ds.push({
        id: baiId + "-log-pb-" + (k + 1),
        thoiDiem: v.thoiDiem,
        vaiTro: v.tacGia,
        hanhDong: k === 0 ? "Tạo bản thảo" : "Sửa nội dung",
        baiId,
        chiTiet: v.ghiChu,
        phienBan: v.id,
      });
    });

    if (s.fileBanBong) {
      ds.push({
        id: baiId + "-log-file",
        thoiDiem: truoc(s.gioTrongTrangThai + 1),
        vaiTro: "HOA_SI",
        hanhDong: "Tải lên bản bông",
        baiId,
        chiTiet: "Thêm tệp đính kèm " + s.fileBanBong,
      });
    }
  });

  return ds.sort((a, b) => b.thoiDiem.localeCompare(a.thoiDiem));
}
