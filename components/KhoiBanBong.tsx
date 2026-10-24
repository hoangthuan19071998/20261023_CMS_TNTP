"use client";

// Khối "File trình bày / bản bông": tệp Họa sĩ dàn trang xong và tải lên (quyền L).
// Người có quyền D mới tải xuống được. Dùng chung cho màn hình bài và màn hình của Nhà in.

import { useState } from "react";
import { getPermission } from "@/lib/permissions";
import { useStore } from "@/lib/store";
import { dinhDangDungLuong } from "@/lib/tep";
import { taiXuongTep } from "@/lib/tepStore";
import type { Article } from "@/lib/types";
import { HopGiaiThich } from "./Bieutuong";
import ChonTep from "./ChonTep";

/** Tệp bản bông mới nhất của bài, nếu có tệp thật. */
export function tepBanBongMoiNhat(bai: Article) {
  return [...bai.taiLieu].reverse().find((t) => t.banBong) ?? null;
}

/** Tải bản bông xuống. Trả về lời nhắn nếu không tải được, null nếu đã tải. */
export async function taiBanBong(bai: Article): Promise<string | null> {
  const tep = tepBanBongMoiNhat(bai);
  if (tep && (await taiXuongTep(tep)) === "ok") return null;
  return tep
    ? "Máy chủ không trả được nội dung tệp bản bông."
    : "Đây là tệp mẫu, chỉ có tên chứ chưa có nội dung. Họa sĩ tải một tệp thật lên để thử tải xuống.";
}

export default function KhoiBanBong({ bai }: { bai: Article }) {
  const { vaiTro, cheDoGiaiThich, themTaiLieu } = useStore();
  const [chon, setChon] = useState<File[]>([]);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<string[]>([]);
  const [thongBao, setThongBao] = useState<string | null>(null);

  const quyen = getPermission(vaiTro, bai.trangThai);
  const coL = quyen.caps.includes("L");
  const coD = quyen.caps.includes("D");
  if (!coL && !coD && !bai.fileBanBong) return null;

  const tep = tepBanBongMoiNhat(bai);
  const soBanDaTai = bai.taiLieu.filter((t) => t.banBong).length;

  async function taiLen() {
    if (chon.length === 0) return;
    setDangTai(true);
    setLoi([]);
    setThongBao(null);
    const kq = await themTaiLieu(bai.id, chon, true);
    setDangTai(false);
    setLoi(kq.loi);
    if (kq.soTep > 0) setChon([]);
  }

  async function tai() {
    setThongBao(await taiBanBong(bai));
  }

  return (
    <section className="the p-5">
      <h2 className="mb-3 text-sm font-semibold">File trình bày / bản bông</h2>
      {bai.fileBanBong ? (
        <div className="flex flex-wrap items-center gap-3 rounded border border-ink-line bg-ink-bg/50 px-3 py-2 text-sm">
          <span aria-hidden>📄</span>
          <span className="font-mono text-xs">{bai.fileBanBong}</span>
          {tep && <span className="text-xs text-ink-soft">{dinhDangDungLuong(tep.dungLuong)}</span>}
          {soBanDaTai > 1 && <span className="nhan bg-ink-bg text-ink-soft">{soBanDaTai} bản đã tải lên</span>}
          {coD ? (
            <button className="nut-phu ml-auto" onClick={tai}>
              Tải xuống
            </button>
          ) : (
            <span className="ml-auto text-xs text-ink-soft">Vai trò này không có quyền tải file</span>
          )}
        </div>
      ) : (
        <p className="text-sm text-ink-soft">Chưa có file bản bông nào được tải lên.</p>
      )}

      {thongBao && (
        <p role="status" className="mt-2 rounded bg-ink-bg px-3 py-2 text-xs text-ink-soft">
          {thongBao}
        </p>
      )}

      {coL && (
        <div className="mt-4 space-y-3">
          <ChonTep tep={chon} onDoi={setChon} nhieu={false} khoa={dangTai} nhan="Chọn file bản bông" />
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
            {dangTai ? "Đang tải lên…" : "Tải lên bản bông"}
          </button>
        </div>
      )}

      {cheDoGiaiThich && (
        <div className="mt-3">
          <HopGiaiThich>
            Hệ thống chỉ tiếp nhận file do họa sĩ dàn trang bằng phần mềm chuyên dụng rồi tải lên — không dàn trang
            trên web (câu hỏi số 28, cần tòa soạn xác nhận bằng văn bản). Tải bản mới thì bản mới thay bản đang
            hiện, các bản cũ vẫn nằm trong hồ sơ. Chỉ vai trò có quyền <span className="font-mono">D</span> mới tải xuống được.
          </HopGiaiThich>
        </div>
      )}
    </section>
  );
}
