package com.petspa.petbooking.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class BookingMailListener {

    private static final Logger log =
            LoggerFactory.getLogger(BookingMailListener.class);

    private final BookingMailService bookingMailService;

    public BookingMailListener(BookingMailService bookingMailService) {
        this.bookingMailService = bookingMailService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onBookingCreated(BookingCreatedEvent event) {
        try {
            bookingMailService.sendBookingReceived(event.booking());
        } catch (Exception exception) {
            log.error(
                    "Không gửi được email cho booking {}",
                    event.booking().code(),
                    exception
            );
        }
    }
}