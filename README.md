# Hệ thống đặt lịch Spa thú cưng

Ứng dụng đặt lịch spa thú cưng với giao diện khách hàng và quản trị. Frontend và backend chạy riêng; schema database nằm trong `database/spathucung.sql`.

## Công nghệ

- Frontend: React/React DOM 19.3.1, Vite, JavaScript, React Router, Ant Design 6, Tailwind CSS, Axios
- Backend: Spring Boot, Java 23, Maven, Spring Web, Spring Data JPA, Validation, Security, OAuth2 Client, Spring Mail
- Database: MySQL/MariaDB chạy qua XAMPP

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

## Cấu hình tích hợp trong tương lai

Google OAuth2, VNPay và email hiện mới được chuẩn bị dependency/cấu hình, chưa có chức năng thực tế. Email sẽ dùng các biến `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME` và `MAIL_PASSWORD`. Khi triển khai Google Login, dùng `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`. Cấu hình merchant và khóa ký VNPay sẽ được bổ sung bằng biến môi trường ở giai đoạn tích hợp thanh toán. Không commit credential thật.

## Phạm vi hiện tại

Entity đã được ánh xạ và các package nền tảng đã được tạo để nhóm tiếp tục phát triển. Đăng ký, đăng nhập, booking, thanh toán, gửi email, CRUD admin và các API nghiệp vụ khác chưa được triển khai trong giai đoạn này.
