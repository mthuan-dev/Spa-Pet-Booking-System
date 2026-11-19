
import {
  setSession,
  getSession,
  getStoredUser,
  clearSession
} from '../utils/session.js'

const API_URL = 'http://localhost:8080/api'

export const authService = {

  async login(input) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.password
      })
    })

    if (!response.ok) {
      throw new Error('Email hoặc mật khẩu không chính xác')
    }

    const data = await response.json()

    if (!data.authentication || !data.token || !data.user) {
      throw new Error('Đăng nhập thất bại')
    }

    setSession(data.token, data.user, input.remember)

    return data.user
  },

  async getCurrentUser() {
    const token = getSession()

    if (!token) return null

    // API này dùng để xác minh JWT có còn hợp lệ không
    const response = await fetch(`${API_URL}/auth/introspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    })

    if (!response.ok) {
      clearSession()
      return null
    }

    const result = await response.json()

    if (!result.valid) {
      clearSession()
      return null
    }

    // Token hợp lệ thì khôi phục User đã lưu
    return getStoredUser()
  },

  async logout() {
    clearSession()
  }
}
