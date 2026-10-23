"use client";

// Sơ đồ cây quy trình, vẽ bằng SVG. Trục chính chạy dọc S0 → S8, nhánh trả lại
// nằm bên trái, nhánh loại bài và đính chính nằm bên phải. Bấm vào một nút để
// xem trạng thái đó ai giữ bài, vai trò hiện tại có quyền gì và đi tiếp được đâu.

import { useState } from "react";
import {
  CAP_LABEL,
  PIPELINE,
  TRANSITIONS,
  getAllTransitions,
  getPermission,
  getRole,
  getState,
} from "@/lib/permissions";
import { vaiTroGiuBai } from "@/lib/store";
import type { Article, LogEntry, RoleId, StateId } from "@/lib/types";
import { HopGiaiThich } from "./Bieutuong";

// --- Hình học --------------------------------------------------------------

const NODE_W = 210;
const NODE_H = 46;
const ROW_H = 72;
const TOP = 24;
const COL_X = 90; // lề trái của cột trục chính
const COL_R = COL_X + NODE_W; // lề phải của cột trục chính
const RAIL_X = 390; // đường gom "loại bài"
const BR_X = 470; // lề trái của cột nhánh phụ
const BR_W = 190;
const BR_R = BR_X + BR_W;
const KHOI_PHUC_X = 706;
const VIEW_W = 744;
const VIEW_H = 666;

const hangY = (i: number) => TOP + i * ROW_H;
const tamY = (i: number) => hangY(i) + NODE_H / 2;

const LOAI_BO_Y = tamY(4) - NODE_H / 2;
const DINH_CHINH_Y = tamY(7) - NODE_H / 2;

// --- Màu, lấy đúng bảng màu Tailwind đang dùng trong dự án ------------------

const MAU = {
  ink: "#1C3554",
  inkSoft: "#45586F",
  inkLine: "#D9DDE2",
  inkBg: "#F4F6F8",
  emeraldNen: "#D1FAE5",
  emeraldVien: "#059669",
  emeraldChu: "#065F46",
  roseNen: "#FFF1F2",
  roseVien: "#FDA4AF",
  roseChu: "#9F1239",
  amberNen: "#FEF3C7",
  amberVien: "#D97706",
  amberChu: "#78350F",
  xam: "#9CA3AF",
};

// --- Tiện ích --------------------------------------------------------------

/** "S1 — Bản thảo" → "Bản thảo" */
function tenNgan(id: StateId): string {
  const ten = getState(id).ten;
  const i = ten.indexOf("—");
  return i >= 0 ? ten.slice(i + 1).trim() : ten;
}

function catChu(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";
}

function nhanChuyenTiep(tu: StateId, den: StateId): string {
  const t = TRANSITIONS.find((x) => x.tu === tu && x.den === den && x.kieu === "tien");
  return t ? t.nhan : "";
}

function dongNguoiGiu(id: StateId): string {
  const vai = vaiTroGiuBai(id).map((v) => getRole(v).vietTat);
  const sla = getState(id).slaGio;
  if (vai.length === 0) return "Không ai phải xử lý";
  const phan = [vai.join(" / ")];
  if (sla !== null) phan.push("hạn " + sla + "h");
  return phan.join(" · ");
}

/** Những cạnh bài này đã thực sự đi qua, đọc từ nhật ký lưu vết. */
function canhDaDiQua(nhatKy: LogEntry[], baiId: string): Set<string> {
  const ds = new Set<string>();
  nhatKy.forEach((e) => {
    if (e.baiId === baiId && e.tu && e.den) ds.add(e.tu + ">" + e.den);
  });
  return ds;
}

// --- Các mảnh SVG ----------------------------------------------------------

type TrangThaiNut = "daQua" | "dangO" | "chuaToi" | "nhanhPhu";

function Nut({
  id,
  x,
  y,
  w,
  tinhTrang,
  chon,
  dong2,
  onChon,
}: {
  id: StateId;
  x: number;
  y: number;
  w: number;
  tinhTrang: TrangThaiNut;
  chon: boolean;
  dong2: string;
  onChon: () => void;
}) {
  const nen =
    tinhTrang === "dangO"
      ? MAU.ink
      : tinhTrang === "daQua"
        ? MAU.emeraldNen
        : tinhTrang === "nhanhPhu"
          ? MAU.roseNen
          : "#FFFFFF";
  const vien =
    tinhTrang === "dangO"
      ? MAU.ink
      : tinhTrang === "daQua"
        ? MAU.emeraldVien
        : tinhTrang === "nhanhPhu"
          ? MAU.roseVien
          : MAU.inkLine;
  const chu =
    tinhTrang === "dangO"
      ? "#FFFFFF"
      : tinhTrang === "daQua"
        ? MAU.emeraldChu
        : tinhTrang === "nhanhPhu"
          ? MAU.roseChu
          : MAU.ink;
  const chuPhu = tinhTrang === "dangO" ? "#C7D2E4" : MAU.inkSoft;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={getState(id).ten + ". " + dong2}
      onClick={onChon}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChon();
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <title>{getState(id).dienGiai}</title>
      {chon && (
        <rect
          x={x - 4}
          y={y - 4}
          width={w + 8}
          height={NODE_H + 8}
          rx={10}
          fill="none"
          stroke={MAU.amberVien}
          strokeWidth={2}
        />
      )}
      <rect
        x={x}
        y={y}
        width={w}
        height={NODE_H}
        rx={7}
        fill={nen}
        stroke={vien}
        strokeWidth={tinhTrang === "dangO" ? 2 : 1.25}
        strokeDasharray={tinhTrang === "nhanhPhu" ? "5 3" : undefined}
      />
      <text x={x + 12} y={y + 19} fontSize={12} fontWeight={600} fill={chu}>
        {id.startsWith("S") ? id + " · " + catChu(tenNgan(id), 22) : catChu(tenNgan(id), 26)}
      </text>
      <text x={x + 12} y={y + 35} fontSize={10} fill={chuPhu}>
        {dong2}
      </text>
    </g>
  );
}

function NhanCanh({
  x,
  y,
  children,
  mau = MAU.inkSoft,
  doc = false,
  neo = "start",
}: {
  x: number;
  y: number;
  children: string;
  mau?: string;
  doc?: boolean;
  neo?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={9}
      fill={mau}
      textAnchor={neo}
      transform={doc ? `rotate(-90 ${x} ${y})` : undefined}
    >
      {children}
    </text>
  );
}

// --- Thành phần chính ------------------------------------------------------

export default function SoDoQuyTrinh({
  bai,
  nhatKy,
  vaiTro,
}: {
  bai: Article;
  nhatKy: LogEntry[];
  vaiTro: RoleId;
}) {
  const [dangChon, setDangChon] = useState<StateId>(bai.trangThai);

  const viTri = PIPELINE.indexOf(bai.trangThai);
  const daDiQua = canhDaDiQua(nhatKy, bai.id);

  function tinhTrangNut(id: StateId, i: number | null): TrangThaiNut {
    if (id === bai.trangThai) return "dangO";
    if (getState(id).nhanhPhu) return "nhanhPhu";
    if (i !== null && viTri >= 0 && i < viTri) return "daQua";
    return "chuaToi";
  }

  function mauCanh(tu: StateId, den: StateId, mauMacDinh: string) {
    const qua = daDiQua.has(tu + ">" + den);
    return { stroke: qua ? MAU.emeraldVien : mauMacDinh, strokeWidth: qua ? 2.4 : 1.4 };
  }

  // Nhánh trả lại, vẽ vòng bên trái trục chính.
  const traLai: { tu: number; den: number; sau: number; nhan: string }[] = [
    { tu: 2, den: 1, sau: 18, nhan: "Trả lại PV" },
    { tu: 3, den: 2, sau: 18, nhan: "Trả lại BTV" },
    { tu: 5, den: 4, sau: 18, nhan: "Sửa trình bày" },
    { tu: 6, den: 2, sau: 50, nhan: "Trả bài, chọn đích S1–S4" },
  ];

  const st = getState(dangChon);
  const quyen = getPermission(vaiTro, dangChon);
  const nguoiGiu = vaiTroGiuBai(dangChon);
  const hanhDong = getAllTransitions(dangChon);

  return (
    <div className="the p-4">
      <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-sm font-semibold">Sơ đồ quy trình</h2>
        <p className="text-xs text-ink-soft">
          Bấm vào một bước để xem bước đó ai giữ bài và vai trò của bạn làm được gì.
        </p>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-ink" /> bài đang ở đây
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-emerald-600 bg-emerald-100" /> đã qua
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-ink-line bg-white" /> chưa tới
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-dashed border-rose-300 bg-rose-50" /> nhánh phụ
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 bg-emerald-600" /> đường bài này đã đi
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="min-w-[700px] max-w-full"
          role="img"
          aria-label={
            "Sơ đồ quy trình toà soạn, 9 bước chính từ S0 đến S8 kèm nhánh trả lại, loại bài và đính chính. Bài đang ở " +
            st.ten
          }
        >
          <defs>
            <marker id="mui-ink" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill={MAU.inkSoft} />
            </marker>
            <marker id="mui-xanh" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill={MAU.emeraldVien} />
            </marker>
            <marker id="mui-hong" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill={MAU.roseChu} />
            </marker>
            <marker id="mui-cam" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill={MAU.amberVien} />
            </marker>
          </defs>

          {/* Đường gom nhánh loại bài: gom từ S0 đến S6 */}
          <g>
            {PIPELINE.slice(0, 7).map((s, i) => (
              <line
                key={"stub-" + s}
                x1={COL_R}
                y1={tamY(i)}
                x2={RAIL_X}
                y2={tamY(i)}
                stroke={MAU.xam}
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            ))}
            <line
              x1={RAIL_X}
              y1={tamY(0)}
              x2={RAIL_X}
              y2={tamY(6)}
              stroke={MAU.xam}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <line
              x1={RAIL_X}
              y1={tamY(4)}
              x2={BR_X}
              y2={tamY(4)}
              stroke={MAU.roseChu}
              strokeWidth={1.4}
              markerEnd="url(#mui-hong)"
            />
            <NhanCanh x={RAIL_X + 10} y={tamY(4) - 6} mau={MAU.roseChu}>
              Loại bài
            </NhanCanh>
          </g>

          {/* Trục chính: 8 cạnh đi tiếp */}
          {PIPELINE.slice(0, 8).map((s, i) => {
            const den = PIPELINE[i + 1];
            const net = mauCanh(s, den, MAU.inkSoft);
            return (
              <g key={"tien-" + s}>
                <line
                  x1={COL_X + NODE_W / 2}
                  y1={hangY(i) + NODE_H}
                  x2={COL_X + NODE_W / 2}
                  y2={hangY(i + 1)}
                  stroke={net.stroke}
                  strokeWidth={net.strokeWidth}
                  markerEnd={net.stroke === MAU.emeraldVien ? "url(#mui-xanh)" : "url(#mui-ink)"}
                />
                <NhanCanh x={COL_X + NODE_W / 2 + 10} y={hangY(i) + NODE_H + 17}>
                  {catChu(nhanChuyenTiep(s, den), 36)}
                </NhanCanh>
              </g>
            );
          })}

          {/* Nhánh trả lại, vòng bên trái */}
          {traLai.map((c) => {
            const y0 = tamY(c.tu) + 10;
            const y1 = tamY(c.den) - 10;
            const xd = COL_X - c.sau;
            const tu = PIPELINE[c.tu];
            const den = PIPELINE[c.den];
            const net = mauCanh(tu, den, MAU.amberVien);
            return (
              <g key={"tra-" + c.tu + "-" + c.den}>
                <path
                  d={`M ${COL_X} ${y0} L ${xd + 8} ${y0} Q ${xd} ${y0} ${xd} ${y0 - 8} L ${xd} ${y1 + 8} Q ${xd} ${y1} ${xd + 8} ${y1} L ${COL_X} ${y1}`}
                  fill="none"
                  stroke={net.stroke}
                  strokeWidth={net.strokeWidth}
                  strokeDasharray="4 3"
                  markerEnd={net.stroke === MAU.emeraldVien ? "url(#mui-xanh)" : "url(#mui-cam)"}
                />
                <NhanCanh x={xd + 11} y={(y0 + y1) / 2} mau={MAU.amberChu} doc neo="middle">
                  {c.nhan}
                </NhanCanh>
              </g>
            );
          })}

          {/* Nhánh đính chính, hai chiều với S7 */}
          <g>
            <line
              x1={COL_R}
              y1={tamY(7) - 8}
              x2={BR_X}
              y2={tamY(7) - 8}
              stroke={MAU.roseChu}
              strokeWidth={mauCanh("S7", "DINH_CHINH", MAU.roseChu).strokeWidth}
              markerEnd="url(#mui-hong)"
            />
            <NhanCanh x={COL_R + 8} y={tamY(7) - 14} mau={MAU.roseChu}>
              Đề nghị đính chính
            </NhanCanh>
            <line
              x1={BR_X}
              y1={tamY(7) + 10}
              x2={COL_R}
              y2={tamY(7) + 10}
              stroke={MAU.roseChu}
              strokeWidth={mauCanh("DINH_CHINH", "S7", MAU.roseChu).strokeWidth}
              markerEnd="url(#mui-hong)"
            />
            <NhanCanh x={COL_R + 8} y={tamY(7) + 24} mau={MAU.roseChu}>
              Duyệt đính chính / rút
            </NhanCanh>
            <line
              x1={BR_X + BR_W / 2}
              y1={DINH_CHINH_Y}
              x2={BR_X + BR_W / 2}
              y2={LOAI_BO_Y + NODE_H}
              stroke={MAU.roseChu}
              strokeWidth={mauCanh("DINH_CHINH", "LOAI_BO", MAU.roseChu).strokeWidth}
              strokeDasharray="4 3"
              markerEnd="url(#mui-hong)"
            />
            <NhanCanh x={BR_X + BR_W / 2 - 7} y={(DINH_CHINH_Y + LOAI_BO_Y + NODE_H) / 2} mau={MAU.roseChu} doc neo="middle">
              Gỡ bài khỏi trang
            </NhanCanh>
          </g>

          {/* Khôi phục bài bị loại về bản thảo */}
          <g>
            <path
              d={`M ${BR_R} ${tamY(4)} L ${KHOI_PHUC_X - 8} ${tamY(4)} Q ${KHOI_PHUC_X} ${tamY(4)} ${KHOI_PHUC_X} ${tamY(4) - 8} L ${KHOI_PHUC_X} ${hangY(1) + 42} Q ${KHOI_PHUC_X} ${hangY(1) + 34} ${KHOI_PHUC_X - 8} ${hangY(1) + 34} L ${COL_R} ${hangY(1) + 34}`}
              fill="none"
              stroke={MAU.xam}
              strokeWidth={mauCanh("LOAI_BO", "S1", MAU.xam).strokeWidth}
              strokeDasharray="4 3"
              markerEnd="url(#mui-ink)"
            />
            <NhanCanh x={KHOI_PHUC_X + 12} y={(tamY(4) + hangY(1) + 34) / 2} mau={MAU.inkSoft} doc neo="middle">
              Khôi phục về bản thảo
            </NhanCanh>
          </g>

          {/* Các nút trục chính */}
          {PIPELINE.map((s, i) => (
            <Nut
              key={s}
              id={s}
              x={COL_X}
              y={hangY(i)}
              w={NODE_W}
              tinhTrang={tinhTrangNut(s, i)}
              chon={dangChon === s}
              dong2={dongNguoiGiu(s)}
              onChon={() => setDangChon(s)}
            />
          ))}

          {/* Các nút nhánh phụ */}
          <Nut
            id="LOAI_BO"
            x={BR_X}
            y={LOAI_BO_Y}
            w={BR_W}
            tinhTrang={tinhTrangNut("LOAI_BO", null)}
            chon={dangChon === "LOAI_BO"}
            dong2="Kho tồn, không xoá bài"
            onChon={() => setDangChon("LOAI_BO")}
          />
          <Nut
            id="DINH_CHINH"
            x={BR_X}
            y={DINH_CHINH_Y}
            w={BR_W}
            tinhTrang={tinhTrangNut("DINH_CHINH", null)}
            chon={dangChon === "DINH_CHINH"}
            dong2={dongNguoiGiu("DINH_CHINH")}
            onChon={() => setDangChon("DINH_CHINH")}
          />
        </svg>
      </div>

      {/* Chi tiết bước đang chọn */}
      <div className="mt-4 rounded-md border border-ink-line bg-ink-bg/60 p-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-sm font-semibold">{st.ten}</h3>
          {dangChon === bai.trangThai && (
            <span className="nhan bg-ink text-white">Bài đang ở bước này</span>
          )}
          <span className="ml-auto font-mono text-xs text-ink-soft" title="Mã trong ma trận phân quyền">
            {getRole(vaiTro).vietTat}: {quyen.ma}
          </span>
        </div>

        <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{st.dienGiai}</p>

        <dl className="mt-3 grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-medium">Ai giữ bài</dt>
            <dd className="text-ink-soft">
              {nguoiGiu.length > 0 ? nguoiGiu.map((v) => getRole(v).ten).join(" / ") : "Không ai phải xử lý"}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Hạn xử lý</dt>
            <dd className="text-ink-soft">{st.slaGio === null ? "Không áp hạn" : st.slaGio + " giờ"}</dd>
          </div>
          <div>
            <dt className="font-medium">Văn bản</dt>
            <dd className="text-ink-soft">{st.khoaNoiDung ? "Đã khóa, sửa chữ phải tạo yêu cầu sửa" : "Còn sửa được"}</dd>
          </div>
          <div>
            <dt className="font-medium">Quyền của {getRole(vaiTro).ten}</dt>
            <dd className="text-ink-soft">
              {quyen.caps.length > 0
                ? quyen.caps.map((c) => CAP_LABEL[c]).join(" · ")
                : "Không nhìn thấy bài ở bước này"}
            </dd>
          </div>
        </dl>

        <div className="mt-3">
          <p className="text-xs font-medium">Đi tiếp được đâu</p>
          <ul className="mt-1.5 space-y-1 text-xs text-ink-soft">
            {hanhDong.length === 0 && <li>Bước cuối, bài không đi đâu nữa.</li>}
            {hanhDong.map((t) => {
              const duocBam = t.vaiTro.includes(vaiTro);
              return (
                <li key={t.id} className="flex flex-wrap items-baseline gap-x-2">
                  <span className={duocBam ? "font-medium text-ink" : ""}>{t.nhan}</span>
                  <span className="text-ink-line">→</span>
                  <span>{t.den.startsWith("S") ? t.den + " · " + tenNgan(t.den) : tenNgan(t.den)}</span>
                  <span className="text-[11px]">
                    ({t.vaiTro.map((v) => getRole(v).vietTat).join(", ")}
                    {duocBam ? " — gồm vai trò của bạn" : ""})
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {st.nhanhPhu && (
          <div className="mt-3">
            <HopGiaiThich>
              Đây là nhánh phụ, nằm ngoài đường ống chính. Bài vào nhánh này không bị xoá — bản gốc
              vẫn giữ nguyên trong nhật ký lưu vết.
            </HopGiaiThich>
          </div>
        )}
      </div>
    </div>
  );
}
