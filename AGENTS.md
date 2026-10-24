# CMS Tòa soạn hội tụ — bản demo

Hướng dẫn cho mọi agent lập trình (và người) làm việc trong repo này. Không phụ thuộc công cụ nào.

Bản mô phỏng quy trình và phân quyền tòa soạn, **không phải sản phẩm** (không ký số thật, không dàn
trang thật). Dữ liệu và tệp đính kèm nằm ở backend NestJS + PostgreSQL. Thanh đổi vai trò ở đầu
trang giữ lại để khách dùng thử: đổi vai là tự đăng nhập tài khoản mẫu của vai đó.
Next.js 15, React 19, TypeScript, Tailwind 3. Đọc `docs/BAN_GIAO.md` trước khi làm; nó có bối cảnh,
bẫy đã gặp và các câu hỏi còn treo.

**Phạm vi sản phẩm thật đã đổi (24/10/2026)**: quản lý, phê duyệt và lưu hành tài liệu nội bộ, duyệt
theo người của từng ban; không đăng bài, không ký số, không bản bông. Xem `docs/PHAM_VI_BAO_GIA.md`.

## Lệnh

```bash
npm install
npm run dev                 # http://localhost:3000
npx tsc --noEmit && npm run lint && npm run build   # trước khi đẩy
```

Cần Node 22. Cần backend `20261023_toasoanso_backend` (NestJS + PostgreSQL) chạy ở `http://localhost:3001`
(đổi bằng `NEXT_PUBLIC_API_URL`). Ở thư mục backend: `npm install`, `npx prisma migrate dev`,
`npm run prisma:seed`, `npm run start:dev`.

## Quy tắc

- **Phân quyền chỉ sửa ở `lib/permissions.ts`** (`MA_TRAN`, `TRANSITIONS`, `DIEM_VAO`). Không rải
  logic quyền trong từng màn hình.
- **Quyền xem được ngầm hiểu**: ma trận không ghi `R` cho người giữ bài hay người có quyền khác. Đừng
  dò chữ `R`; dùng `getPermission(...).thayBai` (xem `coTheXemTaiLieu`).
- **Chỉ có một nhánh: `main`.** Trước khi sửa, `git fetch origin main` và so sánh. Chủ repo và các
  agent khác cũng đẩy lên nhánh này. Cây sạch thì `git merge --ff-only`. Không rebase, không
  force-push. Không tạo pull request nếu chủ repo không yêu cầu.
- **Không xóa dữ liệu, giữ toàn bộ để truy vết.** Không có chức năng khôi phục dữ liệu mẫu, xóa bài
  hay gỡ tài liệu đính kèm. Bài đã lưu trữ (S8) và bài bị loại chỉ ẩn khỏi Bảng điều khiển, vẫn xem
  được ở Kho bài và nhật ký; sẽ tìm lại qua chức năng tìm kiếm (chưa làm).
- Thêm trường vào `Article` thì sửa cả `prisma/schema.prisma` (kèm migration), `src/prisma/seed-data.ts`
  ở backend và `lib/types.ts` ở frontend.
- **Ma trận quyền có hai bản**: `lib/permissions.ts` ở frontend (giao diện) và
  `src/permissions/permissions.service.ts` ở backend (máy chủ chặn thật). Sửa quyền thì sửa cả hai.
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
