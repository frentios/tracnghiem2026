# La bàn — Khám phá tính cách, định hướng tương lai

Website tĩnh bằng tiếng Việt dành cho học sinh THPT. HTML/CSS/JavaScript thuần, không cần build, máy chủ ứng dụng hoặc API trả phí. Chạy mặc định ở chế độ cục bộ.

**Đây là công cụ tham khảo giáo dục, không phải bài đánh giá MBTI® chính thức, không chẩn đoán tâm lý và không khẳng định nghề phù hợp tuyệt đối.** Bộ câu hỏi tự biên soạn chưa được chuẩn hóa tâm trắc. Điểm không đo trí thông minh, năng lực hay xác suất thành công trong nghề.

## Chạy ngay

Từ thư mục dự án:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Mở `index.html` qua máy chủ tĩnh. `admin.html` dành cho giáo viên. Không cần `npm install` để sử dụng. Nên dùng trình duyệt hiện đại và HTTP/HTTPS thay vì mở qua `file://` vì lưu trữ/Clipboard có thể khác nhau. Khi phát hành dùng HTTPS.

## Triển khai Netlify

1. Tạo site Netlify bằng Git repository hoặc chọn Deploy manually.
2. Build command để trống; publish directory là `.` (thư mục chứa `index.html`). Khi kéo thả, đưa toàn bộ thư mục dự án gồm `vendor/` và `netlify.toml`.
3. Mở URL HTTPS được cấp và thử trang chủ, hoàn thành bài, tải lại giữa bài, kiểm tra trang quản trị.
4. Kiểm tra response headers trong DevTools: CSP, nosniff và `X-Robots-Tag` cho `admin.html`. Máy chủ Python chỉ dùng phát triển, không áp dụng các header Netlify.
5. Không cần SPA redirect. Không có khóa bí mật trong thư mục phát hành. `noindex` chỉ ngăn lập chỉ mục, không phải cơ chế bảo vệ truy cập.

Ứng dụng không tự đăng lên Netlify; cần tài khoản và thao tác triển khai của chủ site.

## Cấu hình

Sửa `config.js`:

- `schoolName`: tên trường hiển thị ở trang chủ.
- `required.studentId`, `required.name`, `required.className`: bắt buộc các trường tương ứng khi bắt đầu.
- `anonymousExport`: mặc định ẩn danh CSV kết quả; giáo viên có thể thay đổi trong dashboard.
- `supabaseUrl`, `supabaseAnonKey`: để trống để dùng localStorage. Điền cả hai để dùng Supabase. Chỉ điền URL dự án và **anon key công khai**, tuyệt đối không dùng `service_role`, mật khẩu hay khóa bí mật.

Bản JSON sao lưu có định danh và câu trả lời; bảo quản an toàn. CSV ẩn danh loại bỏ họ tên/lớp và thay mã HS bằng HS-0001… theo từng lần xuất, không phải mã ẩn danh ổn định xuyên các bản xuất.

## Dữ liệu cục bộ

Tiến độ, đáp án và kết quả lưu trong localStorage của đúng origin/trình duyệt. Không đồng bộ giữa thiết bị, tên miền hay hồ sơ trình duyệt; xóa dữ liệu trình duyệt sẽ mất dữ liệu. Trang quản trị cục bộ có trang `teacher-login.html` theo yêu cầu: tài khoản `admin`, mật khẩu `admin@dvt`. Phiên đăng nhập lưu trong sessionStorage của tab; đăng xuất xóa phiên. Đây chỉ là lớp giao diện để tránh mở dashboard ngoài ý muốn, **không bảo vệ dữ liệu**: mã xác minh nằm trong JavaScript và có thể bị bỏ qua; bất cứ ai có quyền dùng trình duyệt trên thiết bị vẫn có thể đọc dữ liệu cục bộ. Khi cấu hình Supabase, vẫn phải dùng Supabase Auth và RLS, tài khoản cục bộ không cấp quyền cơ sở dữ liệu. Không nên dùng thiết bị chung để lưu thông tin nhạy cảm.

Ứng dụng phát hiện lỗi lưu trữ và thông báo, có thể tiếp tục trong bộ nhớ phiên. Khi lưu thất bại hãy in/PDF/sao chép ngay. Nhập JSON kiểm tra toàn bộ tệp trước khi ghi, tính lại điểm, hồ sơ và gợi ý từ câu trả lời, gộp theo UUID để không nhân đôi. Điểm/mã trong tệp không được tin cậy.

## Kết nối Supabase

1. Tạo dự án Supabase. Chạy toàn bộ `supabase/schema.sql` trong SQL Editor bằng tài khoản chủ dự án. Script có giao dịch, có thể chạy lại; không xóa dữ liệu cũ.
2. Vào Authentication → Providers/Sign In settings, **tắt Allow new users to sign up** (đăng ký công khai).
3. Tạo user quản trị bằng Dashboard, đặt mật khẩu mạnh và xác nhận email theo chính sách của trường. Không viết mật khẩu vào website.
4. Lấy UUID của user, chạy bằng SQL Editor:

   ```sql
   insert into public.admins(user_id)
   values ('UUID-USER-QUAN-TRI') on conflict do nothing;
   ```

5. Điền project URL và anon key vào `config.js`, triển khai lại website. CSP hiện hỗ trợ host chuẩn `*.supabase.co`; nếu dùng domain tùy chỉnh, cập nhật CSP với đúng host.
6. Mở `admin.html`, đăng nhập email/mật khẩu. Client gọi `is_admin()` trước khi truy vấn; RLS là lớp bảo vệ thực sự. Học sinh chỉ được gọi `submit_result(p jsonb)` và không được đọc bảng.
7. Thử gửi bài bằng một trình duyệt khác. Chỉ thông báo đã lưu máy chủ sau khi RPC thành công. Timeout 15 giây hoặc lỗi mạng giữ bản cục bộ và hiện nút thử lại. RPC đang chạy có thể vẫn hoàn tất sau timeout; cùng UUID gửi lại không tạo bản sao.

### Phân quyền và tính toàn vẹn

- Bốn bảng `submissions`, `answers`, `recommendations`, `admins` đều bật RLS.
- Thu hồi quyền mặc định PUBLIC/anon/authenticated; authenticated chỉ có SELECT qua policy `is_admin()`. Anon không có quyền đọc. Không có quyền ghi bảng trực tiếp cho học sinh.
- RPC security definer đặt search_path rỗng, dùng tên bảng đầy đủ; giới hạn thông tin học sinh 120 ký tự/trường, xác minh 40 đáp án số 0/1 và nhóm ngành hợp lệ.
- Máy chủ tự tính điểm, mã cân bằng và 5 gợi ý từ ánh xạ; không dùng điểm/mã/gợi ý do client tự khai để lưu kết quả. Cả ba bảng được ghi trong cùng giao dịch. `created_at` lấy từ máy chủ.
- Nếu chỉnh câu hỏi, thứ tự phương án hoặc ánh xạ sau này, phải cập nhật đồng bộ `data.js` và các hằng số trong `schema.sql`; không đổi ý nghĩa bộ đề khi đang thu thập mà không có kế hoạch phiên bản dữ liệu.
- RPC công khai vẫn có nguy cơ spam. Trước khi thu thập diện rộng cần bổ sung CAPTCHA **được xác minh ở phía máy chủ** và giới hạn tần suất tại gateway/Edge Function. CAPTCHA giao diện không tự bảo vệ RPC. Bản này chưa có chống lạm dụng đó. Không gửi service_role xuống client.
- Supabase Auth session được lưu bởi SDK trên thiết bị. Đăng xuất sau khi dùng máy chung. Nhà trường cần chính sách đồng ý, lưu giữ, xóa dữ liệu và phạm vi người quản trị trước khi thu thập định danh học sinh.

## Cách tính điểm và đọc thống kê

40 câu xen kẽ EI/SN/TF/JP, mỗi cặp 10 câu. Vị trí A/B được đảo theo quy tắc cố định. Mỗi lựa chọn cộng 1 điểm cho một chữ. Cặp 5–5 giữ `?`; tất cả hồ sơ khả dĩ có thể xem bằng tab. Gợi ý khi cân bằng: đếm tần suất nhóm ngành trong các hồ sơ khả dĩ, lấy 5 nhóm cao nhất; khi bằng tần suất dùng ID ngành tăng dần để đảm bảo tái lập giữa JavaScript và SQL.

Biểu đồ ngành tính tỷ lệ trên **tổng lượt gợi ý**, không trên số học sinh. “Số lượt được gợi ý” không phải số học sinh yêu thích hay chọn ngành đó. Bộ lọc và tìm kiếm áp dụng cho bảng, chỉ số, biểu đồ và các tệp xuất. Bản tổng hợp HTML chỉ có số lượt và tên ngành, không có định danh hay tên lớp. Dashboard Supabase tải dữ liệu theo trang 500 bản ghi để tránh giới hạn truy vấn mặc định.

Số học sinh có định danh được ước tính bằng mã HS; nếu thiếu mã dùng họ tên + lớp; hoàn toàn ẩn danh không được tính là một học sinh xác định. Các cặp cân bằng được gộp riêng trên biểu đồ; không ép vào một trong 16 nhóm.

## Thư viện và cấu trúc

- `vendor/chart.umd.js`: Chart.js 4.4.8, giấy phép MIT trong thư mục vendor.
- `vendor/supabase.js`, `vendor/591.supabase.js`: Supabase JS 2.49.1, giấy phép MIT. Chunk được giữ để SDK có thể nạp cục bộ.
- Thư viện lấy từ tarball chính thức qua HTTPS npm; `vendor/SHA256SUMS` ghi checksum tệp đã đóng gói.
- Chỉ font Be Vietnam Pro tải từ Google Fonts, có sans-serif dự phòng. Không tải JS từ CDN.
- `data.js`: 40 câu, 16 hồ sơ, mô-đun học/nhóm, 16 ngành và ánh xạ rõ ràng.
- `core.js`: kiểm tra/tính điểm, lưu trữ, RPC, CSV an toàn.
- `app.js`: trang chủ, từng câu, tiến độ, kết quả, in/PDF, sao chép.
- `admin.js`: xác thực, lọc, thống kê, phân trang, nhập/xuất.
- `supabase/schema.sql`: bảng, RPC và RLS; `netlify.toml`: header bảo mật.

## Kiểm thử

Xem `TEST_REPORT.md`. Các kiểm thử không phải dependency runtime. Nếu máy chưa có công cụ, cài vào thư mục tạm bên ngoài checkout:

```sh
npm install --prefix /tmp/laban-test-tools --cache /tmp/laban-npm-cache playwright @electric-sql/pglite@0.3.14
NODE_PATH=/tmp/laban-test-tools/node_modules /tmp/laban-test-tools/node_modules/.bin/playwright install chromium
```

Chạy máy chủ ở port 8000, sau đó trong thư mục dự án:

```sh
# Đổi CHROMIUM_PATH thành đường dẫn Chromium đã cài trên máy bạn.
NODE_PATH=/tmp/laban-test-tools/node_modules CHROMIUM_PATH=/usr/bin/chromium node tests/browser.cjs
NODE_PATH=/tmp/laban-test-tools/node_modules node tests/database.cjs
```

Bài kiểm thử SQL dùng PostgreSQL nhúng PGlite với role anon/authenticated và mô phỏng `auth.uid()`, không phải dự án Supabase thật. Kiểm thử trình duyệt dùng client Supabase giả lập để xác minh trạng thái UI. Cần thử kết nối Auth/PostgREST thật trước khi thu thập dữ liệu trên hệ thống chính thức.
