package com.petspa.petbooking.payment.vnpay;

import com.petspa.petbooking.entity.NguoiDung;
import com.petspa.petbooking.entity.ThanhToan;
import com.petspa.petbooking.entity.enums.PhuongThucThanhToan;
import com.petspa.petbooking.entity.enums.TrangThaiDatLich;
import com.petspa.petbooking.entity.enums.TrangThaiGiaoDich;
import com.petspa.petbooking.entity.enums.TrangThaiThanhToan;
import com.petspa.petbooking.repository.DatLichRepository;
import com.petspa.petbooking.repository.ThanhToanRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class VnpayPaymentService {

    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private static final DateTimeFormatter VNPAY_TIME =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final DatLichRepository bookings;
    private final ThanhToanRepository payments;
    private final VnpayProperties properties;
    private final VnpaySignature signature;

    public VnpayPaymentService(
            DatLichRepository bookings,
            ThanhToanRepository payments,
            VnpayProperties properties,
            VnpaySignature signature) {
        this.bookings = bookings;
        this.payments = payments;
        this.properties = properties;
        this.signature = signature;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public String createPaymentUrl(NguoiDung customer, Integer bookingId, String clientIp) {

        validateConfiguration();

        var booking =
                bookings.lockById(bookingId)
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn."));

        if (!booking.getNguoiDung().getMaNguoiDung().equals(customer.getMaNguoiDung())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn.");
        }

        if (booking.getTrangThaiDatLich() != TrangThaiDatLich.PENDING) {
            throw invalid("Chỉ lịch đang chờ xác nhận mới được thanh toán online.");
        }

        if (booking.getTrangThaiThanhToan() != TrangThaiThanhToan.UNPAID) {
            throw invalid("Lịch hẹn này đã được thanh toán.");
        }

        LocalDateTime now = LocalDateTime.now(ZONE);
        LocalDateTime appointment = LocalDateTime.of(booking.getNgayHen(), booking.getGioBatDau());

        if (!appointment.isAfter(now)) {
            throw invalid("Lịch hẹn đã đến giờ hoặc đã qua.");
        }

        var history = payments.findAllByDatLich_MaDatLich(bookingId);

        if (history.stream()
                .anyMatch(payment -> payment.getTrangThai() == TrangThaiGiaoDich.SUCCESS)) {
            throw invalid("Lịch hẹn đã có giao dịch thành công.");
        }

        ThanhToan payment =
                history.stream()
                        .max(Comparator.comparing(ThanhToan::getMaThanhToan))
                        .orElseThrow(() -> invalid("Không tìm thấy giao dịch thanh toán."));

        if (payment.getPhuongThuc() != PhuongThucThanhToan.VNPAY) {
            throw invalid("Lịch hẹn không chọn thanh toán VNPay.");
        }

        // Tìm lần thanh toán đã được cấp mã nhưng chưa có kết quả.
        var openAttempts =
                history.stream()
                        .filter(
                                item ->
                                        item.getPhuongThuc() == PhuongThucThanhToan.VNPAY
                                                && item.getTrangThai() == TrangThaiGiaoDich.PENDING
                                                && item.getVnpTxnRef() != null)
                        .toList();

        if (!openAttempts.isEmpty()) {
            // Không chọn tùy tiện nếu dữ liệu có nhiều lần đang chờ.
            if (openAttempts.size() != 1) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Có nhiều giao dịch chưa rõ kết quả. "
                                + "Vui lòng liên hệ spa để kiểm tra.");
            }

            ThanhToan openPayment = openAttempts.getFirst();

            if (openPayment.getSoTien().compareTo(booking.getTongTien()) != 0) {
                throw invalid("Số tiền giao dịch không khớp với lịch hẹn.");
            }

            String existingUrl = openPayment.getVnpPaymentUrl();
            LocalDateTime expiresAt = openPayment.getVnpExpiresAt();

            if (existingUrl != null
                    && !existingUrl.isBlank()
                    && expiresAt != null
                    && expiresAt.isAfter(now)) {
                return existingUrl;
            }

            throw new VnpayPendingPaymentException();
        }

        if (payment.getTrangThai() == TrangThaiGiaoDich.FAILED
                && "02".equals(payment.getVnpTransactionStatus())) {

            // Tạo bản ghi mới, không ghi đè lịch sử lần thất bại.
            ThanhToan retryPayment = new ThanhToan();
            retryPayment.setDatLich(booking);
            retryPayment.setPhuongThuc(PhuongThucThanhToan.VNPAY);
            retryPayment.setSoTien(booking.getTongTien());
            retryPayment.setTrangThai(TrangThaiGiaoDich.PENDING);

            payment = retryPayment;

        } else if (payment.getTrangThai() != TrangThaiGiaoDich.PENDING) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Giao dịch trước chưa đủ điều kiện thanh toán lại. "
                            + "Vui lòng liên hệ spa để kiểm tra.");
        }

        // Giao dịch mới phải chưa từng được cấp mã tham chiếu.
        if (payment.getVnpTxnRef() != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Giao dịch đã có mã tham chiếu. " + "Vui lòng kiểm tra kết quả trước.");
        }

        if (payment.getSoTien().compareTo(booking.getTongTien()) != 0) {
            throw invalid("Số tiền giao dịch không khớp với lịch hẹn.");
        }

        BigDecimal amount = payment.getSoTien();

        if (amount.signum() <= 0) {
            throw invalid("Số tiền thanh toán phải lớn hơn 0.");
        }

        String vnpAmount;
        try {
            vnpAmount = amount.movePointRight(2).toBigIntegerExact().toString();
        } catch (ArithmeticException exception) {
            throw invalid("Số tiền thanh toán không hợp lệ.");
        }

        if (vnpAmount.length() > 12) {
            throw invalid("Số tiền vượt giới hạn thanh toán.");
        }

        if (clientIp == null || clientIp.isBlank()) {
            throw invalid("Không xác định được địa chỉ IP.");
        }

        String transactionRef = UUID.randomUUID().toString().replace("-", "");

        LocalDateTime expiresAt = now.plusMinutes(15);
        if (expiresAt.isAfter(appointment)) {
            expiresAt = appointment;
        }

        Map<String, String> parameters = new HashMap<>();
        parameters.put("vnp_Version", "2.1.0");
        parameters.put("vnp_Command", "pay");
        parameters.put("vnp_TmnCode", properties.getTmnCode());
        parameters.put("vnp_Amount", vnpAmount);
        parameters.put("vnp_CurrCode", "VND");
        parameters.put("vnp_TxnRef", transactionRef);
        parameters.put("vnp_OrderInfo", "Thanh toan booking " + booking.getCodeDatLich());
        parameters.put("vnp_OrderType", "other");
        parameters.put("vnp_Locale", "vn");
        parameters.put("vnp_ReturnUrl", properties.getReturnUrl());
        parameters.put("vnp_IpAddr", clientIp);
        parameters.put("vnp_CreateDate", now.format(VNPAY_TIME));
        parameters.put("vnp_ExpireDate", expiresAt.format(VNPAY_TIME));

        String paymentUrl =
                properties.getPaymentUrl() + "?" + signature.buildSignedQuery(parameters);

        payment.setVnpTxnRef(transactionRef);
        payment.setVnpPaymentUrl(paymentUrl);
        payment.setVnpExpiresAt(expiresAt);

        payments.saveAndFlush(payment);

        return paymentUrl;
    }

    private void validateConfiguration() {
        if (properties.getTmnCode() == null
                || properties.getTmnCode().isBlank()
                || properties.getHashSecret() == null
                || properties.getHashSecret().isBlank()
                || properties.getPaymentUrl() == null
                || properties.getPaymentUrl().isBlank()
                || properties.getReturnUrl() == null
                || properties.getReturnUrl().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE, "Chưa cấu hình đầy đủ thanh toán VNPay.");
        }
    }

    private ResponseStatusException invalid(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
