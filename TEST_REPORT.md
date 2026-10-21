# Báo cáo kiểm thử — bản GitHub Pages

Ngày: 21/10/2026. Phạm vi hiện tại: website tĩnh trên GitHub Pages; dữ liệu nghề tùy chọn được GitHub Actions lấy từ Jooble rồi xuất thành JSON. Không có backend chạy khi học sinh làm bài.

## Đã chạy thành công trên mã hiện tại

- `node tests/browser.cjs`: 22 nhóm kiểm tra. Đủ 40 câu/tổng điểm40; không chọn không chuyển; sửa đáp án giữ đúng và đổi điểm ±1; tải lại tiếp tục; hòa 1/2/4 cặp; đủ16 hồ sơ/16 ngành; in PDF; Clipboard và fallback; lọc/tìm kiếm/sắp xếp/phân trang; CSV ẩn danh/định danh và chặn công thức; JSON tính lại điểm; HTML không định danh; admin trống; kích thước375/1280; localStorage bị chặn; mock Supabase lỗi/thử lại/timeout/login/logout; CSP từ meta GitHub Pages không vi phạm trong luồng thử.
- `node tests/teacher-login.cjs`: chuyển trang khi chưa đăng nhập, sai/đúng thông tin, hiện mật khẩu, giữ phiên khi reload, đăng xuất, mobile, không lỗi JavaScript.
- `node tests/static-host.cjs`: giả lập origin `https://frentios.github.io/tracnghiem2026/`; tải đúng đường dẫn JSON tương đối; chỉ GET; không `/api`/POST/405; placeholder không tạo nghề giả; còn5 nhóm cục bộ và liên kết tới kết quả hoạt động.
- `node tests/market.cjs`: 7 nhóm. Catalog50/gộp/khử trùng/tên tiếng Việt/URL an toàn; xếp hạng và hòa; không bịa đủ50 khi nguồn ít; script Actions thiếukey, cập nhật, lỗi và giữ timestamp cũ; adapter Jooble phân trang Việt Nam không lộkey trongJSON; artifact chỉ publicfiles; UI không gửi đáp án/định danh, có5 gợi ý, giữ lịch sử, mobile; lỗi tải dùngcache có nhãn, không lỗiJS.
- `node scripts/build-pages.cjs`: tạo artifact `_site/` từ danh sách tệp công khai, không chứa scripts/workflows/SQL/dependency kiểm thử.
- `git diff --check`: không lỗi whitespace.

Test dữ liệu nghề sử dụng fixture/mock bên trong bài kiểm thử và thư mục tạm; không ghi snapshot mẫu vào dữ liệu website. `data/market.json` trong repository hiện là placeholder chưa cấu hình.

## Giới hạn xác minh

- Chưa có JOOBLE_API_KEY và chưa xác minh Jooble live. Contract API/địa lý Việt Nam, điều khoản, hạn mức và độ tươi thực tế cần kiểm tra sau khi chủ repository thêm key vào Actions Secret.
- Workflow YAML đã được viết và các lệnh chuẩn bị artifact/cập nhật đã kiểm thử cục bộ. Chưa có bằng chứng job GitHub Actions deploy/schedule/cache đã chạy thành công hoặc URL Pages đã phục vụ artifact mới. Đẩy mã không tự chứng minh deployment đã xong.
- Dữ liệu cập nhật theo lịch mỗi ngày hoặc Run workflow/push, không theo từng truy vấn trực tiếp tới nhà cung cấp. GitHub có thể trì hoãn schedule hoặc xóa cache. Timestamp cũ được giữ khi nguồn lỗi.
- Chưa thử Safari/iOS/Firefox thật, trình đọc màn hình, máy in vật lý hoặc mọi hoán vị lọc/sắp xếp. PDF Chromium và viewport mô phỏng không thay thế các kiểm tra thiết bị đó.
- Supabase là tùy chọn, chưa kiểm thử với project thật. Bộ7 kiểm tra SQL PGlite của phiên bản trước đã xác minh tính lại điểm, RLS, lũy đẳng và snapshot client_reference; không chạy lại trong lần đổi hosting này vì không thay schema/core lưu trữ. Mock không chứng minh kết nối Supabase thực tế.
- Đăng nhập giáo viên cục bộ chỉ là lớp giao diện; không tuyên bố bảo mật localStorage. Thuật toán nghề là quy tắc tham khảo, không được chuẩn hóa tâm lý học hay đại diện thống kê toàn thị trường.
