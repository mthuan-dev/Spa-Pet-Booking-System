# Hệ thống đặt lịch Spa thú cưng

Ứng dụng đặt lịch spa thú cưng với giao diện khách hàng và quản trị. Frontend và backend chạy riêng; schema database nằm trong `database/spathucung.sql`.

## Công nghệ

- Frontend: React/React DOM 19.3.1, Vite, JavaScript, React Router, Ant Design 6, Tailwind CSS, Axios
- Backend: Spring Boot, Java 23, Maven, Spring Web, Spring Data JPA, Validation, Security, OAuth2 Client, Spring Mail
- Database: MySQL/MariaDB chạy qua XAMPP
- Redis: giữ chỗ tạm trong luồng đặt lịch của khách. Trên Windows có thể chạy bằng Memurai.

## Cấu trúc dự án

```text
Spa-Pet-Booking-System/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/petspa/petbooking/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── exception/
│       │   ├── mail/
│       │   ├── mapper/
│       │   ├── payment/vnpay/
│       │   ├── repository/
│       │   ├── security/
│       │   ├── service/
│       │   └── util/
│       └── resources/
├── database/
│   └── spathucung.sql
└── frontend/
    ├── public/                 # Tài nguyên dùng qua URL
    └── src/
        ├── api/
        ├── app/
        ├── assets/             # Ảnh và icon được import trong code
        ├── components/         # Thành phần giao diện dùng chung
        ├── features/           # Code theo chức năng
        │   ├── admin/
        │   ├── about/
        │   ├── auth/
        │   ├── bookings/
        │   ├── catalog/
        │   ├── home/
        │   ├── pets/
        │   └── profile/
        ├── hooks/
        ├── layouts/
        ├── lib/
        ├── pages/
        ├── stores/
        ├── styles/
        ├── utils/
        └── main.jsx
```

## Quy ước đặt file frontend

- **Trang:** đặt trong `pages/<nhóm>/`, dùng tên rõ nghĩa như `CustomersPage.jsx`, `BookingDetailPage.jsx`. Trang admin nằm trong `pages/admin/`.
- **Chức năng:** code riêng của một chức năng đặt trong `features/<chức-năng>/`. Code chỉ dành cho quản trị đặt trong `features/admin/<chức-năng>/`.
- **API:** cấu hình kết nối và helper dùng chung đặt trong `src/api/`; lời gọi API theo chức năng và query/mutation liên quan đặt trong `features/<chức-năng>/api/`.


## Chạy dự án

Cần JDK 23, Node.js/npm và MySQL/MariaDB.

1. Khởi động MySQL và import `database/spathucung.sql` vào database `spathucung`.
2. Thiết lập cấu hình database cho backend: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, và `SERVER_PORT` nếu cần đổi cổng. Cấu hình Spring local được bỏ qua bởi Git; kiểm tra cấu hình đó khi thiết lập máy mới.
3. Chạy backend từ thư mục gốc:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Hoặc mở thư mục `backend` bằng IntelliJ và chạy `com.petspa.petbooking.PetSpaApplication` với JDK 23. Trên macOS/Linux, chạy `./mvnw` từ thư mục `backend`.

Cấu hình database đọc từ các biến `DB_URL`, `DB_USERNAME` và `DB_PASSWORD`. Mặc định local là `localhost:3306/spathucung`, username `root`, mật khẩu rỗng. Nếu cấu hình XAMPP của bạn khác, hãy đặt lại các biến này. Có thể đổi cổng backend bằng `SERVER_PORT` (mặc định `8080`). Project không chứa thông tin đăng nhập production.

## Chạy frontend

```powershell
cd frontend
npm ci
npm run dev
```

Giao diện người dùng và quản trị dùng chung React 19.3.1. Chức năng kéo thả dùng `@dnd-kit/react`; Ant Design 6 hỗ trợ React 19 trực tiếp. Cài dependency bằng lệnh chuẩn, không cần `--force`, `--legacy-peer-deps` hoặc gói vá React 19.

- Giao diện người dùng (placeholder): <http://localhost:5173>
- Giao diện admin (placeholder): <http://localhost:5173/admin>
- Backend: <http://localhost:8080>

Axios đọc URL backend từ `VITE_BACKEND_ENDPOINT`. Sao chép `frontend/.env.example` thành `.env.local` để cấu hình URL local.

## Giữ chỗ bằng Redis trên Windows

Khi khách chọn ngày, giờ và nhân viên rồi bấm **Tiếp tục**, Redis giữ khoảng giờ tối đa 5 phút. Khi khách xác nhận đặt lịch, backend khóa dòng nhân viên trong MySQL và kiểm tra lại trước khi lưu. Sau khi lưu thành công, lịch trong MySQL tiếp tục chiếm khung giờ và lượt giữ tạm trong Redis được nhả.

### 1. Cài Memurai

1. Tải bộ cài MSI [Memurai Developer cho Windows](https://www.memurai.com/get-memurai).
2. Mở bộ cài với quyền quản trị, chọn cài dưới dạng **Windows Service** và giữ cổng `6379`. Xem [hướng dẫn cài đặt Memurai](https://docs.memurai.com/en/installation.html).
3. Mở PowerShell mới và kiểm tra kết nối:

```powershell
Test-NetConnection 127.0.0.1 -Port 6379
memurai-cli.exe -h 127.0.0.1 -p 6379 PING
```

Kết quả mong đợi là `TcpTestSucceeded : True` và `PONG`. Nếu cổng chưa mở, kiểm tra dịch vụ **Memurai** trong `services.msc`. Nếu PowerShell chưa tìm thấy CLI, chạy `memurai-cli.exe` từ thư mục cài đặt.

### 2. Bật Redis cho backend

Thêm hoặc cập nhật hai dòng sau trong `backend/.env`, giữ nguyên các cấu hình khác:

```dotenv
BOOKING_REDIS_HOLDS_ENABLED=true
BOOKING_REDIS_URL=redis://127.0.0.1:6379
```

Tính năng mặc định tắt. Sau khi đổi cấu hình, khởi động lại Spring Boot từ thư mục `backend` để ứng dụng đọc đúng file `.env`. Bật MySQL và frontend theo hướng dẫn ở trên.

### 3. Kiểm tra giữ chỗ bằng hai tài khoản khách

1. Đăng nhập tài khoản **A** ở cửa sổ thường và tài khoản **B** ở cửa sổ ẩn danh. Cho cả hai chọn cùng ngày, giờ và nhân viên trước khi ai bấm **Tiếp tục**.
2. Cho **A** bấm **Tiếp tục** và dừng ở bước chọn phương thức thanh toán. Giao diện hiển thị **“Lịch được giữ tạm đến…”**.
3. Cho **B** bấm **Tiếp tục**. Giao diện báo khung giờ đã được giữ và yêu cầu chọn lại.
4. Cho **A** bấm **Quay lại** rồi cho **B** chọn lại đúng giờ và nhân viên. B đi tiếp được. Có thể lặp lại ca kiểm tra bằng cách chờ lượt giữ tự hết hạn thay vì bấm **Quay lại**.

Các bước trên kiểm tra Redis mà chưa cần thanh toán. Để kiểm tra bước bàn giao sang MySQL, cho B xác nhận **Thanh toán tại spa**. Lịch phải xuất hiện trong **Lịch hẹn của tôi** và khung giờ vẫn bận. Với **VNPay sandbox** đã cấu hình, thử một khung giờ khác và kiểm tra khung giờ vẫn bận sau khi chuyển sang trang thanh toán.

## Cấu hình tích hợp

Để chạy thử thanh toán VNPay sandbox, cấu hình `VNPAY_TMN_CODE` và `VNPAY_HASH_SECRET` theo [backend/.env.example](backend/.env.example). Email dùng các biến `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME` và `MAIL_PASSWORD`. Khi triển khai Google Login, dùng `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`. Không commit credential thật.

## Phạm vi hiện tại

Luồng đặt lịch của khách hỗ trợ thanh toán tại spa, thanh toán VNPay và giữ chỗ tạm bằng Redis khi bật cấu hình.
