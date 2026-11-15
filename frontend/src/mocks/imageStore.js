const mockImages = new Map();

export const cacheMockImage = (path, image) => mockImages.set(path, image);

export const resolveMockImage = (path) => {
  if (!path?.startsWith('/uploads/')) return path || '';
  return mockImages.get(path) || path;
};

export function storePetImage(value) {
  if (!value) return null;
  if (value.startsWith('data:image/')) {
    const mime = value.match(/^data:(image\/(?:jpeg|png|webp));base64,/)?.[1];
    if (!mime || value.length > 2 * 1024 * 1024 * 4 / 3 + 100) throw new Error('Ảnh thú cưng phải là JPG, PNG hoặc WebP và tối đa 2 MB.');
    const path = `/uploads/pets/${crypto.randomUUID()}.${mime === 'image/jpeg' ? 'jpg' : mime.slice(6)}`;
    cacheMockImage(path, value);
    return path;
  }
  if (value.length > 255 || value.startsWith('blob:')) throw new Error('Đường dẫn ảnh tối đa 255 ký tự.');
  return value;
}
