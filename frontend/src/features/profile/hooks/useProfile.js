
import { useEffect, useState } from 'react'
import { useAuth } from '../../../app/providers/AuthProvider.jsx'
import { profileService } from '../services/profileService.js'

export function useProfile() {
  const { user, setUser } = useAuth()

  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ fullName: '', phone: '' })
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Chuyển User từ Spring Boot sang dữ liệu Profile
  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }

    const p = {
      id: user.maNguoiDung,
      fullName: user.hoTen || '',
      email: user.email,
      phone: user.soDienThoai || '',
      provider: user.nhaCungCap || 'LOCAL',
      createdAt: user.ngayTao,
    }

    setProfile(p)
    setForm(p)
  }, [user])

  async function save(e) {
    e.preventDefault()

    setBusy(true)
    setError('')
    setMessage('')

    try {
      const p = await profileService.updateProfile(form)

      setProfile(p)
      setForm(p)
      setEditing(false)

      setUser(prev => ({
        ...prev,
        hoTen: p.fullName,
        soDienThoai: p.phone,
      }))

      setMessage('Đã cập nhật thông tin của bạn.')
    } catch (err) {
      setError(err.message || 'Không thể cập nhật hồ sơ.')
    } finally {
      setBusy(false)
    }
  }
  return {
    profile,
    form,
    setForm,
    editing,
    setEditing,
    busy,
    message,
    setMessage,
    error,
    setError,
    save,
  }
}
