import { mapUserRow } from '~/features/profile/mappers/customerMapper.js';

export function mapAdminUser(row) {
  const user = mapUserRow(row);
  return { ...user, name: user.fullName, userRole: user.role, is_deleted: user.status === 0 };
}
export const mapAdminUserPage = (page) => ({ ...page, content: page.content.map(mapAdminUser) });
export const userWriteRow = (data, role) => ({
  hoTen: data.name, email: data.email, soDienThoai: data.phone,
  ...(role ? { vaiTro: role } : {}),
  ...(data.password === undefined ? {} : { matKhau: data.password }),
  ...(data.is_deleted === undefined ? {} : { trangThai: data.is_deleted ? 0 : 1 }),
});
