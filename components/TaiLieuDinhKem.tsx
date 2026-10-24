"use client";

// Tài liệu đính kèm của bài: PDF, Word, ảnh, ZIP. Ai nhìn thấy bài thì xem và tải được;
// ai sửa được ở bước hiện tại (quyền E hoặc L) thì tải thêm được. Bản bông của Họa sĩ
// nằm riêng ở khối "File trình bày / bản bông", không lẫn vào đây.

import { useEffect, useState } from "react";
import { ROLES, coTheTaiTepLen, coTheXemTaiLieu, getRole, getState } from "@/lib/permissions";
import { dinhDangThoiDiem, useStore } from "@/lib/store";
import { dinhDangDungLuong } from "@/lib/tep";
import { layTep, taiXuongTep } from "@/lib/tepStore";
import type { Article, TaiLieu } from "@/lib/types";
import { AnhDaiDien, ChipLoaiTep, HopGiaiThich } from "./Bieutuong";
import ChonTep from "./ChonTep";

/** Ảnh thu nhỏ cho tệp ảnh, đọc từ máy chủ. Không có nội dung thì không hiện. */
function AnhThu({ tep }: { tep: TaiLieu }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!tep.coNoiDung) return;
    let huy = false;
    let tam: string | null = null;
    layTep(tep.id).then((noiDung) => {
      if (!noiDung || huy) return;
      tam = URL.createObjectURL(noiDung);
      setUrl(tam);
    });
    return () => {
      huy = true;
      if (tam) URL.revokeObjectURL(tam);
    };
  }, [tep.id, tep.coNoiDung]);

  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element -- ảnh tải về dạng blob, next/image không áp dụng được.
  return <img src={url} alt={"Ảnh thu nhỏ " + tep.ten} className="h-10 w-10 shrink-0 rounded border border-ink-line object-cover" />;
}

export default function TaiLieuDinhKem({ bai }: { bai: Article }) {
  const { vaiTro, cheDoGiaiThich, themTaiLieu } = useStore();
  const [chon, setChon] = useState<File[]>([]);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<string[]>([]);
  const [thongBao, setThongBao] = useState<string | null>(null);

  if (!coTheXemTaiLieu(vaiTro, bai.trangThai)) return null;

  const taiDuoc = coTheTaiTepLen(vaiTro, bai.trangThai);
  const ds = bai.taiLieu.filter((t) => !t.banBong);

  async function taiLen() {
    if (chon.length === 0) return;
    setDangTai(true);
    setLoi([]);
    setThongBao(null);
    const kq = await themTaiLieu(bai.id, chon);
    setDangTai(false);
    setLoi(kq.loi);
    if (kq.soTep > 0) {
      setChon([]);
      setThongBao("Đã tải lên " + kq.soTep + " tệp.");
    }
  }

  async function tai(t: TaiLieu) {
    setThongBao(null);
    const kq = await taiXuongTep(t);
    if (kq === "khong_co_noi_dung") {
      setThongBao(
        t.coNoiDung
          ? "Máy chủ không trả được nội dung “" + t.ten + "”."
          : "“" + t.ten + "” là tệp mẫu, chỉ có tên chứ chưa có nội dung. Tải một tệp thật lên để thử tải xuống."
      );
    }
  }

  const nguoiTaiDuoc = ROLES.filter((r) => coTheTaiTepLen(r.id, bai.trangThai)).map((r) => r.ten);

  return (
    <section className="the p-5">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold">Tài liệu đính kèm</h2>
        <span className="nhan bg-ink-bg text-ink-soft">{ds.length} tệp</span>
      </div>

      {ds.length === 0 ? (
        <p className="text-sm text-ink-soft">Bài chưa có tài liệu đính kèm.</p>
      ) : (
        <ul className="divide-y divide-ink-line rounded border border-ink-line" aria-label="Tài liệu đính kèm">
          {ds.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2.5">
              <ChipLoaiTep loai={t.loai} />
              {t.loai === "anh" && <AnhThu tep={t} />}
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 text-sm">
                  <span className="min-w-0 truncate font-medium" title={t.ten}>
                    {t.ten}
                  </span>
                  <span className="shrink-0 text-xs text-ink-soft">{dinhDangDungLuong(t.dungLuong)}</span>
                  {!t.coNoiDung && (
                    <span
                      className="nhan bg-stone-200 text-stone-700"
                      title="Tệp mẫu của dữ liệu khởi tạo, chưa có nội dung"
                    >
                      Chỉ có tên tệp
                    </span>
                  )}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-ink-soft">
                  <AnhDaiDien ten={t.tenNguoi} co={16} />
                  <span>{t.tenNguoi}</span>
                  <span>· {getRole(t.vaiTro).ten}</span>
                  <span>· {dinhDangThoiDiem(t.taiLuc)}</span>
                  <span>· tại {getState(t.buoc).ten.split("—")[0].trim()}</span>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => tai(t)} className="nut-phu" aria-label={"Tải xuống " + t.ten}>
                  Tải xuống
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {thongBao && (
        <p role="status" className="mt-2 rounded bg-ink-bg px-3 py-2 text-xs text-ink-soft">
          {thongBao}
        </p>
      )}

      {taiDuoc && (
        <div className="mt-4 space-y-3">
          <ChonTep tep={chon} onDoi={setChon} nhan="Chọn tài liệu đính kèm" khoa={dangTai} />
          {loi.length > 0 && (
            <ul role="alert" className="space-y-1 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {loi.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={taiLen}
            disabled={chon.length === 0 || dangTai}
            className={chon.length === 0 || dangTai ? "nut-tat" : "nut-chinh"}
          >
            {dangTai ? "Đang tải lên…" : chon.length > 0 ? "Tải lên " + chon.length + " tệp" : "Tải lên"}
          </button>
        </div>
      )}

      {cheDoGiaiThich && (
        <div className="mt-4 space-y-2">
          <HopGiaiThich>
            {taiDuoc ? (
              <>
                Vai trò <strong>{getRole(vaiTro).ten}</strong> có quyền <span className="font-mono">E</span> hoặc{" "}
                <span className="font-mono">L</span> ở {getState(bai.trangThai).ten}, nên tải thêm được tài liệu.
              </>
            ) : (
              <>
                Vai trò <strong>{getRole(vaiTro).ten}</strong> không có quyền <span className="font-mono">E</span> hoặc{" "}
                <span className="font-mono">L</span> ở bước này, nên chỉ xem và tải xuống được, không tải thêm.
              </>
            )}{" "}
            Ở bước này tải lên được: {nguoiTaiDuoc.length > 0 ? nguoiTaiDuoc.join(", ") : "không vai trò nào"}.
          </HopGiaiThich>
          <HopGiaiThich>
            Nhận PDF, Word, ảnh và ZIP. Bản demo chỉ kiểm tra đuôi tệp và dung lượng; hệ thống thật cần kiểm tra
            nội dung bên trong và quét mã độc, nhất là với tệp ZIP.
          </HopGiaiThich>
        </div>
      )}
    </section>
  );
}
