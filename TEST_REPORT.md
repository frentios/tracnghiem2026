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

## Cập nhật API nghề Việt Nam — 20/10/2026

Đã thêm backend Node.js qua Netlify Functions, adapter Jooble, engine xếp hạng chung browser/server và snapshot lưu cùng bài. `tests/market.cjs` có 9 nhóm kiểm tra vượt qua bằng fixture/mock:

1. Phân loại tên tiếng Việt, loại tin trùng URL, gộp chức danh, chọn 50 từ 60 chức danh hợp lệ, loại URL không an toàn.
2. Xếp hạng theo cả 4 cặp, hòa giữ trung lập; không dùng định danh để tính gợi ý.
3. Nguồn có ít hơn 50 chức danh giữ đúng số thật.
4. API `/api/recommend` tự tính 40 đáp án, trả mã hòa đúng, từ chối thiếu câu và payload có định danh.
5. Backend phân trang với `location: Việt Nam`, bộ đệm, phương thức HTTP và không đưa khóa vào response.
6. Thiếu key trả 503; key/quyền sai trả lỗi 502 không lộ khóa.
7. UI hiển thị 5 gợi ý từ catalog 50, lưu snapshot, mở lại giữ bản cũ và không tràn ngang 375 px.
8. Khi mất kết nối và có cache, gắn nhãn bản cũ thay vì gọi là dữ liệu mới.
9. Khi lỗi và chưa có cache, không bịa nghề và vẫn có nút thử lại.

Đã chạy lại thành công 22 nhóm Playwright cũ, kiểm thử đăng nhập giáo viên và 7 nhóm SQL. SQL còn kiểm tra lưu market_snapshot với provenance `client_reference` và từ chối provider/nhóm ngành không hợp lệ. Frontend vẫn có thể chạy trắc nghiệm/gợi ý nhóm cục bộ khi backend chưa có.

**Chưa xác minh live**: chưa có JOOBLE_API_KEY hoặc quyền triển khai Netlify trong môi trường. Truy cập tài liệu chính thức Jooble/Arbeitnow/ESCO bị chặn 403; tài liệu Remotive từ GitHub đọc được và xác nhận nguồn đó không phù hợp làm mặc định Việt Nam (thiên remote, khuyến nghị tối đa 4 lượt/ngày). Adapter Jooble đang dựa trên contract API `POST /api/{key}`, các trường jobs/title/link/company/location/updated; cần xác minh lại với key thật và điều khoản/hạn mức tài khoản trước khi gọi kết nối là đã hoạt động. Không có dữ liệu tuyển dụng giả hoặc snapshot mẫu được nhúng vào website phát hành.

GitHub Pages không thực thi Functions. Đẩy mã lên GitHub chỉ cập nhật frontend và mã backend; cần Netlify Git deployment + biến JOOBLE_API_KEY để phần động chạy thật. Các trường hợp CORS tách hosting, hạn mức live, phạm vi Việt Nam thực tế của nhà cung cấp, tốc độ triển khai và quota lớn chưa được kiểm thử.


## Sửa lỗi 405 trên GitHub Pages — 20/10/2026

Kiểm thử `node tests/static-host.cjs`: giả lập origin GitHub Pages và xác nhận không gọi API/POST, không hiện lỗi 405 hoặc nút thử lại vô ích; liên kết tới gợi ý cục bộ hoạt động và vẫn đủ 5 nhóm gợi ý. Trên origin khác, kiểm tra 405, response HTML 200 và 503 BACKEND_NOT_CONFIGURED đều hiển thị trạng thái chưa kích hoạt. Không coi đây là bằng chứng backend live đã chạy. Chạy lại `node tests/market.cjs` để xác minh luồng API bình thường, lỗi mạng và cache.
