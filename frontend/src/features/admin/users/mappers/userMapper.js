export function mapAdminUser(row) {
  const user = {
    id: row.maNguoiDung,
    email: row.email,
    fullName: row.hoTen,
    phone: row.soDienThoai,
    provider: row.nhaCungCap,
    role: row.vaiTro,
    status: row.trangThai,
    createdAt: row.ngayTao,
    updatedAt: row.ngayCapNhat,
  };
  return { ...user, name: user.fullName, userRole: user.role, is_deleted: user.status === 0 };
}
export const mapAdminUserPage = (page) => ({ ...page, content: page.content.map(mapAdminUser) });
export const userWriteRow = (data, role) => ({
  hoTen: data.name?.trim(), email: data.email?.trim().toLowerCase(),
  ...(data.phone === undefined ? {} : { soDienThoai: data.phone?.trim() || null }),
  ...(role ? { vaiTro: role } : {}),
  ...(data.password === undefined ? {} : { matKhau: data.password }),
  ...(data.is_deleted === undefined ? {} : { trangThai: data.is_deleted ? 0 : 1 }),
});
