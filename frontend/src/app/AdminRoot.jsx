import { useLayoutEffect } from 'react'
import AppProvider from './providers/AdminProvider.jsx'
import AdminRoutes from './guards/RequireAdmin.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'
import adminStyles from '../styles/admin.css?inline'

const fontStylesheet = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap'

export default function AdminRoot() {
  useLayoutEffect(() => {
    const previousTitle = document.title
    document.title = 'Quản lý pet spa'
    document.body.classList.add('railway-admin')
    return () => {
      document.title = previousTitle
      document.body.classList.remove('railway-admin')
    }
  }, [])

  return (
    <>
      <link rel="stylesheet" href={fontStylesheet} />
      <style>{adminStyles}</style>
      <style>{'body.railway-admin { font: inherit; color: inherit; background: transparent; text-rendering: auto; -webkit-font-smoothing: auto; } html:has(body.railway-admin) { scroll-behavior: auto; scroll-padding-top: 0; }'}</style>
      <AppProvider>
        <AdminRoutes><AdminLayout /></AdminRoutes>
      </AppProvider>
    </>
  )
}
