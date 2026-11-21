import { mockUsers, mockServices, mockServicePrices, mockBookings, mockBookingDetails, mockPayments, mockReviews } from '../data.js';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { bookingBundle } from '../bookings.js';
import { currentUserRow } from '../../features/profile/mocks/customerRepository.js';
import { handleServiceCatalog } from './serviceCatalog.js';
import { uploadServiceImage } from './serviceImages.js';
const publicUserRow = ({ matkhau, ...row }) => row;

const normalize = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
const search = (items, keyword) => items.filter((item) => normalize(JSON.stringify(item)).includes(normalize(keyword)));
const inRange = (value, start, end) => value && (!start || value.slice(0, 10) >= start) && (!end || value.slice(0, 10) <= end);
function paginate(items, params = {}, spring = false) {
  const size = Math.max(1, Number(params.size) || 10), page = Math.max(1, Number(params.page) || 1);
  const rows = items.slice((page - 1) * size, page * size);
  return spring
    ? { content: rows, size, totalElements: items.length, totalPages: Math.ceil(items.length / size), number: page - 1 }
    : { items: rows, meta: { current_page: page, per_page: size, total_elements: items.length, total_pages: Math.ceil(items.length / size) } };
}
function handle(config) {
  const method = (config.method || 'get').toLowerCase();
  const path = config.url.replace(/^\/api/, '').replace(/\/$/, '');
  const params = config.params || {}, body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
  const fail = (detail, status = 400) => {
    throw new AxiosError(detail, 'ERR_BAD_REQUEST', config, null, { status, statusText: detail, data: { detail }, headers: {}, config });
  };
  if (path === '/auth/login' && method === 'post') {
    const email = String(body.email || '').trim().toLowerCase();
    const user = mockUsers.find((row) => row.email === email && row.trangthai === 1);
    fail('Please use the backend login API.', 401);
    return { user: publicUserRow(user), token: 'petspa-mock-session', refreshToken: 'petspa-mock-session' };
  }
  if (path === '/public/services' && method === 'get') return mockServices.filter((row) => row.trangthai === 1);
  if (path === '/public/service-prices' && method === 'get') return mockServicePrices.filter((row) => !params.madichvu || row.madichvu === Number(params.madichvu));
  const sessionUser = currentUserRow();
  if (sessionUser?.vaitro !== 'ADMIN') fail('Vui lòng đăng nhập tài khoản quản trị.', 401);
  if (path === '/auth/me') return publicUserRow(sessionUser);
  if (path === '/auth/refresh') return { token: 'petspa-mock-session', refreshToken: 'petspa-mock-session' };
  if (path === '/service-images') {
    if (method !== 'post') fail('Thao tác ảnh dịch vụ không được hỗ trợ.', 405);
    return uploadServiceImage(body, fail);
  }
  if (/^\/(services|service-prices)(\/\d+)?$/.test(path)) return handleServiceCatalog({ path, method, body, fail });
  const filteredBookings = () => mockBookings.filter((row) => inRange(row.ngayhen, params.startDate, params.endDate));
  if (path === '/bookings' && method === 'get') {
    const rows = mockBookings.filter((row) => inRange(row.ngaytao, params.startDate, params.endDate)
      && (!params.status || row.trangthaidatlich === params.status)
      && (!params.paymentMethod || mockPayments.some((payment) => payment.madatlich === row.madatlich && payment.phuongthuc === params.paymentMethod)));
    return paginate(search(rows.map((row) => bookingBundle(row)), params.keyword), params);
  }
  const bookingMatch = path.match(/^\/bookings\/(\d+)$/);
  if (bookingMatch && method === 'get') {
    const row = mockBookings.find((booking) => booking.madatlich === Number(bookingMatch[1]));
    return row ? bookingBundle(row) : fail('Không tìm thấy lịch hẹn.', 404);
  }
  if (path === '/payments' && method === 'get') return mockPayments.filter((row) => !params.madatlich || row.madatlich === Number(params.madatlich));
  if (path === '/reviews' && method === 'get') return mockReviews.filter((row) => !params.madatlich || row.madatlich === Number(params.madatlich));
  if (path === '/reports/bookings') {
    const start = dayjs(params.startDate || dayjs().startOf('week'));
    const end = dayjs(params.endDate || dayjs().endOf('week'));
    if (!start.isValid() || !end.isValid()) fail('Khoảng ngày báo cáo không hợp lệ.');
    const count = Math.min(366, Math.max(0, end.startOf('day').diff(start.startOf('day'), 'day') + 1));
    return Array.from({ length: count }, (_, index) => {
      const date = start.add(index, 'day').format('YYYY-MM-DD');
      return { date,
        totalBookings: mockBookings.filter((row) => row.ngayhen === date && row.trangthaidatlich !== 'CANCELLED').length,
        revenue: mockPayments.filter((row) => row.trangthai === 'SUCCESS' && row.thoigianthanhtoan?.slice(0, 10) === date).reduce((sum, row) => sum + row.sotien, 0),
      };
    });
  }
  if (path === '/reports/services') {
    const bookings = filteredBookings().filter((row) => row.trangthaidatlich !== 'CANCELLED');
    return mockServices.map((service) => {
      const details = mockBookingDetails.filter((detail) => detail.madichvu === service.madichvu && bookings.some((booking) => booking.madatlich === detail.madatlich));
      return { serviceId: service.madichvu, serviceName: service.ten, totalBookings: details.length,
        revenue: Number(mockBookingDetails.filter((detail) => detail.madichvu === service.madichvu).reduce((sum, detail) => {
          const booking = mockBookings.find((row) => row.madatlich === detail.madatlich);
          const paid = mockPayments.filter((payment) => payment.madatlich === detail.madatlich && payment.trangthai === 'SUCCESS' && inRange(payment.thoigianthanhtoan, params.startDate, params.endDate)).reduce((total, payment) => total + payment.sotien, 0);
          return sum + (booking.tongtien ? detail.gia * paid / booking.tongtien : 0);
        }, 0).toFixed(2)) };
    });
  }
  if (path === '/reports/customers') return {
    guestCustomers: 0, memberCustomers: new Set(filteredBookings().map((row) => row.manguoidung)).size,
  };
  fail('Đường dẫn không thuộc API spa: ' + method.toUpperCase() + ' ' + path, 404);
}
export async function mockAdapter(config) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { data: structuredClone(await handle(config)), status: 200, statusText: 'OK', headers: {}, config };
}
