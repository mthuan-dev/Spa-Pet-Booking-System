import { BACKEND_ENDPOINT } from '~/app/config/env.js';

// url tương đối -> đầy đủ
export function petImageUrl(path) {
  if (!path || !path.startsWith('/')) return path || '';
  if (!path.startsWith('/uploads/') && !path.startsWith('/api/booking-data/pet-images/')) return path;
  const backend = new URL(BACKEND_ENDPOINT || 'http://localhost:8080/api', window.location.origin);
  return new URL(path, backend).href;
}
