# Bàn giao — CMS Tòa soạn hội tụ (bản demo phân quyền và luồng công việc)

Tài liệu này để một phiên làm việc mới (người hoặc agent AI bất kỳ) nắm được dự án và làm tiếp
mà không phải hỏi lại. Quy tắc ngắn cho agent nằm ở `AGENTS.md`. Cập nhật lần cuối ở commit `7c69514`, nhánh `demo/phan-quyen-workflow`.

## 1. Dự án là gì

Bản mô phỏng chạy được để **tòa soạn bấm thử và xác nhận quy trình cùng phân quyền** trước khi
thiết kế hệ thống thật. **Không phải sản phẩm**: không ký số thật, không dàn trang báo in thật,
đăng nhập bằng tài khoản mẫu theo vai trò. Từ nhánh `feat/ket-noi-api`, dữ liệu và tệp đính kèm
nằm ở backend `20261023_toasoanso_backend` (NestJS + Prisma + PostgreSQL, cổng 3001); tệp lưu
trong thư mục `uploads/` của backend.

- Repo: `hoangthuan19071998/20261023_CMS_TNTP`, nhánh làm việc `demo/phan-quyen-workflow`
- Chưa tạo pull request nào. Chỉ tạo khi chủ repo yêu cầu.
- Có hai người cùng đẩy lên nhánh này: chủ repo (Hoàng Thuận) và các agent AI làm việc cùng. Xem mục 7.

## 2. Chạy và kiểm tra

Node 22.

```bash
npm install
npm run dev            # http://localhost:3000
npx tsc --noEmit       # kiểm tra kiểu
npm run lint           # ESLint (cấu hình flat, eslint.config.mjs)
npm run build
```

Cả ba lệnh kiểm tra đều sạch ở commit `7c69514`. Sau `npm install`, `package-lock.json` có thể bị
sửa; nếu không chủ ý nâng thư viện thì `git checkout package-lock.json` trước khi commit.

Công nghệ: Next.js 15 (app router), React 19, TypeScript, Tailwind 3, thư viện `diff`. Có
`vercel.json` để deploy.

## 3. Mô hình nghiệp vụ

**7 vai trò** (chủ repo đã gộp từ 10 vai cũ): `PV` Phóng viên · `BTV` Biên tập viên / Trưởng ban ·
`TKTS` Thư ký tòa soạn · `HOA_SI` Họa sĩ / Thiết kế · `TBT` Phó TBT / TBT · `NHA_IN` Nhà in ·
`ADMIN` Quản trị. Các vai `CTV`, `TRUONG_BAN`, `KE_TOAN` không còn; `store.tsx` có hàm di trú
(`migratedRole`) đổi dữ liệu cũ sang vai mới.

**Quy trình**: S0 Đề tài → S1 Bản thảo → S2 Biên tập nội dung → S3 Chốt nội dung → S4 Trình bày →
S5 Soát bản bông → S6 Chờ duyệt xuất bản → S7 Đã xuất bản → S8 Lưu trữ. Hai nhánh phụ:
`DINH_CHINH` (từ S7) và `LOAI_BO` (từ bất kỳ bước nào trước S7). Có đường trả lại, TBT chọn đích
khi trả bài.

**Ký hiệu quyền** (mỗi ô của ma trận): `◆` đang giữ bài · `R` xem · `C` bình luận · `E` sửa nội
dung và tải tài liệu đính kèm · `L` sửa trình bày / tải bản bông · `A` chuyển trạng thái · `K` ký
số · `D` tải file thành phẩm · `—` không thấy bài.

**Điểm vào khi đăng bài** (`DIEM_VAO`): PV → S1 hoặc S0 · BTV → S2 · TKTS → S3 · TBT → S6. Mọi điểm
vào đều là bước vai đó có quyền `E`.

## 4. Đã dựng

| Nhóm | Nội dung |
|---|---|
| Phân quyền | Thanh đổi 7 vai trò, chế độ "Giải thích phân quyền" (hiện cả nút mờ kèm lý do), mã quyền nguyên văn trên mỗi bài |
| Bài viết | Kho bài có lọc, màn hình chi tiết, sửa nội dung có lưu phiên bản, xem diff giữa các phiên bản, bình luận nội bộ gắn đoạn và gắn thẻ vai trò |
| Luồng duyệt | Chuyển trạng thái với lý do bắt buộc khi trả/loại, ký số mô phỏng, khóa văn bản S4–S5, "Yêu cầu sửa" khi đã khóa |
| Trực quan | Cột "Thông tin duyệt" (dòng thời gian ai làm gì, ghi chú), dải chín bước ngang, sơ đồ toàn quy trình dạng cây (mở theo yêu cầu), bảng "Lịch sử bài viết" có lọc |
| Đăng bài | Màn hình `/dang-bai`, mỗi vai đăng vào đúng bước của mình |
| Tài liệu đính kèm | PDF, Word, ảnh, ZIP, tối đa 25 MB mỗi tệp; tệp lưu trên máy chủ, tải xuống đúng từng byte; gỡ tệp; thumbnail ảnh |
| Bản bông | Họa sĩ tải tệp thật (quyền `L`), Nhà in tải đúng tệp đó ở S7 (quyền `D`) |
| Nhật ký | Ghi mọi thao tác, chỉ ghi thêm, có cấu trúc (bước đi, bước đến, ghi chú, phiên bản) |

Giao diện học theo màn hình phê duyệt tài liệu của MISA AMIS Quy trình:
`https://helpamis.misa.vn/amis-quy-trinh/kb/bo-sung-tien-ich-tren-phan-he-tai-lieu-quy-trinh-phe-duyet-tai-lieu-quy-trinh-xem-lich-su-tai-lieu/`
(lấy con người làm trung tâm: cột duyệt bên trái, bảng lịch sử có lọc). Lúc làm, công cụ tải trang
của phiên trước bị proxy mạng chặn; sau khi chủ repo mở quyền mạng thì tải được bằng `curl`. MISA còn có "Chuyển cấp phê duyệt" và chọn đích danh người
duyệt — **chưa làm**, xem mục 6.

## 5. Bản đồ mã nguồn

```
lib/permissions.ts   MA TRẬN PHÂN QUYỀN — nguồn sự thật duy nhất: vai trò, trạng thái, MA_TRAN,
                     TRANSITIONS, DIEM_VAO và các hàm coTheDangBai / coTheTaiTepLen /
                     coTheXemTaiLieu / coTheGoTep
lib/types.ts         Article, TaiLieu, LogEntry, Version, Comment...
lib/api/             gọi backend: articlesApi, taiLieuApi, commentsApi, logsApi, thongBaoLoi
lib/store.tsx        trạng thái toàn app (React context + react-query, gọi backend); dangBai, themTaiLieu,
                     goTaiLieu, chuyenTrangThai, luuNoiDung, themBinhLuan, khoiPhucMau
lib/seed.ts          dữ liệu mẫu của bản chạy trong trình duyệt, nhánh API không còn dùng;
                     dữ liệu mẫu thật nằm ở src/prisma/seed-data.ts của backend
lib/tep.ts           quy tắc tệp: loại nhận, 25 MB, kiểm tra (hàm thuần)
lib/tepStore.ts      tải nội dung tệp từ máy chủ (layTep, taiXuongTep)
lib/danhMuc.ts       chuyên mục, loại nội dung, ấn phẩm khi đăng bài
lib/diff.ts          so sánh phiên bản
app/                 trang: /, /kho-bai, /bai-viet/[id], /nhat-ky, /dang-bai
components/          ChiTietBai (màn hình bài, ghép các khối), ThongTinDuyet, DaiBuoc,
                     SoDoQuyTrinh, LichSuTaiLieu, LichSuPhienBan, XemDiff, ThanhHanhDong,
                     BinhLuanNoiBo, FormDangBai, NutDangBai, ChonTep, TaiLieuDinhKem, KhoiBanBong,
                     Bieutuong (nhãn, avatar, chip loại tệp), TopBar, RoleSwitcher
```

Đặt tên biến và hàm theo tiếng Việt không dấu (`bai`, `vaiTro`, `trangThai`, `tep`, `taiLieu`);
nội dung giao diện bằng tiếng Việt có dấu. Giữ đúng kiểu này.

## 6. Việc đang chờ tòa soạn xác nhận

Đây là giả định của bản demo, **chưa ai chốt**:

1. **Tự đăng tự duyệt.** BTV đăng vào S2 rồi tự duyệt, TBT đăng vào S6 rồi tự ký số xuất bản. Giao
   diện đã ghi cảnh báo. Cần quyết có cho phép không.
2. **"Đăng bài" nghĩa là tạo bài mới kèm tài liệu**, không phải bấm xuất bản. Đây là cách hiểu của
   agent đã làm, từ câu "BTV/TB, TKTS, TBT đều có thể đăng bài, sửa bài ở đúng vị trí của mình". Cần chủ
   repo xác nhận.
3. **Điểm vào của từng vai** (`DIEM_VAO`) và việc PV mặc định vào S1 thay vì S0 là giả định.
4. **TKTS không tải được bản bông ở S5.** Ma trận chỉ cho `D` ở Họa sĩ (S3) và Nhà in (S7), trong khi
   TKTS "soát bản bông" ở S5. Có vẻ là sót.
5. **Họa sĩ không được báo** khi TBT sửa chữ ở S6 (chỉ có cảnh báo trên màn hình và ghi chú phiên
   bản). Có thể tự gắn thẻ bình luận cho Họa sĩ.
6. **Chọn đích danh người duyệt và "chuyển cấp phê duyệt"** như MISA: hiện quy trình định tuyến theo
   vai trò, không theo cá nhân. Đổi sang cá nhân là thay đổi mô hình, cần bàn trước.
7. **Giới hạn tệp**: 25 MB, các loại PDF/Word/ảnh/ZIP là con số của demo. Demo chỉ kiểm tra đuôi tệp
   và dung lượng. Hệ thống thật bắt buộc kiểm tra nội dung và quét mã độc, nhất là ZIP.
8. **Google Sheet "Ma trận phân quyền" đã gửi tòa soạn giờ lệch với `MA_TRAN`** (đã gộp vai, thêm `E`
   cho TBT ở S6). Chưa ai cập nhật lại Sheet.
9. Giao diện trích dẫn các "câu hỏi số 5, 10, 28, 53, 60" trong danh sách câu hỏi gửi tòa soạn. Danh
   sách đó **không nằm trong repo**; hỏi chủ repo nếu cần.

## 7. Bẫy đã gặp — đọc trước khi làm

1. **Chủ repo đẩy lên cùng nhánh khi agent đang làm.** Giữa phiên trước, `origin` đã đi trước 3
   commit chạm đúng các file đang sửa (gộp vai trò, viết lại seed). Luôn `git fetch origin
   demo/phan-quyen-workflow` rồi so sánh trước khi sửa; nếu cây sạch thì `git merge --ff-only`.
   Không rebase, không force-push.
2. **Quyền xem được ngầm hiểu.** Ma trận không ghi `R` cho người giữ bài hay người có quyền khác
   (BTV ở S2 là `◆ E C A`). Đừng dò chữ `R` để biết ai thấy bài. Dùng `getPermission(...).thayBai`;
   riêng Nhà in (chỉ `D`, không `R`) bị chặn nội dung. Hàm `coTheXemTaiLieu` đã làm đúng việc này;
   từng có lỗi ở đây và test đã bắt được.
3. **Ma trận quyền có hai bản.** Frontend `lib/permissions.ts` quyết định giao diện, backend
   `src/permissions/permissions.service.ts` chặn thật. Sửa quyền (`MA_TRAN`, `DIEM_VAO`, khóa nội
   dung theo bước) thì sửa cả hai, nếu không giao diện hiện nút mà máy chủ trả 403.
4. **Thêm trường vào `Article`** thì sửa `prisma/schema.prisma` (kèm migration), `seed-data.ts`
   ở backend và `lib/types.ts` ở frontend.
5. **Tệp đính kèm**: mô tả ở bảng `tai_lieu`, nội dung ở thư mục `uploads/` của backend (cột
   `duongDan`, tên ngẫu nhiên). Frontend chỉ thấy `coNoiDung`. "Khôi phục dữ liệu mẫu" (chỉ ADMIN)
   xóa cả hai. Tệp mẫu trong seed không có `duongDan` nên không tải được; giao diện báo rõ. Gửi
   FormData qua axios phải đặt `Content-Type: multipart/form-data`, nếu không axios đổi thành JSON.
6. **Chạy server nền để thử**: đổi cổng mỗi lần build lại; cổng cũ còn tiến trình giữ bản build cũ
   sẽ trả trang cũ mà không báo lỗi. Ở môi trường đám mây của phiên trước, `pkill -f "next start"`
   làm chết chính shell vì dòng lệnh chứa chuỗi đó; dùng `setsid npm start -- -p <cổng> &` thay thế.
7. **Kiểm thử trình duyệt**: cần một trình duyệt Chromium (phiên trước có sẵn ở
   `/opt/pw-browsers/chromium`, máy khác thì đường dẫn khác). Cài tạm
   `npm install --no-save playwright-core`; tệp script phải nằm ở thư mục gốc dự án mới import được,
   xong thì xóa. Sau khi bấm đổi vai trò, chờ khoảng 250 ms rồi mới `goto`, vì vai trò lưu bằng
   `useEffect`.
8. **`.playwright-mcp/`** (ảnh chụp và tệp `.yml`) đang nằm trong repo từ commit của chủ repo. Nên
   thêm vào `.gitignore` và gỡ khỏi git, nhưng đó là việc của chủ repo.
9. **Công cụ GitHub tùy môi trường.** Phiên trước không có `gh`, thao tác GitHub đi qua công cụ
   MCP do môi trường cung cấp, phạm vi chỉ gồm repo này. Dùng công cụ nào có sẵn ở nơi bạn chạy.

## 8. Cách kiểm thử đã dùng (51 mục, đều đạt ở `7c69514`)

Kịch bản chạy bằng Playwright, không commit vào repo. Dựng lại khi cần. Cần tạo tệp thử: một PDF,
một DOCX, một PNG 1×1, một ZIP thật, cộng ba tệp phải bị từ chối (`.exe`, PDF rỗng, ZIP 26 MB).

- **A. BTV đăng bài kèm 7 tệp**: thấy mục "Đăng bài" trên menu; bài vào S2; từ chối `.exe`, tệp rỗng,
  tệp quá 25 MB, mỗi cái kèm lý do; giữ đúng 4 tệp hợp lệ; sau khi đăng, panel liệt kê 4 tệp, ảnh
  thu nhỏ hiển thị thật, "Thông tin duyệt" có mốc "Đăng bài".
- **B. Tải xuống**: 4 tệp tải về khớp từng byte; gỡ một tệp còn 3; tải lại trang vẫn còn và vẫn tải được.
- **C. Quyền trên cùng bài ở S2**: TKTS tải thêm được nhưng không gỡ được tệp của người khác; Họa sĩ
  chỉ xem và tải; Nhà in không thấy bài; BTV gỡ được tệp mình tải.
- **D. TBT đăng vào S6 và sửa**: có nút Sửa nội dung, có cảnh báo vỡ ma-két, vẫn còn nút ký số;
  sửa xong có phiên bản mới ghi chú đúng.
- **E. PV** có hai lựa chọn bắt đầu, đề tài S0 không bắt buộc nội dung; **TKTS** vào S3.
- **F. Họa sĩ** bị từ chối ở màn đăng bài, menu không có mục Đăng bài, nút ở Kho bài bị mờ.
- **G. Chuỗi bản bông**: Họa sĩ tải bản bông S4 → Gửi bản bông → TKTS Trình duyệt → TBT Ký số →
  Nhà in tải về đúng tệp.
- **H. Tệp mẫu** báo rõ chỉ có tên; lịch sử ghi Đăng bài và Gỡ tài liệu.
- **I. Điện thoại 390 px**: không tràn ngang ở `/dang-bai` và màn hình bài.

## 9. Việc có thể làm tiếp

- Chốt các câu hỏi ở mục 6 với chủ repo trước khi dựng thêm.
- Đưa kịch bản kiểm thử trên thành tệp trong repo (`scripts/`) để chạy lại được.
- Một kiểm tra bất biến rẻ tiền: mọi bước trong `DIEM_VAO` đều phải có quyền `E` trong `MA_TRAN`.
- "Nhóm 2" theo README, chưa dựng: sa bàn báo in, kho dữ liệu số (DAM), lịch xuất bản, nhuận bút.
- Bản xếp dọc gọn hơn cho sơ đồ toàn quy trình trên máy tính bảng (hiện cuộn ngang, rộng tối thiểu 700 px).
- Đồng bộ lại Google Sheet ma trận phân quyền với `MA_TRAN`.

## 10. Quy ước làm việc

- Phát triển và đẩy lên nhánh `demo/phan-quyen-workflow`. Không đẩy sang nhánh khác khi chưa được phép.
- Commit viết tiếng Việt, tiền tố `feat:` / `fix:` / `chore:`, giải thích cái gì và vì sao.
- Muốn đổi phân quyền thì sửa `lib/permissions.ts`, không sửa trong từng màn hình.
- Trước khi đẩy: `npx tsc --noEmit`, `npm run lint`, `npm run build`, và chạy thử trên trình duyệt thật
  với từng vai trò bị ảnh hưởng. Build qua chưa có nghĩa là giao diện dùng được.

## 11. Câu mở đầu cho phiên mới

Dán cho agent bất kỳ (Claude Code, Codex, Cursor, Copilot, Gemini CLI, Aider…):

> Đọc `AGENTS.md`, `docs/BAN_GIAO.md` và `README.md`, rồi `git fetch` và so sánh với `origin/demo/phan-quyen-workflow`
> trước khi sửa gì. Dự án là bản demo phân quyền và luồng công việc tòa soạn hội tụ (Next.js 15). Mình
> muốn làm tiếp: <việc cần làm>. Các điểm ở mục 6 chưa được tòa soạn xác nhận, đừng coi là đã chốt.
