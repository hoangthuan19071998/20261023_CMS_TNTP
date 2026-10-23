"use client";

import { ROLES } from "@/lib/permissions";
import { useStore } from "@/lib/store";

export default function RoleSwitcher() {
  const { vaiTro, datVaiTro, cheDoGiaiThich, batGiaiThich } = useStore();

  return (
    <div className="border-b border-ink-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Đang xem với vai trò
        </span>
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((r) => {
            const dangChon = r.id === vaiTro;
            return (
              <button
                key={r.id}
                onClick={() => datVaiTro(r.id)}
                title={r.moTa}
                aria-pressed={dangChon}
                className={
                  "rounded-full px-3 py-1.5 text-sm transition " +
                  (dangChon
                    ? "bg-ink text-white shadow-sm"
                    : "border border-ink-line bg-white text-ink hover:bg-ink-bg")
                }
              >
                {r.ten}
              </button>
            );
          })}
        </div>

        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={cheDoGiaiThich}
            onChange={(e) => batGiaiThich(e.target.checked)}
            className="h-4 w-4 rounded border-ink-line"
          />
          Giải thích phân quyền
        </label>
      </div>
    </div>
  );
}
