# Phạm vi báo giá — Tòa soạn hội tụ (quản lý và lưu hành tài liệu nội bộ)

Tổng hợp câu trả lời của chủ repo (Hoàng Thuận) ngày 24/10/2026, làm cơ sở để chốt báo giá. Mục 8
là các câu hỏi còn mở; báo giá cố định chỉ chốt được khi mục 8 có câu trả lời.

**Thay đổi lớn so với bản demo:** sản phẩm không còn là CMS tòa soạn (đăng bài, bản bông, ký số,
xuất bản). Phạm vi mới là **hệ thống quản lý, phê duyệt và lưu hành tài liệu nội bộ**, duyệt theo
người cụ thể của từng ban. Bản demo vẫn dùng được làm nền (phân quyền, quy trình, phiên bản, diff,
bình luận, tệp đính kèm, nhật ký), nhưng phải sửa mô hình như ở mục 7.

## 1. Phạm vi sản phẩm (đã chốt)

| # | Quyết định | Ảnh hưởng đến thiết kế |
|---|---|---|
| 1 | Dùng thật | Cần backend, CSDL, đăng nhập, sao lưu, kiểm thử như sản phẩm, không phải mô phỏng |
| 2 | Phần mềm **không có giá trị pháp lý** | Không tích hợp ký số CA. Bước "Ký số" đổi thành "Phê duyệt" nội bộ, chỉ ghi nhận ai duyệt lúc nào |
| 3 | Chỉ dùng nội bộ: thao tác, quản lý và lưu hành tài liệu | Không có cổng công khai, không có người dùng bên ngoài |
| 4 | Chỉ quản lý tài liệu | Không xuất bản ra website, không dàn trang, không nhuận bút |
| 5 | **Chọn đích danh người duyệt theo trách nhiệm**: ban nào duyệt tài liệu của ban đó | Cần mô hình tổ chức (ban, người, chức vụ) và định tuyến duyệt theo người, không theo vai trò như demo |
| 6 | Thông báo **chỉ trong ứng dụng** | Không gửi email, Zalo hay SMS. Hệ quả: quên mật khẩu phải nhờ quản trị đặt lại (xem câu hỏi 8.4) |
| 7 | Báo cáo, thống kê theo **trạng thái tài liệu** | Ví dụ: số tài liệu theo trạng thái, theo ban, tài liệu chờ duyệt quá hạn, thời gian xử lý trung bình |

## 2. Ngoài phạm vi báo giá

- Tên miền, máy chủ, hosting, gói lưu trữ và mọi chi phí hạ tầng
- Ký số, chứng thư số
- Ứng dụng di động cài đặt (chỉ làm web, dùng tốt trên máy tính và điện thoại)
- Chuyển dữ liệu từ hệ thống cũ
- Đào tạo trực tiếp (chỉ bàn giao tài liệu hướng dẫn sử dụng)
- Chi phí bảo hành, hỗ trợ, SLA (không nêu trong báo giá)
- Tiến độ thanh toán (không ảnh hưởng số tiền)

## 3. Chín điểm nghiệp vụ trong `BAN_GIAO.md` mục 6

| # | Điểm | Trạng thái |
|---|---|---|
| 1 | Tự tạo tự duyệt | **Chốt: cho phép.** Người có quyền duyệt tạo tài liệu thì bước duyệt của chính họ được bỏ qua (xem câu hỏi 8.3) |
| 2 | Nghĩa của "Đăng bài" | **Chốt: không có chức năng đăng bài.** Vẫn cần chức năng tạo tài liệu hoặc tải tài liệu lên (xem câu hỏi 8.1) |
| 3 | Điểm vào của từng vai (`DIEM_VAO`) | Đã giải thích ở dưới bảng. Chờ trả lời câu hỏi 8.3 |
| 4 | TKTS không tải được bản bông ở S5 | Đã giải thích ở dưới bảng. Nhiều khả năng **không còn áp dụng** vì bỏ bản bông |
| 5 | Báo cho người liên quan khi tài liệu bị sửa sau khi đã chuyển đi | **Chốt: có**, bằng thông báo trong ứng dụng |
| 6 | Chọn đích danh người duyệt | Câu trả lời ghi "s". Hiểu là **có**, trùng với phạm vi mục 1.5. Cần xác nhận |
| 7 | Giới hạn tệp | **Chốt: chưa giới hạn dung lượng và loại tệp, có quét mã độc** (xem câu hỏi 8.6) |
| 8 | Google Sheet ma trận phân quyền lệch với mã | **Chốt: đồng ý cập nhật.** Ma trận mới sẽ dựng lại theo mô hình ban, đưa vào phụ lục báo giá |
| 9 | Danh sách câu hỏi gửi tòa soạn | Thay bằng tài liệu này và mục 8 |

**Giải thích điểm 3 (điểm vào).** Khi một người tạo tài liệu mới, hệ thống phải biết tài liệu
bắt đầu ở bước nào. Ví dụ: nhân viên tạo thì tài liệu ở bước "Soạn thảo", chờ trưởng ban duyệt;
trưởng ban tạo thì tài liệu bỏ qua bước trưởng ban duyệt (vì đã cho tự duyệt) và đi thẳng lên cấp
trên, hoặc lưu hành luôn. Câu hỏi thực chất là: **ai được tạo tài liệu, và tài liệu do người ở
từng cấp tạo ra thì phải qua những bước duyệt nào.**

**Giải thích điểm 4 (bản bông).** Trong demo, Thư ký tòa soạn soát bản bông ở bước S5 nhưng chỉ
xem được trên màn hình, không tải tệp về máy để in hay soát kỹ. Sửa chỉ mất một ô trong ma trận
quyền, không ảnh hưởng giá. Với phạm vi mới không còn bản bông, nên điểm này chỉ còn một nguyên tắc
chung cần chốt: **người duyệt ở bước nào cũng tải được tệp về máy, hay có bước chỉ được xem?**

## 4. Quy mô và kỹ thuật

| # | Mục | Trả lời |
|---|---|---|
| 1 | Số người dùng | Khoảng 200–300 người |
| 2 | Dung lượng tệp | Chưa giới hạn |
| 3 | Chuyển dữ liệu cũ | Không |
| 4 | Đăng nhập | Tài khoản riêng của hệ thống, không SSO hay LDAP |
| 5 | Cài đặt on-premise hay cloud | Chưa chốt, không nêu trong báo giá |
| 6 | An toàn thông tin theo cấp độ | Xem mục 6 |
| 7 | Thiết bị | Web trên máy tính và điện thoại, không làm app |

## 5. Thương mại

| # | Mục | Trả lời |
|---|---|---|
| 1–2 | Nguồn vốn, đấu thầu | Không đấu thầu, ký hợp đồng trực tiếp |
| 3 | Mã nguồn | Bàn giao toàn bộ |
| 4 | Đào tạo | Chỉ bàn giao tài liệu hướng dẫn sử dụng |
| 5 | Bảo hành, SLA | Không nêu trong báo giá |
| 6 | Thanh toán | Không ảnh hưởng số tiền |
| 7 | Số vòng sửa | Không giới hạn, sửa đến khi khách hài lòng |

Lưu ý ở điểm 7: không giới hạn vòng sửa thì nên ghi rõ trong báo giá danh sách chức năng đã chốt
(mục 7 và phụ lục ma trận quyền). Sửa trong phạm vi đó thì miễn phí; chức năng mới ngoài danh sách
thì báo giá riêng. Nếu không, "sửa" có thể biến thành "làm thêm" mà không có điểm dừng.

## 6. Các cấp độ an toàn thông tin

Theo Nghị định 85/2016/NĐ-CP, hệ thống thông tin của cơ quan nhà nước chia thành 5 cấp độ. Dưới đây
là tóm tắt rút gọn, cần đối chiếu văn bản gốc. Khung pháp lý về an ninh mạng gần đây đã thay đổi,
nên phải xác nhận văn bản đang có hiệu lực trước khi đưa vào hợp đồng.

| Cấp độ | Hệ thống điển hình | Ai phê duyệt hồ sơ |
|---|---|---|
| **1** | Phục vụ nội bộ, chỉ xử lý thông tin công khai | Cơ quan chủ quản |
| **2** | Phục vụ nội bộ, có xử lý thông tin riêng hoặc dữ liệu cá nhân (không có bí mật nhà nước); hoặc cung cấp thông tin, dịch vụ công mức thấp cho người dân | Cơ quan chủ quản |
| **3** | Dịch vụ công trực tuyến mức cao, hạ tầng dùng chung của cả ngành hoặc tỉnh, hệ thống mà sự cố gây thiệt hại lớn | Cơ quan chủ quản, có thẩm định chuyên môn |
| **4** | Hệ thống quan trọng quốc gia, sự cố ảnh hưởng nghiêm trọng đến xã hội, quốc phòng, an ninh | Bộ chủ quản hoặc cơ quan chuyên trách cấp Bộ |
| **5** | Hệ thống đặc biệt quan trọng, phục vụ quốc phòng, an ninh quốc gia | Thủ tướng hoặc cơ quan được giao |

Hệ thống chứa **bí mật nhà nước** đi theo Luật Bảo vệ bí mật nhà nước, yêu cầu tách mạng riêng.
Phần mềm web thông thường như thế này không đáp ứng.

**Hệ thống này nhiều khả năng ở cấp độ 2**: dùng nội bộ, có tài khoản và họ tên người dùng (dữ liệu
cá nhân), tài liệu nội bộ không công khai.

Phần mềm ở cấp độ 2 cần có (ảnh hưởng trực tiếp đến công làm):

- Mật khẩu đủ mạnh, khóa tài khoản sau nhiều lần đăng nhập sai, tự đăng xuất khi không thao tác
- Phân quyền theo nguyên tắc tối thiểu, chặn ở máy chủ (backend demo đã có phần này)
- Nhật ký truy cập và thao tác, không sửa được, lưu trong thời gian quy định
- Mã hóa đường truyền (HTTPS) và lưu mật khẩu dạng băm
- Sao lưu và khôi phục dữ liệu, có quy trình kiểm tra khôi phục
- Quét mã độc tệp tải lên (đã chốt ở mục 3.7)

Việc lập **hồ sơ đề xuất cấp độ** là trách nhiệm của cơ quan chủ quản. Bên làm phần mềm thường được
nhờ viết phần mô tả kỹ thuật (xem câu hỏi 8.9).

## 7. Những gì phải đổi so với bản demo

| Hạng mục | Demo hiện tại | Phạm vi mới |
|---|---|---|
| Đối tượng | Bài báo (tin, bài, longform, video…) | Tài liệu nội bộ |
| Vai trò | 7 vai tòa soạn (PV, BTV, TKTS, Họa sĩ, TBT, Nhà in, Admin) | Theo cơ cấu ban và chức vụ (chờ câu hỏi 8.2) |
| Quy trình | 9 bước tòa soạn S0–S8 | Quy trình duyệt tài liệu (chờ câu hỏi 8.2, 8.3) |
| Định tuyến duyệt | Theo vai trò | Theo người cụ thể của từng ban |
| Ký số | Mô phỏng | Bỏ, thay bằng phê duyệt nội bộ |
| Bản bông, Nhà in | Có | Bỏ |
| Đăng bài | Màn hình `/dang-bai` | Đổi thành tạo hoặc tải tài liệu lên |
| Giới hạn tệp | 25 MB; PDF, Word, ảnh, ZIP | Không giới hạn loại và dung lượng, có quét mã độc |
| Thông báo | Không có | Thông báo trong ứng dụng |
| Báo cáo | Không có | Thống kê theo trạng thái |
| Quản trị | Đổi vai để thử | Quản lý người dùng, ban, chức vụ, người duyệt |
| Bảo mật | Đăng nhập cơ bản | Các yêu cầu cấp độ 2 ở mục 6 |

Giữ lại từ demo: phiên bản và so sánh phiên bản, bình luận nội bộ, tệp đính kèm, nhật ký, dòng thời
gian duyệt, giao diện chạy được trên điện thoại.

## 8. Câu hỏi và câu trả lời

Bản theo dõi chính là Google Sheet "Phạm vi báo giá - Tòa soạn hội tụ", tab "Câu hỏi còn mở"
(https://docs.google.com/spreadsheets/d/1Dy7dVE_f_8p9Z5tfQ0xQto0YmZrq62PV_LoK7JSKohY/edit). Bảng dưới
chép lại câu trả lời ngày 24/10/2026.

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | Tài liệu vào hệ thống bằng cách nào | Chỉ tải tệp lên. Sửa bằng cách tải tệp về rồi tải bản mới lên, không sửa trên trình duyệt. Vẫn so sánh được nội dung hai phiên bản |
| 2 | Cơ cấu tổ chức | Khách cung cấp sau, không ảnh hưởng báo giá |
| 3 | Số cấp duyệt | Mọi tài liệu dùng chung một quy trình duyệt |
| 4 | Quên mật khẩu, xác thực hai lớp | Quản trị đặt lại, hai bên tự liên hệ ngoài hệ thống. Không cần xác thực hai lớp |
| 5 | Tài liệu liên ban | Không có, mỗi tài liệu chỉ thuộc một ban |
| 6 | Dung lượng tối đa, tệp nén có mật khẩu | Chưa chốt |
| 7 | Người duyệt vắng mặt | Phải duyệt được trên điện thoại (ngoài máy tính). Hiện chưa xét trường hợp người duyệt vắng mặt |
| 8 | Lưu hành đến ai, xác nhận đã đọc | Chưa chốt |
| 9 | Hồ sơ cấp độ an toàn thông tin, pentest | Chưa chốt |
| 10 | Danh mục, số hiệu tự động | Chưa chốt (câu 15 cho thấy có danh mục) |
| 11 | Phạm vi xem giữa các ban, tài liệu mật | Chưa chốt |
| 12 | Quyền tải tệp | Người duyệt và người nhận đều tải được tệp và tải bản mới lên |
| 13 | Hạn duyệt và nhắc quá hạn | Có |
| 14 | Xuất báo cáo, ai xem báo cáo | Chưa chốt |
| 15 | Tìm kiếm | Chỉ tìm theo tên và theo danh mục |
| 16 | Xóa tài liệu | Không xóa, lưu trữ tất cả |
| 17 | Xem trước tệp | Có |
| 18 | Chọn đích danh người duyệt | Chọn người duyệt ở bước tiếp theo. Từ chối hoặc trả về bước trước thì không cần chọn |
| 19 | Tên sản phẩm | Tòa soạn hội tụ |
| 20 | Công cài đặt lên máy chủ | Chưa chốt |

Còn mở: câu 6, 8, 9, 10, 11, 14, 20.

## 9. Danh sách chức năng và giá tham khảo

Đơn vị: triệu đồng. Chưa gồm VAT và hạ tầng. Giá tính theo mức freelancer hoặc studio nhỏ, có dùng
lại bản demo và làm có hỗ trợ AI. Bảng có công thức và ô tích chọn nằm ở tab "Chức năng và giá" của
Google Sheet trên. Đây là ước lượng, chưa phải báo giá cố định.

### Phần lõi

| Mã | Nhóm | Chức năng | Demo | Giá |
|---|---|---|---|---|
| L1 | Nền tảng | Đăng nhập tài khoản riêng, chính sách mật khẩu, khóa tài khoản khi sai nhiều lần, tự đăng xuất, quản trị đặt lại mật khẩu | Một phần | 5–8 |
| L2 | Nền tảng | Quản trị tổ chức: ban, chức vụ, người dùng, gán người duyệt cho từng ban | | 8–12 |
| L3 | Nền tảng | Phân quyền theo ban và chức vụ, chặn ở máy chủ; mỗi tài liệu thuộc một ban; người duyệt và người nhận đều tải được tệp | Một phần | 6–10 |
| L4 | Nền tảng | Nhật ký thao tác không sửa được, màn hình xem có lọc | Có | 3–5 |
| L5 | Tài liệu | Tạo tài liệu bằng cách tải tệp lên kèm tên, số hiệu, danh mục, ban, mô tả; quản lý danh mục | Một phần | 6–10 |
| L6 | Tài liệu | Tệp đính kèm: nhiều tệp, mọi loại, tải lên tệp lớn tiếp tục được khi rớt mạng, tải xuống | Một phần | 6–10 |
| L7 | Tài liệu | Quét mã độc, cách ly tệp nhiễm, quét bên trong tệp nén | | 5–8 |
| L8 | Tài liệu | Phiên bản tệp và so sánh nội dung: tải bản mới lên tạo phiên bản có ghi chú, người duyệt cũng tải được bản mới, xem và tải lại mọi bản cũ, so sánh chữ giữa hai phiên bản (trích chữ từ Word, PDF) | Một phần | 6–9 |
| L9 | Tài liệu | Bình luận nội bộ trên tài liệu, gắn thẻ người liên quan | Có | 2–4 |
| L10 | Tài liệu | Kho tài liệu: tìm theo tên, lọc theo danh mục, ban, trạng thái | Có | 4–6 |
| L11 | Tài liệu | Lưu trữ: không xóa tài liệu và tệp, giữ toàn bộ để truy vết | | 1–2 |
| L12 | Quy trình | Một quy trình duyệt nhiều cấp chung cho mọi tài liệu; chọn đích danh người duyệt ở bước tiếp theo; từ chối hoặc trả về không cần chọn, có lý do; tự duyệt bỏ qua bước | Một phần | 12–16 |
| L13 | Quy trình | Lưu hành sau khi duyệt: gửi đến ban hoặc người, xác nhận đã đọc | | 5–8 |
| L14 | Quy trình | Hạn duyệt từng bước, nhắc khi sắp và đã quá hạn | | 3–5 |
| L15 | Quy trình | Dòng thời gian duyệt, sơ đồ quy trình | Có | 2–3 |
| L16 | Thông báo | Thông báo trong ứng dụng: chuông, số chưa đọc, cập nhật tức thời | | 5–8 |
| L17 | Thông báo | Trang "Việc của tôi" | Một phần | 3–5 |
| L18 | Báo cáo | Thống kê theo trạng thái, ban, quá hạn, thời gian xử lý, có biểu đồ | Một phần | 6–10 |
| L19 | Chất lượng | Giao diện dùng tốt trên điện thoại cho mọi màn hình, duyệt được trên điện thoại | Một phần | 4–6 |
| L20 | Chất lượng | Kiểm thử tự động và nghiệm thu, sửa lỗi | | 8–12 |
| L21 | Chất lượng | Bảo mật cấp độ 2: HTTPS, băm mật khẩu, sao lưu và khôi phục, rà soát bảo mật | | 5–8 |
| L22 | Bàn giao | Hướng dẫn sử dụng, tài liệu kỹ thuật, bàn giao mã nguồn | | 3–5 |
| L23 | Quản lý | Khảo sát, họp chốt yêu cầu, quản lý dự án | | 5–8 |
| L24 | Tài liệu | Xem trước PDF, Word, ảnh trên web và điện thoại (Word chuyển sang PDF trên máy chủ) | | 5–8 |
| | | **Cộng phần lõi** | | **118–186** |

### Tùy chọn

| Mã | Chức năng | Câu hỏi | Giá |
|---|---|---|---|
| T5 | Xuất báo cáo ra Excel, PDF | 14 | 3–4 |
| T8 | Viết phần kỹ thuật cho hồ sơ đề xuất cấp độ an toàn thông tin | 9 | 5–10 |
| T9 | Cài đặt, cấu hình lên máy chủ của khách | 20 | 3–6 |
| | **Cộng nếu lấy hết** | | **11–20** |

### Đã loại theo câu trả lời

| Mã | Chức năng | Lý do |
|---|---|---|
| T1 | Xem trước tệp | Chuyển vào phần lõi thành L24 |
| T2 | Tìm trong nội dung tệp | Câu 15: chỉ tìm theo tên và danh mục |
| T3 | Ủy quyền duyệt khi vắng mặt | Câu 7: hiện chưa xét trường hợp người duyệt vắng mặt |
| T4 | Duyệt liên ban | Câu 5: mỗi tài liệu chỉ thuộc một ban |
| T6 | Xác thực hai lớp | Câu 4: không cần |
| T7 | Soạn thảo trực tuyến kiểu Word | Câu 1: chỉ tải tệp lên |
