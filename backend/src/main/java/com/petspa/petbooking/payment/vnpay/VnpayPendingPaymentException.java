package com.petspa.petbooking.payment.vnpay;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Signals that a previous payment must be reconciled before issuing another URL. */
public class VnpayPendingPaymentException extends ResponseStatusException {
    public VnpayPendingPaymentException() {
        super(
                HttpStatus.CONFLICT,
                "Lần thanh toán trước đang chờ xác nhận. "
                        + "Nếu đã bị trừ tiền, vui lòng không thanh toán thêm và liên hệ spa.");
    }
}
