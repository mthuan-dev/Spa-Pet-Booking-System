package com.petspa.petbooking.payment.vnpay;

import com.petspa.petbooking.entity.NguoiDung;
import com.petspa.petbooking.entity.ThanhToan;
import com.petspa.petbooking.entity.enums.PhuongThucThanhToan;
import com.petspa.petbooking.entity.enums.TrangThaiGiaoDich;
import com.petspa.petbooking.repository.DatLichRepository;
import com.petspa.petbooking.repository.ThanhToanRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.petspa.petbooking.entity.enums.TrangThaiDatLich;
import com.petspa.petbooking.entity.enums.TrangThaiThanhToan;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;

import java.math.BigDecimal;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import com.petspa.petbooking.mail.BookingCreatedEvent;
import com.petspa.petbooking.service.DatLichService;
import org.springframework.context.ApplicationEventPublisher;

@Service
public class VnpayReconcileStore {

    private final DatLichRepository bookings;
    private final ThanhToanRepository payments;
    private final DatLichService reader;
    private final ApplicationEventPublisher events;

    public VnpayReconcileStore(
            DatLichRepository bookings,
            ThanhToanRepository payments,
            DatLichService reader,
            ApplicationEventPublisher events) {
        this.bookings = bookings;
        this.payments = payments;
        this.reader = reader;
        this.events = events;
    }

    public record QuerySnapshot(
            Integer bookingId,
            Integer customerId,
            Integer paymentId,
            String transactionRef,
            String transactionDate,
            BigDecimal amount) {}

    public record ReconcileResult(
            Integer bookingId, String paymentStatus, String transactionStatus, String message) {}

    @Transactional(readOnly = true, isolation = Isolation.READ_COMMITTED)
    public QuerySnapshot prepare(NguoiDung customer, Integer bookingId) {

        var booking =
                bookings.findById(bookingId)
                        .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn."));

        if (!booking.getNguoiDung().getMaNguoiDung().equals(customer.getMaNguoiDung())) {
            throw error(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn.");
        }

        ThanhToan payment =
                payments.findAllByDatLich_MaDatLich(bookingId).stream()
                        .filter(
                                item ->
                                        item.getPhuongThuc() == PhuongThucThanhToan.VNPAY
                                                && item.getVnpTxnRef() != null)
                        .max(Comparator.comparing(ThanhToan::getMaThanhToan))
                        .orElseThrow(
                                () ->
                                        error(
                                                HttpStatus.BAD_REQUEST,
                                                "Chưa có lần thanh toán VNPay để đối soát."));

        if (payment.getTrangThai() == TrangThaiGiaoDich.SUCCESS) {
            throw error(
                    HttpStatus.CONFLICT,
                    "Giao dịch đã được ghi nhận thành công. " + "Vui lòng tải lại lịch hẹn.");
        }

        Map<String, String> originalParameters = readOriginalParameters(payment.getVnpPaymentUrl());

        if (!payment.getVnpTxnRef().equals(originalParameters.get("vnp_TxnRef"))) {
            throw error(HttpStatus.CONFLICT, "URL đã lưu không khớp mã giao dịch.");
        }

        String transactionDate = originalParameters.get("vnp_CreateDate");

        if (transactionDate == null || !transactionDate.matches("[0-9]{14}")) {
            throw error(HttpStatus.CONFLICT, "Thiếu thời gian tạo thanh toán gốc.");
        }

        if (payment.getSoTien().compareTo(booking.getTongTien()) != 0) {
            throw error(HttpStatus.CONFLICT, "Số tiền giao dịch không khớp lịch hẹn.");
        }

        return new QuerySnapshot(
                bookingId,
                customer.getMaNguoiDung(),
                payment.getMaThanhToan(),
                payment.getVnpTxnRef(),
                transactionDate,
                payment.getSoTien());
    }

    /** Snapshot cho job hệ thống (không có khách đăng nhập). */
    @Transactional(readOnly = true, isolation = Isolation.READ_COMMITTED)
    public QuerySnapshot prepareForExpiry(Integer bookingId) {
        var booking =
                bookings.findById(bookingId)
                        .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn."));
        return prepare(booking.getNguoiDung(), bookingId);
    }

    /**
     * Hủy booking VNPay quá hạn giữ chỗ. Chỉ gọi sau khi đã đối soát xác nhận chưa thanh toán; kiểm
     * tra lại dưới khóa để không hủy nhầm đơn vừa được IPN ghi nhận thanh toán.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public boolean cancelExpired(Integer bookingId, LocalDateTime cutoff) {
        var booking = bookings.lockById(bookingId).orElse(null);
        if (booking == null
                || booking.getTrangThaiDatLich() != TrangThaiDatLich.PENDING
                || booking.getTrangThaiThanhToan() != TrangThaiThanhToan.UNPAID
                || booking.getHanThanhToan() == null
                || booking.getHanThanhToan().isAfter(cutoff)) {
            return false;
        }
        var history = payments.findAllByDatLich_MaDatLich(bookingId);
        if (history.stream().anyMatch(p -> p.getTrangThai() == TrangThaiGiaoDich.SUCCESS)) {
            return false;
        }
        booking.setTrangThaiDatLich(TrangThaiDatLich.CANCELLED);
        booking.setLyDoHuy(com.petspa.petbooking.entity.DatLich.LY_DO_HET_HAN_THANH_TOAN);
        for (var payment : history) {
            if (payment.getTrangThai() == TrangThaiGiaoDich.PENDING) {
                payment.setTrangThai(TrangThaiGiaoDich.CANCELLED);
                payment.setMessage("Hold expired; booking released");
            }
        }
        bookings.saveAndFlush(booking);
        return true;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ReconcileResult apply(QuerySnapshot snapshot, Map<String, String> result) {

        var booking =
                bookings.lockById(snapshot.bookingId())
                        .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn."));

        if (!booking.getNguoiDung().getMaNguoiDung().equals(snapshot.customerId())) {
            throw error(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn.");
        }

        var payment =
                payments.lockByReference(snapshot.transactionRef())
                        .orElseThrow(
                                () -> error(HttpStatus.NOT_FOUND, "Không tìm thấy giao dịch."));

        if (!payment.getMaThanhToan().equals(snapshot.paymentId())
                || !payment.getDatLich().getMaDatLich().equals(snapshot.bookingId())
                || payment.getPhuongThuc() != PhuongThucThanhToan.VNPAY
                || !snapshot.transactionRef().equals(result.get("vnp_TxnRef"))) {
            throw error(HttpStatus.CONFLICT, "Thông tin giao dịch đã thay đổi hoặc không khớp.");
        }

        // IPN có thể đã cập nhật trong lúc mình chờ QueryDr.
        if (payment.getTrangThai() == TrangThaiGiaoDich.SUCCESS) {
            return new ReconcileResult(
                    booking.getMaDatLich(),
                    booking.getTrangThaiThanhToan().name(),
                    payment.getTrangThai().name(),
                    "Giao dịch đã được ghi nhận thành công.");
        }

        // Đây là mã kết quả truy vấn, không phải kết quả thanh toán.
        if (!"00".equals(result.get("vnp_ResponseCode"))) {
            return new ReconcileResult(
                    booking.getMaDatLich(),
                    booking.getTrangThaiThanhToan().name(),
                    payment.getTrangThai().name(),
                    "VNPay chưa xác nhận được kết quả. " + "Không thay đổi trạng thái giao dịch.");
        }

        if (!"01".equals(result.get("vnp_TransactionType"))) {
            throw error(
                    HttpStatus.BAD_GATEWAY, "Kết quả đối soát không phải giao dịch thanh toán.");
        }

        String rawAmount = result.get("vnp_Amount");

        if (rawAmount == null || !rawAmount.matches("[0-9]{1,12}")) {
            throw error(HttpStatus.BAD_GATEWAY, "Số tiền đối soát không hợp lệ.");
        }

        BigDecimal amount = new BigDecimal(rawAmount).movePointLeft(2);

        if (amount.compareTo(snapshot.amount()) != 0
                || amount.compareTo(payment.getSoTien()) != 0
                || amount.compareTo(booking.getTongTien()) != 0) {
            throw error(HttpStatus.CONFLICT, "Số tiền đối soát không khớp database.");
        }

        String status = result.get("vnp_TransactionStatus");
        String message;
        boolean wasPaid = booking.getTrangThaiThanhToan() == TrangThaiThanhToan.PAID;

        if ("00".equals(status)) {
            String transactionNo = result.get("vnp_TransactionNo");
            String payDate = result.get("vnp_PayDate");

            if (transactionNo == null
                    || !transactionNo.matches("[0-9]{1,100}")
                    || payDate == null
                    || !payDate.matches("[0-9]{14}")) {
                throw error(HttpStatus.BAD_GATEWAY, "Thiếu thông tin giao dịch thành công.");
            }

            LocalDateTime paidAt;

            try {
                paidAt =
                        LocalDateTime.parse(
                                payDate,
                                DateTimeFormatter.ofPattern("uuuuMMddHHmmss")
                                        .withResolverStyle(ResolverStyle.STRICT));
            } catch (java.time.format.DateTimeParseException exception) {
                throw error(HttpStatus.BAD_GATEWAY, "Thời gian thanh toán không hợp lệ.");
            }

            boolean needsReview =
                    booking.getTrangThaiDatLich() == TrangThaiDatLich.CANCELLED
                            || booking.getTrangThaiThanhToan() == TrangThaiThanhToan.PAID;

            payment.setTrangThai(TrangThaiGiaoDich.SUCCESS);
            payment.setVnpTransactionStatus(status);
            payment.setVnpTransactionNo(transactionNo);
            payment.setThoiGianThanhToan(paidAt);
            payment.setVnpBankCode(result.get("vnp_BankCode"));

            booking.setTrangThaiThanhToan(TrangThaiThanhToan.PAID);

            message =
                    needsReview
                            ? "Đã ghi nhận tiền thanh toán; " + "vui lòng liên hệ spa để kiểm tra."
                            : "Đối soát thành công, lịch hẹn đã thanh toán.";

            payment.setMessage(
                    needsReview
                            ? "QueryDr: payment received; manual review required"
                            : "QueryDr: payment successful");

        } else if ("02".equals(status)) {
            payment.setTrangThai(TrangThaiGiaoDich.FAILED);
            payment.setVnpTransactionStatus(status);
            payment.setMessage("QueryDr: payment failed");

            message =
                    "VNPay xác nhận giao dịch bị lỗi. "
                            + "Nếu lịch hẹn vẫn đủ điều kiện, "
                            + "bạn có thể thử thanh toán lại.";

        } else {
            // Không đủ căn cứ cho phép khách trả tiền thêm lần nữa.
            return new ReconcileResult(
                    booking.getMaDatLich(),
                    booking.getTrangThaiThanhToan().name(),
                    payment.getTrangThai().name(),
                    "Giao dịch chưa có kết quả cuối cùng "
                            + "hoặc cần kiểm tra thêm. "
                            + "Vui lòng không thanh toán thêm.");
        }

        payments.saveAndFlush(payment);
        if ("00".equals(status) && !wasPaid) {
            var response =
                    reader.getBookingsByUserId(snapshot.customerId()).stream()
                            .filter(b -> b.id().equals(snapshot.bookingId()))
                            .findFirst()
                            .orElseThrow();
            events.publishEvent(new BookingCreatedEvent(response));
        }

        return new ReconcileResult(
                booking.getMaDatLich(),
                booking.getTrangThaiThanhToan().name(),
                payment.getTrangThai().name(),
                message);
    }

    private Map<String, String> readOriginalParameters(String paymentUrl) {

        if (paymentUrl == null || paymentUrl.isBlank()) {
            throw error(
                    HttpStatus.CONFLICT,
                    "Giao dịch cũ thiếu URL gốc. " + "Vui lòng liên hệ spa để kiểm tra.");
        }

        try {
            String query = URI.create(paymentUrl).getRawQuery();

            if (query == null || query.isBlank()) {
                throw new IllegalArgumentException();
            }

            Map<String, String> parameters = new HashMap<>();

            for (String pair : query.split("&")) {
                String[] parts = pair.split("=", 2);

                String name = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);

                String value =
                        parts.length == 2
                                ? URLDecoder.decode(parts[1], StandardCharsets.UTF_8)
                                : "";

                if (parameters.putIfAbsent(name, value) != null) {
                    throw new IllegalArgumentException();
                }
            }

            return parameters;

        } catch (IllegalArgumentException exception) {
            throw error(HttpStatus.CONFLICT, "URL thanh toán đã lưu không hợp lệ.");
        }
    }

    private ResponseStatusException error(HttpStatus status, String message) {
        return new ResponseStatusException(status, message);
    }
}
