export function loginDestination(user, from) {
  const validPath =
      typeof from === 'string' &&
      from.startsWith('/') &&
      !from.startsWith('//') &&
      !/^\/(login|register|logout|auth)(\/|[?#]|$)/.test(from)

  const adminPath =
      validPath && /^\/admin(\/|[?#]|$)/.test(from)

  if (user?.vaiTro === 'ADMIN') {
    return adminPath ? from : '/admin'
  }

  return validPath && !adminPath ? from : '/profile'
}