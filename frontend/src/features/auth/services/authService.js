import { mockUsers, userRow } from '../../../mocks/data.js';
import { copy, credentials, currentUser, setSession, wait } from '../../profile/mocks/customerRepository.js';
import { mapUserRow } from '../../profile/mappers/customerMapper.js';
import { selectService } from '../../../app/config/dataSource.js';
import { validateAccount } from '../validation/accountValidation.js';
import { nextMockId, mockTimestamp } from '../../../mocks/utils.js';

// Demo credentials stay in memory; the SQL matkhau column is never returned to the UI.
export const authService = selectService({
  async getCurrentUser() { await wait(); return copy(currentUser()); },
  async login({ email, password, remember }) {
    await wait();
    const normalized = email.trim().toLowerCase();
    const user = mockUsers.find((row) => row.email === normalized && row.trangthai === 1);
    if (!user || credentials.get(normalized) !== password)
      throw new Error('Email hoặc mật khẩu chưa đúng. Tài khoản mới tạo chỉ đăng nhập được trong phiên mở ứng dụng này.');
    setSession(user.manguoidung, remember);
    return copy(mapUserRow(user));
  },
  async register(input) {
    await wait();
    if (Object.keys(validateAccount(input, true)).length) throw new Error('Bạn kiểm tra lại thông tin đăng ký nhé.');
    const email = input.email.trim().toLowerCase();
    if (mockUsers.some((row) => row.email === email)) throw new Error('Email này đã được đăng ký.');
    if (input.phone && mockUsers.some((row) => row.sodienthoai === input.phone)) throw new Error('Số điện thoại này đã được đăng ký.');
    const row = userRow(nextMockId(mockUsers, 'manguoidung'), input.fullName.trim(), email, 'CUSTOMER', mockTimestamp());
    row.sodienthoai = input.phone || null;
    mockUsers.push(row);

    credentials.set(email, input.password);
    return copy(mapUserRow(row));
  },
  async logout() { setSession(null); },
});
