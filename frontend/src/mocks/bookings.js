import { mockUsers, mockPets, mockServices, mockServicePrices, mockBookings, mockBookingDetails, mockPayments, mockReviews, paymentRow } from './data.js';
import { nextMockId, mockTimestamp } from './utils.js';

export function bookingBundle(row) {
  const { matkhau, ...employee } = mockUsers.find((user) => user.manguoidung === row.manhanvien);
  return {
    datlich: row, thucung: mockPets.find((pet) => pet.mathucung === row.mathucung), nhanvien: employee,
    chitietdatlich: mockBookingDetails.filter((detail) => detail.madatlich === row.madatlich),
    thanhtoan: mockPayments.filter((payment) => payment.madatlich === row.madatlich),
    danhgia: mockReviews.find((review) => review.madatlich === row.madatlich) || null,
  };
}

export function availableStaffRows({ date, startTime, endTime, excludeBookingId }) {
  const start = startTime?.slice(0, 5), end = endTime?.slice(0, 5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !start || !end || start >= end || start < '08:00' || end > '18:00') return [];
  return mockUsers.filter((user) => user.vaitro === 'ADMIN' && user.trangthai === 1 && !mockBookings.some((booking) =>
    booking.madatlich !== Number(excludeBookingId) && booking.manhanvien === user.manguoidung && booking.ngayhen === date
    && ['PENDING', 'CONFIRMED'].includes(booking.trangthaidatlich)
    && booking.giobatdau.slice(0, 5) < end && booking.gioketthuc.slice(0, 5) > start));
}

export const BOOKING_START_TIMES = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

export function createMockBooking(owner, draft) {
  if (owner.vaitro !== 'CUSTOMER') throw new Error('Chỉ khách hàng có thể đặt lịch.');
  const pet = mockPets.find((row) => row.mathucung === Number(draft.petId) && row.manguoidung === owner.manguoidung && row.trangthai === 1);
  if (!pet) throw new Error('Thú cưng không thuộc tài khoản của bạn.');
  if (!owner.sodienthoai) throw new Error('Bạn cần cập nhật số điện thoại trong hồ sơ trước khi đặt lịch.');
  if (!['VNPAY', 'CASH'].includes(draft.paymentMethod)) throw new Error('Phương thức thanh toán không hợp lệ.');
  if (!Array.isArray(draft.serviceIds) || !draft.serviceIds.length || new Set(draft.serviceIds.map(Number)).size !== draft.serviceIds.length) throw new Error('Vui lòng chọn các dịch vụ hợp lệ.');
  const selected = draft.serviceIds.map((id) => mockServices.find((row) => row.madichvu === Number(id) && row.trangthai === 1));
  if (selected.some((row) => !row)) throw new Error('Dịch vụ không còn hoạt động.');
  const prices = selected.map((service) => mockServicePrices.find((price) => price.madichvu === service.madichvu && price.loaithucung === pet.loaithucung && pet.cannang > price.cannangtu && pet.cannang <= price.cannangden));
  if (prices.some((row) => !row)) throw new Error('Dịch vụ chưa có giá cho loại và cân nặng của thú cưng.');
  const date = String(draft.appointmentDate || ''), startTime = String(draft.startTime || '').slice(0, 5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(startTime)) throw new Error('Ngày hoặc giờ hẹn không hợp lệ.');
  const start = new Date(date + 'T' + startTime + ':00');
  if (!Number.isFinite(start.getTime()) || mockTimestamp(start).slice(0, 10) !== date || start <= new Date()) throw new Error('Lịch hẹn phải có ngày hợp lệ và ở trong tương lai.');
  const duration = selected.reduce((sum, row) => sum + row.thoiluongphut, 0);
  const end = new Date(start.getTime() + duration * 60000);
  const endTime = mockTimestamp(end).slice(11, 16);
  const employee = availableStaffRows({ date, startTime, endTime }).find((user) => user.manguoidung === Number(draft.employeeId));
  if (!employee || mockTimestamp(end).slice(0, 10) !== date) throw new Error('Nhân viên hoặc khung giờ không còn trống.');
  const id = nextMockId(mockBookings, 'madatlich'), now = mockTimestamp();
  const row = {
    madatlich: id, codedatlich: 'MEO-' + date.replaceAll('-', '').slice(2) + '-' + id,
    manguoidung: owner.manguoidung, tenlienhe: owner.hoten, sdtlienhe: owner.sodienthoai, emaillienhe: owner.email,
    mathucung: pet.mathucung, tenthucung: pet.tenthucung, loaithucung: pet.loaithucung, cannangthucung: pet.cannang,
    ghichu: String(draft.note || '').trim() || null, manhanvien: employee.manguoidung,
    ngayhen: date, giobatdau: startTime + ':00', gioketthuc: endTime + ':00',
    tongtien: prices.reduce((sum, price) => sum + price.gia, 0), trangthaidatlich: 'PENDING', trangthaithanhtoan: 'UNPAID',
    lydohuy: null, ngaytao: now, ngaycapnhat: now,
  };
  mockBookings.push(row);
  for (const [index, service] of selected.entries()) mockBookingDetails.push({
    id: nextMockId(mockBookingDetails, 'id'), madatlich: id, madichvu: service.madichvu,
    tendichvu: service.ten, gia: prices[index].gia, thoiluongphut: service.thoiluongphut,
  });
  mockPayments.push(paymentRow(nextMockId(mockPayments, 'mathanhtoan'), row, draft.paymentMethod));
  return row;
}
