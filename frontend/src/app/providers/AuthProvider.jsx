import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { authService } from '../../features/auth/services/authService.js'
import { queryClient } from '../../lib/query-client.js'
const Context = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true)
  useEffect(() => {
    authService
      .getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])
  return (
    <Context.Provider
      value={{
        user,
        loading,
        setUser,
        async login(input) {
          const u = await authService.login(input)
          queryClient.clear()
          setUser(u)
          return u
        },
        async logout() {
          await authService.logout()
          queryClient.clear()
          setUser(null)
        },
      }}
    >
      {children}
    </Context.Provider>
  )
}
export const useAuth = () => useContext(Context)
export function RequireCustomer({ children }) {
  const { user, loading } = useAuth(),
    location = useLocation()
  if (loading) return <p role="status">Đang tải tài khoản…</p>
  return user ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  )
}
