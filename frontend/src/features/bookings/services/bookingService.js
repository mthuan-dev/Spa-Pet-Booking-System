import { bookingApi } from '../../../shared/api/bookingApi.js'
import { mapBookingResponse } from '../mappers/bookingMapper.js'
function model(row) {
  if (row.pet?.imageUrl?.startsWith('/api/')) row.pet.imageUrl = new URL(row.pet.imageUrl, import.meta.env.VITE_BACKEND_ENDPOINT || 'http://localhost:8080').href
  const payment = row.payments?.findLast(p => p.transactionStatus === 'SUCCESS') || row.payments?.at(-1)
  return mapBookingResponse({ ...row, payment })
}
export const bookingService = {
  async checkout(draft) {
    const result = await bookingApi('/checkout', { method: 'POST', body: JSON.stringify(draft) })
    return { booking: model(result.booking), paymentUrl: result.paymentUrl }
  },
  async confirmVnpayReturn(parameters) {
    return model(await bookingApi('/vnpay/return', { method: 'POST', body: JSON.stringify(parameters) }))
  },
  async getMyBookings() { return (await bookingApi('/bookings')).map(model) },
  async getBookingById(id) {
    try { return model(await bookingApi('/bookings/' + id)) }
    catch (error) { if (error.status === 404) return null; throw error }
  },
  async createBooking(draft) { return model(await bookingApi('/bookings', { method: 'POST', body: JSON.stringify(draft) })) },
  async cancelBooking(id, reason) { return model(await bookingApi(`/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) })) },
  async rescheduleBooking(id, request) { return model(await bookingApi(`/bookings/${id}/reschedule`, { method: 'PUT', body: JSON.stringify(request) })) },
  async reviewBooking(id, review) { return model(await bookingApi(`/bookings/${id}/review`, { method: 'POST', body: JSON.stringify(review) })) },
  async createVnpayPaymentUrl(id) {
    return bookingApi(`/bookings/${id}/vnpay`, {
      method: 'POST',
    })
  },
  async reconcileVnpayPayment(id) {
    return bookingApi(`/bookings/${id}/vnpay/reconcile`, {
      method: 'POST',
    })
  },
}
