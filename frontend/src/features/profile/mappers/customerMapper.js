import { imageUrl } from '../../../shared/api/imageUrl.js';
export const PET_TYPES = { DOG: 'Chó', CAT: 'Mèo', OTHER: 'Khác' }
// Convert database field names into the fields used by the UI.
export function mapUserRow(row) {
  return {
    id: Number(row.maNguoiDung ?? row.manguoidung),
    email: row.email,
    fullName: row.hoten ?? row.hoTen,
    phone: row.sodienthoai ?? row.soDienThoai,
    provider: row.nhacungcap ?? row.nhaCungCap,
    role: row.vaitro ?? row.vaiTro,
    status: Number(row.trangthai ?? row.trangThai),
    createdAt: row.ngaytao ?? row.ngayTao,
    updatedAt: row.ngaycapnhat ?? row.ngayCapNhat,
  }
}
export function mapPetRow(row) {
  return {
    id: Number(row.mathucung),
    ownerId: Number(row.manguoidung),
    name: row.tenthucung,
    type: row.loaithucung,
    species: PET_TYPES[row.loaithucung],
    breed: row.giong,
    weightKg: Number(row.cannang),
    imageUrl: imageUrl(row.hinhanh),
    status: Number(row.trangthai),
    createdAt: row.ngaytao,
    updatedAt: row.ngaycapnhat,
    avatarTone: 'honey',
  }
}
