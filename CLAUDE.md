# CMS Tòa soạn hội tụ — bản demo

Bản mô phỏng quy trình và phân quyền tòa soạn, **không phải sản phẩm** (không máy chủ, không đăng
nhập thật). Next.js 15, React 19, TypeScript, Tailwind 3. Đọc `docs/BAN_GIAO.md` trước khi làm; nó
có bối cảnh, bẫy đã gặp và các câu hỏi còn treo.

## Lệnh

```bash
npm install
npm run dev                 # http://localhost:3000
npx tsc --noEmit && npm run lint && npm run build   # trước khi đẩy
```

## Quy tắc

- **Phân quyền chỉ sửa ở `lib/permissions.ts`** (`MA_TRAN`, `TRANSITIONS`, `DIEM_VAO`). Không rải
  logic quyền trong từng màn hình.
- **Quyền xem được ngầm hiểu**: ma trận không ghi `R` cho người giữ bài hay người có quyền khác. Đừng
  dò chữ `R`; dùng `getPermission(...).thayBai` (xem `coTheXemTaiLieu`).
- **Trước khi sửa, `git fetch origin demo/phan-quyen-workflow` và so sánh.** Chủ repo cũng đẩy lên
  nhánh này. Cây sạch thì `git merge --ff-only`. Không rebase, không force-push.
- Làm trên nhánh `demo/phan-quyen-workflow`. Không tạo pull request nếu chủ repo không yêu cầu.
- Thêm trường vào `Article` thì sửa cả `migrateStoredData` (`lib/store.tsx`) và `lib/seed.ts`.
- Tên biến, hàm bằng tiếng Việt không dấu (`bai`, `vaiTro`, `taiLieu`); chữ trên giao diện tiếng Việt
  có dấu. Commit viết tiếng Việt, tiền tố `feat:` / `fix:` / `chore:`.
- Build qua chưa đủ: chạy thử trên trình duyệt thật với từng vai trò bị ảnh hưởng. Chromium ở
  `/opt/pw-browsers/chromium`; cài tạm `npm install --no-save playwright-core`, rồi
  `git checkout package-lock.json`.
- Không dùng `pkill -f "next start"` (tự giết shell). Chạy server bằng `setsid`, đổi cổng mỗi lần build.
- Không có `gh`; thao tác GitHub qua công cụ MCP `mcp__github__*`.
