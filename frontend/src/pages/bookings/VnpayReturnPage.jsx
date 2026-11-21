import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../app/routes/routePaths.js'
import { bookingService } from '../../features/bookings/services/bookingService.js'
import { readVnpayReturn, redirectToVnpay } from '../../features/bookings/services/vnpayPayment.js'
import PetAvatar from '../../features/bookings/components/create/PetAvatar.jsx'
import { formatDuration, getTotalDuration } from '../../features/bookings/utils/bookingDuration.js'
import { formatVnd } from '../../features/bookings/utils/bookingPrice.js'
import '../../features/bookings/styles/booking.css'
import '../../features/bookings/styles/vnpay-return.css'

export default function VnpayReturnPage() {
  const { search } = useLocation()
  const [booking, setBooking] = useState(null)
  const [status, setStatus] = useState('checking')
  const [message, setMessage] = useState('')
  const [retry, setRetry] = useState(0)
  const [paying, setPaying] = useState(false)
  const paymentLock = useRef(false)
  const queriedReference = useRef(null)

  useEffect(() => {
    function resume() { paymentLock.current = false; setPaying(false) }
    window.addEventListener('pageshow', resume)
    return () => window.removeEventListener('pageshow', resume)
  }, [])

  useEffect(() => {
    let active = true
    let timer
    let attempts = 0
    setStatus('checking')
    setMessage('')

    function show(result) {
      setBooking(result)
      sessionStorage.setItem('vnpay_pending_booking_id', String(result.id))
      if (result.paymentStatus === 'PAID') { setStatus('paid'); return true }
      const latest = [...(result.payments ?? [])].filter(p => p.method === 'VNPAY').sort((a, b) => b.id - a.id)[0]
      if (latest && ['FAILED', 'CANCELLED'].includes(latest.transactionStatus)) {
        setStatus('failed'); return true
      }
      return false
    }

    async function start() {
      let id
      let parameters
      try {
        parameters = readVnpayReturn(search)
        if (Object.keys(parameters).length) {
          // Never trust browser status codes or a cached booking ID. Verify the
          // signed response on the server and resolve its actual owned booking.
          const confirmed = await bookingService.confirmVnpayReturn(parameters)
          if (!active) return
          id = confirmed.id
          if (show(confirmed)) return
        } else {
          id = sessionStorage.getItem('vnpay_pending_booking_id')
          if (!id || !/^[1-9][0-9]*$/.test(id)) { setStatus('missing'); return }
        }
      } catch (error) {
        if (active) { setStatus('error'); setMessage(error.message || 'Chưa xác minh được kết quả thanh toán.') }
        return
      }

      async function poll() {
        try {
          const result = await bookingService.getBookingById(id)
          if (!active) return
          if (!result) throw new Error('Không tìm thấy lịch hẹn.')
          if (show(result)) return
          attempts += 1
          // One automatic reconciliation per reference; repeated polling only
          // reads our database. QueryDr failure must not imply payment failure.
          const reference = parameters?.vnp_TxnRef
          if (attempts === 4 && reference && queriedReference.current !== reference) {
            queriedReference.current = reference
            try { await bookingService.reconcileVnpayPayment(id) } catch { /* Keep waiting for IPN. */ }
            if (!active) return
          }
          if (attempts >= 12) { setStatus('pending'); return }
          timer = window.setTimeout(poll, 2000)
        } catch (error) {
          if (active) { setStatus('error'); setMessage(error.message || 'Chưa tải được trạng thái lịch hẹn.') }
        }
      }
      await poll()
    }
    start()
    return () => { active = false; window.clearTimeout(timer) }
  }, [search, retry])

  async function payAgain() {
    if (paymentLock.current || !booking) return
    paymentLock.current = true
    setPaying(true)
    setMessage('')
    try {
      const result = await bookingService.createVnpayPaymentUrl(booking.id)
      redirectToVnpay(booking.id, result.paymentUrl)
    } catch (error) {
      setMessage(error.message || 'Chưa mở được thanh toán. Vui lòng thử lại sau.')
      paymentLock.current = false
      setPaying(false)
    }
  }

  const content = {
    checking: ['Đang xác nhận thanh toán', 'Vui lòng chờ trong khi hệ thống cập nhật lịch hẹn.'],
    paid: ['Thanh toán thành công', 'Khoản thanh toán đã được ghi nhận. Thông tin xác nhận sẽ được gửi đến email của bạn.'],
    failed: ['Thanh toán chưa hoàn tất', 'Lần thanh toán đã kết thúc nhưng chưa thành công. Lịch hẹn vẫn được lưu để bạn có thể thanh toán lại.'],
    pending: ['Đang chờ xác nhận thanh toán', 'Nếu đã bị trừ tiền, vui lòng không thanh toán thêm. Bạn có thể xem lịch hẹn sau ít phút hoặc liên hệ spa.'],
    missing: ['Không xác định được lịch hẹn', 'Vui lòng mở Lịch đặt của tôi để xem trạng thái lịch hẹn.'],
    error: ['Chưa xác nhận được thanh toán', 'Vui lòng tải lại trạng thái hoặc mở Lịch đặt của tôi. Nếu đã bị trừ tiền, không thanh toán thêm.'],
  }[status]
  const canRetryPayment = status === 'failed' && booking?.bookingStatus === 'PENDING' && booking?.paymentStatus === 'UNPAID'

  return (
    <div className="booking-page" lang="vi">
      <div className="booking-container">
        <section className={`booking-success vnpay-result vnpay-result--${status}`} aria-labelledby="vnpay-result-title" aria-live="polite" aria-busy={status === 'checking'}>
          <div className="booking-success__mark" aria-hidden="true">
            <svg viewBox="0 0 56 56" focusable="false">
              {status === 'paid'
                ? <path d="m15 29 9 9 18-20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                : ['checking', 'pending'].includes(status)
                  ? <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><circle cx="28" cy="28" r="17" /><path d="M28 17v12l8 5" /></g>
                  : <path d="M28 16v16m0 8v1" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />}
            </svg>
          </div>
          <p className="booking-step-heading__eyebrow">Lịch hẹn tại MEOMEO · VNPay</p>
          <h1 id="vnpay-result-title">{content[0]}</h1>
          <p className="booking-success__intro" role="status">{content[1]}</p>
          {message && <p className="vnpay-result__notice" role="alert">{message}</p>}
          {status === 'paid' && booking?.bookingStatus === 'PENDING' && <p className="vnpay-result__notice">Lịch hẹn đang chờ spa xác nhận.</p>}
          {status === 'paid' && booking?.bookingStatus === 'CANCELLED' && <p className="vnpay-result__notice">Lịch hẹn đã hủy. Vui lòng liên hệ spa để xử lý khoản thanh toán.</p>}
          {booking && <>
            <div className="booking-success__code"><span>Mã lịch hẹn</span><strong>{booking.code}</strong></div>
            <div className="booking-success__appointment">
              <div className="booking-success__pet"><PetAvatar pet={booking.pet} /><span><strong>{booking.pet.name}</strong><small>{booking.pet.breed || booking.pet.species} · {booking.pet.weight} kg</small></span></div>
              <div><small>Ngày & giờ</small><strong>{booking.appointment.date && new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${booking.appointment.date}T12:00:00`))} · {booking.appointment.startTime}–{booking.appointment.endTime}</strong></div>
              <div><small>Chuyên viên</small><strong>{booking.employee.name}</strong></div>
              <div><small>Dịch vụ · {formatDuration(getTotalDuration(booking.services))}</small><strong>{formatVnd(booking.totalPrice)}</strong><small>{booking.paymentStatus === 'PAID' ? 'Đã thanh toán qua VNPay' : 'Chưa thanh toán'}</small></div>
            </div>
          </>}
          <div className="booking-success__actions">
            {canRetryPayment && <button className="button button--primary booking-action-button" type="button" disabled={paying} onClick={payAgain}>{paying ? 'Đang mở VNPay…' : 'Thanh toán lại'}</button>}
            {['pending', 'error'].includes(status) && <button className="button button--primary booking-action-button" type="button" onClick={() => setRetry(n => n + 1)}>Tải lại trạng thái</button>}
            {booking
              ? <Link className={canRetryPayment || ['pending', 'error'].includes(status) ? 'booking-text-button' : 'button button--primary booking-action-button'} to={ROUTES.BOOKING_DETAIL(booking.id)}>Xem chi tiết lịch hẹn <span aria-hidden="true">↗</span></Link>
              : <Link className="booking-text-button" to={ROUTES.HOME}>Về trang chủ</Link>}
            <Link className={status === 'missing' || (status === 'checking' && !booking) ? 'button button--primary booking-action-button' : 'booking-text-button'} to={ROUTES.BOOKINGS}>Lịch đặt của tôi</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
