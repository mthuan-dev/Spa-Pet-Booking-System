import { serviceImageError } from '../../features/admin/service-management/utils/serviceImages.js';
import { cacheMockImage } from '../imageStore.js';

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
  cacheMockImage(hinhanh, image);
  return { hinhanh };
}
