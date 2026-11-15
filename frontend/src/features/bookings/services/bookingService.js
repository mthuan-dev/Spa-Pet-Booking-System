import { mockBookings, mockPayments, mockReviews } from '../../../mocks/data.js';
import { mockRequest } from '../../../shared/api/mockRequest.js';
import { requireUserRow } from '../../profile/mocks/customerRepository.js';
import { mapBookingBundle } from '../mappers/bookingMapper.js';
import { getBookingActions } from '../utils/bookingDetail.js';
import { getTotalDuration, addMinutesToTime } from '../utils/bookingDuration.js';
import { bookingBundle, createMockBooking, availableStaffRows } from '../../../mocks/bookings.js';
import { nextMockId, mockTimestamp } from '../../../mocks/utils.js';

function find(id) {
  const owner = requireUserRow();
  const row = mockBookings.find((booking) => booking.madatlich === Number(id) && booking.manguoidung === owner.manguoidung);
  if (!row) throw new Error('Không tìm thấy lịch hẹn trong tài khoản của bạn.');
  return row;
}
const model = (row) => mapBookingBundle(bookingBundle(row));
export const bookingService = {
  async getMyBookings() {
    const owner = requireUserRow();
    return mockRequest(mockBookings.filter((row) => row.manguoidung === owner.manguoidung).map(model), 300);
  },
  async getBookingById(id) {
    const owner = requireUserRow();
    const row = mockBookings.find((booking) => booking.madatlich === Number(id) && booking.manguoidung === owner.manguoidung);
    return mockRequest(row ? model(row) : null, 300);
  },
  async rescheduleBooking(id, requested) {
    const row = find(id), booking = model(row);
    if (!getBookingActions(booking).canReschedule) throw new Error('Lịch hẹn này không thể đổi lịch.');
    const date = String(requested.date || ''), startTime = String(requested.startTime || '').slice(0, 5);
    const start = new Date(date + 'T' + startTime);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(startTime) || !Number.isFinite(start.getTime()) || mockTimestamp(start).slice(0, 10) !== date || start <= new Date())
      throw new Error('Ngày và giờ hẹn phải ở trong tương lai.');
    const endTime = addMinutesToTime(startTime, getTotalDuration(booking.services));
    const employee = availableStaffRows({ date, startTime, endTime, excludeBookingId: row.madatlich })
      .find((user) => user.manguoidung === Number(requested.employeeId));
    if (!employee) throw new Error('Nhân viên hoặc khung giờ không còn trống.');
    Object.assign(row, { ngayhen: date, giobatdau: startTime + ':00', gioketthuc: endTime.slice(0, 5) + ':00', manhanvien: employee.manguoidung, ngaycapnhat: mockTimestamp() });

    return mockRequest(model(row), 300);
  },
  async cancelBooking(id, reason) {
    const row = find(id);
    if (!getBookingActions(model(row)).canCancel) throw new Error('Lịch hẹn này không thể hủy.');
    if (String(reason || '').length > 255) throw new Error('Lý do hủy tối đa 255 ký tự.');
    Object.assign(row, { trangthaidatlich: 'CANCELLED', lydohuy: String(reason || '').trim() || null, ngaycapnhat: mockTimestamp() });
    for (const payment of mockPayments.filter((payment) => payment.madatlich === row.madatlich && payment.trangthai === 'PENDING'))
      Object.assign(payment, { trangthai: 'CANCELLED', ngaycapnhat: mockTimestamp() });

    return mockRequest(model(row));
  },
  async reviewBooking(id, { rating, comment }) {
    const row = find(id), booking = model(row);
    if (!getBookingActions(booking).canReview || mockReviews.some((review) => review.madatlich === row.madatlich)) throw new Error('Lịch hẹn này không thể đánh giá.');
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Số sao cần từ 1 đến 5.');
    const now = mockTimestamp();
    mockReviews.push({ madanhgia: nextMockId(mockReviews, 'madanhgia'), madatlich: row.madatlich, sosao: rating,
      binhluan: String(comment || '').trim() || null, is_hidden: 0, ngaytao: now, ngaycapnhat: now });

    return mockRequest(model(row));
  },
  async createBooking(draft) {
    const row = createMockBooking(requireUserRow(), draft);

    return mockRequest(model(row), 300);
  },
};
