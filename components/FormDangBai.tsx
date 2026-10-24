"use client";

// Màn hình đăng bài. Mỗi vai trò đăng vào đúng vị trí của mình trong quy trình
// (xem DIEM_VAO trong lib/permissions.ts), nên người đăng luôn sửa được bài ngay tại đó.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AN_PHAM, CHUYEN_MUC, LOAI_NOI_DUNG } from "@/lib/danhMuc";
import { ROLES, diemVaoCuaVaiTro, getRole, getState } from "@/lib/permissions";
import { useStore, vaiTroGiuBai } from "@/lib/store";
import type { AnPham, LoaiNoiDung, StateId } from "@/lib/types";
import { HopGiaiThich } from "./Bieutuong";
import ChonTep from "./ChonTep";

const NHAN_BUOC_PV: Partial<Record<StateId, { tieuDe: string; moTa: string }>> = {
  S1: { tieuDe: "Gửi bản thảo", moTa: "Đã viết xong hoặc đang viết, vào thẳng S1 — Bản thảo." },
  S0: { tieuDe: "Đề xuất đề tài", moTa: "Chưa viết bài, chờ Biên tập viên / Trưởng ban duyệt đề tài (S0)." },
};

const O_NHAP = "w-full rounded border border-ink-line bg-white px-3 py-2 text-sm";

export default function FormDangBai() {
  const router = useRouter();
  const { vaiTro, cheDoGiaiThich, dangBai } = useStore();

  const [tieuDe, setTieuDe] = useState("");
  const [sapo, setSapo] = useState("");
  const [than, setThan] = useState("");
  const [chuyenMuc, setChuyenMuc] = useState(CHUYEN_MUC[0]);
  const [loai, setLoai] = useState<LoaiNoiDung>("bai");
  const [anPham, setAnPham] = useState<AnPham>("bao_dien_tu");
  const [tep, setTep] = useState<File[]>([]);
  const [chonBuoc, setChonBuoc] = useState<StateId | null>(null);
  const [dangDang, setDangDang] = useState(false);
  const [loi, setLoi] = useState<string[]>([]);

  const role = getRole(vaiTro);
  const cacBuoc = diemVaoCuaVaiTro(vaiTro);

  if (cacBuoc.length === 0) {
    const duocDang = ROLES.filter((r) => diemVaoCuaVaiTro(r.id).length > 0);
    return (
      <div className="the max-w-3xl p-6">
        <h1 className="text-lg font-semibold">Vai trò này không đăng bài được</h1>
        <p className="mt-2 text-sm text-ink-soft">
          <strong>{role.ten}</strong> không có điểm vào quy trình nào. Đổi vai trò ở thanh phía trên, hoặc{" "}
          <Link href="/kho-bai" className="underline">
            về kho bài
          </Link>
          .
        </p>
        <p className="mt-4 text-sm font-medium">Vai trò đăng được bài, và bước họ đăng vào:</p>
        <ul className="mt-1.5 space-y-1 text-sm text-ink-soft">
          {duocDang.map((r) => (
            <li key={r.id}>
              <strong className="text-ink">{r.ten}</strong> → {getState(diemVaoCuaVaiTro(r.id)[0]).ten}
              {diemVaoCuaVaiTro(r.id).length > 1 && " (hoặc " + getState(diemVaoCuaVaiTro(r.id)[1]).ten + ")"}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const buoc = chonBuoc && cacBuoc.includes(chonBuoc) ? chonBuoc : cacBuoc[0];
  const nguoiGiu = vaiTroGiuBai(buoc).map((r) => getRole(r).ten).join(" / ");
  const canNoiDung = buoc !== "S0";
  const doan = than.split(/\n{2,}/).map((d) => d.trim()).filter(Boolean);
  const hopLe = tieuDe.trim().length >= 5 && (!canNoiDung || doan.length > 0);
  const batDauSom = buoc !== "S0" && buoc !== "S1";

  async function gui(e: React.FormEvent) {
    e.preventDefault();
    if (!hopLe || dangDang) return;
    setDangDang(true);
    setLoi([]);
    const kq = await dangBai({ tieuDe, sapo, doan, chuyenMuc, anPham, loai, buoc }, tep);
    if (kq.id) {
      router.push("/bai-viet/" + kq.id);
      return;
    }
    setDangDang(false);
    setLoi(kq.loi);
  }

  return (
    <form onSubmit={gui} className="max-w-3xl space-y-4" noValidate>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href="/kho-bai" className="text-ink-soft underline underline-offset-2">
          Kho bài
        </Link>
        <span className="text-ink-line">/</span>
        <span className="text-ink-soft">Đăng bài mới</span>
      </div>

      <div className="the p-5">
        <h1 className="text-xl font-semibold">Đăng bài mới</h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Bạn đăng với vai trò <strong className="text-ink">{role.ten}</strong>. Bài sẽ vào{" "}
          <strong className="text-ink">{getState(buoc).ten}</strong>
          {nguoiGiu && <>, người giữ bài: {nguoiGiu}</>}.
        </p>

        {cacBuoc.length > 1 && (
          <fieldset className="mt-4">
            <legend className="text-sm font-medium">Bài bắt đầu từ đâu?</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {cacBuoc.map((b) => (
                <label
                  key={b}
                  className={
                    "flex cursor-pointer gap-2.5 rounded-md border px-3 py-2.5 text-sm " +
                    (b === buoc ? "border-ink bg-ink-bg" : "border-ink-line hover:bg-ink-bg/60")
                  }
                >
                  <input
                    type="radio"
                    name="buoc"
                    value={b}
                    checked={b === buoc}
                    onChange={() => setChonBuoc(b)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium">{NHAN_BUOC_PV[b]?.tieuDe ?? getState(b).ten}</span>
                    <span className="block text-xs text-ink-soft">{NHAN_BUOC_PV[b]?.moTa}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {cheDoGiaiThich && (
          <div className="mt-4 space-y-2">
            <HopGiaiThich>
              Mỗi vai trò đăng bài vào <strong>đúng vị trí của mình</strong>: Phóng viên vào Đề tài hoặc Bản thảo,
              Biên tập viên / Trưởng ban vào Biên tập nội dung, Thư ký tòa soạn vào Chốt nội dung, Phó TBT / TBT vào
              Chờ duyệt xuất bản. Đó cũng là bước họ có quyền <span className="font-mono">E</span> nên sửa được bài ngay tại chỗ.
            </HopGiaiThich>
            {batDauSom && (
              <HopGiaiThich>
                Bài bắt đầu giữa quy trình nên <strong>bỏ qua các bước trước</strong>
                {buoc === "S6" && ", gồm cả biên tập, chốt nội dung và trình bày"}, và người đăng cũng là người giữ bài ở
                bước này. Mọi thao tác vẫn được ghi vào nhật ký. Cần tòa soạn xác nhận có cho phép tự đăng tự duyệt không.
              </HopGiaiThich>
            )}
          </div>
        )}
      </div>

      <div className="the space-y-4 p-5">
        <div>
          <label htmlFor="tieu-de" className="mb-1 block text-sm font-medium">
            Tiêu đề <span className="text-rose-700">*</span>
          </label>
          <input
            id="tieu-de"
            value={tieuDe}
            onChange={(e) => setTieuDe(e.target.value)}
            className={O_NHAP + " text-base font-medium"}
            placeholder="Ít nhất 5 ký tự"
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="sapo" className="mb-1 block text-sm font-medium">
            Sa pô
          </label>
          <textarea id="sapo" value={sapo} onChange={(e) => setSapo(e.target.value)} rows={2} className={O_NHAP} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="chuyen-muc" className="mb-1 block text-sm font-medium">
              Chuyên mục
            </label>
            <select id="chuyen-muc" value={chuyenMuc} onChange={(e) => setChuyenMuc(e.target.value)} className={O_NHAP}>
              {CHUYEN_MUC.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="loai" className="mb-1 block text-sm font-medium">
              Loại nội dung
            </label>
            <select id="loai" value={loai} onChange={(e) => setLoai(e.target.value as LoaiNoiDung)} className={O_NHAP}>
              {LOAI_NOI_DUNG.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nhan}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="an-pham" className="mb-1 block text-sm font-medium">
              Ấn phẩm
            </label>
            <select id="an-pham" value={anPham} onChange={(e) => setAnPham(e.target.value as AnPham)} className={O_NHAP}>
              {AN_PHAM.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nhan}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="noi-dung" className="mb-1 block text-sm font-medium">
            Nội dung {canNoiDung && <span className="text-rose-700">*</span>}
          </label>
          <textarea
            id="noi-dung"
            value={than}
            onChange={(e) => setThan(e.target.value)}
            rows={12}
            className={O_NHAP + " leading-relaxed"}
            placeholder="Thân bài — cách nhau một dòng trống để tách đoạn"
          />
          <p className="mt-1 text-xs text-ink-soft">
            {canNoiDung
              ? "Bắt buộc có ít nhất một đoạn."
              : "Không bắt buộc ở bước đề tài, có thể chỉ ghi đề cương sơ bộ."}{" "}
            Hiện có {doan.length} đoạn.
          </p>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Tài liệu đính kèm</p>
          <ChonTep tep={tep} onDoi={setTep} nhan="Chọn tài liệu đính kèm" khoa={dangDang} />
        </div>
      </div>

      {loi.length > 0 && (
        <ul role="alert" className="space-y-1 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {loi.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {!hopLe && (
          <span className="mr-auto text-xs text-ink-soft">
            {tieuDe.trim().length < 5 ? "Cần tiêu đề ít nhất 5 ký tự." : "Cần ít nhất một đoạn nội dung."}
          </span>
        )}
        <Link href="/kho-bai" className="nut-phu">
          Hủy
        </Link>
        <button type="submit" disabled={!hopLe || dangDang} className={!hopLe || dangDang ? "nut-tat" : "nut-chinh"}>
          {dangDang ? "Đang đăng…" : "Đăng bài"}
        </button>
      </div>
    </form>
  );
}
