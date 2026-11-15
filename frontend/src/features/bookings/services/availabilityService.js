import { availableStaffRows, BOOKING_START_TIMES } from '../../../mocks/bookings.js';
import { addMinutesToTime, minutesFromTime } from '../utils/bookingDuration.js';
import { mockRequest } from '../../../shared/api/mockRequest.js';
export const availabilityService = {
  async getAvailableSlots({ date, totalDuration, excludeBookingId }) {
    if (!Number.isFinite(totalDuration) || totalDuration <= 0) return mockRequest([]);
    const slots = BOOKING_START_TIMES.filter((startTime) => {
      const endTime = addMinutesToTime(startTime, totalDuration);
      return minutesFromTime(endTime) <= 18 * 60 && availableStaffRows({ date, startTime, endTime, excludeBookingId }).length > 0;
    });
    return mockRequest(slots, 150);
  },
};
