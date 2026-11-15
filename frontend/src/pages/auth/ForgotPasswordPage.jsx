import { useState } from 'react'
import { Link } from 'react-router-dom'
import AccountField from '../../features/auth/components/AccountField.jsx'
import UserHeader from '../../layouts/components/UserHeader.jsx'
import photo from '../../assets/images/editorial/portrait.jpg'
import '../../styles/account.css'

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({ email: '', phone: '' })
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState('')
  function update(e) { setForm(v => ({ ...v, [e.target.name]: e.target.value })); setMessage('') }
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMessage('')
    try {
      const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '')
      const response = await fetch(`${base}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email.trim().toLowerCase(), phone: form.phone.trim() }) })
      if (!response.ok) throw new Error('Chưa thể gửi yêu cầu. Bạn kiểm tra thông tin và thử lại sau nhé.')
      setSent(true)
    } catch (error) { setMessage(error instanceof TypeError ? 'Không kết nối được máy chủ. Bạn thử lại sau nhé.' : error.message) }
    finally { setBusy(false) }
  }
  return <div className="meomeo-home"><UserHeader /><main className="access-page wrap access-page--recovery">
    <aside className="access-story"><div className="access-photo"><img src={photo} alt="Chú chó Pug trên nền vàng" width="1400" height="1867" /></div><span className="access-wordmark">MEOMEO</span></aside>
    <section className="access-form"><p className="account-eyebrow">Trở lại cùng MEOMEO</p><h1>{sent ? 'Kiểm tra email nhé' : 'Quên mật khẩu?'}</h1>
      {sent ? <><p role="status">Nếu email và số điện thoại khớp với tài khoản khách hàng, mật khẩu mới sẽ được gửi qua email. Bạn nhớ kiểm tra cả thư mục spam.</p><Link className="access-forgot-link" to="/login" state={{ email: form.email }}>Về trang đăng nhập</Link></> : <>
        <p>Nhập email và số điện thoại đã đăng ký để nhận mật khẩu mới qua email.</p>
        <form onSubmit={submit}><fieldset disabled={busy}>
          <AccountField name="email" label="Email đã đăng ký" type="email" autoComplete="email" value={form.email} onChange={update} required />
          <AccountField name="phone" label="Số điện thoại đã đăng ký" type="tel" autoComplete="tel" pattern="0[0-9]{9}" title="Số điện thoại gồm 10 chữ số, bắt đầu bằng 0" value={form.phone} onChange={update} required />
          {message && <p className="account-error" role="alert">{message}</p>}
          <button className="account-primary" disabled={busy}>{busy ? 'Đang gửi yêu cầu…' : 'Gửi mật khẩu mới'}</button>
        </fieldset></form><p className="access-switch"><Link to="/login">Quay lại đăng nhập</Link></p>
      </>}
    </section>
  </main></div>
}
