import { serviceImageError } from '../../features/admin/service-management/utils/serviceImages.js';

const IMAGE_STORAGE_PREFIX = 'petspa-admin-service-image:';
const IMAGE_PATH_PREFIX = '/uploads/services/';
const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export async function uploadServiceImage(body, fail) {
  const file = body?.get?.('file');
  const validationError = serviceImageError(file);
  if (validationError) fail(validationError);

  const image = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Không thể đọc ảnh. Vui lòng chọn ảnh khác.'));
    reader.readAsDataURL(file);
  }).catch(() => fail('Không thể đọc ảnh. Vui lòng chọn ảnh khác.'));

  const hinhanh = `${IMAGE_PATH_PREFIX}${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
  try {
    // Keep image contents separate: dichvu.hinhanh remains a VARCHAR(255) path.
    localStorage.setItem(`${IMAGE_STORAGE_PREFIX}${hinhanh}`, image);
  } catch {
    fail('Bộ nhớ trình duyệt không đủ để lưu ảnh. Vui lòng chọn ảnh nhỏ hơn.');
  }
  return { hinhanh };
}

export const serviceImageUrl = (path) => path?.startsWith(IMAGE_PATH_PREFIX)
  ? localStorage.getItem(`${IMAGE_STORAGE_PREFIX}${path}`) || path
  : path;
