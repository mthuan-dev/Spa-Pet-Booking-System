import { mapUserRow } from '../mappers/customerMapper.js';

export function setSession(token, remember = false) {
  sessionStorage.removeItem(SESSION);
  localStorage.removeItem(SESSION);
  if (token) {
    (remember ? localStorage : sessionStorage)
        .setItem(SESSION, token);
  }
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
