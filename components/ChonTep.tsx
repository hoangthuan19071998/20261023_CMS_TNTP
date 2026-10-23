"use client";

// Ô chọn tệp: bấm để chọn hoặc kéo thả. Kiểm tra loại và dung lượng ngay khi chọn,
// tệp không hợp lệ bị từ chối kèm lý do, tệp hợp lệ nằm chờ trong danh sách đến khi
// người dùng bấm nút tải lên / đăng bài ở nơi gọi.

import { useRef, useState } from "react";
import {
  CHUOI_ACCEPT,
  DUNG_LUONG_TOI_DA,
  MO_TA_DINH_DANG,
  dinhDangDungLuong,
  kiemTraTep,
  loaiTepTuTen,
} from "@/lib/tep";
import { ChipLoaiTep } from "./Bieutuong";

interface Props {
  tep: File[];
  onDoi: (tep: File[]) => void;
  /** false: chỉ một tệp, chọn tệp mới thì thay tệp cũ. */
  nhieu?: boolean;
  khoa?: boolean;
  nhan: string;
}

const khoa_tep = (f: File) => f.name + "|" + f.size + "|" + f.lastModified;

export default function ChonTep({ tep, onDoi, nhieu = true, khoa = false, nhan }: Props) {
  const oChon = useRef<HTMLInputElement>(null);
  const [loi, setLoi] = useState<string[]>([]);
  const [dangKeo, setDangKeo] = useState(false);

  function them(moi: File[]) {
    if (khoa || moi.length === 0) return;
    const tuChoi: string[] = [];
    const hopLe: File[] = [];
    for (const f of moi) {
      const kt = kiemTraTep(f);
      if (kt.ok) hopLe.push(f);
      else tuChoi.push(kt.lyDo);
    }
    setLoi(tuChoi);
    if (hopLe.length === 0) return;
    if (!nhieu) {
      onDoi([hopLe[hopLe.length - 1]]);
      return;
    }
    const daCo = new Set(tep.map(khoa_tep));
    onDoi([...tep, ...hopLe.filter((f) => !daCo.has(khoa_tep(f)))]);
  }

  function bo(f: File) {
    onDoi(tep.filter((x) => x !== f));
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          if (khoa) return;
          e.preventDefault();
          setDangKeo(true);
        }}
        onDragLeave={() => setDangKeo(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDangKeo(false);
          them(Array.from(e.dataTransfer.files));
        }}
        className={
          "rounded-md border border-dashed px-4 py-4 text-center text-sm " +
          (dangKeo ? "border-ink bg-ink-bg" : "border-ink-line bg-ink-bg/40")
        }
      >
        <p>
          Kéo tệp vào đây hoặc{" "}
          <button
            type="button"
            disabled={khoa}
            onClick={() => oChon.current?.click()}
            className="font-medium underline underline-offset-2 disabled:no-underline disabled:opacity-60"
          >
            {nhieu ? "chọn tệp" : "chọn một tệp"}
          </button>
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          {MO_TA_DINH_DANG} · tối đa {dinhDangDungLuong(DUNG_LUONG_TOI_DA)} mỗi tệp
        </p>
        <input
          ref={oChon}
          type="file"
          accept={CHUOI_ACCEPT}
          multiple={nhieu}
          disabled={khoa}
          aria-label={nhan}
          tabIndex={-1}
          className="sr-only"
          onChange={(e) => {
            them(Array.from(e.target.files ?? []));
            // Xóa giá trị để chọn lại đúng tệp vừa bỏ vẫn được.
            e.target.value = "";
          }}
        />
      </div>

      {loi.length > 0 && (
        <ul role="alert" className="mt-2 space-y-1 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {loi.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}

      {tep.length > 0 && (
        <ul className="mt-2 divide-y divide-ink-line rounded border border-ink-line" aria-label="Tệp đã chọn, chờ tải lên">
          {tep.map((f) => {
            const loai = loaiTepTuTen(f.name);
            return (
              <li key={khoa_tep(f)} className="flex items-center gap-2.5 px-3 py-2 text-sm">
                {loai && <ChipLoaiTep loai={loai} />}
                <span className="min-w-0 flex-1 truncate" title={f.name}>
                  {f.name}
                </span>
                <span className="shrink-0 text-xs text-ink-soft">{dinhDangDungLuong(f.size)}</span>
                <button
                  type="button"
                  onClick={() => bo(f)}
                  className="shrink-0 text-lg leading-none text-ink-soft hover:text-rose-700"
                  aria-label={"Bỏ tệp " + f.name}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
