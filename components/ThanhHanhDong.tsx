"use client";

import { useState } from "react";
import type { Transition } from "@/lib/permissions";
import { getAllTransitions, getPermission, getRole, getState, getTransitions } from "@/lib/permissions";
import { useStore } from "@/lib/store";
import type { Article, StateId } from "@/lib/types";
import { HopGiaiThich } from "./Bieutuong";

export default function ThanhHanhDong({ bai }: { bai: Article }) {
  const { vaiTro, cheDoGiaiThich, chuyenTrangThai } = useStore();
  const [dangMo, setDangMo] = useState<Transition | null>(null);
  const [lyDo, setLyDo] = useState("");
  const [dich, setDich] = useState<StateId | null>(null);

  const quyen = getPermission(vaiTro, bai.trangThai);
  const duocLam = getTransitions(bai.trangThai, vaiTro);
  const tatCa = getAllTransitions(bai.trangThai);
  const khongDuocLam = tatCa.filter((t) => !duocLam.some((d) => d.id === t.id));

  function moHopThoai(t: Transition) {
    setDangMo(t);
    setLyDo("");
    setDich(t.chonDich ? t.chonDich[0] : null);
  }

  function xacNhan() {
    if (!dangMo) return;
    const den = dangMo.chonDich && dich ? dich : dangMo.den;
    chuyenTrangThai(bai.id, den, dangMo.nhan, lyDo.trim() || null, !!dangMo.kySo);
    setDangMo(null);
  }

  const canLyDo = dangMo?.batBuocLyDo && lyDo.trim().length < 5;

  return (
    <section className="the p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold">Hành động</h2>
        <span className="nhan bg-ink-bg font-mono text-ink-soft" title="Mã quyền trong ma trận">
          {quyen.ma}
        </span>
        {quyen.dangGiuBai && (
          <span className="nhan bg-amber-200 text-amber-950">Vai trò này đang giữ bài</span>
        )}
      </div>

      {duocLam.length === 0 && khongDuocLam.length === 0 && (
        <p className="text-sm text-ink-soft">Trạng thái này không còn hành động nào.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {duocLam.map((t) => (
          <button
            key={t.id}
            onClick={() => moHopThoai(t)}
            className={
              t.kieu === "tien" ? "nut-chinh" : t.kieu === "tra_lai" ? "nut-canh-bao" : "nut-phu"
            }
            title={t.giaiThich}
          >
            {t.kySo && <span aria-hidden>🔏</span>}
            {t.nhan}
          </button>
        ))}

        {cheDoGiaiThich &&
          khongDuocLam.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled
              className="nut-tat"
              title={
                "Chỉ các vai trò sau làm được: " +
                t.vaiTro.map((v) => getRole(v).ten).join(", ")
              }
            >
              {t.nhan}
            </button>
          ))}
      </div>

      {cheDoGiaiThich && khongDuocLam.length > 0 && (
        <div className="mt-3">
          <HopGiaiThich>
            Nút mờ là hành động có ở trạng thái này nhưng <strong>{getRole(vaiTro).ten}</strong> không
            được phép thực hiện. Di chuột lên nút để xem vai trò nào làm được.
          </HopGiaiThich>
        </div>
      )}

      {cheDoGiaiThich && duocLam.some((t) => t.giaiThich) && (
        <div className="mt-3 space-y-2">
          {duocLam
            .filter((t) => t.giaiThich)
            .map((t) => (
              <HopGiaiThich key={t.id}>
                <strong>{t.nhan}:</strong> {t.giaiThich}
              </HopGiaiThich>
            ))}
        </div>
      )}

      {dangMo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold">{dangMo.nhan}</h3>
            <p className="mt-1 text-sm text-ink-soft">
              Bài <span className="font-mono">{bai.maBai}</span> đang ở{" "}
              {getState(bai.trangThai).ten}.
            </p>

            {dangMo.chonDich && (
              <label className="mt-4 block text-sm">
                <span className="font-medium">Trả bài về bước nào?</span>
                <select
                  value={dich ?? ""}
                  onChange={(e) => setDich(e.target.value as StateId)}
                  className="mt-1 w-full rounded border border-ink-line px-2 py-2"
                >
                  {dangMo.chonDich.map((d) => (
                    <option key={d} value={d}>
                      {getState(d).ten}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-ink-soft">
                  Đề xuất số 10: tài liệu gốc chỉ ghi &quot;gửi lại tất cả&quot;, không chỉ rõ đích đến.
                </span>
              </label>
            )}

            <label className="mt-4 block text-sm">
              <span className="font-medium">
                Ghi chú lý do {dangMo.batBuocLyDo ? "(bắt buộc)" : "(không bắt buộc)"}
              </span>
              <textarea
                value={lyDo}
                onChange={(e) => setLyDo(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded border border-ink-line px-2 py-2"
                placeholder="Ví dụ: cần kiểm tra lại số liệu ở đoạn 3 trước khi duyệt."
              />
            </label>

            {dangMo.kySo && (
              <p className="mt-3 rounded bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Hành động này kèm <strong>ký số</strong>. Ở hệ thống thật đây là bước cắm USB token
                hoặc xác thực ký số từ xa — bản demo chỉ mô phỏng, không ký thật.
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setDangMo(null)} className="nut-phu">
                Hủy
              </button>
              <button onClick={xacNhan} disabled={canLyDo} className={canLyDo ? "nut-tat" : "nut-chinh"}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
