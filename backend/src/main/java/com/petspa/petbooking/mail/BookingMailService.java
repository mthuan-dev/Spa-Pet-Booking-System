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
            JavaMailSender mailSender,
            @Value("${spring.mail.username}") String sender) {
        this.mailSender = mailSender;
        this.sender = sender;
    }

    public void sendBookingReceived(BookingResponse booking) {
        DateTimeFormatter dateFormat =
                DateTimeFormatter.ofPattern("dd/MM/yyyy");

        DateTimeFormatter timeFormat =
                DateTimeFormatter.ofPattern("HH:mm");

        String content = """
                Xin chào %s,

                MEOMEO đã tiếp nhận yêu cầu đặt lịch của bạn.

                Mã đặt lịch: %s
                Thú cưng: %s
                Nhân viên: %s
                Ngày hẹn: %s
                Thời gian: %s - %s
                Tổng tiền: %s VND

                Trạng thái đặt lịch: Đang chờ spa xác nhận.
                Trạng thái thanh toán: Chưa thanh toán.

                Nếu cần hỗ trợ, bạn có thể trả lời email này.

                Cảm ơn bạn đã lựa chọn MEOMEO!
                """.formatted(
                booking.contact().name(),
                booking.code(),
                booking.pet().name(),
                booking.employee().name(),
                booking.appointment().date().format(dateFormat),
                booking.appointment().startTime().format(timeFormat),
                booking.appointment().endTime().format(timeFormat),
                booking.totalPrice().toPlainString()
        );

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(sender);
        message.setTo(booking.contact().email());
        message.setSubject(
                "MEOMEO - Tiếp nhận đặt lịch " + booking.code()
        );
        message.setText(content);

        mailSender.send(message);
    }
}