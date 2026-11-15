import { mapUserRow } from '~/features/profile/mappers/customerMapper.js';

export function mapAdminUser(row) {
  const user = mapUserRow(row);
  return { ...user, name: user.fullName, userRole: user.role, is_deleted: user.status === 0 };
}
export const mapAdminUserPage = (page) => ({ ...page, content: page.content.map(mapAdminUser) });
export const userWriteRow = (data, role) => ({
  hoten: data.name, email: data.email, sodienthoai: data.phone,
  ...(role ? { vaitro: role } : {}),
  ...(data.password === undefined ? {} : { matkhau: data.password }),
  ...(data.is_deleted === undefined ? {} : { trangthai: data.is_deleted ? 0 : 1 }),
});
