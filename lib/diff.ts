import { diffWordsWithSpace, type Change } from "diff";

export interface SnapshotNoiDung {
  tieuDe: string;
  sapo: string;
  doan: string[];
}

export interface KetQuaDiff {
  tieuDe: Change[];
  sapo: Change[];
  than: Change[];
  thongKe: {
    soTuThem: number;
    soTuXoa: number;
  };
}

function demTu(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function tinhThongKe(ds: Change[]): { soTuThem: number; soTuXoa: number } {
  let soTuThem = 0;
  let soTuXoa = 0;
  for (const c of ds) {
    if (c.added) {
      soTuThem += demTu(c.value);
    } else if (c.removed) {
      soTuXoa += demTu(c.value);
    }
  }
  return { soTuThem, soTuXoa };
}

export function soSanhHaiSnapshot(
  cu: SnapshotNoiDung | null,
  moi: SnapshotNoiDung
): KetQuaDiff {
  const tieuDeCu = cu ? cu.tieuDe : "";
  const sapoCu = cu ? cu.sapo : "";
  const thanCu = cu ? (cu.doan || []).join("\n\n") : "";

  const tieuDeMoi = moi.tieuDe || "";
  const sapoMoi = moi.sapo || "";
  const thanMoi = (moi.doan || []).join("\n\n");

  const diffTieuDe = diffWordsWithSpace(tieuDeCu, tieuDeMoi);
  const diffSapo = diffWordsWithSpace(sapoCu, sapoMoi);
  const diffThan = diffWordsWithSpace(thanCu, thanMoi);

  const tk1 = tinhThongKe(diffTieuDe);
  const tk2 = tinhThongKe(diffSapo);
  const tk3 = tinhThongKe(diffThan);

  return {
    tieuDe: diffTieuDe,
    sapo: diffSapo,
    than: diffThan,
    thongKe: {
      soTuThem: tk1.soTuThem + tk2.soTuThem + tk3.soTuThem,
      soTuXoa: tk1.soTuXoa + tk2.soTuXoa + tk3.soTuXoa,
    },
  };
}
