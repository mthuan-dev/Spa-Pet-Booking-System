import { useState } from 'react'
import { Link } from 'react-router-dom'
import arrowRightIcon from '../../../../assets/icons/booking/arrow-right.svg'
import { ROUTES } from '../../../../app/routes/routePaths.js'
import { getBookingActions } from '../../utils/bookingDetail.js'
import { bookingService } from '../../services/bookingService.js'

function formatDate(value) {
  if (!value) return 'Ngày hẹn chưa được cập nhật'
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return 'Ngày hẹn chưa được cập nhật'
  return new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export default function BookingActionZone({ booking, onCancel, onRefresh }) {
  const [cancelExpanded, setCancelExpanded] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [paymentNotice, setPaymentNotice] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [paying, setPaying] = useState(false)
  const actions = getBookingActions(booking)
  const [reconciling, setReconciling] = useState(false)
  const [nextReconcileAt, setNextReconcileAt] = useState(0)

  const canReconcile =
    booking.paymentStatus === 'UNPAID' &&
    (booking.payments ?? []).some(
      payment => payment.method === 'VNPAY'
    )

  async function submitCancellation(event) {
    event.preventDefault()
    if (cancelling) return
    setCancelling(true)
    setCancelError('')
    try {
      await onCancel(cancelReason.trim() || null)
      setCancelExpanded(false)
      setCancelReason('')
    } catch {
      setCancelError('Chưa hủy được lịch hẹn. Bạn thử lại nhé.')
    } finally {
      setCancelling(false)
    }
  }

  async function startVnpayPayment() {
    if (paying || reconciling) return

    setPaying(true)
    setPaymentNotice('')

    try {
      const result = await bookingService.createVnpayPaymentUrl(
        booking.id
      )

      const paymentUrl = new URL(result.paymentUrl)

      if (
        paymentUrl.protocol !== 'https:' ||
        paymentUrl.hostname !== 'sandbox.vnpayment.vn'
      ) {
        throw new Error('Địa chỉ thanh toán không hợp lệ.')
      }

      sessionStorage.setItem(
        'vnpay_pending_booking_id',
        String(booking.id)
      )

      window.location.assign(paymentUrl.href)
    } catch (error) {
      setPaymentNotice(
        error.message ||
        'Chưa mở được thanh toán VNPay. Vui lòng thử lại.'
      )

      setPaying(false)
    }
  }

  async function checkVnpayPayment() {
    if (reconciling || paying) return

    const now = Date.now()

    if (now < nextReconcileAt) {
      const seconds = Math.ceil(
        (nextReconcileAt - now) / 1000
      )

      setPaymentNotice(
        `Vui lòng chờ ${seconds} giây trước khi kiểm tra lại.`
      )
      return
    }

    setReconciling(true)
    setPaymentNotice('')
    setNextReconcileAt(now + 60_000)

    let notice

    try {
      const result = await bookingService.reconcileVnpayPayment(
        booking.id
      )

      notice = result.message
    } catch (error) {
      notice =
        error.message ||
        'Chưa đối soát được thanh toán. Vui lòng thử lại sau.'
    }

    // IPN có thể đã cập nhật dù yêu cầu đối soát bị lỗi.
    try {
      await onRefresh()
    } catch {
      notice += ' Chưa tải lại được lịch hẹn; vui lòng tải lại trang.'
    }

    setPaymentNotice(notice)
    setReconciling(false)
  }
  return (
    <section className="booking-detail-page__actions" aria-labelledby="booking-detail-actions-title">
      <div className="booking-detail-page__action-heading">
        <div>
          <p className="booking-detail-page__field-label">Lịch hẹn của bạn</p>
          <h2 id="booking-detail-actions-title">Quản lý lịch hẹn</h2>
        </div>
      </div>

      {actions.canReschedule || actions.canPay || actions.canCancel ? (
        <div className="booking-detail-page__action-list">
          {actions.canReschedule && (
            <Link className="booking-detail-page__button booking-detail-page__button--primary booking-detail-page__button--reschedule" to={ROUTES.BOOKING_RESCHEDULE(booking.id)}>
              <span className="booking-detail-page__reschedule-label">Đổi lịch</span> <img className="booking-detail-page__action-arrow" src={arrowRightIcon} alt="" />
            </Link>
          )}
          {actions.canPay && (
            <button
              className="booking-detail-page__button booking-detail-page__button--secondary"
              type="button"
              onClick={startVnpayPayment}
              disabled={paying || reconciling}
            >
              {paying ? 'Đang mở VNPay…' : 'Thanh toán VNPay'}
            </button>
          )}

          
          {actions.canCancel && (
            <button
              className="booking-detail-page__cancel-trigger"
              type="button"
              aria-expanded={cancelExpanded}
              aria-controls={`booking-cancel-${booking.id}`}
              onClick={() => setCancelExpanded((expanded) => !expanded)}
            >
              {cancelExpanded ? 'Đóng phần hủy lịch' : 'Hủy lịch'}
            </button>
          )}
        </div>
      ) : (
        <p className="booking-detail-page__action-message">
          {booking.bookingStatus === 'PENDING' && booking.paymentStatus === 'PAID'
            ? 'Lịch hẹn đã được thanh toán. Nếu cần hủy, vui lòng liên hệ MEOMEO để được hỗ trợ.'
            : booking.bookingStatus === 'CONFIRMED'
              ? 'Lịch hẹn đã được MEOMEO xác nhận.'
              : booking.bookingStatus === 'COMPLETED'
                ? 'Cảm ơn bạn đã để MEOMEO chăm sóc bé.'
                : booking.bookingStatus === 'CANCELLED'
                  ? 'Lịch hẹn này đã kết thúc.'
                  : 'Các thao tác sẽ hiển thị khi trạng thái lịch hẹn được cập nhật.'}
        </p>
      )}

      {booking.bookingStatus === 'PENDING' && !actions.canCancel && (
        <p className="booking-detail-page__payment-notice">
          Chỉ lịch chưa thanh toán và chọn thanh toán tại spa mới được tự hủy. Nếu cần hủy lịch này, vui lòng liên hệ MEOMEO để được hỗ trợ.
        </p>
      )}
      {canReconcile && (
        <button
          className="booking-detail-page__button booking-detail-page__button--secondary"
          type="button"
          onClick={checkVnpayPayment}
          disabled={reconciling || paying}
        >
          {reconciling
            ? 'Đang kiểm tra thanh toán…'
            : 'Kiểm tra thanh toán'}
        </button>
      )}
      {paymentNotice && <p className="booking-detail-page__payment-notice" role="status">{paymentNotice}</p>}

      {cancelExpanded && actions.canCancel && (
        <form className="booking-detail-page__cancel-form" id={`booking-cancel-${booking.id}`} onSubmit={submitCancellation}>
          <h3>Bạn muốn hủy lịch này?</h3>
          <p className="booking-detail-page__cancel-summary">
            <strong>{booking.pet.name || 'Bé yêu'}</strong>
            <span>{formatDate(booking.appointment.date)} · {booking.appointment.startTime}–{booking.appointment.endTime}</span>
          </p>
          <label htmlFor={`booking-cancel-reason-${booking.id}`}>Lý do hủy <span>(không bắt buộc)</span></label>
          <textarea
            id={`booking-cancel-reason-${booking.id}`}
            rows="3"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="Chia sẻ lý do để MEOMEO hỗ trợ bạn tốt hơn"
          />
          <p className="booking-detail-page__cancel-warning">Hành động này không thể hoàn tác.</p>
          {cancelError && <p role="alert">{cancelError}</p>}
          <div className="booking-detail-page__cancel-actions">
            <button className="booking-detail-page__button booking-detail-page__button--quiet" type="button" onClick={() => setCancelExpanded(false)}>Giữ lịch</button>
            <button className="booking-detail-page__button booking-detail-page__button--danger" type="submit" disabled={cancelling}>Xác nhận hủy</button>
          </div>
        </form>
      )}
    </section>
  )
}
