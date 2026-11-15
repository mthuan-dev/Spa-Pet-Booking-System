import { mockUsers, mockPets } from '../data.js';
import { nextMockId, mockTimestamp } from '../utils.js';
import { publicUserRow } from './users.js';

export function handleCustomerPets({ customerId, petId, method, body, fail }) {
  const customer = mockUsers.find((row) => row.manguoidung === Number(customerId) && row.vaitro === 'CUSTOMER');
  if (!customer) return fail('Không tìm thấy khách hàng.', 404);
  if (method === 'get' && !petId) return { customer: publicUserRow(customer), pets: mockPets.filter((row) => row.manguoidung === customer.manguoidung) };
  const pet = petId ? mockPets.find((row) => row.mathucung === Number(petId) && row.manguoidung === customer.manguoidung) : null;
  if (petId && !pet) return fail('Không tìm thấy thú cưng của khách hàng này.', 404);
  if (method === 'delete' && pet) { Object.assign(pet, { trangthai: 0, ngaycapnhat: mockTimestamp() }); return pet; }
  if ((method !== 'post' || petId) && (method !== 'put' || !petId)) return fail('Thao tác thú cưng không được hỗ trợ.', 405);
  const name = String(body.tenthucung || '').trim(), breed = String(body.giong || '').trim(), image = String(body.hinhanh || '').trim();
  const weight = Number(body.cannang), status = body.trangthai ?? 1;
  if (!name || name.length > 100) return fail('Tên thú cưng cần từ 1 đến 100 ký tự.');
  if (!['DOG', 'CAT', 'OTHER'].includes(body.loaithucung)) return fail('Loại thú cưng không hợp lệ.');
  if (breed.length > 100) return fail('Giống thú cưng tối đa 100 ký tự.');
  if (!Number.isFinite(weight) || weight <= 0 || weight > 999.99 || !/^\d+(\.\d{1,2})?$/.test(String(body.cannang))) return fail('Cân nặng cần lớn hơn 0, tối đa 999,99 kg và có tối đa 2 số thập phân.');
  if (image.length > 255) return fail('Đường dẫn hình ảnh tối đa 255 ký tự.');
  if (![0, 1].includes(status)) return fail('Trạng thái thú cưng không hợp lệ.');
  const now = mockTimestamp(), record = pet || { mathucung: nextMockId(mockPets, 'mathucung'), manguoidung: customer.manguoidung, ngaytao: now };
  Object.assign(record, { tenthucung: name, loaithucung: body.loaithucung, giong: breed || null, cannang: weight, hinhanh: image || null, trangthai: status, ngaycapnhat: now });
  if (!pet) mockPets.push(record);
  return record;
}
