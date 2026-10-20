# Báo cáo kiểm thử

Ngày kiểm tra: 20/10/2026. Chạy trên checkout hiện tại, Python HTTP server, Chromium headless qua Playwright; JavaScript thuần không có bước build.

## Kết quả

22 nhóm kiểm thử trình duyệt và 7 nhóm kiểm thử SQL vượt qua. Các lần chạy kiểm thử không tạo dữ liệu mẫu vào mã nguồn; dữ liệu chỉ tồn tại trong browser context hoặc database nhúng tạm thời.

| Yêu cầu | Kết quả và phạm vi |
|---|---|
| 1. Hoàn thành 40 câu | Đã kiểm thử UI từ trang chủ tới kết quả; tổng 8 điểm xu hướng bằng 40. |
| 2. Chặn bỏ trống | Nút tiếp bị khóa, mũi tên phải không bỏ qua câu chưa chọn; ở câu cuối, nếu còn trống thì nhảy về câu đầu tiên còn trống; có xác nhận trước khi hoàn thành. |
| 3. Quay lại và sửa | Đáp án được giữ, có thể đổi; một lần đổi làm một xu hướng giảm 1 và xu hướng đối lập tăng 1. |
| 4. Tải lại giữa bài | Tiếp tục đúng số câu và đáp án đã chọn. Tự chuyển mặc định tắt, bật lên có hoạt động. |
| 5. Hòa điểm | Hòa 1/2/4 cặp giữ đúng 1/2/4 dấu ?, có 2/4/16 hồ sơ khả dĩ và 5 ngành; SQL và JavaScript trả cùng mã, điểm và nhóm gợi ý. |
| 6. Độ phủ dữ liệu | Có 16 hồ sơ, ánh xạ bao phủ 16 nhóm ngành. Mỗi cặp có 10 câu trong 40 câu xen kẽ. |
| 7. Supabase | Client giả lập: gửi thành công, lỗi mạng, thử lại, timeout thật 15 giây, giữ UUID; login admin/non-admin/logout. SQL thực thi trên PostgreSQL nhúng: gửi trùng không nhân đôi, 40 answers, tính điểm máy chủ, RLS anon/non-admin/admin, từ chối payload sai. |
| 8. Quản trị | Trống/có dữ liệu; tìm kiếm, lớp, so sánh, thao tác sắp xếp, phân trang 12 bản ghi thành 10+2; CSV ẩn danh/có định danh; chặn xuất khi trống; JSON tính lại điểm, gộp ID, từ chối JSON lỗi; báo cáo HTML không chứa định danh kiểm tra. |
| 9. Responsive và in | 1280 px / 375 px, không tràn ngang trang chủ/câu hỏi; chụp màn hình; tạo PDF trang kết quả bằng Chromium. |
| 10. Nội dung nguy hiểm | Tên chứa `<script>` hiển thị dạng văn bản, không sinh thẻ script; mã HS bắt đầu `=cmd` được thêm dấu nháy khi xuất CSV. Hàm CSV áp dụng cùng quy tắc cho = + - @ và khoảng trắng trước ký tự đó. |

Kiểm tra bổ sung: Clipboard API và phương án sao chép thủ công khi API/execCommand không có; thông báo khi localStorage bị chặn; CSP từ `netlify.toml` được chèn vào response trong browser test, biểu đồ hoạt động và không ghi nhận vi phạm CSP; không có lỗi JavaScript được ghi nhận trong luồng chính.

SQL đã chạy lại schema hai lần để kiểm tra khả năng tái chạy. Các lỗi payload bị từ chối mà không tạo bản ghi dở. Bảng `admins` không thể được tài khoản authenticated tự thêm quyền. Tài khoản anon bị từ chối đọc bảng; authenticated không phải admin nhận tập dữ liệu rỗng qua RLS; admin đọc được.

## Lệnh đã chạy thành công

```sh
node tests/browser.cjs
PGLITE_MODULE=/tmp/laban-db/node_modules/@electric-sql/pglite node tests/database.cjs
node --check app.js
node --check admin.js
node --check core.js
```

Xem README để cài dependency kiểm thử trên máy khác. PGlite 0.3.14 được cài vào `/tmp`, không trở thành dependency của website. Trình duyệt dùng `/usr/bin/chromium` trong môi trường này.

## Chưa kiểm thử / chưa triển khai

- Chưa kết nối dự án Supabase thật: chưa xác minh Auth email, PostgREST, mạng và cấu hình project thực tế. `auth.users`, `auth.uid()` và các role được dựng cho kiểm thử SQL; client mock không chứng minh khả năng kết nối dịch vụ thật.
- Chưa phát hành Netlify, chưa xác minh header trên URL Netlify thật. Đã kiểm tra chính sách CSP trong Chromium bằng response header tương đương.
- Chưa thử trên thiết bị iOS/Safari/Firefox thật, trình đọc màn hình, máy in vật lý hoặc hộp thoại Save as PDF của từng hệ điều hành. PDF tự động không thay thế tất cả các kiểm tra này.
- Chưa kiểm tra tải đồng thời lớn, spam RPC, proxy CAPTCHA hoặc giới hạn tần suất. CAPTCHA/rate limit phía máy chủ là phần cần bổ sung trước khi mở thu thập công khai diện rộng.
- Kiểm thử sắp xếp và một số bộ lọc xác nhận thao tác và cập nhật UI, không duyệt mọi hoán vị bộ lọc/ngày/thứ tự. Không khẳng định bộ đề được chuẩn hóa tâm lý học.
- Bản nháp môi trường lưu `start_skill`; chưa có bằng chứng xuất bản snapshot hoặc khôi phục trong task mới.

## Cập nhật đăng nhập giáo viên — 20/10/2026

Đã thêm trang teacher-login.html cho chế độ cục bộ, dùng phiên theo tab. Kiểm thử `node tests/teacher-login.cjs` xác nhận: truy cập admin trực tiếp chuyển tới đăng nhập; mật khẩu sai bị từ chối; tài khoản được yêu cầu đăng nhập thành công; bật/tắt hiển thị mật khẩu; tải lại giữ phiên; đăng xuất xóa phiên; giao diện 375 px không tràn; không có lỗi JavaScript. Bộ 22 kiểm thử trình duyệt được cập nhật để đăng nhập trước khi kiểm tra dashboard cục bộ. Đây chỉ là lớp giao diện, không phải cơ chế bảo mật cho localStorage; chế độ Supabase tiếp tục dùng Auth và RLS.
