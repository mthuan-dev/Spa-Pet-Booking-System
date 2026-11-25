
import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { authService } from '../../features/auth/api/authService.js'
import { queryClient } from '../../lib/query-client.js'

const Context = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        authService.getCurrentUser()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    async function login(input) {
        const user = await authService.login(input)

        queryClient.clear()
        setUser(user)

        return user
    }
    async function logout() {
        await authService.logout()
        queryClient.clear()
        setUser(null)
    }

    return (
        <Context.Provider
            value={{
                user,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </Context.Provider>
    )
}

export const useAuth = () => useContext(Context)

export function RequireCustomer({ children }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <p role="status">Đang tải tài khoản…</p>
    }

    return user ? (
        children
    ) : (
        <Navigate
            to="/login"
            replace
            state={{ from: location.pathname + location.search + location.hash }}
        />
    )
}
export function RequireAdmin({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <p>Đang kiểm tra quyền truy cập...</p>
    }

    // Chưa đăng nhập
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Đăng nhập rồi nhưng không phải ADMIN
    if (user.vaiTro !== 'ADMIN') {
        return <Navigate to="/profile" replace />
    }

    // Là ADMIN
    return children
}
