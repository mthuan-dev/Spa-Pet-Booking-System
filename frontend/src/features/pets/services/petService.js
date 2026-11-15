import { mockPets } from '../../../mocks/data.js';
import { copy, currentUser, requireUser, wait } from '../../profile/mocks/customerRepository.js';
import { selectService } from '../../../app/config/dataSource.js';
import { PET_TYPES, mapPetRow } from '../../profile/mappers/customerMapper.js';
import { nextMockId, mockTimestamp } from '../../../mocks/utils.js';
import { storePetImage } from '../../../mocks/imageStore.js';

function find(id) {
  const user = requireUser();
  const row = mockPets.find((pet) => pet.mathucung === Number(id) && pet.manguoidung === user.id && pet.trangthai === 1);
  if (!row) throw new Error('Không tìm thấy thú cưng trong tài khoản của bạn.');
  return row;
}
export function validatePet(value) {
  if (!value.name?.trim() || value.name.trim().length > 100) return 'Tên thú cưng cần từ 1 đến 100 ký tự.';
  if (!PET_TYPES[value.type] && !Object.values(PET_TYPES).includes(value.species)) return 'Bạn chọn loại thú cưng nhé.';
  if (!Number.isFinite(Number(value.weightKg)) || Number(value.weightKg) <= 0 || Number(value.weightKg) > 999.99 || !/^\d+(\.\d{1,2})?$/.test(String(value.weightKg)))
    return 'Cân nặng cần lớn hơn 0, tối đa 999,99 kg và có tối đa 2 số thập phân.';
  if (value.breed?.length > 100) return 'Giống thú cưng tối đa 100 ký tự.';
  return '';
}
function fields(value) {
  const error = validatePet(value);
  if (error) throw new Error(error);
  return {
    tenthucung: value.name.trim(), loaithucung: value.type || Object.keys(PET_TYPES).find((type) => PET_TYPES[type] === value.species),
    giong: value.breed?.trim() || null, cannang: Number(value.weightKg), hinhanh: storePetImage(value.imageUrl),
  };
}
export const petService = selectService({
  async getMyPets() {
    await wait();
    const user = currentUser();
    return user ? copy(mockPets.filter((pet) => pet.manguoidung === user.id && pet.trangthai === 1).map(mapPetRow)) : [];
  },
  async getPetById(id) { await wait(); return copy(mapPetRow(find(id))); },
  async createPet(value) {
    await wait();
    const owner = requireUser();
    if (owner.role !== 'CUSTOMER') throw new Error('Chỉ tài khoản khách hàng có thể thêm thú cưng.');
    const data = fields(value), now = mockTimestamp();
    const row = { mathucung: nextMockId(mockPets, 'mathucung'), manguoidung: owner.id, ...data, trangthai: 1, ngaytao: now, ngaycapnhat: now };
    mockPets.push(row);
    return copy(mapPetRow(row));
  },
  async updatePet(id, value) {
    await wait();
    const row = find(id), data = fields(value);
    Object.assign(row, data, { ngaycapnhat: mockTimestamp() });
    return copy(mapPetRow(row));
  },
  async deletePet(id) { await wait(); Object.assign(find(id), { trangthai: 0, ngaycapnhat: mockTimestamp() }); },
});
