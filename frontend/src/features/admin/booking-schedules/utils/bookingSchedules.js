import { api } from '../../../../api/client.js';
import { mapBookingResponse } from '../../../bookings/mappers/bookingMapper.js';
import { searchWithoutDiacritics } from '../../../../utils/searchWithoutDiacritics.js';

export const SCHEDULE_BOOKING_STATUS = {
  CONFIRMED: { label: 'CONFIRMED', color: 'purple' },
  COMPLETED: { label: 'COMPLETED', color: 'green' },
  CANCELLED: { label: 'CANCELLED', color: 'red' },
};
export async function getBookingSchedules() {
  return (await api.get('/admin/booking-schedules')).map(mapBookingResponse);
}
export async function updateBookingScheduleStatus({ id, status }) {
  return mapBookingResponse(await api.put(`/admin/bookings/${id}/status`, { status }));
}

export function countBookingsByDate(bookings) {
  return bookings.reduce((counts, booking) => {
    if (!Object.hasOwn(SCHEDULE_BOOKING_STATUS, booking.bookingStatus)) return counts;
    const date = booking.appointment.date;
    counts.set(date, (counts.get(date) ?? 0) + 1);
    return counts;
  }, new Map());
}

export function filterBookingSchedules(bookings, { date, keyword = '', status, serviceId }) {
  return bookings
    .filter((booking) => {
      if (!Object.hasOwn(SCHEDULE_BOOKING_STATUS, booking.bookingStatus)) return false;
      if (booking.appointment.date !== date) return false;
      if (status && booking.bookingStatus !== status) return false;
      if (serviceId != null && !booking.services.some((service) => Number(service.serviceId) === Number(serviceId))) return false;

      const searchText = [
        booking.code,
        booking.contact.name,
        booking.contact.phone,
        booking.contact.phone.replace(/\D/g, ''),
        booking.pet.name,
        booking.pet.species,
        booking.pet.breed,
        ...booking.services.map((service) => service.name),
      ].join(' ');

      return searchWithoutDiacritics(searchText, keyword.trim());
    })
    .sort((left, right) => left.appointment.startTime.localeCompare(right.appointment.startTime) || left.id - right.id);
}
