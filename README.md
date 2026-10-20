# La bàn — Khám phá tính cách, định hướng tương lai

Website tiếng Việt dành cho học sinh THPT, với API đề xuất nghề động qua Netlify Functions. HTML/CSS/JavaScript thuần, không cần build frontend. Phần đề xuất trực tuyến cần backend Node.js serverless và API key Jooble do chủ site đăng ký; không đặt khóa trong trình duyệt. Chạy mặc định ở chế độ cục bộ.

**Đây là công cụ tham khảo giáo dục, không phải bài đánh giá MBTI® chính thức, không chẩn đoán tâm lý và không khẳng định nghề phù hợp tuyệt đối.** Bộ câu hỏi tự biên soạn chưa được chuẩn hóa tâm trắc. Điểm không đo trí thông minh, năng lực hay xác suất thành công trong nghề.

## Chạy ngay

Từ thư mục dự án:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Mở `index.html` qua máy chủ tĩnh để dùng bài trắc nghiệm và gợi ý nhóm cục bộ. Máy chủ Python/GitHub Pages không chạy được API nghề Việt Nam; để bật phần động hãy làm theo phần triển khai backend bên dưới. `admin.html` dành cho giáo viên. Không cần `npm install` để sử dụng. Nên dùng trình duyệt hiện đại và HTTP/HTTPS thay vì mở qua `file://` vì lưu trữ/Clipboard có thể khác nhau. Khi phát hành dùng HTTPS.

## Triển khai Netlify

1. Tạo site Netlify bằng Git repository hoặc chọn Deploy manually.
2. Chọn Import from Git → GitHub → repository này. Build command để trống; publish directory là `.`; functions directory là `netlify/functions` (cấu hình tự đọc trong netlify.toml). **Dùng Git deploy hoặc Netlify CLI để build Functions; kéo thả thư mục tĩnh không triển khai được backend.**
3. Mở URL HTTPS được cấp và thử trang chủ, hoàn thành bài, tải lại giữa bài, kiểm tra trang quản trị.
4. Kiểm tra response headers trong DevTools: CSP, nosniff và `X-Robots-Tag` cho `admin.html`. Máy chủ Python chỉ dùng phát triển, không áp dụng các header Netlify.
5. Không cần SPA redirect. Không có khóa bí mật trong thư mục phát hành. `noindex` chỉ ngăn lập chỉ mục, không phải cơ chế bảo vệ truy cập.

Ứng dụng không tự tạo tài khoản hoặc đăng lên Netlify; cần chủ site kết nối GitHub và thêm khóa Jooble qua cài đặt an toàn. Việc đẩy mã lên GitHub không đồng nghĩa backend đã được triển khai.

## Cấu hình

Sửa `config.js`:

- `schoolName`: tên trường hiển thị ở trang chủ.
- `required.studentId`, `required.name`, `required.className`: bắt buộc các trường tương ứng khi bắt đầu.
- `anonymousExport`: mặc định ẩn danh CSV kết quả; giáo viên có thể thay đổi trong dashboard.
- `supabaseUrl`, `supabaseAnonKey`: để trống để dùng localStorage. Điền cả hai để dùng Supabase. Chỉ điền URL dự án và **anon key công khai**, tuyệt đối không dùng `service_role`, mật khẩu hay khóa bí mật.

Bản JSON sao lưu có định danh và câu trả lời; bảo quản an toàn. CSV ẩn danh loại bỏ họ tên/lớp và thay mã HS bằng HS-0001… theo từng lần xuất, không phải mã ẩn danh ổn định xuyên các bản xuất.

## Dữ liệu cục bộ

Tiến độ, đáp án và kết quả được lưu trong localStorage của đúng origin/trình duyệt. Không đồng bộ giữa thiết bị, tên miền hay hồ sơ trình duyệt; khi bật đề xuất nghề trực tuyến, 40 đáp án (không có họ tên/mã HS/lớp) được gửi đến API riêng để tính lại và xếp hạng; xóa dữ liệu trình duyệt sẽ mất dữ liệu. Trang quản trị cục bộ có trang `teacher-login.html` theo yêu cầu: tài khoản `admin`, mật khẩu `admin@dvt`. Phiên đăng nhập lưu trong sessionStorage của tab; đăng xuất xóa phiên. Đây chỉ là lớp giao diện để tránh mở dashboard ngoài ý muốn, **không bảo vệ dữ liệu**: mã xác minh nằm trong JavaScript và có thể bị bỏ qua; bất cứ ai có quyền dùng trình duyệt trên thiết bị vẫn có thể đọc dữ liệu cục bộ. Khi cấu hình Supabase, vẫn phải dùng Supabase Auth và RLS, tài khoản cục bộ không cấp quyền cơ sở dữ liệu. Không nên dùng thiết bị chung để lưu thông tin nhạy cảm.

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

## API nghề động: nguồn Việt Nam và cách kích hoạt

**Nguồn lựa chọn:** [Jooble API — trang đăng ký/tài liệu chính thức](https://jooble.org/api/about), [cổng tuyển dụng Jooble Việt Nam](https://vn.jooble.org/). API key phải được cấp cho tài khoản/website của chủ site. Kiểm tra điều khoản và hạn mức hiện tại khi đăng ký; bản này không cam kết hạn mức miễn phí không đổi hoặc truy cập không cần phê duyệt. Chưa có key thật trong dự án, nên kết nối live còn là bước bắt buộc trước khi công bố tính năng đã hoạt động.

1. Đăng ký nhận API key tại trang Jooble ở trên. Không gửi khóa trong chat.
2. Trong Netlify chọn Import from Git, kết nối `frentios/tracnghiem2026`, dùng `netlify.toml` sẵn có. Đây là thay đổi cần thiết so với chỉ host GitHub Pages vì Pages không thực thi backend hoặc giữ API key bí mật.
3. Netlify → Site configuration → Environment variables: thêm **JOOBLE_API_KEY**, scope **Functions/runtime**, giá trị là khóa được cấp. Không đặt vào `config.js` hoặc commit `.env`. Redeploy sau khi thêm/đổi biến.
4. Mở `/api/careers` trên **site Netlify**: phải trả JSON `provider: "jooble"` với thời điểm lấy, số tin trong mẫu và tối đa 50 chức danh. Khi thiếu khóa API trả 503 với thông báo; khóa sai/nguồn lỗi trả 502. Không báo đã kết nối khi chưa có JSON hợp lệ.
5. Làm một bài, kiểm tra phần “Khám phá nghề từ nguồn tuyển dụng”: nguồn, thời điểm, số chức danh thực có và 5 gợi ý cá nhân. API `/api/recommend` nhận POST chỉ gồm `{ "answers": [40 giá trị 0 hoặc 1] }`, tự tính lại điểm và giữ `?` khi hòa; từ chối payload có định danh.
6. Nếu đang dùng Supabase, chạy lại `supabase/schema.sql` để thêm cột `market_snapshot` trước khi dùng dashboard mới. Snapshot nghề được lưu cùng kết quả với provenance `client_reference`: tham chiếu từ client, không phải dữ liệu nguồn được Supabase chứng thực. Điểm/mã vẫn được tính lại bằng SQL.

`config.js` hiện dùng `market: { mode: "auto", provider: "jooble", apiUrl: "api/careers", recommendUrl: "api/recommend" }`. Hai URL tương đối chạy cùng origin trên Netlify. Chưa hỗ trợ mặc định gọi chéo origin từ GitHub Pages sang backend khác; cấu hình CORS/allowlist CSP phải được thiết kế riêng nếu muốn tách hosting.

### Dữ liệu “50 nghề phổ biến” nghĩa là gì?

- Backend truy vấn Jooble với `location: "Việt Nam"`, tối đa 5 trang. Đây là mẫu tin từ một nguồn, không phải thống kê toàn thị trường Việt Nam. Phạm vi địa lý phụ thuộc bộ lọc của nhà cung cấp; cần kiểm tra thực tế khi có khóa.
- Tin trùng URL chỉ đếm một lần. Chức danh được chuẩn hóa chữ hoa/thường, dấu câu, một số cấp bậc và phần trong ngoặc; các chức danh gần nhau vẫn có thể chưa được gộp hoàn toàn. Không tuyên bố nhận diện nghề bằng mô hình chuẩn hóa quốc gia.
- Lấy tối đa 50 chức danh có tần suất cao nhất trong mẫu, hòa tần suất ưu tiên tin mới rồi khóa tên ổn định. Nếu nguồn chỉ có 23 chức danh hợp lệ thì hiển thị 23, không tự bịa 27 để đủ 50.
- API được gọi mỗi lần hoàn thành bài. Để bảo vệ quota, backend/CDN dùng bộ đệm tối đa khoảng 10 phút; ghi rõ thời điểm lấy nguồn. Không gọi dữ liệu trong cache là vừa cập nhật từ internet. Tin gốc có thể cũ hơn ngày tải; bản ghi có `oldestAt`/`newestAt`.
- Mỗi gợi ý có URL tin gốc để kiểm tra, không dùng mô tả HTML từ API đưa vào trang. Tin tuyển dụng không bảo đảm còn nhận hồ sơ và không phải lời mời học sinh ứng tuyển ngay.

### Thuật toán v2, minh bạch và có giới hạn

`career-engine.js` chạy chung ở browser/backend. Tên nghề/nhãn được ánh xạ bằng quy tắc tiếng Việt/Anh sang 16 nhóm; nghề chưa phân loại được vào nhóm khác, không đoán ngành chi tiết. Vector giả định theo 4 trục là **quy tắc biên soạn để khám phá**, chưa được chuẩn hóa tâm trắc cho từng nghề.

Với mỗi cặp, độ lệch = (điểm chữ thứ nhất − điểm chữ thứ hai)/10. Điểm ưu tiên nội bộ = 85% đối chiếu vector xu hướng + 15% log(tần suất chức danh trong mẫu). Hòa 5–5 đóng góp 0 ở trục tương ứng. Không hiển thị con số này như “% phù hợp” hoặc xác suất thành công. Không dùng AI tạo ngành, không gửi định danh cho Jooble; chỉ backend gửi vị trí và tham số tìm kiếm.

Kết quả giữ cả catalog tối đa 50 nghề cùng 5 nghề đã xếp hạng, nguồn và thời điểm. Mở lại kết quả có snapshot sẽ giữ snapshot đó; nút “Tải lại dữ liệu nghề” mới chủ động thay bằng bản cập nhật. Nếu API lỗi, chỉ dùng cache cùng nhà cung cấp, gắn nhãn bản cũ; không có cache thì hiện lỗi và giữ phần 16 nhóm tham khảo cục bộ. Dashboard và CSV thêm nghề từ internet; các biểu đồ 16 nhóm hiện vẫn tính nhóm tham khảo từ bộ câu hỏi, không tự đồng nhất với 50 chức danh động.

### Phát triển và kiểm thử backend

Frontend không cần npm. Để chạy Functions cục bộ, dùng Node.js >= 22, cài Netlify CLI ở ngoài checkout hoặc môi trường phát triển, thêm JOOBLE_API_KEY qua cấu hình an toàn, chạy `netlify dev` tại thư mục dự án (cổng mặc định 8888). Máy chủ Python không thay thế Netlify Functions. Thêm biến thật không phải là bước đã được kiểm thử tự động trong báo cáo.

```sh
node tests/market.cjs
```

Kiểm thử này dùng fixture đánh dấu rõ trong test và mock fetch, không lấy dữ liệu giả để hiển thị cho người dùng thật. Kiểm tra thật với Jooble vẫn chưa thực hiện do chưa có API key, truy cập tài liệu/API từ môi trường hiện tại bị chặn 403. Không coi việc test mock vượt qua là bằng chứng nguồn đã kết nối.


### Chạy trên GitHub Pages (bản sửa lỗi 405)

Chế độ auto nhận diện hostname `*.github.io`: không POST đáp án tới API tương đối trên Pages, không hiện nút tải lại khi backend chưa tồn tại. Gợi ý nhóm ngành cục bộ tiếp tục hoạt động. Với custom domain, HTTP 404/405 hoặc response HTML thay JSON được xem là backend chưa bật, không phải lỗi mạng cần thử liên tục. Netlify thiếu key trả mã máy đọc BACKEND_NOT_CONFIGURED. Đây là xử lý trạng thái chưa cấu hình, không tự tạo backend hay nguồn dữ liệu trực tuyến. Để có đề xuất nghề mới vẫn cần Netlify Functions và JOOBLE_API_KEY.
