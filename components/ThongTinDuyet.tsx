"use client";

// Cột "Thông tin duyệt": dòng thời gian bài đã đi qua tay những ai, mỗi mốc ghi
// rõ hành động, người thực hiện, thời điểm và ghi chú họ để lại. Mốc cuối cùng
// là bước đang chờ, nêu tên người đang giữ bài.

import { PIPELINE, getRole, getState } from "@/lib/permissions";
import { dinhDangGio, dinhDangThoiDiem, quaHan, vaiTroGiuBai } from "@/lib/store";
import type { Article, LogEntry } from "@/lib/types";
import { AnhDaiDien } from "./Bieutuong";

type Loai = "tien" | "lui" | "loai" | "nhanh" | "cho";

function loaiMoc(e: LogEntry): Loai {
  if (!e.tu || !e.den) return "nhanh";
  if (e.den === "LOAI_BO") return "loai";
  if (e.den === "DINH_CHINH" || e.tu === "DINH_CHINH" || e.tu === "LOAI_BO") return "nhanh";
  const a = PIPELINE.indexOf(e.tu);
  const b = PIPELINE.indexOf(e.den);
  if (a >= 0 && b >= 0 && b < a) return "lui";
  return "tien";
}

function Dau({ loai }: { loai: Loai }) {
  const chung = "relative z-10 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold leading-none";
  if (loai === "tien") return <span className={chung + " bg-emerald-600 text-white"} aria-hidden>✓</span>;
  if (loai === "lui") return <span className={chung + " bg-rose-600 text-white"} aria-hidden>✕</span>;
  if (loai === "loai") return <span className={chung + " bg-gray-400 text-white"} aria-hidden>✕</span>;
  if (loai === "cho")
    return <span className={chung + " border-2 border-amber-500 bg-white text-transparent"} aria-hidden>•</span>;
  return <span className={chung + " bg-sky-600 text-white"} aria-hidden>→</span>;
}

const CHU_LOAI: Record<Loai, string> = {
  tien: "text-emerald-700",
  lui: "text-rose-700",
  loai: "text-gray-600",
  nhanh: "text-sky-700",
  cho: "text-amber-700",
};

function Moc({
  loai,
  nhan,
  nguoi,
  thoiDiem,
  ghiChu,
  cuoi,
}: {
  loai: Loai;
  nhan: string;
  /** Một người đã xử lý, hoặc nhiều người cùng được quyền xử lý bước đang chờ. */
  nguoi: { ten: string; vaiTro: string }[];
  thoiDiem: string | null;
  ghiChu: string | null;
  cuoi: boolean;
}) {
  return (
    <li className="relative pl-6">
      {!cuoi && <span className="absolute left-[8px] top-[18px] h-full w-px bg-ink-line" aria-hidden />}
      <span className="absolute left-0 top-0">
        <Dau loai={loai} />
      </span>
      <p className={"text-[13px] font-semibold leading-tight " + CHU_LOAI[loai]}>{nhan}</p>
      {nguoi.map((n) => (
        <div key={n.ten} className="mt-1.5 flex items-center gap-1.5">
          <AnhDaiDien ten={n.ten} co={22} />
          <span className="min-w-0 text-[13px] leading-tight">
            <span className="block truncate font-medium">{n.ten}</span>
            <span className="block truncate text-[11px] text-ink-soft">{n.vaiTro}</span>
          </span>
        </div>
      ))}
      {thoiDiem && <p className="mt-1 text-[11px] text-ink-soft">{thoiDiem}</p>}
      {ghiChu && <p className="mt-1 pb-4 text-[12px] italic leading-snug text-ink-soft">{ghiChu}</p>}
      {!ghiChu && <div className="pb-4" />}
    </li>
  );
}

export default function ThongTinDuyet({
  bai,
  nhatKy,
  bayGio,
}: {
  bai: Article;
  nhatKy: LogEntry[];
  bayGio: number | null;
}) {
  const moc = nhatKy
    .filter((e) => e.baiId === bai.id && e.tu && e.den)
    .slice()
    .sort((a, b) => a.thoiDiem.localeCompare(b.thoiDiem));

  const dangGiu = vaiTroGiuBai(bai.trangThai);
  const st = getState(bai.trangThai);
  const han = bayGio === null ? null : quaHan(bai, bayGio);

  return (
    <section className="the p-4">
      <h2 className="mb-3 text-sm font-semibold">Thông tin duyệt</h2>

      {moc.length === 0 && dangGiu.length === 0 && (
        <p className="text-xs text-ink-soft">Bài chưa qua bước duyệt nào.</p>
      )}

      <ol>
        {moc.map((e) => (
          <Moc
            key={e.id}
            loai={loaiMoc(e)}
            nhan={e.hanhDong}
            nguoi={[{ ten: e.tenNguoi ?? getRole(e.vaiTro).nguoiDung, vaiTro: getRole(e.vaiTro).ten }]}
            thoiDiem={dinhDangThoiDiem(e.thoiDiem)}
            ghiChu={e.ghiChu ? "“" + e.ghiChu + "”" : null}
            cuoi={false}
          />
        ))}

        {dangGiu.length > 0 && (
          <Moc
            loai="cho"
            nhan="Chờ xử lý"
            nguoi={dangGiu.map((v) => ({ ten: getRole(v).nguoiDung, vaiTro: getRole(v).ten }))}
            thoiDiem={
              han && han.slaGio !== null
                ? (han.quaHan ? "Quá hạn " : "Đã chờ ") + dinhDangGio(han.gio) + " / hạn " + han.slaGio + " giờ"
                : "Đang ở " + st.ten
            }
            ghiChu={null}
            cuoi
          />
        )}
      </ol>

      {han && han.quaHan && (
        <p className="rounded bg-rose-50 px-2.5 py-1.5 text-[11px] text-rose-800">
          Bước này đã vượt hạn xử lý {st.slaGio} giờ.
        </p>
      )}
    </section>
  );
}
