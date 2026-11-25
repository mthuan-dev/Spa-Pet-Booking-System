import { bookingApi } from '../../../api/bookingApi.js'
import { PET_TYPES } from '../../profile/mappers/customerMapper.js'
function model(row) {
  return { id: row.maThuCung, ownerId: row.maNguoiDung, name: row.tenThuCung,
    type: row.loaiThuCung, species: PET_TYPES[row.loaiThuCung], breed: row.giong,
    weightKg: Number(row.canNang), imageUrl: row.hinhAnh?.startsWith('/api/') ? new URL(row.hinhAnh, import.meta.env.VITE_BACKEND_ENDPOINT || 'http://localhost:8080').href : row.hinhAnh || '', status: row.trangThai, avatarTone: 'honey' }
}
export function validatePet(value) {
  if (!value.name?.trim() || value.name.trim().length > 100) return 'Tên thú cưng cần từ 1 đến 100 ký tự.'
  if (!PET_TYPES[value.type] && !Object.values(PET_TYPES).includes(value.species)) return 'Vui lòng chọn loại thú cưng.'
  if (!Number.isFinite(Number(value.weightKg)) || Number(value.weightKg) <= 0 || Number(value.weightKg) > 999.99 || !/^\d+(\.\d{1,2})?$/.test(String(value.weightKg))) return 'Cân nặng không hợp lệ.'
  if (value.breed?.length > 100) return 'Giống thú cưng tối đa 100 ký tự.'
  return ''
}
export const petService = {
  async getMyPets() { return (await bookingApi('/pets')).pets.filter(p => p.trangThai === 1).map(model) },
  async getPetById(id) { return (await this.getMyPets()).find(p => p.id === Number(id)) || null },
  async createPet(value) {
    const error = validatePet(value)
    if (error) throw new Error(error)
    let image = value.imageUrl || null
    if (image?.startsWith('data:')) image = (await bookingApi('/pet-images', { method: 'POST', body: JSON.stringify({ image }) })).url
    return model(await bookingApi('/pets', { method: 'POST', body: JSON.stringify({
      tenThuCung: value.name.trim(), loaiThuCung: value.type || Object.keys(PET_TYPES).find(t => PET_TYPES[t] === value.species),
      giong: value.breed?.trim() || null, canNang: Number(value.weightKg), hinhAnh: image, trangThai: 1,
    }) }))
  },
  async updatePet(id, value) {
    const error = validatePet(value)
    if (error) throw new Error(error)
    let image = value.imageUrl || null
    if (image?.startsWith('data:')) image = (await bookingApi('/pet-images', { method: 'POST', body: JSON.stringify({ image }) })).url
    return model(await bookingApi('/pets/' + id, { method: 'PUT', body: JSON.stringify({
      tenThuCung: value.name.trim(), loaiThuCung: value.type || Object.keys(PET_TYPES).find(t => PET_TYPES[t] === value.species),
      giong: value.breed?.trim() || null, canNang: Number(value.weightKg), hinhAnh: image, trangThai: 1,
    }) }))
  },
  async deletePet(id) { await bookingApi('/pets/' + id, { method: 'DELETE' }) },
}
