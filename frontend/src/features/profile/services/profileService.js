import { mockUsers } from '../../../mocks/data.js';
import { copy, requireUserRow, wait } from '../mocks/customerRepository.js';
import { mapUserRow } from '../mappers/customerMapper.js';
import { selectService } from '../../../app/config/dataSource.js';
import { mockTimestamp } from '../../../mocks/utils.js';
export const profileService = selectService({
  async getProfile() { await wait(); return copy(mapUserRow(requireUserRow())); },
  async updateProfile(input) {
    await wait();
    if (!input.fullName?.trim() || input.fullName.trim().length > 100) throw new Error('Họ tên cần từ 1 đến 100 ký tự.');
    if (input.phone && (input.phone.length > 15 || !/^\+?[0-9]{9,15}$/.test(input.phone))) throw new Error('Số điện thoại tối đa 15 ký tự và cần từ 9 chữ số.');
    const user = requireUserRow();
    if (input.phone && mockUsers.some((row) => row.manguoidung !== user.manguoidung && row.sodienthoai === input.phone))
      throw new Error('Số điện thoại này đã được sử dụng bởi tài khoản khác.');
    Object.assign(user, { hoten: input.fullName.trim(), sodienthoai: input.phone || null, ngaycapnhat: mockTimestamp() });

    return copy(mapUserRow(user));
  },
});
