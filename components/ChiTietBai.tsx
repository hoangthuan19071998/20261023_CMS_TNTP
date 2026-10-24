"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPermission, getRole, getState } from "@/lib/permissions";
import { dinhDangGio, dinhDangThoiDiem, quaHan, useArticleQuery, useStore, vaiTroGiuBai } from "@/lib/store";
import { AnhDaiDien, HopGiaiThich, NhanAnPham, NhanTrangThai, TheQuyen } from "./Bieutuong";
import DaiBuoc from "./DaiBuoc";
import ThongTinDuyet from "./ThongTinDuyet";
import LichSuTaiLieu from "./LichSuTaiLieu";
import ThanhHanhDong from "./ThanhHanhDong";
import LichSuPhienBan from "./LichSuPhienBan";
import KhoiBanBong, { taiBanBong } from "./KhoiBanBong";
import TaiLieuDinhKem from "./TaiLieuDinhKem";

/** Một ô trong dải thông tin ngang phía trên nội dung bài. */
function O({ nhan, children }: { nhan: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-1.5 border-l border-ink-line pl-3 first:border-l-0 first:pl-0">
      <span className="whitespace-nowrap text-xs text-ink-soft">{nhan}:</span>
      <span className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium">{children}</span>
    </div>
  );
}

export default function ChiTietBai({ baiId }: { baiId: string }) {
  const { bai: tatCa, nhatKy: nhatKyToanCuc, vaiTro, cheDoGiaiThich, luuNoiDung, themBinhLuan } = useStore();
  const { data: baiChiTiet, isLoading: dangTaiChiTiet } = useArticleQuery(baiId);
  const bai = baiChiTiet || tatCa.find((b) => b.id === baiId);
  const nhatKy = baiChiTiet?.nhatKy && baiChiTiet.nhatKy.length > 0 ? baiChiTiet.nhatKy : nhatKyToanCuc;

  const [dangSua, setDangSua] = useState(false);
  const [nhap, setNhap] = useState({ tieuDe: "", sapo: "", than: "" });
  const [yeuCauSua, setYeuCauSua] = useState("");
  const [bayGio, setBayGio] = useState<number | null>(null);
  const [moLichSu, setMoLichSu] = useState(false);
  const [thongBaoNhaIn, setThongBaoNhaIn] = useState<string | null>(null);

  useEffect(() => setBayGio(Date.now()), []);

  if (dangTaiChiTiet && !bai) {
    return (
      <div className="the p-6">
        <p className="text-sm text-ink-soft">Đang tải dữ liệu bài viết từ máy chủ...</p>
      </div>
    );
  }

  if (!bai) {
    return (
      <div className="the p-6">
        <p className="text-sm">Không tìm thấy bài này. <Link href="/kho-bai" className="underline">Về kho bài</Link>.</p>
      </div>
    );
  }

  const st = getState(bai.trangThai);
  const quyen = getPermission(vaiTro, bai.trangThai);
  const role = getRole(vaiTro);

  if (!quyen.thayBai) {
    return (
      <div className="space-y-4">
        <div className="the p-6">
          <h1 className="text-lg font-semibold">Không có quyền xem bài này</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Theo ma trận phân quyền, vai trò <strong>{role.ten}</strong> không nhìn thấy bài ở trạng
            thái <strong>{st.ten}</strong> (mã trong ma trận: <span className="font-mono">—</span>).
          </p>
          <p className="mt-3 text-sm">
            Đổi vai trò ở thanh phía trên, hoặc <Link href="/kho-bai" className="underline">về kho bài</Link>.
          </p>
        </div>
      </div>
    );
  }

  // Nhà in chỉ có quyền D: xem thông tin giao nhận và tải thành phẩm,
  // không được đọc nội dung, bình luận hay lịch sử nội bộ của bài.
  if (quyen.caps.includes("D") && !quyen.caps.includes("R")) {
    return (
      <div className="space-y-4">
        <div className="text-sm">
          <Link href="/kho-bai" className="text-ink-soft underline underline-offset-2">
            Kho bài
          </Link>
          <span className="mx-2 text-ink-line">/</span>
          <span className="font-mono text-xs text-ink-soft">{bai.maBai}</span>
        </div>
        <section className="the p-5">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold">File thành phẩm giao Nhà in</h1>
              <p className="mt-1 text-sm text-ink-soft">
                {bai.maBai} · {st.ten} · {bai.anPham === "bao_dien_tu" ? "Báo điện tử" : bai.anPham === "bao_in" ? "Báo in" : "In + Điện tử"}
              </p>
            </div>
            <TheQuyen vaiTro={vaiTro} trangThai={bai.trangThai} />
          </div>
          <div className="mt-4 rounded-md border border-ink-line bg-ink-bg/50 p-4">
            {bai.fileBanBong ? (
              <div className="flex flex-wrap items-center gap-3">
                <span aria-hidden>📄</span>
                <span className="font-mono text-sm">{bai.fileBanBong}</span>
                <button
                  className="nut-chinh ml-auto"
                  onClick={async () => setThongBaoNhaIn(await taiBanBong(bai))}
                >
                  Tải file thành phẩm
                </button>
              </div>
            ) : (
              <p className="text-sm text-ink-soft">Chưa có file thành phẩm để tải.</p>
            )}
            {thongBaoNhaIn && (
              <p role="status" className="mt-3 rounded bg-white px-3 py-2 text-xs text-ink-soft">
                {thongBaoNhaIn}
              </p>
            )}
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            Nhà in không có quyền xem nội dung, bình luận hoặc lịch sử nội bộ của bài.
          </p>
        </section>
      </div>
    );
  }

  // Văn bản bị khóa từ S4 trở đi (đề xuất số 5): có quyền E cũng không sửa được chữ.
  const biKhoa = st.khoaNoiDung;
  const coQuyenSua = quyen.caps.includes("E");
  const suaDuoc = coQuyenSua && !biKhoa;
  const nguoiGiu = vaiTroGiuBai(bai.trangThai);
  const tinhHan = bayGio === null ? null : quaHan(bai, bayGio);
  const banCuoi = bai.phienBan[bai.phienBan.length - 1] ?? {
    tenNguoi: bai.tacGia,
    thoiDiem: bai.taoLuc,
  };

  function batDauSua() {
    if (!bai) return;
    setNhap({ tieuDe: bai.tieuDe, sapo: bai.sapo, than: bai.doan.join("\n\n") });
    setDangSua(true);
  }

  function luu() {
    if (!bai) return;
    const doan = nhap.than.split(/\n{2,}/).map((d) => d.trim()).filter(Boolean);
    luuNoiDung(bai.id, doan.length > 0 ? doan : bai.doan, nhap.tieuDe.trim() || bai.tieuDe, nhap.sapo.trim());
    setDangSua(false);
  }

  function guiYeuCauSua() {
    if (!bai || yeuCauSua.trim().length < 5) return;
    themBinhLuan(bai.id, yeuCauSua.trim(), "HOA_SI", null, true);
    setYeuCauSua("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href="/kho-bai" className="text-ink-soft underline underline-offset-2">
          Kho bài
        </Link>
        <span className="text-ink-line">/</span>
        <span className="font-mono text-xs text-ink-soft">{bai.maBai}</span>
      </div>

      <div className="the p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold">{bai.tieuDe}</h1>
            <p className="mt-1.5 text-sm text-ink-soft">{bai.sapo}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <NhanTrangThai trangThai={bai.trangThai} />
              <NhanAnPham anPham={bai.anPham} />
              <span className="nhan bg-ink-bg text-ink-soft">{bai.chuyenMuc}</span>
              {bai.daKySo && <span className="nhan bg-emerald-100 text-emerald-800">Đã ký số</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <TheQuyen vaiTro={vaiTro} trangThai={bai.trangThai} />
            <button onClick={() => setMoLichSu(true)} className="nut-phu">
              Lịch sử bài viết
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 border-t border-ink-line pt-3">
          <O nhan="Trạng thái">{st.ten}</O>
          <O nhan="Đang ở">
            {nguoiGiu.length > 0 ? nguoiGiu.map((r) => getRole(r).ten).join(" / ") : "Không ai phải xử lý"}
          </O>
          <O nhan="Phiên bản">{bai.phienBan.length}</O>
          <O nhan="Người sửa cuối">
            <AnhDaiDien ten={banCuoi.tenNguoi} co={20} />
            {banCuoi.tenNguoi}
          </O>
          <O nhan="Sửa lúc">{dinhDangThoiDiem(banCuoi.thoiDiem)}</O>
          <O nhan="Tác giả">{bai.tacGia}</O>
          {tinhHan && tinhHan.slaGio !== null && (
            <O nhan="Hạn xử lý">
              <span className={tinhHan.quaHan ? "text-rose-700" : ""}>
                {tinhHan.quaHan ? "Quá hạn " : "Đã chờ "}
                {dinhDangGio(tinhHan.gio)} / {tinhHan.slaGio} giờ
              </span>
            </O>
          )}
        </div>

        {bai.lyDoGanNhat && (
          <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <strong>Ghi chú khi chuyển bài:</strong> {bai.lyDoGanNhat}
          </p>
        )}
      </div>

      <DaiBuoc hienTai={bai.trangThai} />

      <div className="grid gap-4 lg:grid-cols-[264px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-4 lg:self-start">
          <ThongTinDuyet bai={bai} nhatKy={nhatKy} bayGio={bayGio} />
        </div>

        <div className="min-w-0 space-y-4">
          <ThanhHanhDong bai={bai} />

          <section className="the p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold">Nội dung bài</h2>
              {biKhoa && (
                <span className="nhan bg-stone-200 text-stone-700" title="Văn bản đã khóa sau khi Thư ký tòa soạn chốt nội dung">
                  🔒 Văn bản đã khóa
                </span>
              )}
              {suaDuoc && !dangSua && (
                <button onClick={batDauSua} className="nut-phu ml-auto">
                  Sửa nội dung
                </button>
              )}
              {dangSua && (
                <div className="ml-auto flex gap-2">
                  <button onClick={() => setDangSua(false)} className="nut-phu">
                    Hủy
                  </button>
                  <button onClick={luu} className="nut-chinh">
                    Lưu phiên bản mới
                  </button>
                </div>
              )}
            </div>

            {st.id === "S6" && coQuyenSua && (
              <p className="mb-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <strong>Bài đã dàn trang xong.</strong> Bạn sửa trực tiếp được ở bước này, nhưng sửa chữ có thể làm vỡ
                ma-két. Mỗi lần lưu tạo một phiên bản mới; nên nhờ Họa sĩ kiểm tra lại bản bông.
              </p>
            )}

            {dangSua ? (
              <div className="space-y-3">
                <input
                  value={nhap.tieuDe}
                  onChange={(e) => setNhap({ ...nhap, tieuDe: e.target.value })}
                  className="w-full rounded border border-ink-line px-3 py-2 text-base font-medium"
                  placeholder="Tiêu đề"
                />
                <textarea
                  value={nhap.sapo}
                  onChange={(e) => setNhap({ ...nhap, sapo: e.target.value })}
                  rows={2}
                  className="w-full rounded border border-ink-line px-3 py-2 text-sm"
                  placeholder="Sa pô"
                />
                <textarea
                  value={nhap.than}
                  onChange={(e) => setNhap({ ...nhap, than: e.target.value })}
                  rows={14}
                  className="w-full rounded border border-ink-line px-3 py-2 text-sm leading-relaxed"
                  placeholder="Thân bài — cách nhau một dòng trống để tách đoạn"
                />
                <p className="text-xs text-ink-soft">
                  Mỗi lần lưu tạo một phiên bản mới trong lịch sử chỉnh sửa, ghi rõ ai sửa và lúc nào.
                </p>
              </div>
            ) : (
              <article className="space-y-3 text-[15px] leading-relaxed">
                {bai.doan.map((d, i) => (
                  <p key={i} className="flex gap-3">
                    <span className="mt-1 shrink-0 font-mono text-xs text-ink-line">{i + 1}</span>
                    <span>{d}</span>
                  </p>
                ))}
              </article>
            )}

            {biKhoa && coQuyenSua && (
              <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3">
                <p className="text-sm font-medium text-amber-900">
                  Văn bản đã khóa — muốn sửa chữ phải tạo yêu cầu sửa
                </p>
                <p className="mt-1 text-xs text-amber-900">
                  Đề xuất số 5: sau khi Thư ký tòa soạn chốt nội dung, mỗi lần sửa chữ là một lần vỡ
                  ma-két. Yêu cầu sửa sẽ được gửi tới Họa sĩ kèm ghi nhận trong nhật ký.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    value={yeuCauSua}
                    onChange={(e) => setYeuCauSua(e.target.value)}
                    className="min-w-0 flex-1 rounded border border-amber-300 px-2 py-1.5 text-sm"
                    placeholder="Nội dung cần sửa, ví dụ: tít phụ đoạn 2 sai tên địa danh."
                  />
                  <button
                    onClick={guiYeuCauSua}
                    disabled={yeuCauSua.trim().length < 5}
                    className={yeuCauSua.trim().length < 5 ? "nut-tat" : "nut-canh-bao"}
                  >
                    Tạo yêu cầu sửa
                  </button>
                </div>
              </div>
            )}

            {!coQuyenSua && cheDoGiaiThich && (
              <div className="mt-4">
                <HopGiaiThich>
                  Vai trò <strong>{role.ten}</strong> không có quyền <span className="font-mono">E</span>{" "}
                  (sửa nội dung) ở trạng thái này, nên nội dung chỉ hiển thị để đọc.
                </HopGiaiThich>
              </div>
            )}
          </section>

          <TaiLieuDinhKem bai={bai} />

          <KhoiBanBong bai={bai} />

          <LichSuPhienBan bai={bai} />
        </div>
      </div>

      {moLichSu && <LichSuTaiLieu bai={bai} nhatKy={nhatKy} onDong={() => setMoLichSu(false)} />}
    </div>
  );
}
