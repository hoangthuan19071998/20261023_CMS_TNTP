"use client";

import { getPermission, getRole } from "@/lib/permissions";
import { useStore, vaiTroGiuBai } from "@/lib/store";
import type { Article, RoleId, StateId } from "@/lib/types";
import DanhSachBai from "./DanhSachBai";
import { HopGiaiThich } from "./Bieutuong";
import NutDangBai from "./NutDangBai";

interface Khoi {
  tieuDe: string;
  loc: (b: Article, vaiTro: RoleId) => boolean;
  moTaTrong?: string;
}

/**
 * Bài đã xong quy trình (đã lưu trữ hoặc bị loại) không hiện trên bảng điều khiển để màn hình
 * làm việc gọn lại. Bài không bị xóa: vẫn xem được ở Kho bài và trong nhật ký.
 */
const DA_XONG: StateId[] = ["S8", "LOAI_BO"];

function daXong(b: Article): boolean {
  return DA_XONG.includes(b.trangThai);
}

/** Các khối trên bảng điều khiển, bám theo cột "Giao diện hiển thị chính" trong tài liệu khách. */
const KHOI_THEO_VAI_TRO: Record<RoleId, Khoi[]> = {
  PV: [
    { tieuDe: "Đề tài của tôi", loc: (b) => b.trangThai === "S0", moTaTrong: "Chưa có đề tài nào đang chờ duyệt." },
    { tieuDe: "Bài đang viết", loc: (b) => b.trangThai === "S1" && !b.lyDoGanNhat },
    { tieuDe: "Bài bị trả lại", loc: (b) => b.trangThai === "S1" && !!b.lyDoGanNhat, moTaTrong: "Không có bài nào bị trả lại." },
    { tieuDe: "Bài đang đi trong quy trình", loc: (b) => ["S2", "S3", "S4", "S5", "S6"].includes(b.trangThai) },
    { tieuDe: "Bài đã xuất bản", loc: (b) => b.trangThai === "S7" },
  ],
  BTV: [
    { tieuDe: "Đề tài chờ duyệt", loc: (b) => b.trangThai === "S0" },
    { tieuDe: "Kho bài chờ biên tập", loc: (b) => b.trangThai === "S2" },
    { tieuDe: "Bản bông cần soát cùng Thư ký tòa soạn", loc: (b) => b.trangThai === "S5" },
    { tieuDe: "Bài đã chuyển đi", loc: (b) => ["S3", "S4", "S6"].includes(b.trangThai) },
  ],
  TKTS: [
    { tieuDe: "Bài chờ chốt nội dung", loc: (b) => b.trangThai === "S3" },
    { tieuDe: "Bản bông chờ soát", loc: (b) => b.trangThai === "S5" },
    { tieuDe: "Bài đã xuất bản, chờ đưa vào lưu trữ", loc: (b) => b.trangThai === "S7" },
    { tieuDe: "Toàn bộ bài đang chạy", loc: (b) => ["S0", "S1", "S2", "S4", "S6"].includes(b.trangThai) },
  ],
  HOA_SI: [
    { tieuDe: "Kho bài cần trình bày", loc: (b) => b.trangThai === "S4", moTaTrong: "Chưa có bài nào chuyển sang trình bày." },
    { tieuDe: "Bản bông đang được soát", loc: (b) => b.trangThai === "S5" },
    { tieuDe: "Bài đang biên tập — chuẩn bị đặt hàng thiết kế", loc: (b) => ["S2", "S3"].includes(b.trangThai) },
  ],
  TBT: [
    { tieuDe: "Chờ duyệt xuất bản", loc: (b) => b.trangThai === "S6", moTaTrong: "Không có bài nào chờ duyệt." },
    { tieuDe: "Đề nghị đính chính / gỡ bài", loc: (b) => b.trangThai === "DINH_CHINH", moTaTrong: "Không có đề nghị nào." },
    { tieuDe: "Bài đã xuất bản", loc: (b) => b.trangThai === "S7" },
    { tieuDe: "Toàn bộ bài đang chạy", loc: (b) => ["S0", "S1", "S2", "S3", "S4", "S5"].includes(b.trangThai) },
  ],
  NHA_IN: [
    { tieuDe: "Thư mục chờ in ấn", loc: (b) => b.trangThai === "S7" && b.anPham !== "bao_dien_tu", moTaTrong: "Chưa có file nào được duyệt cuối." },
  ],
  ADMIN: [
    { tieuDe: "Toàn bộ bài đang xử lý", loc: () => true },
  ],
};

const GHI_CHU_VAI_TRO: Partial<Record<RoleId, string>> = {
  ADMIN: "Quản trị hệ thống là vai trò đề xuất thêm (số 6). Bảng phân quyền gốc có 6 vai trò, không vai nào tạo được tài khoản hay xem nhật ký.",
  TKTS: "Theo đề xuất số 1, Thư ký tòa soạn là vai trò duy nhất có quyền can thiệp toàn hệ thống. Tài liệu gốc trao quyền này cho cả ba vai (BTV, TKTS, PTBT/TBT).",
  TBT: "PTBT/TBT đăng bài vào thẳng bước chờ duyệt và được sửa trực tiếp nội dung ngay ở bước này, cùng với quyền duyệt và ký số. Mọi lần sửa đều tạo phiên bản mới và ghi nhật ký, nên vẫn biết ai đã sửa gì.",
  HOA_SI: "Theo đề xuất, quyền đặt lịch xuất bản đã chuyển từ Họa sĩ sang Thư ký tòa soạn (số 3). Bù lại, Họa sĩ thấy bài từ bước biên tập để đặt hàng thiết kế chạy song song.",
};

export default function BangDieuKhien() {
  const { vaiTro, bai, cheDoGiaiThich } = useStore();
  const role = getRole(vaiTro);
  const khoi = KHOI_THEO_VAI_TRO[vaiTro];
  const ghiChu = GHI_CHU_VAI_TRO[vaiTro];

  const dangLam = bai.filter((b) => !daXong(b));
  const soViecCho = dangLam.filter((b) => vaiTroGiuBai(b.trangThai).includes(vaiTro)).length;
  const soThayDuoc = dangLam.filter((b) => getPermission(vaiTro, b.trangThai).thayBai).length;

  return (
    <div className="space-y-5">
      <div className="the p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold">Bảng điều khiển — {role.ten}</h1>
            <p className="mt-1 text-sm text-ink-soft">{role.moTa}</p>
          </div>
          <NutDangBai />
        </div>
        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <div>
            <div className="text-2xl font-semibold">{soViecCho}</div>
            <div className="text-xs text-ink-soft">việc đang chờ bạn xử lý</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">{soThayDuoc}</div>
            <div className="text-xs text-ink-soft">trên tổng {dangLam.length} bài đang xử lý mà vai trò này nhìn thấy</div>
          </div>
        </div>
      </div>

      {cheDoGiaiThich && ghiChu && <HopGiaiThich>{ghiChu}</HopGiaiThich>}
      {cheDoGiaiThich && (
        <HopGiaiThich>
          Bài đã lưu trữ (S8) và bài bị loại không hiện trên bảng điều khiển. Bài không bị xóa: vẫn xem
          được ở Kho bài (lọc theo trạng thái) và trong nhật ký.
        </HopGiaiThich>
      )}

      {khoi.map((k) => (
        <DanhSachBai key={k.tieuDe} tieuDe={k.tieuDe} loc={(b) => !daXong(b) && k.loc(b, vaiTro)} moTaTrong={k.moTaTrong} />
      ))}
    </div>
  );
}
