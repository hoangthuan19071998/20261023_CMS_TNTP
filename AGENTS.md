# CMS Tòa soạn hội tụ — bản demo

Hướng dẫn cho mọi agent lập trình (và người) làm việc trong repo này. Không phụ thuộc công cụ nào.

Bản mô phỏng quy trình và phân quyền tòa soạn, **không phải sản phẩm** (không máy chủ, không đăng
nhập thật). Next.js 15, React 19, TypeScript, Tailwind 3. Đọc `docs/BAN_GIAO.md` trước khi làm; nó
có bối cảnh, bẫy đã gặp và các câu hỏi còn treo.

## Lệnh

```bash
npm install
npm run dev                 # http://localhost:3000
npx tsc --noEmit && npm run lint && npm run build   # trước khi đẩy
```

Cần Node 22.

## Quy tắc

- **Phân quyền chỉ sửa ở `lib/permissions.ts`** (`MA_TRAN`, `TRANSITIONS`, `DIEM_VAO`). Không rải
  logic quyền trong từng màn hình.
- **Quyền xem được ngầm hiểu**: ma trận không ghi `R` cho người giữ bài hay người có quyền khác. Đừng
  dò chữ `R`; dùng `getPermission(...).thayBai` (xem `coTheXemTaiLieu`).
- **Trước khi sửa, `git fetch origin demo/phan-quyen-workflow` và so sánh.** Chủ repo và các agent
  khác cũng đẩy lên nhánh này. Cây sạch thì `git merge --ff-only`. Không rebase, không force-push.
- Làm trên nhánh `demo/phan-quyen-workflow`. Không tạo pull request nếu chủ repo không yêu cầu.
- Thêm trường vào `Article` thì sửa cả `migrateStoredData` (`lib/store.tsx`) và `lib/seed.ts`.
- Tên biến, hàm bằng tiếng Việt không dấu (`bai`, `vaiTro`, `taiLieu`); chữ trên giao diện tiếng Việt
  có dấu. Commit viết tiếng Việt, tiền tố `feat:` / `fix:` / `chore:`.
- Build qua chưa đủ: chạy thử trên trình duyệt thật với từng vai trò bị ảnh hưởng. Cài tạm
  `npm install --no-save playwright-core` (đường dẫn Chromium tùy máy), rồi
  `git checkout package-lock.json` vì `npm install` có thể sửa tệp này.

## Lưu ý về môi trường

Các điểm sau đã gặp ở môi trường đám mây của phiên trước; môi trường của bạn có thể khác.

- Tránh `pkill -f` với chuỗi trùng chính dòng lệnh của shell đang chạy (từng làm chết shell). Khi chạy
  server nền để thử, đổi cổng mỗi lần build lại: cổng cũ còn tiến trình giữ bản build cũ sẽ trả trang
  cũ mà không báo lỗi.
- Phiên trước không có `gh`, thao tác GitHub đi qua công cụ do môi trường cung cấp. Dùng công cụ nào
  có sẵn ở nơi bạn chạy.
