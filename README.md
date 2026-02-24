# STV AI Translate - Script Dịch Truyện SangTacViet bằng AI

Một script Tampermonkey giúp "hack" nội dung truyện trên sangtacviet.com (STV) để dịch sang tiếng Việt bằng các mô hình AI (Gemini, ChatGPT, Claude...) thông qua API của chính bạn.


##  Tính năng nổi bật
- **Bóc tách text gốc chuẩn xác**: Tự động lấy text Trung Quốc từ thuộc tính `i[t]` ẩn của website.
- **Tùy biến văn phong**: Bạn có thể tự soạn `System Prompt` để AI dịch theo đúng phong cách Kiếm Hiệp, Tiên Hiệp, Tổng Tài...
- **Bảng cấu hình AI tiện lợi (⚙️)**: 
    - Tự nhập API Endpoint (Hỗ trợ OpenAI format).
    - Tùy chỉnh Model Name.
    - Hỗ trợ lưu API Key (Bearer Token) an toàn trong bộ nhớ Tampermonkey.
- **Giao diện hiện đại**: Nút bấm lơ lửng, hiệu ứng mượt mà, không làm ảnh hưởng đến bố cục trang web gốc.
- **Hoàn toàn miễn phí & Riêng tư**: Toàn bộ logic chạy trên trình duyệt của bạn, API Key được lưu cục bộ.

##  Hướng dẫn cài đặt

1. Cài đặt tiện ích **Tampermonkey** trên trình duyệt (Chrome, Edge, Firefox...).
2. Click vào icon Tampermonkey -> **Bảng điều khiển (Dashboard)** -> Tab **Tiện ích mới (+)**.
3. Copy toàn bộ nội dung file [stv-ai-hijack.user.js](./scripts/stv-ai-hijack.user.js) và dán vào.
4. Nhấn **Ctrl + S** để lưu.
5. Mở một chương truyện bất kỳ trên `sangtacviet.com` hoặc `sangtacvietcdn.xyz`.

##  Cấu hình API

Sau khi cài đặt, bạn sẽ thấy nút **⚙️** ở góc phải dưới màn hình:

- **API Endpoint URL**: Địa chỉ server API (Mặc định là OpenAI format). 
    - Nếu dùng trực tiếp Google Gemini: `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
    - Nếu dùng Local Proxy (CLIProxyAPI): `http://localhost:8317/v1/chat/completions`
- **Model Name**: 
    - Google Gemini: `gemini-3.0-flash`
- **System Prompt**: Nơi bạn ép AI phải dịch theo phong cách mong muốn. (Em đã để sẵn mẫu văn phong Kiếm Hiệp cực mượt).

## 🛠️ Phát triển & Đóng góp
Dự án được xây dựng với mục tiêu giúp cộng đồng đọc truyện CV (Convert) tiếp cận với bản dịch AI chất lượng cao mà không bị phụ thuộc vào API cứng của website. 

Mọi đóng góp, báo lỗi hoặc yêu cầu tính năng mới vui lòng tạo **Issue** tại repository này.

---
**Disclaimer**: Script này được tạo ra cho mục đích học tập và hỗ trợ cá nhân. Tác giả không chịu trách nhiệm về bất kỳ hành vi vi phạm điều khoản sử dụng của bên thứ ba nào.
