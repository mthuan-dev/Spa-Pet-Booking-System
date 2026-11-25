
import { getSession } from '../../auth/utils/session.js'

const API_URL = 'http://localhost:8080/api'

export const profileService = {
  async updateProfile(input) {
    if (!input.fullName?.trim() || input.fullName.trim().length > 100) {
      throw new Error('Họ tên cần từ 1 đến 100 ký tự.')
    }

    if (
        input.phone &&
        !/^\+?[0-9]{9,15}$/.test(input.phone)
    ) {
      throw new Error('Số điện thoại cần từ 9 đến 15 chữ số.')
    }

    const token = getSession()

    if (!token) {
      throw new Error('Bạn cần đăng nhập để tiếp tục.')
    }

    const response = await fetch(`${API_URL}/users/${input.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        hoTen: input.fullName.trim(),
        soDienThoai: input.phone || null,
      }),
    })

    if (!response.ok) {
      throw new Error('Không thể cập nhật thông tin tài khoản.')
    }

    const user = await response.json()

    return {
      id: user.maNguoiDung,
      fullName: user.hoTen || '',
      email: user.email,
      phone: user.soDienThoai || '',
      provider: user.nhaCungCap || 'LOCAL',
      createdAt: user.ngayTao,
    }
  },
}
