import { mockBookings } from '../../../../mocks/data.js';
import { bookingBundle } from '../../../../mocks/bookings.js';
import { mockTimestamp } from '../../../../mocks/utils.js';
import { currentUserRow } from '../../../profile/mocks/customerRepository.js';
import { mapBookingBundle } from '../../../bookings/mappers/bookingMapper.js';
import { searchWithoutDiacritics } from '../../../../utils/searchWithoutDiacritics.js';

export const SCHEDULE_BOOKING_STATUS = {
  CONFIRMED: { label: 'CONFIRMED', color: 'purple' },
  COMPLETED: { label: 'COMPLETED', color: 'green' },
  CANCELLED: { label: 'CANCELLED', color: 'red' },
};
export function getBookingSchedules() {
  if (currentUserRow()?.vaitro !== 'ADMIN') throw new Error('Bạn cần đăng nhập tài khoản quản trị.');
  return mockBookings.map((row) => mapBookingBundle(bookingBundle(row)));
}
export function updateBookingScheduleStatus({ id, status }) {
  if (currentUserRow()?.vaitro !== 'ADMIN') throw new Error('Bạn cần đăng nhập tài khoản quản trị.');
  if (!['COMPLETED', 'CANCELLED'].includes(status)) throw new Error('Trạng thái đặt lịch không hợp lệ.');
  const row = mockBookings.find((booking) => booking.madatlich === Number(id));
  if (!row) throw new Error('Không tìm thấy lịch hẹn.');
  if (row.trangthaidatlich !== 'CONFIRMED') throw new Error('Chỉ được đổi trạng thái lịch hẹn đã CONFIRMED.');
  Object.assign(row, { trangthaidatlich: status, ngaycapnhat: mockTimestamp() });

  return mapBookingBundle(bookingBundle(row));
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
