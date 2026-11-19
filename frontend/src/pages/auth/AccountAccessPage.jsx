
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthProvider.jsx'
import { authService } from '~/features/auth/services/authService.js'
import { validateAccount } from '~/features/auth/validation/accountValidation.js'
import AccountField from '../../features/auth/components/AccountField.jsx'
import UserHeader from '../../layouts/components/UserHeader.jsx'
import photo from '../../assets/images/editorial/portrait.jpg'
import { loginDestination } from '~/features/auth/utils/loginDestination.js'
import '../../styles/account.css'

export default function AccountAccessPage({ register = false }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: location.state?.email || '',
    password: '',
    confirmPassword: '',
    remember: false,
  })

  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  // Trang cần quay lại sau khi đăng nhập
  const from = location.state?.from
  const destination =
      typeof from === 'string' &&
      from.startsWith('/') &&
      !from.startsWith('//') &&
      !['/login', '/register'].includes(from)
          ? from
          : '/profile'

  // Cập nhật input
  const update = (e) => {
    const { name, type, value, checked } = e.target

    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    setErrors(prev => ({ ...prev, [name]: '' }))
    setMessage('')
  }

  // Xử lý đăng nhập / đăng ký
  const submit = async (e) => {
    e.preventDefault()

    const validation = validateAccount(form, register)
    setErrors(validation)

    if (Object.keys(validation).length > 0) return

    setBusy(true)
    setMessage('')

    try {
      if (register) {
        const user = {
          fullname:form.fullName,
          email:form.email,
          password:form.password,
          phone:form.phone
        }
        await authService.register(user)

        navigate('/login', {
          replace: true,
          state: {
            email: form.email,
            registered: true,
            from: destination,
          },
        })
      } else {
        const authenticatedUser = await login(form);

        navigate(
            loginDestination(authenticatedUser, destination),
            { replace: true }
        );
      }
    } catch (err) {
      setMessage(err.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setBusy(false)
    }
  }

  // Tạo input dùng chung
  const field = (name, label, type = 'text', autoComplete) => (
      <AccountField
          key={name}
          name={name}
          label={label}
          type={type}
          autoComplete={autoComplete}
          value={form[name]}
          onChange={update}
          error={errors[name]}
          disabled={busy}
      />
  )

  return (
      <div className="meomeo-home">
        <UserHeader />

        <main className={`access-page wrap ${register ? 'access-page--register' : ''}`}>

          <aside className="access-story">
            <p>
              {register
                  ? 'Lưu thông tin thú cưng và chuẩn bị cho lần hẹn tiếp theo.'
                  : 'Trở lại với những người bạn nhỏ và những cuộc hẹn chăm sóc.'}
            </p>

            <div className="access-photo">
              <img
                  src={photo}
                  alt="Chú chó Pug trên nền vàng"
                  width="1400"
                  height="1867"
              />
            </div>

            <span className="access-wordmark">MEOMEO</span>
          </aside>

          <section className="access-form">
            <p className="account-eyebrow">
              {register ? 'Bắt đầu cùng MEOMEO' : 'Mừng bạn trở lại'}
            </p>

            <h1>{register ? 'Tạo tài khoản' : 'Đăng nhập'}</h1>

            <form noValidate onSubmit={submit}>
              <fieldset disabled={busy}>

                {register && field('fullName', 'Họ và tên', 'text', 'name')}

                {field('email', 'Email', 'email', 'email')}

                {register &&
                    field('phone', 'Số điện thoại (không bắt buộc)', 'tel', 'tel')}

                {field(
                    'password',
                    'Mật khẩu',
                    'password',
                    register ? 'new-password' : 'current-password'
                )}

                {register &&
                    field(
                        'confirmPassword',
                        'Nhập lại mật khẩu',
                        'password',
                        'new-password'
                    )}

                {!register && (
                    <>
                      <label className="account-check">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={form.remember}
                            onChange={update}
                        />
                        {' '}Ghi nhớ đăng nhập trên thiết bị này
                      </label>

                      <Link
                          className="access-forgot-link"
                          to="/forgot-password"
                      >
                        Quên mật khẩu?
                      </Link>
                    </>
                )}

                {location.state?.registered && (
                    <p className="account-notice" role="status">
                      Đã tạo tài khoản. Bạn đăng nhập để tiếp tục nhé.
                    </p>
                )}

                {message && (
                    <p className="account-error" role="alert">
                      {message}
                    </p>
                )}

                <button
                    type="submit"
                    className="account-primary"
                    disabled={busy}
                >
                  {busy
                      ? 'Đang xử lý…'
                      : register
                          ? 'Tạo tài khoản'
                          : 'Đăng nhập'}
                </button>

              </fieldset>
            </form>

            <p className="access-switch">
              {register
                  ? 'Bạn đã có tài khoản? '
                  : 'Bạn chưa có tài khoản? '}

              <Link
                  to={register ? '/login' : '/register'}
                  state={{ from: destination }}
              >
                {register ? 'Đăng nhập' : 'Tạo tài khoản'}
              </Link>
            </p>
          </section>
        </main>
      </div>
  )
}
