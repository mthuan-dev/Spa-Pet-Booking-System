export const SERVICE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_SERVICE_IMAGE_BYTES = 2 * 1024 * 1024;

export const serviceImageError = (file) => {
  if (!file || !SERVICE_IMAGE_TYPES.includes(file.type))
    return 'Vui lòng chọn ảnh JPG, PNG hoặc WebP.';
  if (!file.size || file.size > MAX_SERVICE_IMAGE_BYTES)
    return 'Ảnh phải có dung lượng lớn hơn 0 và tối đa 2 MB.';
  return null;
};

export async function cropServiceImage(image, crop, filename) {
  if (!image?.naturalWidth || !image.naturalHeight || !crop
    || ![crop.x, crop.y, crop.width, crop.height].every(Number.isFinite))
    throw new Error('Vui lòng chọn vùng ảnh cần cắt.');

  const x = Math.max(0, Math.min(100, crop.x)) * image.naturalWidth / 100;
  const y = Math.max(0, Math.min(100, crop.y)) * image.naturalHeight / 100;
  const width = Math.min(image.naturalWidth - x, crop.width * image.naturalWidth / 100);
  const height = Math.min(image.naturalHeight - y, crop.height * image.naturalHeight / 100);
  if (width < 1 || height < 1) throw new Error('Vùng cắt quá nhỏ. Vui lòng chọn lại.');

  const scale = Math.min(1, 2560 / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Trình duyệt chưa hỗ trợ cắt ảnh.');
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);

  let blob;
  for (const quality of [0.92, 0.8, 0.65, 0.5]) {
    blob = await new Promise((resolve, reject) => {
      try {
        canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Không thể tạo ảnh đã cắt.')),
          'image/webp', quality);
      } catch {
        reject(new Error('Không thể cắt ảnh từ nguồn này. Vui lòng tải ảnh về rồi chọn lại.'));
      }
    });
    if (blob.size <= MAX_SERVICE_IMAGE_BYTES) break;
  }
  const extension = blob.type === 'image/webp' ? 'webp' : 'png';
  const name = (filename || 'anh-dich-vu').replace(/\.[^.]+$/, '').replace(/-cropped$/, '');
  const file = new File([blob], `${name}-cropped.${extension}`, { type: blob.type });
  const validationError = serviceImageError(file);
  if (validationError) throw new Error(validationError);
  return file;
}
