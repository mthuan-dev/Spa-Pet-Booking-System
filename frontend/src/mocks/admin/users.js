import { mockUsers, userRow } from '../data.js';
import { credentials } from '../../features/profile/mocks/customerRepository.js';
import { nextMockId, mockTimestamp } from '../utils.js';

export const publicUserRow = ({ matkhau, ...row }) => row;
export function handleAdminUsers({ userId, method, body, params, fail, search, paginate }) {
  if (!userId && method === 'get') {
    if (params.role && !['ADMIN', 'CUSTOMER'].includes(params.role)) return fail('Vai trò tài khoản không hợp lệ.');
    return paginate(search(mockUsers.filter((row) => !params.role || row.vaitro === params.role).map(publicUserRow), params.keyword), params, true);
  }
  const user = userId ? mockUsers.find((row) => row.manguoidung === Number(userId)) : null;
  if (userId && !user) return fail('Không tìm thấy người dùng.', 404);
  if (method === 'get') return publicUserRow(user);
  if (method === 'delete' && user) { Object.assign(user, { trangthai: user.trangthai === 1 ? 0 : 1, ngaycapnhat: mockTimestamp() }); return publicUserRow(user); }
  if ((method !== 'post' || userId) && (method !== 'put' || !userId)) return fail('Thao tác người dùng không được hỗ trợ.', 405);
  const role = body.vaitro ?? user?.vaitro ?? 'CUSTOMER';
  const name = String(body.hoten ?? user?.hoten ?? '').trim();
  const email = String(body.email ?? user?.email ?? '').trim().toLowerCase();
  const phone = String(body.sodienthoai === undefined ? user?.sodienthoai || '' : body.sodienthoai ?? '').trim() || null;
  const status = body.trangthai ?? user?.trangthai ?? 1;
  if (!['ADMIN', 'CUSTOMER'].includes(role)) return fail('Vai trò tài khoản không hợp lệ.');
  if (!name || name.length > 100) return fail('Họ tên cần từ 1 đến 100 ký tự.');
  if (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Email không hợp lệ.');
  if (phone && (phone.length > 15 || !/^\+?\d{9,15}$/.test(phone))) return fail('Số điện thoại tối đa 15 ký tự và cần từ 9 chữ số.');
  if (![0, 1].includes(status)) return fail('Trạng thái người dùng không hợp lệ.');
  if (mockUsers.some((row) => row.manguoidung !== user?.manguoidung && row.email.toLowerCase() === email)) return fail('Email này đã được sử dụng.', 409);
  if (phone && mockUsers.some((row) => row.manguoidung !== user?.manguoidung && row.sodienthoai === phone)) return fail('Số điện thoại này đã được sử dụng.', 409);
  if (!user && (typeof body.matkhau !== 'string' || body.matkhau.length < 6 || body.matkhau.length > 16)) return fail('Mật khẩu cần từ 6 đến 16 ký tự.');
  const record = user || userRow(nextMockId(mockUsers, 'manguoidung'), name, email, role, mockTimestamp());
  Object.assign(record, { hoten: name, email, sodienthoai: phone, vaitro: role, trangthai: status, ngaycapnhat: mockTimestamp() });
  if (!user) { mockUsers.push(record); credentials.set(email, body.matkhau); }
  return publicUserRow(record);
}
