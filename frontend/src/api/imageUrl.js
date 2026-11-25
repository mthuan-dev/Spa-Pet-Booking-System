import { BACKEND_ENDPOINT } from '../app/config/env.js';

export function imageUrl(path) {
  if (!path) return '';
  if (!path.startsWith('/uploads/') && !path.startsWith('/api/booking-data/pet-images/')) return path;
  return new URL(path, new URL(BACKEND_ENDPOINT, window.location.origin)).href;
}
