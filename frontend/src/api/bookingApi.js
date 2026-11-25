import { getSession } from '../features/auth/utils/session.js'

export async function bookingApi(path, options = {}) {
  const token = getSession()
  const base = (import.meta.env.VITE_BACKEND_ENDPOINT || 'http://localhost:8080/api').replace(/\/$/, '')
  const response = await fetch(`${base}/booking-data${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const failure = new Error(error.detail || error.message || (response.status === 401 ? 'Vui lòng đăng nhập lại.' : 'Không thể xử lý yêu cầu. Vui lòng thử lại.'))
    failure.status = response.status
    throw failure
  }
  return response.status === 204 ? null : response.json()
}
