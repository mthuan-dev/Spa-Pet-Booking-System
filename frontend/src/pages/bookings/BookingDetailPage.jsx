import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import arrowLeftIcon from '../../assets/icons/booking/arrow-left.svg'
import { ROUTES } from '../../app/routes/routePaths.js'
import { bookingService } from '../../features/bookings/api/bookingService.js'
import {
  BookingDetailContent,
  BookingDetailMessage,
  BookingDetailSkeleton,
} from '../../features/bookings/components/detail/BookingDetailSections.jsx'
import '../../features/bookings/styles/booking-detail.css'

export default function BookingDetailPage() {
  const location = useLocation()
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let active = true
    setBooking(null)
    setLoadState('loading')

    bookingService.getBookingById(bookingId)
      .then((result) => {
        if (!active) return
        if (!result) {
          setLoadState('not-found')
          return
        }
        setBooking(result)
        setLoadState('ready')
      })
      .catch(() => {
        if (active) setLoadState('error')
      })

    return () => { active = false }
  }, [bookingId, retryCount])

  // The server owns cancellation. Refresh pending online bookings until it has a final result.
  const watchPayment = loadState === 'ready' && booking?.bookingStatus === 'PENDING'
    && booking?.paymentStatus === 'UNPAID' && Boolean(booking?.paymentDeadline)
  useEffect(() => {
    if (!watchPayment) return undefined
    let active = true
    let timer
    async function poll() {
      try {
        const result = await bookingService.getBookingById(bookingId)
        if (active && result) setBooking(result)
      } catch { /* Keep the last known server state and retry. */ }
      if (active) timer = window.setTimeout(poll, 10000)
    }
    timer = window.setTimeout(poll, 10000)
    return () => { active = false; window.clearTimeout(timer) }
  }, [bookingId, watchPayment])

  async function cancelBooking(reason) {
    const updated = await bookingService.cancelBooking(bookingId, reason)
    setBooking(updated)
  }

  async function saveReview(review) {
    const updated = await bookingService.reviewBooking(bookingId, review)
    setBooking(updated)
  }

  async function refreshBooking() {
    const updated = await bookingService.getBookingById(bookingId)

    if (!updated) {
      throw new Error('Không tìm thấy lịch hẹn.')
    }

    setBooking(updated)
  }
  return (
    <div className="booking-detail-page" lang="vi">
      <div className="booking-detail-page__inner">
        <Link className="booking-detail-page__back" to={ROUTES.BOOKINGS}>
          <img className="booking-detail-page__back-icon" src={arrowLeftIcon} alt="" /> Lịch đặt của tôi
        </Link>
        {location.state?.paymentNotice && <p role="alert">{location.state.paymentNotice}</p>}

        {loadState === 'loading' && <BookingDetailSkeleton />}

        {loadState === 'error' && (
          <BookingDetailMessage
            title="Chưa tải được chi tiết lịch hẹn."
            message="Bạn thử tải lại sau ít phút nhé."
            action={(
              <button className="booking-detail-page__button booking-detail-page__button--primary" type="button" onClick={() => setRetryCount((count) => count + 1)}>
                Thử lại
              </button>
            )}
          />
        )}

        {loadState === 'not-found' && (
          <BookingDetailMessage
            title="Không tìm thấy lịch hẹn này."
            message="Lịch hẹn có thể đã được di chuyển hoặc không còn tồn tại."
            action={(
              <Link className="booking-detail-page__button booking-detail-page__button--primary" to={ROUTES.BOOKINGS}>
                Về lịch đặt của tôi
              </Link>
            )}
          />
        )}

        {loadState === 'ready' && booking && (
          <BookingDetailContent booking={booking} onCancel={cancelBooking} onSubmitReview={saveReview} onRefresh={refreshBooking} />
        )}
      </div>
    </div>
  )
}
