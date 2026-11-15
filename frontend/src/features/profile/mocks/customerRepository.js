import { mockUsers } from '../../../mocks/data.js';
import { mapUserRow } from '../mappers/customerMapper.js';

const SESSION = 'meomeo:session:v1';
export const credentials = new Map([
  ['minhthuan@meomeo.vn', 'Meomeo123!'], ['admin@example.com', 'Admin123!'],
]);
export function setSession(id, remember = false) {
  sessionStorage.removeItem(SESSION);
  localStorage.removeItem(SESSION);
  if (id) (remember ? localStorage : sessionStorage).setItem(SESSION, String(id));
}
export function currentUserRow() {
  let id;
  try { id = Number(sessionStorage.getItem(SESSION) || localStorage.getItem(SESSION)); }
  catch { return null; }
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return mockUsers.find((row) => row.manguoidung === id && row.trangthai === 1) ?? null;
}
export const currentUser = () => {
  const row = currentUserRow();
  return row ? mapUserRow(row) : null;
};
export function requireUserRow() {
  const user = currentUserRow();
  if (!user) throw new Error('Bạn cần đăng nhập để tiếp tục.');
  return user;
}
export const requireUser = () => mapUserRow(requireUserRow());
export const wait = () => new Promise((resolve) => setTimeout(resolve, 300));
export const copy = (value) => structuredClone(value);
