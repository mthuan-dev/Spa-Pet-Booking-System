package com.petspa.petbooking.payment.vnpay;

import com.petspa.petbooking.entity.enums.PhuongThucThanhToan;
import com.petspa.petbooking.entity.enums.TrangThaiDatLich;
import com.petspa.petbooking.entity.enums.TrangThaiGiaoDich;
import com.petspa.petbooking.entity.enums.TrangThaiThanhToan;
import com.petspa.petbooking.repository.DatLichRepository;
import com.petspa.petbooking.repository.ThanhToanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.util.Map;
import com.petspa.petbooking.dto.response.BookingResponse;
import com.petspa.petbooking.mail.BookingCreatedEvent;
import com.petspa.petbooking.service.DatLichService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VnpayIpnService {

    private final DatLichRepository bookings;
    private final ThanhToanRepository payments;
    private final VnpayProperties properties;
    private final VnpaySignature signature;
    private final DatLichService reader;
    private final ApplicationEventPublisher events;

    public VnpayIpnService(
            DatLichRepository bookings,
            ThanhToanRepository payments,
            VnpayProperties properties,
            VnpaySignature signature,
            DatLichService reader,
            ApplicationEventPublisher events) {
        this.bookings = bookings;
        this.payments = payments;
        this.properties = properties;
        this.signature = signature;
        this.reader = reader;
        this.events = events;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Map<String, String> handle(Map<String, String> parameters) {
        return process(parameters, null);
    }

    // Browser return is accepted only after the same signature/amount checks as IPN,
    // plus authenticated ownership. It is a fallback when the server notification is delayed.
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingResponse handleReturn(Map<String, String> parameters, Integer customerId) {
        Map<String, String> reply = process(parameters, customerId);
        if (!"00".equals(reply.get("RspCode")) && !"02".equals(reply.get("RspCode"))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Không xác minh được kết quả VNPay. Vui lòng kiểm tra lịch hẹn hoặc liên hệ spa.");
        }
        Integer bookingId =
                payments.findBookingIdByReference(parameters.get("vnp_TxnRef")).orElseThrow();
        return reader.getBookingsByUserId(customerId).stream()
                .filter(b -> b.id().equals(bookingId))
                .findFirst()
                .orElseThrow();
    }

    private Map<String, String> process(Map<String, String> parameters, Integer customerId) {

        if (!signature.verify(parameters)) {
            return reply("97", "Invalid signature");
        }

        if (!properties.getTmnCode().equals(parameters.get("vnp_TmnCode"))) {
            return reply("97", "Invalid merchant");
        }

        String reference = parameters.get("vnp_TxnRef");
        String rawAmount = parameters.get("vnp_Amount");
        String responseCode = parameters.get("vnp_ResponseCode");
        String transactionStatus = parameters.get("vnp_TransactionStatus");

        if (reference == null
                || reference.isBlank()
                || responseCode == null
                || !responseCode.matches("[0-9]{2}")
                || transactionStatus == null
                || !transactionStatus.matches("[0-9]{2}")) {
            return reply("99", "Invalid parameters");
        }

        if (rawAmount == null || !rawAmount.matches("[0-9]{1,12}")) {
            return reply("04", "Invalid amount");
        }

        Integer bookingId = payments.findBookingIdByReference(reference).orElse(null);

        if (bookingId == null) {
            return reply("01", "Order not found");
        }

        var booking = bookings.lockById(bookingId).orElseThrow();
        if (customerId != null && !booking.getNguoiDung().getMaNguoiDung().equals(customerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn.");
        }

        var payment = payments.lockByReference(reference).orElseThrow();

        if (payment.getPhuongThuc() != PhuongThucThanhToan.VNPAY) {
            return reply("01", "VNPay transaction not found");
        }

        BigDecimal receivedAmount = new BigDecimal(rawAmount).movePointLeft(2);

        if (receivedAmount.compareTo(payment.getSoTien()) != 0
                || receivedAmount.compareTo(booking.getTongTien()) != 0) {
            return reply("04", "Invalid amount");
        }

        boolean success = "00".equals(responseCode) && "00".equals(transactionStatus);
        if (payment.getTrangThai() == TrangThaiGiaoDich.SUCCESS
                || (!success && payment.getTrangThai() == TrangThaiGiaoDich.FAILED)) {
            return reply("02", "Order already confirmed");
        }

        boolean wasPaid = booking.getTrangThaiThanhToan() == TrangThaiThanhToan.PAID;

        LocalDateTime paidAt = null;
        String transactionNo = parameters.get("vnp_TransactionNo");

        if (success) {
            String payDate = parameters.get("vnp_PayDate");

            if (transactionNo == null
                    || !transactionNo.matches("[0-9]{1,100}")
                    || payDate == null
                    || !payDate.matches("[0-9]{14}")) {
                return reply("99", "Invalid payment information");
            }

            try {
                paidAt =
                        LocalDateTime.parse(
                                payDate,
                                DateTimeFormatter.ofPattern("uuuuMMddHHmmss")
                                        .withResolverStyle(ResolverStyle.STRICT));
            } catch (java.time.format.DateTimeParseException exception) {
                return reply("99", "Invalid payment date");
            }
        }

        payment.setVnpResponseCode(responseCode);
        payment.setVnpTransactionStatus(transactionStatus);
        payment.setVnpBankCode(parameters.get("vnp_BankCode"));
        payment.setVnpBankTranNo(parameters.get("vnp_BankTranNo"));
        payment.setVnpCardType(parameters.get("vnp_CardType"));

        if (success) {
            payment.setVnpTransactionNo(transactionNo);
            payment.setThoiGianThanhToan(paidAt);
            payment.setTrangThai(TrangThaiGiaoDich.SUCCESS);

            boolean needsReview =
                    booking.getTrangThaiThanhToan() == TrangThaiThanhToan.PAID
                            || booking.getTrangThaiDatLich() == TrangThaiDatLich.CANCELLED;

            booking.setTrangThaiThanhToan(TrangThaiThanhToan.PAID);

            payment.setMessage(
                    needsReview
                            ? "Payment received; manual review required"
                            : "Payment successful");
        } else if ("02".equals(transactionStatus)) {
            payment.setTrangThai(TrangThaiGiaoDich.FAILED);
            payment.setMessage("VNPay payment failed");
        } else {
            // Pending, reversal and suspicious statuses are not safe to retry.
            payment.setMessage("VNPay result requires further confirmation");
        }

        payments.saveAndFlush(payment);
        if (success && !wasPaid) {
            var response =
                    reader.getBookingsByUserId(booking.getNguoiDung().getMaNguoiDung()).stream()
                            .filter(b -> b.id().equals(bookingId))
                            .findFirst()
                            .orElseThrow();
            events.publishEvent(new BookingCreatedEvent(response));
        }

        return reply("00", "Confirm Success");
    }

    private Map<String, String> reply(String code, String message) {
        return Map.of(
                "RspCode", code,
                "Message", message);
    }
}
