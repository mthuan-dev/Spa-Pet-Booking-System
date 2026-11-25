import { bookingApi } from '../../../api/bookingApi.js'
export const availabilityService = {
  getAvailableSlots({ date, totalDuration, excludeBookingId }) {
    if (!Number.isFinite(totalDuration) || totalDuration <= 0) return Promise.resolve([])
    return bookingApi('/slots?' + new URLSearchParams({ date, totalDuration, ...(excludeBookingId ? { excludeBookingId } : {}) }))
  },
}
