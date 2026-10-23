# CMS Tòa soạn hội tụ — Bản demo phân quyền và luồng công việc

Bản mô phỏng chạy được, dùng để tòa soạn bấm thử và xác nhận **quy trình** và
**phân quyền** trước khi thiết kế hệ thống thật.

> **Đây không phải sản phẩm.** Không có máy chủ, không có cơ sở dữ liệu, không có
> đăng nhập thật, không dàn trang báo in thật, không ký số thật. Dữ liệu nằm trong
> trình duyệt của người xem.

## Chạy tại máy

```bash
npm install
npm run dev
```

Mở http://localhost:3000

## Cách dùng khi trình bày với tòa soạn

1. **Đổi vai trò** bằng dải nút ở đầu trang (7 vai trò). Toàn bộ menu, bảng điều
   khiển, danh sách bài và các nút hành động đổi theo ngay lập tức.
2. Bật **"Giải thích phân quyền"** (góc phải thanh vai trò) để hiện cả những nút mà
   vai trò hiện tại *không* được bấm — nút sẽ mờ đi kèm chú thích vai trò nào làm được.
   Đây là cách cho thấy *vì sao* chứ không chỉ *cái gì*.
3. Mỗi bài có ô mã quyền nguyên văn theo ma trận, ví dụ `◆ E C A`, để đối chiếu trực
   tiếp với bảng đã gửi tòa soạn.
4. Nút **"Khôi phục dữ liệu mẫu"** ở trang Kho bài đưa demo về trạng thái ban đầu.

## Chức năng đã dựng (Nhóm 1)

| # | Chức năng | Ghi chú |
|---|---|---|
| 1 | Thanh chuyển vai trò + chế độ giải thích phân quyền | 7 vai trò, đổi tức thì |
| 2 | Bảng điều khiển riêng cho từng vai trò | Bám theo cột "Giao diện hiển thị chính" trong tài liệu tòa soạn |
| 3 | Kho bài, lọc theo trạng thái và chuyên mục | Hiện ai đang giữ bài, cảnh báo quá hạn |
| 4 | Cột "Thông tin duyệt" trong màn hình bài | Dòng thời gian bài đã qua tay ai: hành động, người, thời điểm, ghi chú họ để lại; mốc cuối là người đang giữ bài |
| 4b | Dải chín bước ngang + sơ đồ toàn quy trình (mở theo yêu cầu) | Dải bước cho biết đang ở đâu; sơ đồ cây vẽ cả nhánh trả lại, loại bài, đính chính |
| 5 | Màn hình chi tiết bài | Nội dung, siêu dữ liệu, ghi chú khi chuyển bài |
| 6 | Chuyển trạng thái | Duyệt / Trả lại (chọn đích) / Loại bài / Ký số, bắt buộc ghi lý do |
| 7 | Bình luận nội bộ | Gắn theo đoạn, gắn thẻ vai trò, đánh dấu đã xử lý |
| 8 | Lịch sử phiên bản | Ai sửa, lúc nào, so sánh hai bản gần nhất |
| 9 | Khóa văn bản sau khi chốt nội dung | Kèm luồng "Tạo yêu cầu sửa" |
| 10 | Nhật ký lưu vết | Ghi mọi thao tác, chỉ ghi thêm, phân quyền xem |
| 11 | Bảng "Lịch sử bài viết" | Người dùng, thời gian, hành động, mô tả, phiên bản; lọc theo hành động |

## Cấu trúc mã nguồn

```
lib/permissions.ts   ← MA TRẬN PHÂN QUYỀN — nguồn sự thật duy nhất
lib/types.ts         kiểu dữ liệu dùng chung
lib/seed.ts          14 bài mẫu rải đều trên các trạng thái
lib/store.tsx        trạng thái ứng dụng, lưu trong localStorage
app/                 các trang
components/          các thành phần giao diện
```

**Muốn đổi phân quyền thì sửa `lib/permissions.ts`, không sửa trong từng màn hình.**
Bảng `MA_TRAN` trong file đó là ma trận đã chuẩn hóa sau khi gộp các vai trò theo yêu cầu.
Chính file này sẽ được mang sang hệ thống thật.

## Chín điểm demo làm khác tài liệu ban đầu

Demo dựng theo **bản đề xuất**, không theo nguyên văn tài liệu, vì tài liệu có chỗ
mâu thuẫn và có ngõ cụt khiến bài không đi tiếp được. Các điểm khác biệt:

1. Chỉ Thư ký tòa soạn là super editor (tài liệu cho cả ba vai).
2. PTBT/TBT chỉ xem, bình luận và duyệt — không trực tiếp sửa nội dung.
3. Quyền đặt lịch xuất bản chuyển từ Họa sĩ sang Thư ký tòa soạn.
4. Thêm nút "Trình duyệt" ở bước soát bản bông (tài liệu chỉ có nút Trả lại — ngõ cụt).
5. Khóa văn bản sau khi Thư ký tòa soạn chốt nội dung, muốn sửa phải tạo Yêu cầu sửa.
6. Giữ Quản trị hệ thống là vai trò riêng; Cộng tác viên được gộp vào Phóng viên.
7. Biên tập viên và Trưởng ban dùng chung một vai trò và một bộ quyền.
8. Thêm nhánh đính chính / gỡ bài sau xuất bản.
9. Thư ký tòa soạn duyệt xong, hệ thống tự chuyển bài sang Họa sĩ.

Khi bật chế độ giải thích, các điểm này hiện ngay trên giao diện tại đúng chỗ liên quan.

## Những gì demo cố tình KHÔNG có

- Đăng nhập, bảo mật, phân quyền phía máy chủ
- Lưu dữ liệu lên máy chủ (tải lại trang có thể mất dữ liệu đã thao tác)
- Công cụ dàn trang báo in (hệ thống thật chỉ nhận file PDF họa sĩ tải lên)
- Ký số thật
- Trang báo điện tử công khai
- Sa bàn báo in, kho dữ liệu số (DAM), lịch xuất bản, nhuận bút — thuộc Nhóm 2, chưa dựng
