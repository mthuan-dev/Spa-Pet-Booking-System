import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom'
import { createAdminRoute } from './adminRoutes.jsx'
import PublicLayout from '../../layouts/PublicLayout.jsx'
import { RequireCustomer } from '../providers/AuthProvider.jsx'
import CustomerLayout from '../../layouts/CustomerLayout.jsx'
import { ROUTES } from './routePaths.js'
import NotFoundPage from '../../pages/errors/NotFoundPage.jsx'
import VnpayReturnPage from '../../pages/bookings/VnpayReturnPage.jsx'
import {
  AboutPage,
  BookingDetailPage, BookingPage, BookingReschedulePage,
  ForgotPasswordPage, HomePage, LoginPage, MyBookingsPage, PetsPage,
  ProfilePage, RegisterPage, ServiceDetailPage, ServicesPage,
} from '../../pages/index.js'

const pageRoutes = [
  [ROUTES.HOME, HomePage], [ROUTES.ABOUT, AboutPage], [ROUTES.SERVICES, ServicesPage],
  [ROUTES.SERVICE_DETAIL(), ServiceDetailPage],
  [ROUTES.LOGIN, LoginPage], [ROUTES.REGISTER, RegisterPage], [ROUTES.FORGOT_PASSWORD, ForgotPasswordPage],
  [ROUTES.PROFILE, ProfilePage], [ROUTES.PETS, PetsPage], [ROUTES.BOOKING, BookingPage],
  [ROUTES.BOOKINGS, MyBookingsPage],
  [ROUTES.BOOKING_DETAIL(), BookingDetailPage],
  [ROUTES.BOOKING_RESCHEDULE(), BookingReschedulePage],
  [ROUTES.VNPAY_RETURN, VnpayReturnPage],
]

const publicPaths = new Set([ROUTES.HOME, ROUTES.ABOUT, ROUTES.SERVICES, ROUTES.SERVICE_DETAIL()])
const customerPaths = new Set([
  ROUTES.PROFILE, ROUTES.PETS, ROUTES.BOOKING,
  ROUTES.BOOKINGS, ROUTES.BOOKING_DETAIL(),
  ROUTES.BOOKING_RESCHEDULE(),
  ROUTES.VNPAY_RETURN,
])

const userRoutes = createRoutesFromElements(
  <>
    <Route path="/auth/login" element={<Navigate to={ROUTES.LOGIN} replace />} />
    <Route path="/contact" element={<Navigate to={ROUTES.ABOUT} replace />} />
    <Route element={<PublicLayout />}>
      {pageRoutes.filter(([path]) => publicPaths.has(path)).map(([path, Page]) => (
        <Route key={path} path={path} element={<Page />} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Route>
    <Route element={<CustomerLayout />}>
      {pageRoutes.filter(([path]) => customerPaths.has(path)).map(([path, Page]) => (
        <Route key={path} path={path} element={<RequireCustomer><Page /></RequireCustomer>} />
      ))}
    </Route>
    {pageRoutes.filter(([path]) => !publicPaths.has(path) && !customerPaths.has(path)).map(([path, Page]) => (
      <Route key={path} path={path} element={<Page />} />
    ))}
  </>
)

const router = createBrowserRouter([
  createAdminRoute(),
  ...userRoutes,
])

export default function AppRoutes() {
  return <RouterProvider router={router} />
}
