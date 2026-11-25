import { bookingApi } from '../../../api/bookingApi.js'
export const staffService = {
  getAvailableStaff({ date, startTime, endTime, excludeBookingId }) {
    return bookingApi('/staff?' + new URLSearchParams({ date, startTime, endTime, ...(excludeBookingId ? { excludeBookingId } : {}) }))
  },
}
