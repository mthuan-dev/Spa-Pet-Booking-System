package com.petspa.petbooking.mail;

import com.petspa.petbooking.dto.response.BookingResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class BookingMailService {

    private final JavaMailSender mailSender;
    private final String sender;

    public BookingMailService(
            JavaMailSender mailSender, @Value("${spring.mail.username}") String sender) {
        this.mailSender = mailSender;
        this.sender = sender;
    }

    public void sendBookingReceived(BookingResponse booking) {
        boolean paid = "PAID".equals(booking.paymentStatus());
        boolean cancelled = "CANCELLED".equals(booking.bookingStatus());
        DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        DateTimeFormatter timeFormat = DateTimeFormatter.ofPattern("HH:mm");

        String content =
                """
                Xin chào %s,

                %s

                Mã đặt lịch: %s
                Thú cưng: %s
                Nhân viên: %s
                Ngày hẹn: %s
                Thời gian: %s - %s
                Tổng tiền: %s VND

                Trạng thái đặt lịch: %s
                Trạng thái thanh toán: %s

                Nếu cần hỗ trợ, bạn có thể trả lời email này.

                Cảm ơn bạn đã lựa chọn MEOMEO!
                """
                        .formatted(
                                booking.contact().name(),
                                paid
                                        ? "MEOMEO đã ghi nhận thanh toán VNPay cho lịch hẹn của bạn."
                                        : "MEOMEO đã tiếp nhận yêu cầu đặt lịch của bạn.",
                                booking.code(),
                                booking.pet().name(),
                                booking.employee().name(),
                                booking.appointment().date().format(dateFormat),
                                booking.appointment().startTime().format(timeFormat),
                                booking.appointment().endTime().format(timeFormat),
                                booking.totalPrice().toPlainString(),
                                cancelled
                                        ? "Đã hủy. Vui lòng liên hệ spa để xử lý khoản thanh toán."
                                        : switch (booking.bookingStatus()) {
                                            case "CONFIRMED" -> "Spa đã xác nhận.";
                                            case "COMPLETED" -> "Đã hoàn thành.";
                                            default -> "Đang chờ spa xác nhận.";
                                        },
                                paid
                                        ? "Đã thanh toán qua VNPay."
                                        : "Chưa thanh toán. Thanh toán tại spa.");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(sender);
        message.setTo(booking.contact().email());
        message.setSubject(
                "MEOMEO - "
                        + (paid ? "Thanh toán thành công " : "Tiếp nhận đặt lịch ")
                        + booking.code());
        message.setText(content);

        mailSender.send(message);
    }
}
