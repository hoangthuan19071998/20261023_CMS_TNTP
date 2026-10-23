"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPermission, getRole, getState } from "@/lib/permissions";
import { dinhDangGio, dinhDangThoiDiem, quaHan, useStore, vaiTroGiuBai } from "@/lib/store";
import { HopGiaiThich, NhanAnPham, NhanTrangThai, TheQuyen } from "./Bieutuong";
import SoDoQuyTrinh from "./SoDoQuyTrinh";
import ThanhHanhDong from "./ThanhHanhDong";
import BinhLuanNoiBo from "./BinhLuanNoiBo";
import LichSuPhienBan from "./LichSuPhienBan";

export default function ChiTietBai({ baiId }: { baiId: string }) {
  const { bai: tatCa, nhatKy, vaiTro, cheDoGiaiThich, luuNoiDung, themBinhLuan, taiLenBanBong } = useStore();
  const bai = tatCa.find((b) => b.id === baiId);

  const [dangSua, setDangSua] = useState(false);
  const [nhap, setNhap] = useState({ tieuDe: "", sapo: "", than: "" });
  const [yeuCauSua, setYeuCauSua] = useState("");
  const [bayGio, setBayGio] = useState<number | null>(null);

  useEffect(() => setBayGio(Date.now()), []);

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

  // Văn bản bị khóa từ S4 trở đi (đề xuất số 5): có quyền E cũng không sửa được chữ.
  const biKhoa = st.khoaNoiDung;
  const coQuyenSua = quyen.caps.includes("E");
  const suaDuoc = coQuyenSua && !biKhoa;
  const nguoiGiu = vaiTroGiuBai(bai.trangThai);
  const tinhHan = bayGio === null ? null : quaHan(bai, bayGio);

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
    <div className="space-y-5">
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
              <span className="nhan bg-ink-bg text-ink-soft">Tác giả: {bai.tacGia}</span>
              {bai.daKySo && <span className="nhan bg-emerald-100 text-emerald-800">Đã ký số</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 text-right text-xs text-ink-soft">
            <TheQuyen vaiTro={vaiTro} trangThai={bai.trangThai} />
            <span>
              {nguoiGiu.length > 0
                ? "Đang ở: " + nguoiGiu.map((r) => getRole(r).ten).join(" / ")
                : "Không ai phải xử lý"}
            </span>
            <span>Vào trạng thái lúc {dinhDangThoiDiem(bai.vaoTrangThaiLuc)}</span>
            {tinhHan && tinhHan.slaGio !== null && (
              <span className={tinhHan.quaHan ? "font-medium text-rose-700" : ""}>
                {tinhHan.quaHan ? "Quá hạn " : "Đã chờ "}
                {dinhDangGio(tinhHan.gio)} / hạn {tinhHan.slaGio} giờ
              </span>
            )}
          </div>
        </div>

        {bai.lyDoGanNhat && (
          <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <strong>Ghi chú khi chuyển bài:</strong> {bai.lyDoGanNhat}
          </p>
        )}
      </div>

      <SoDoQuyTrinh bai={bai} nhatKy={nhatKy} vaiTro={vaiTro} />

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

      {(quyen.caps.includes("L") || quyen.caps.includes("D") || bai.fileBanBong) && (
        <section className="the p-5">
          <h2 className="mb-3 text-sm font-semibold">File trình bày / bản bông</h2>
          {bai.fileBanBong ? (
            <div className="flex flex-wrap items-center gap-3 rounded border border-ink-line bg-ink-bg/50 px-3 py-2 text-sm">
              <span aria-hidden>📄</span>
              <span className="font-mono text-xs">{bai.fileBanBong}</span>
              {quyen.caps.includes("D") ? (
                <button className="nut-phu ml-auto" onClick={() => alert("Bản demo không có file thật để tải.")}>
                  Tải xuống
                </button>
              ) : (
                <span className="ml-auto text-xs text-ink-soft">Vai trò này không có quyền tải file</span>
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-soft">Chưa có file bản bông nào được tải lên.</p>
          )}

          {quyen.caps.includes("L") && (
            <button
              onClick={() => taiLenBanBong(bai.id, bai.maBai + "_banbong_v" + (bai.phienBan.length + 1) + ".pdf")}
              className="nut-chinh mt-3"
            >
              Tải lên file đã dàn trang (mô phỏng)
            </button>
          )}

          {cheDoGiaiThich && (
            <div className="mt-3">
              <HopGiaiThich>
                Hệ thống chỉ tiếp nhận file PDF do họa sĩ dàn trang bằng phần mềm chuyên dụng rồi tải
                lên — không dàn trang trên web (câu hỏi số 28, cần tòa soạn xác nhận bằng văn bản).
              </HopGiaiThich>
            </div>
          )}
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <BinhLuanNoiBo bai={bai} />
        <LichSuPhienBan bai={bai} />
      </div>
    </div>
  );
}
