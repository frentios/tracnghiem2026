# La bàn — Khám phá tính cách, định hướng tương lai

Website tiếng Việt cho học sinh THPT, chạy hoàn toàn bằng HTML/CSS/JavaScript trên **GitHub Pages**, kể cả đường dẫn con `/tracnghiem2026/`. Không có máy chủ ứng dụng, Functions, khóa bí mật trong trình duyệt hoặc bước cài dependency để chạy frontend.

**Công cụ tham khảo giáo dục, không phải bài đánh giá MBTI® chính thức; không chẩn đoán tâm lý, không đo trí thông minh/năng lực và không khẳng định nghề phù hợp tuyệt đối.** Bộ đề tự biên soạn chưa được chuẩn hóa tâm trắc.

## Mở website và triển khai

Website: https://frentios.github.io/tracnghiem2026/

Repository → Settings → Pages → Source chọn **GitHub Actions**. Workflow `.github/workflows/pages.yml` tự xuất bản khi đẩy mã vào `main`, khi chạy thủ công và mỗi ngày khoảng **08:17 giờ Việt Nam** (GitHub có thể chạy trễ lịch). Trong Actions chọn **Deploy website to GitHub Pages → Run workflow** để chạy ngay. Trạng thái thành công của job deploy mới xác nhận triển khai xong.

Workflow dùng Node.js 22 để chuẩn bị dữ liệu/tệp tĩnh, không dùng Jekyll. `scripts/build-pages.cjs` tạo `_site/` chỉ gồm tài nguyên công khai; không đóng gói workflow, script tải dữ liệu, SQL hay dependency kiểm thử. `.nojekyll` được giữ. Có thể dùng “Deploy from a branch → main → / (root)” để chạy trắc nghiệm tĩnh, nhưng cách đó không chạy bước cập nhật nghề định kỳ.

Chạy phát triển:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Mở trang chủ qua máy chủ tĩnh. Tệp JSON nghề được tải bằng **GET cùng origin**, URL tương đối đúng đường dẫn con. Không POST vào `/api`, không gửi đáp án hay định danh cho nguồn tin tuyển dụng. Tính điểm và xếp hạng nghề chạy trong trình duyệt.

## Trắc nghiệm và gợi ý

40 câu xen kẽ EI/SN/TF/JP, mỗi cặp 10 câu. Mỗi màn hình một câu; A/B được đảo cố định. Có lưu tiến độ, quay lại sửa, phím tắt, tùy chọn tự chuyển, xác nhận hoàn thành, in/PDF và sao chép với phương án dự phòng.

Hòa 5–5 giữ `?`, hiển thị các hồ sơ khả dĩ. Các gợi ý nhóm ngành cục bộ đếm tần suất trong các hồ sơ, lấy tối đa 5; khi bằng nhau dùng ID tăng dần. Có 16 hồ sơ và 16 nhóm ngành, mọi nhóm có trong ánh xạ. Tính cách chỉ là một nguồn tham khảo bên cạnh sở thích, học lực, năng lực, giá trị, điều kiện thực tế và trải nghiệm nghề.

## Dữ liệu 50 nghề từ internet, chỉ dùng GitHub

Nguồn: [Jooble API](https://jooble.org/api/about), tìm tin có vị trí **Việt Nam**. Đây là mẫu từ một nhà cung cấp, không phải top 50 toàn thị trường. Điều khoản, cấp khóa và hạn mức cần kiểm tra với tài khoản Jooble; chưa có kết nối live khi chưa có key hợp lệ.

Cách bật cập nhật:

1. Đăng ký API key tại Jooble. Không đưa khóa vào file, browser hoặc chat.
2. Repository GitHub → **Settings → Secrets and variables → Actions → New repository secret**.
3. Name **JOOBLE_API_KEY**, Secret là khóa được cấp → Save.
4. Chạy workflow **Deploy website to GitHub Pages**. Workflow gửi khóa tới Jooble để lấy tin, giữ khóa trong bước Actions và chỉ xuất dữ liệu công khai vào `data/market.json` của artifact.
5. Kiểm tra trang kết quả và thời điểm lấy nguồn. Không coi chạy fixture/mock thành công là bằng chứng đã kết nối Jooble thật.

Không có key: website vẫn chạy trắc nghiệm, kết quả, giáo viên và gợi ý nhóm cục bộ; không bịa nghề trực tuyến. Tệp trong repository là placeholder rõ ràng. Khi nguồn lỗi/thiếu key, Actions giữ snapshot cũ hợp lệ từ cache nếu có, không đổi thời điểm để giả là vừa lấy mới. Cache có thể bị GitHub xóa; nếu không còn bản tốt thì xuất placeholder. Lỗi ghi/build vẫn làm workflow thất bại.

Mỗi lần hoàn thành bài, trình duyệt tải bản JSON mới nhất đã xuất bản; **không truy vấn Jooble tức thời cho từng học sinh**. Nguồn được cập nhật theo lịch hoặc khi bấm Run workflow. Mở lại kết quả có snapshot giữ bản đã lưu; nút tải lại chủ động cập nhật. Luôn hiển thị thời điểm nguồn, số tin và số chức danh thực có. Nếu chỉ có 23 chức danh hợp lệ thì hiển thị 23, không tạo thêm để đủ 50.

Adapter lấy tối đa 5 trang, loại tin trùng URL, chuẩn hóa chức danh và chọn tối đa 50 theo tần suất trong mẫu; hòa ưu tiên thời gian tin rồi tên. Việc chuẩn hóa có giới hạn, không phải phân loại nghề chuẩn quốc gia. Lịch mỗi ngày dùng tối đa 5 request/lần; push/chạy thủ công dùng thêm quota của tài khoản.

Thuật toán `career-engine.js`: đối chiếu 4 cặp liên tục với vector giả định theo nhóm nghề, 85% xu hướng + 15% log(tần suất trong mẫu). Hòa đóng góp 0 ở trục tương ứng. Đây là quy tắc khám phá biên soạn, không hiển thị như “% phù hợp” đã kiểm định. Các ví dụ tin gốc có liên kết để tự kiểm tra, không phải lời mời học sinh ứng tuyển.

## Lưu trữ và giáo viên

Mặc định localStorage theo origin/trình duyệt, không đồng bộ thiết bị. Chuyển từ domain khác sang Pages sẽ không tự mang dữ liệu theo; dùng sao lưu JSON trước. Nếu bị chặn/hết dung lượng, ứng dụng báo rõ; hãy in hoặc sao chép ngay.

Trang `teacher-login.html`: tài khoản **admin**, mật khẩu **admin@dvt** theo yêu cầu. Phiên theo tab trong sessionStorage; có đăng xuất. **Đây chỉ là lớp giao diện, không bảo vệ dữ liệu cục bộ bằng mật khẩu.** Người có quyền dùng trình duyệt trên thiết bị vẫn có thể đọc dữ liệu. Không dùng làm cơ chế bảo mật cho dữ liệu nhạy cảm.

Dashboard có bộ lọc, biểu đồ/bảng, tìm kiếm, sắp xếp, phân trang, CSV, JSON và HTML tổng hợp không định danh. Thống kê 16 nhóm dựa trên bài trắc nghiệm; bảng nghề trực tuyến dựa trên snapshot đã lưu, không tự đồng nhất hai nguồn. “Số lượt được gợi ý” không phải số học sinh yêu thích hay chọn ngành.

CSV mặc định ẩn danh (HS-0001…) và chặn công thức = + - @. JSON có định danh, cần bảo quản an toàn. Nhập kiểm tra toàn bộ dữ liệu, tính lại điểm từ 40 đáp án và gộp UUID. Số học sinh có định danh dựa vào mã HS, hoặc tên + lớp nếu thiếu mã; bài hoàn toàn ẩn danh không được coi là một học sinh xác định.

## Cấu hình

`config.js`: tên trường, bắt buộc mã HS/họ tên/lớp, mặc định ẩn danh CSV; `market.dataUrl` mặc định `data/market.json` phải cùng origin. Không thêm API key vào đây.

Supabase vẫn là lựa chọn độc lập nếu cần đồng bộ và xác thực thực sự; để URL/key trống thì không sử dụng. Supabase client chạy trực tiếp trên GitHub Pages với **anon key công khai**, tuyệt đối không dùng service_role.

1. Tạo project và chạy `supabase/schema.sql` trong SQL Editor. Nếu đã dùng bản trước, chạy lại để thêm `market_snapshot`.
2. Tắt đăng ký công khai trong Authentication. Tạo user giáo viên bằng Dashboard, lấy UUID.
3. SQL Editor: `insert into public.admins(user_id) values ('UUID-USER') on conflict do nothing;`.
4. Điền URL/anon key vào config rồi đẩy lên GitHub. Chế độ này dùng email/mật khẩu Supabase, không dùng tài khoản UI cục bộ để cấp quyền DB.
5. Thử gửi bài và đăng nhập với dự án thật trước khi thu thập dữ liệu.

RLS trên cả 4 bảng; anon chỉ gọi RPC submit_result, không đọc bảng. RPC xác minh 40 đáp án, tính lại điểm/mã/gợi ý nhóm, ghi giao dịch lũy đẳng theo UUID. Chỉ admin đọc. Snapshot nghề là `client_reference`, không được Supabase chứng thực là dữ liệu nguồn. Lỗi mạng/timeout 15 giây giữ bản cục bộ và có thử lại. Cần chính sách dữ liệu học sinh, CAPTCHA/rate limit phía máy chủ trước khi mở thu thập công khai; bản này chưa triển khai các biện pháp đó.

## Bảo mật và thư viện

CSP dùng meta trong ba trang HTML để tương thích Pages; noindex cho trang giáo viên/quản trị. GitHub Pages không cho ứng dụng đặt tùy ý HTTP security headers; không tuyên bố có X-Frame-Options hoặc frame-ancestors từ meta. Chỉ JS cục bộ; font Be Vietnam Pro từ Google Fonts có dự phòng. Supabase domain chuẩn có trong CSP, custom domain cần chỉnh CSP.

Chart.js 4.4.8 và Supabase JS 2.49.1 nằm trong vendor, giấy phép MIT và SHA256SUMS đi kèm; không tải JS CDN. Tên học sinh/tin tuyển dụng đưa vào DOM bằng textContent, chỉ URL nguồn HTTPS cho phép được mở. Chạy Actions chỉ với mã tin cậy vì workflow có thể đọc repository secret.

## Kiểm thử

Xem TEST_REPORT.md. Frontend không cần npm. Tool kiểm thử có thể cài ngoài checkout:

```sh
npm install --prefix /tmp/laban-test-tools --cache /tmp/laban-npm-cache playwright @electric-sql/pglite@0.3.14
```

Cần Chromium đã cài. Chạy máy chủ port8000 rồi:

```sh
NODE_PATH=/tmp/laban-test-tools/node_modules CHROMIUM_PATH=/usr/bin/chromium node tests/browser.cjs
NODE_PATH=/tmp/laban-test-tools/node_modules node tests/teacher-login.cjs
NODE_PATH=/tmp/laban-test-tools/node_modules node tests/static-host.cjs
NODE_PATH=/tmp/laban-test-tools/node_modules node tests/market.cjs
NODE_PATH=/tmp/laban-test-tools/node_modules node tests/database.cjs
```

Các test nguồn dùng fixture/mock, không xuất dữ liệu mẫu ra website. Kiểm thử SQL dùng PGlite với auth.uid/role mô phỏng, không thay thế xác minh Supabase thật. Workflow Pages và Jooble live cần được xác minh sau khi chạy trên GitHub với khóa hợp lệ.
