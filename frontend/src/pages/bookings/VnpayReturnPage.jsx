import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../app/routes/routePaths.js'
import { bookingService } from '../../features/bookings/services/bookingService.js'

export default function VnpayReturnPage() {
  const [bookingId] = useState(() =>
    sessionStorage.getItem('vnpay_pending_booking_id')
  )

  const [booking, setBooking] = useState(null)
  const [status, setStatus] = useState('checking')
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!bookingId || !/^[1-9][0-9]*$/.test(bookingId)) {
      setStatus('missing')
      return
    }

    let active = true
    let timer
    let attempts = 0

    setStatus('checking')
    setError('')

    async function checkPayment() {
      try {
        const result = await bookingService.getBookingById(bookingId)

        if (!active) return

        if (!result) {
          setStatus('error')
          setError('Không tìm thấy lịch hẹn.')
          return
        }

        setBooking(result)

        if (result.paymentStatus === 'PAID') {
          setStatus('paid')
          return
        }

        const latestPayment = [...(result.payments ?? [])]
          .filter(payment => payment.method === 'VNPAY')
          .sort((a, b) => b.id - a.id)[0]

        if (
          latestPayment &&
          ['FAILED', 'CANCELLED'].includes(
            latestPayment.transactionStatus
          )
        ) {
          setStatus('failed')
          return
        }

        attempts += 1

        if (attempts >= 15) {
          setStatus('pending')
          return
        }

        timer = window.setTimeout(checkPayment, 2000)
      } catch (requestError) {
        if (!active) return

        setStatus('error')
        setError(
          requestError.message ||
          'Chưa kiểm tra được trạng thái thanh toán.'
        )
      }
    }

    checkPayment()

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [bookingId, retry])

  let title = 'Đang kiểm tra thanh toán'
  let description =
    'Hệ thống đang chờ xác nhận thanh toán từ VNPay.'

  if (status === 'paid') {
    title = 'Lịch hẹn đã được thanh toán'
    description =
      'Backend đã ghi nhận trạng thái đã thanh toán cho lịch hẹn này.'
  } else if (status === 'failed') {
    title = 'Giao dịch chưa thành công'
    description =
      'Backend đã ghi nhận giao dịch không thành công. Bạn có thể xem lại lịch hẹn hoặc liên hệ spa.'
  } else if (status === 'pending') {
    title = 'Chưa nhận được xác nhận thanh toán'
    description =
      'Chưa thể kết luận giao dịch thất bại. Nếu đã bị trừ tiền, vui lòng không thanh toán thêm và liên hệ spa nếu trạng thái chưa cập nhật.'
  } else if (status === 'missing') {
    title = 'Không xác định được lịch hẹn'
    description =
      'Thông tin lịch hẹn không còn trong tab này. Vui lòng kiểm tra tại Lịch đặt của tôi.'
  } else if (status === 'error') {
    title = 'Chưa kiểm tra được thanh toán'
    description = error
  }

  return (
    <main>
      <h1>{title}</h1>
      <p role="status">{description}</p>

      {booking && (
        <p>
          Mã lịch hẹn: <strong>{booking.code}</strong>
        </p>
      )}

      {status === 'paid' &&
        booking?.bookingStatus === 'PENDING' && (
          <p>Lịch hẹn vẫn đang chờ spa xác nhận.</p>
        )}

      {status === 'paid' &&
        booking?.bookingStatus === 'CANCELLED' && (
          <p>
            Lịch hẹn đã bị hủy nhưng có ghi nhận thanh toán.
            Vui lòng liên hệ spa để được hỗ trợ.
          </p>
        )}

      {['pending', 'error'].includes(status) && (
        <button
          type="button"
          onClick={() => setRetry(value => value + 1)}
        >
          Kiểm tra lại
        </button>
      )}

      {booking && (
        <p>
          <Link to={ROUTES.BOOKING_DETAIL(booking.id)}>
            Xem chi tiết lịch hẹn
          </Link>
        </p>
      )}

      <p>
        <Link to={ROUTES.BOOKINGS}>Lịch đặt của tôi</Link>
      </p>
    </main>
  )
}