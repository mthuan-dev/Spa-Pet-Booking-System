const TOKEN_KEY = 'access_token'
const USER_KEY = 'current_user'

export function setSession(token, user, remember = false) {
    // Xóa phiên cũ
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)

    const storage = remember ? localStorage : sessionStorage

    storage.setItem(TOKEN_KEY, token)
    storage.setItem(USER_KEY, JSON.stringify(user))
}

export function getSession() {
    return localStorage.getItem(TOKEN_KEY)
        || sessionStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
    const storage = localStorage.getItem(TOKEN_KEY)
        ? localStorage : sessionStorage

    const user = storage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
}