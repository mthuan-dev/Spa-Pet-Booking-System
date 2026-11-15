import dayjs from 'dayjs';
import { nextMockId } from './utils.js';

const SAMPLE_USERS = [
  ['Minh Thuận', 'minhthuan@meomeo.vn', 'CUSTOMER'], ['Admin Demo', 'admin@example.com', 'ADMIN'],
  ['Lê Thu Hà', 'user3@example.com', 'ADMIN'], ['Phạm Hoàng Nam', 'user4@example.com', 'ADMIN'],
  ['Võ Ngọc Linh', 'user5@example.com', 'ADMIN'], ['Đặng Tuấn Kiệt', 'user6@example.com', 'CUSTOMER'],
  ['Bùi Thanh Mai', 'user7@example.com', 'CUSTOMER'], ['Đỗ Gia Bảo', 'user8@example.com', 'CUSTOMER'],
  ['Hồ Phương Thảo', 'user9@example.com', 'CUSTOMER'], ['Ngô Đức Minh', 'user10@example.com', 'CUSTOMER'],
  ['Dương Khánh Vy', 'user11@example.com', 'CUSTOMER'], ['Lý Bảo Ngọc', 'user12@example.com', 'CUSTOMER'],
];
export const userRow = (id, name, email, role = 'CUSTOMER', createdAt = '2026-10-01T08:00:00') => ({
  manguoidung: id, email, matkhau: null, hoten: name, sodienthoai: `090${String(1234566 + id)}`,
  googleid: null, nhacungcap: 'LOCAL', vaitro: role, trangthai: 1, ngaytao: createdAt, ngaycapnhat: createdAt,
});
export const petRow = (id, ownerId, name, type, breed, weight, createdAt = '2026-10-26T08:00:00') => ({
  mathucung: id, manguoidung: ownerId, tenthucung: name, loaithucung: type, giong: breed,
  cannang: weight, hinhanh: null, trangthai: 1, ngaytao: createdAt, ngaycapnhat: createdAt,
});

export const mockUsers = SAMPLE_USERS.map(([name, email, role], index) => userRow(index + 1, name, email, role,
  index === 0 ? '2026-10-26T08:00:00' : `2026-10-${String(index + 1).padStart(2, '0')}T08:00:00`));
mockUsers[1].sodienthoai = null;
mockUsers[4].trangthai = 0;
mockUsers[11].nhacungcap = 'GOOGLE';
mockUsers[11].googleid = 'demo-google-12';
export const mockPets = [
  petRow(101, 1, 'Mochi', 'DOG', 'Poodle', 4.8), petRow(102, 1, 'Bắp', 'CAT', 'Mèo mướp', 6.2),
  petRow(103, 6, 'Bông', 'DOG', 'Poodle', 4.8), petRow(104, 6, 'Miu', 'CAT', 'Mèo Anh lông ngắn', 4.2),
  petRow(105, 7, 'Kiki', 'CAT', 'Mèo mướp', 3.6), petRow(106, 8, 'Gấu', 'DOG', 'Corgi', 10.5),
  petRow(107, 8, 'Đậu', 'DOG', 'Phốc sóc', 3.2), petRow(108, 1, 'Mây', 'DOG', 'Shih Tzu', 5.1),
  petRow(109, 9, 'Milo', 'DOG', 'Corgi', 9.2), petRow(110, 10, 'Kem', 'CAT', 'Mèo Ba Tư', 5.6),
  petRow(111, 11, 'Lucky', 'DOG', 'Golden Retriever', 22),
];
const photos = [
  new URL('../assets/images/services/dog-shower-animal-photography.webp', import.meta.url).href,
  new URL('../assets/images/services/white-shih-tzu-trimmed.jpg', import.meta.url).href,
  new URL('../assets/images/services/spa-1.jpg', import.meta.url).href,
  new URL('../assets/images/services/spa-6.jpg', import.meta.url).href,
];
const services = [
  ['Tắm thơm & sấy lông', 'SINGLE', 60, 'Làm sạch nhẹ nhàng, sấy khô và chải lại bộ lông.'],
  ['Cắt tỉa tạo kiểu', 'SINGLE', 90, 'Tỉa gọn theo dáng lông và sự thoải mái của boss.'],
  ['Chải lông & gỡ rối', 'SINGLE', 30, 'Gỡ rối vừa tay, giúp bộ lông mềm và tơi hơn.'],
  ['Gói chăm sóc trọn buổi', 'COMBO', 150, 'Kết hợp tắm, sấy, chải lông và chăm chút diện mạo.'],
  ['Vệ sinh tai & cắt móng', 'SINGLE', 15, 'Vệ sinh tai và cắt móng nhẹ nhàng.'],
];
export const mockServices = services.map(([ten, loaidichvu, thoiluongphut, mota], index) => ({
  madichvu: index + 1, ten, loaidichvu, thoiluongphut, hinhanh: photos[index] || null, mota,
  trangthai: 1, ngaytao: '2026-10-01T08:00:00', ngaycapnhat: '2026-10-01T08:00:00',
}));
export const mockComboDetails = [1, 2, 3].map((madichvucon) => ({ macombo: 4, madichvucon }));
export const mockServicePrices = [];
const dogPrices = [[120000, 150000, 190000, 230000], [180000, 230000, 290000, 360000], [80000, 100000, 140000, 180000], [320000, 390000, 490000, 590000], [60000, 70000, 80000, 90000]];
const catPrices = [[150000, 180000, 220000], [200000, 250000, 310000], [90000, 120000, 160000], null, [60000, 60000, 60000]];
for (const service of mockServices) {
  for (const [index, gia] of dogPrices[service.madichvu - 1].entries()) {
    mockServicePrices.push({ magiadichvu: mockServicePrices.length + 1, madichvu: service.madichvu, loaithucung: 'DOG', cannangtu: [0, 5, 10, 20][index], cannangden: [5, 10, 20, 999.99][index], gia });
  }
  if (catPrices[service.madichvu - 1]) for (const [index, gia] of catPrices[service.madichvu - 1].entries()) {
    mockServicePrices.push({ magiadichvu: mockServicePrices.length + 1, madichvu: service.madichvu, loaithucung: 'CAT', cannangtu: [0, 3, 5][index], cannangden: [3, 5, 10][index], gia });
  }
}
mockServicePrices.push(...[[0, 1, 80000], [1, 3, 100000]].map(([cannangtu, cannangden, gia], index) => ({ magiadichvu: mockServicePrices.length + index + 1, madichvu: 1, loaithucung: 'OTHER', cannangtu, cannangden, gia })));

export const paymentRow = (id, booking, method, status = 'PENDING') => ({
  mathanhtoan: id, madatlich: booking.madatlich, phuongthuc: method, sotien: booking.tongtien,
  vnp_txn_ref: method === 'VNPAY' ? `DEMO-${booking.madatlich}-${id}` : null,
  vnp_transaction_no: method === 'VNPAY' && status === 'SUCCESS' ? `DEMO-TXN-${id}` : null,
  trangthai: status, vnp_response_code: method === 'VNPAY' && status === 'SUCCESS' ? '00' : null,
  vnp_transaction_status: method === 'VNPAY' && status === 'SUCCESS' ? '00' : null,
  vnp_bank_code: null, vnp_bank_tran_no: null, vnp_card_type: null, message: null,
  thoigianthanhtoan: status === 'SUCCESS' ? booking.ngaycapnhat : null,
  ngaytao: booking.ngaytao, ngaycapnhat: booking.ngaycapnhat,
});

// Frontend sample objects; changes made by the demo stay in memory until reload.
export const mockBookings = [];
export const mockBookingDetails = [];
export const mockPayments = [];
export const mockReviews = [];
const referenceDate = new Date();
const today = dayjs(referenceDate).startOf('day');
const employees = mockUsers.filter((row) => row.vaitro === 'ADMIN' && row.trangthai === 1);
const owner = mockUsers.find((row) => row.email === 'minhthuan@meomeo.vn' && row.vaitro === 'CUSTOMER');
const addBooking = (id, customer, pet, employee, date, time, serviceIds, status, paid, method = 'CASH') => {
  const services = serviceIds.map((serviceId) => mockServices.find((row) => row.madichvu === serviceId)).filter(Boolean);
  if (!services.length || !pet) return;
  const details = services.map((service) => ({
    id: nextMockId(mockBookingDetails, 'id'), madatlich: id, madichvu: service.madichvu, tendichvu: service.ten,
    gia: mockServicePrices.find((price) => price.madichvu === service.madichvu && price.loaithucung === pet.loaithucung && pet.cannang > price.cannangtu && pet.cannang <= price.cannangden)?.gia ?? 150000,
    thoiluongphut: service.thoiluongphut,
  }));
  for (const detail of details) { detail.id = nextMockId(mockBookingDetails, 'id'); mockBookingDetails.push(detail); }
  const duration = details.reduce((total, row) => total + row.thoiluongphut, 0);
  const dateTime = dayjs(`${date}T${time}:00`);
  let created = dateTime.subtract(14, 'day');
  if (created.isAfter(dayjs(referenceDate))) created = dayjs(referenceDate).subtract(1, 'day');
  if (created.isBefore(dayjs(customer.ngaytao))) created = dayjs(customer.ngaytao);
  let updated = status === 'COMPLETED' ? dateTime.add(duration, 'minute') : paid ? created.add(5, 'minute') : created;
  if (updated.isAfter(dayjs(referenceDate))) updated = dayjs(referenceDate);
  const row = {
    madatlich: id, codedatlich: `MEO-${date.replaceAll('-', '').slice(2)}-${id}`, manguoidung: customer.manguoidung,
    tenlienhe: customer.hoten, sdtlienhe: customer.sodienthoai || '0901000000', emaillienhe: customer.email,
    mathucung: pet.mathucung, tenthucung: pet.tenthucung, loaithucung: pet.loaithucung, cannangthucung: pet.cannang,
    ghichu: null, manhanvien: employee.manguoidung, ngayhen: date, giobatdau: `${time}:00`,
    gioketthuc: dateTime.add(duration, 'minute').format('HH:mm:ss'), tongtien: details.reduce((total, detail) => total + detail.gia, 0),
    trangthaidatlich: status, trangthaithanhtoan: paid ? 'PAID' : 'UNPAID',
    lydohuy: status === 'CANCELLED' ? 'Khách cần đổi lịch.' : null,
    ngaytao: created.format('YYYY-MM-DDTHH:mm:ss'), ngaycapnhat: updated.format('YYYY-MM-DDTHH:mm:ss'),
  };
  mockBookings.push(row);
  mockPayments.push(paymentRow(nextMockId(mockPayments, 'mathanhtoan'), row, method, paid ? 'SUCCESS' : status === 'CANCELLED' ? 'CANCELLED' : 'PENDING'));
};
const pets = mockPets.filter((row) => row.manguoidung === owner.manguoidung);
[[27, 2, 'PENDING', false], [28, 4, 'PENDING', true], [29, 7, 'CONFIRMED', false], [30, 10, 'CONFIRMED', true], [24, -7, 'COMPLETED', true], [22, -10, 'COMPLETED', true], [19, -11, 'CANCELLED', false]].forEach(([id, offset, status, paid], index) => {
  const pet = pets[index % pets.length];
  const serviceIds = pet?.loaithucung === 'CAT' ? [1, 3] : index % 2 ? [4] : [1, 2];
  addBooking(id, owner, pet, employees[index % employees.length], today.add(offset, 'day').format('YYYY-MM-DD'), index % 2 ? '13:00' : '09:00', serviceIds, status, paid, index % 2 ? 'VNPAY' : 'CASH');
});
const completed = mockBookings.find((row) => row.madatlich === 22);
if (completed) mockReviews.push({ madanhgia: 701, madatlich: completed.madatlich, sosao: 5, binhluan: 'Bé về nhà thơm tho, lông mềm và rất vui.', is_hidden: 0, ngaytao: completed.ngaycapnhat, ngaycapnhat: completed.ngaycapnhat });
if (completed) mockPayments.push({ ...paymentRow(nextMockId(mockPayments, 'mathanhtoan'), completed, 'VNPAY', 'FAILED'),
  vnp_response_code: '24', vnp_transaction_status: '02', message: 'Giao dịch mẫu bị từ chối.' });
for (const [index, email] of ['user6@example.com', 'user7@example.com', 'user8@example.com', 'user9@example.com', 'user10@example.com', 'user11@example.com'].entries()) {
  const customer = mockUsers.find((row) => row.email === email && row.vaitro === 'CUSTOMER');
  const pet = customer && mockPets.find((row) => row.manguoidung === customer.manguoidung);
  if (!pet) continue;
  for (const offset of [-2, -1, 0, 1, 2, 3, 5]) {
    const date = today.add(offset, 'day').format('YYYY-MM-DD');
    addBooking(Number(date.replaceAll('-', '')) * 10 + index + 1, customer, pet, employees[index % employees.length], date,
      ['08:00', '09:00', '10:00', '13:00', '14:00', '16:00'][index], [index === 3 ? 4 : index === 4 ? 3 : 1], offset < 0 ? 'COMPLETED' : 'CONFIRMED', offset < 0);
  }
}
