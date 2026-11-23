import { BOOKING_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from '../constants/bookingDomain.js'

// Hạn giữ chỗ của booking VNPay chưa thanh toán (null nếu không áp dụng).
export function getPaymentDeadline(booking) {
  if (booking?.bookingStatus !== BOOKING_STATUS.PENDING
    || booking?.paymentStatus !== PAYMENT_STATUS.UNPAID
    || booking?.payment?.method !== PAYMENT_METHOD.VNPAY
    || !booking?.paymentDeadline) return null
  const deadline = new Date(booking.paymentDeadline)
  return Number.isNaN(deadline.getTime()) ? null : deadline
}

export function getBookingActions(booking, now = Date.now()) {
  const isPending = booking?.bookingStatus === BOOKING_STATUS.PENDING
  const isUnpaid = booking?.paymentStatus === PAYMENT_STATUS.UNPAID
  const usesVnpay = booking?.payment?.method === PAYMENT_METHOD.VNPAY
  const cashOnly = booking?.payment?.method === PAYMENT_METHOD.CASH
    && (booking?.payments ?? []).every(payment => payment.method === PAYMENT_METHOD.CASH && payment.transactionStatus !== 'SUCCESS')
  const canReview = booking?.bookingStatus === BOOKING_STATUS.COMPLETED && booking?.paymentStatus === PAYMENT_STATUS.PAID
  const deadline = getPaymentDeadline(booking)
  const holdExpired = Boolean(deadline && deadline.getTime() <= now)

  return {
    canReschedule: isPending && !holdExpired,
    canPay: isPending && isUnpaid && usesVnpay && !holdExpired,
    canCancel: isPending && isUnpaid && cashOnly,
    canReview,
  }
}
