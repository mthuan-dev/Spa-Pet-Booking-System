import { MOCK_BOOKINGS } from '../../../bookings/mocks/bookings.js';
import { MOCK_STAFF } from '../../../bookings/mocks/staff.js';
import { mapBookingResponse } from '../../../bookings/mappers/bookingMapper.js';
import { searchWithoutDiacritics } from '../../../../utils/searchWithoutDiacritics.js';
import { createSampleBookingSchedules } from '../mocks/bookingSchedules.js';

export const SCHEDULE_BOOKING_STATUS = {
  CONFIRMED: { label: 'CONFIRMED', color: 'purple' },
  COMPLETED: { label: 'COMPLETED', color: 'green' },
  CANCELLED: { label: 'CANCELLED', color: 'red' },
};

const BOOKING_CHANGES_KEY = 'meomeo:booking-changes';

function readSessionRecord(key) {
  try {
    const value = JSON.parse(globalThis.sessionStorage?.getItem(key) ?? '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

export function getBookingSchedules() {
  const changes = readSessionRecord(BOOKING_CHANGES_KEY);
  const reschedules = readSessionRecord('meomeo:booking-reschedules');

  return [...MOCK_BOOKINGS, ...createSampleBookingSchedules()].map((original) => {
    const booking = { ...original, ...changes[original.id] };
    const appointment = reschedules[original.id];
    const employee = appointment?.employeeId
      ? {
          ...booking.employee,
          id: appointment.employeeId,
          name: MOCK_STAFF.find((member) => Number(member.id) === Number(appointment.employeeId))?.name ?? booking.employee?.name,
        }
      : booking.employee;

    return mapBookingResponse({
      ...booking,
      employee,
      appointment: { ...booking.appointment, ...appointment },
    });
  });
}

export function updateBookingScheduleStatus({ id, status }) {
  if (!['COMPLETED', 'CANCELLED'].includes(status)) {
    throw new Error('Trạng thái đặt lịch không hợp lệ.');
  }

  const booking = getBookingSchedules().find((item) => item.id === Number(id));
  if (!booking) throw new Error('Không tìm thấy lịch hẹn.');
  if (booking.bookingStatus === 'COMPLETED') {
    throw new Error('Lịch hẹn đã hoàn thành, không thể đổi trạng thái.');
  }
  if (booking.bookingStatus !== 'CONFIRMED') {
    throw new Error('Chỉ được đổi trạng thái lịch hẹn đã CONFIRMED.');
  }

  const changes = readSessionRecord(BOOKING_CHANGES_KEY);
  changes[booking.id] = { ...changes[booking.id], bookingStatus: status };
  try {
    globalThis.sessionStorage.setItem(BOOKING_CHANGES_KEY, JSON.stringify(changes));
  } catch {
    throw new Error('Không thể lưu trạng thái đặt lịch. Vui lòng thử lại.');
  }

  return { ...booking, bookingStatus: status };
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
