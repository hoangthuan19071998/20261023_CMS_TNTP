# CMS Tòa soạn hội tụ — Bản demo phân quyền và luồng công việc

Bản mô phỏng chạy được, dùng để tòa soạn bấm thử và xác nhận **quy trình** và
**phân quyền** trước khi thiết kế hệ thống thật.

> **Đây không phải sản phẩm.** Không dàn trang báo in thật, không ký số thật, đăng nhập
> dùng tài khoản mẫu tự chọn theo vai trò. Dữ liệu bài viết, nhật ký và tệp đính kèm nằm
> ở backend NestJS + PostgreSQL.

Quy trình đã chốt cho sản phẩm có 7 bước, từ Biên tập nội dung đến Lưu trữ / lưu chiểu, không còn
Đề tài và Bản thảo (xem `docs/PHAM_VI_BAO_GIA.md` mục 1b). Bản demo chưa sửa theo, vẫn có 9 bước.

## Chạy tại máy

Chạy backend trước (repo `20261023_toasoanso_backend`, cổng 3001):

```bash
npm install
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

Rồi chạy frontend ở repo này:

```bash
npm install
npm run dev
```

Mở http://localhost:3000. Backend ở địa chỉ khác thì đặt `NEXT_PUBLIC_API_URL`.

## Cách dùng khi trình bày với tòa soạn

1. **Đổi vai trò** bằng dải nút ở đầu trang (7 vai trò). Toàn bộ menu, bảng điều
   khiển, danh sách bài và các nút hành động đổi theo ngay lập tức.
2. Bật **"Giải thích phân quyền"** (góc phải thanh vai trò) để hiện cả những nút mà
   vai trò hiện tại *không* được bấm — nút sẽ mờ đi kèm chú thích vai trò nào làm được.
   Đây là cách cho thấy *vì sao* chứ không chỉ *cái gì*.
3. Mỗi bài có ô mã quyền nguyên văn theo ma trận, ví dụ `◆ E C A`, để đối chiếu trực
   tiếp với bảng đã gửi tòa soạn.
4. Nút **"Đăng bài mới"** (menu và trang Kho bài) cho Phóng viên, Biên tập viên / Trưởng ban,
   Thư ký tòa soạn và Phó TBT / TBT. Mỗi vai trò đăng vào đúng bước của mình; có thể kèm tệp
   PDF, Word, ảnh, ZIP. Tệp lưu trên máy chủ nên vai trò nào có quyền cũng tải xuống được.
5. **Không xóa gì cả.** Mọi phiên bản, tệp và thao tác đều được giữ để truy vết: không có nút khôi
   phục dữ liệu mẫu, không gỡ được tài liệu đã tải lên. Bài đã lưu trữ (S8) và bài bị loại ẩn khỏi
   Bảng điều khiển nhưng vẫn xem được ở Kho bài.

## Chức năng đã dựng (Nhóm 1)

| # | Chức năng | Ghi chú |
|---|---|---|
| 1 | Thanh chuyển vai trò + chế độ giải thích phân quyền | 7 vai trò, đổi tức thì |
| 2 | Bảng điều khiển riêng cho từng vai trò | Bám theo cột "Giao diện hiển thị chính" trong tài liệu tòa soạn; không hiện bài đã lưu trữ và bài bị loại |
| 3 | Kho bài, lọc theo trạng thái và chuyên mục | Hiện ai đang giữ bài, cảnh báo quá hạn |
| 4 | Cột "Thông tin duyệt" trong màn hình bài | Dòng thời gian bài đã qua tay ai: hành động, người, thời điểm, ghi chú họ để lại; mốc cuối là người đang giữ bài |
| 4b | Dải chín bước ngang | Cho biết bài đang ở bước nào (sơ đồ toàn quy trình đã bỏ khỏi màn hình bài) |
| 5 | Màn hình chi tiết bài | Nội dung, siêu dữ liệu, ghi chú khi chuyển bài |
| 6 | Chuyển trạng thái | Duyệt / Trả lại (chọn đích) / Loại bài / Ký số, bắt buộc ghi lý do |
| 7 | Yêu cầu sửa | Gửi Họa sĩ khi văn bản đã khóa (khối bình luận nội bộ đã bỏ khỏi màn hình bài) |
| 8 | Lịch sử phiên bản | Ai sửa, lúc nào, so sánh hai bản gần nhất |
| 9 | Khóa văn bản sau khi chốt nội dung | Kèm luồng "Tạo yêu cầu sửa" |
| 10 | Nhật ký lưu vết | Ghi mọi thao tác, chỉ ghi thêm, phân quyền xem |
| 11 | Bảng "Lịch sử bài viết" | Người dùng, thời gian, hành động, mô tả, phiên bản; lọc theo hành động |
| 12 | Đăng bài | PV, BTV/TB, TKTS, TBT đăng vào đúng bước của mình (`DIEM_VAO` trong `lib/permissions.ts`); PV chọn bắt đầu từ Đề tài hoặc Bản thảo |
| 13 | Tài liệu đính kèm | PDF, Word, ảnh, ZIP, tối đa 25 MB mỗi tệp; ai sửa được ở bước hiện tại (quyền E/L) thì tải lên, ai đọc được bài thì tải xuống; không gỡ được tệp đã tải lên |
| 14 | Bản bông thật | Họa sĩ tải tệp bản bông (quyền L), Nhà in tải đúng tệp đó ở bước đã xuất bản (quyền D) |

## Cấu trúc mã nguồn

```
lib/permissions.ts   ← MA TRẬN PHÂN QUYỀN — nguồn sự thật duy nhất
lib/types.ts         kiểu dữ liệu dùng chung
lib/api/             gọi backend (axios): bài viết, bình luận, nhật ký, tài liệu
lib/store.tsx        trạng thái ứng dụng, đọc và ghi qua backend (react-query)
lib/tep.ts           quy tắc tệp tải lên: loại được nhận, dung lượng tối đa, kiểm tra
lib/tepStore.ts      tải nội dung tệp đính kèm từ máy chủ
lib/danhMuc.ts       danh mục chọn khi đăng bài (chuyên mục, loại, ấn phẩm)
app/                 các trang
components/          các thành phần giao diện
```

**Muốn đổi phân quyền thì sửa `lib/permissions.ts`, không sửa trong từng màn hình.**
Bảng `MA_TRAN` trong file đó là ma trận đã chuẩn hóa sau khi gộp các vai trò theo yêu cầu.
Chính file này sẽ được mang sang hệ thống thật.

## Mười điểm demo làm khác tài liệu ban đầu

Demo dựng theo **bản đề xuất**, không theo nguyên văn tài liệu, vì tài liệu có chỗ
mâu thuẫn và có ngõ cụt khiến bài không đi tiếp được. Các điểm khác biệt:

1. Chỉ Thư ký tòa soạn là super editor (tài liệu cho cả ba vai).
2. PTBT/TBT đăng bài vào thẳng bước chờ duyệt và được sửa trực tiếp nội dung ở bước này
   (có lưu vết, kèm cảnh báo sửa chữ sau khi dàn trang có thể vỡ ma-két).
3. Quyền đặt lịch xuất bản chuyển từ Họa sĩ sang Thư ký tòa soạn.
4. Thêm nút "Trình duyệt" ở bước soát bản bông (tài liệu chỉ có nút Trả lại — ngõ cụt).
5. Khóa văn bản sau khi Thư ký tòa soạn chốt nội dung, muốn sửa phải tạo Yêu cầu sửa.
6. Giữ Quản trị hệ thống là vai trò riêng; Cộng tác viên được gộp vào Phóng viên.
7. Biên tập viên và Trưởng ban dùng chung một vai trò và một bộ quyền.
8. Thêm nhánh đính chính / gỡ bài sau xuất bản.
9. Thư ký tòa soạn duyệt xong, hệ thống tự chuyển bài sang Họa sĩ.
10. Đăng bài vào đúng vị trí của mình: PV vào Đề tài hoặc Bản thảo, BTV/TB vào Biên tập nội
    dung, TKTS vào Chốt nội dung, PTBT/TBT vào Chờ duyệt xuất bản. Bài bắt đầu giữa quy trình
    bỏ qua các bước trước và người đăng cũng là người giữ bài (**chờ tòa soạn xác nhận** có
    cho phép tự đăng tự duyệt không).

Khi bật chế độ giải thích, các điểm này hiện ngay trên giao diện tại đúng chỗ liên quan.

## Những gì demo cố tình KHÔNG có

- Đăng nhập thật: đổi vai trò là tự đăng nhập tài khoản mẫu của vai trò đó
- Công cụ dàn trang báo in (hệ thống thật chỉ nhận file PDF họa sĩ tải lên)
- Ký số thật
- Kiểm tra nội dung bên trong tệp tải lên và quét mã độc (demo chỉ kiểm tra đuôi tệp và dung
  lượng; hệ thống thật bắt buộc phải có, nhất là với tệp ZIP)
- Trang báo điện tử công khai
- Sa bàn báo in, kho dữ liệu số (DAM), lịch xuất bản, nhuận bút — thuộc Nhóm 2, chưa dựng
