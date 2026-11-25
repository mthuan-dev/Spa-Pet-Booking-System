import LoadingScreen from '../../components/ui/LoadingScreen.jsx';
import { Navigate } from 'react-router-dom';

export const createAdminRoute = () => ({
  // Cha
  id: 'admin',
  path: '/admin',
  hydrateFallbackElement: <LoadingScreen />,
  lazy: async () => {
    const AdminRoot = await import('../AdminRoot.jsx');
    return { Component: AdminRoot.default };
  },
  children: [
    {
      path: '',
      lazy: async () => {
        const HomePage = await import('../../pages/admin/HomePage.jsx');
        return { Component: HomePage.default };
      },
    },
    {
      path: 'employees',
      lazy: async () => {
        const EmployeesPage = await import('../../pages/admin/employees/EmployeesPage.jsx');
        return { Component: EmployeesPage.default };
      },
    },
    {
      path: 'customers',
      lazy: async () => {
        const CustomersPage = await import('../../pages/admin/customers/CustomersPage.jsx');
        return { Component: CustomersPage.default };
      },
    },
    {
      path: 'combos',
      lazy: async () => {
        const CombosPage = await import('../../pages/admin/combos/CombosPage.jsx');
        return { Component: CombosPage.default };
      },
    },
    {
      path: 'combos/create',
      lazy: async () => {
        const CreateComboPage = await import('../../pages/admin/combos/CreateComboPage.jsx');
        return { Component: CreateComboPage.default };
      },
    },
    {
      path: 'combos/:id/edit',
      lazy: async () => {
        const EditComboPage = await import('../../pages/admin/combos/EditComboPage.jsx');
        return { Component: EditComboPage.default };
      },
    },
    {
      path: 'services',
      lazy: async () => {
        const ServicesPage = await import('../../pages/admin/services/ServicesPage.jsx');
        return { Component: ServicesPage.default };
      },
    },
    {
      path: 'weight-prices',
      lazy: async () => {
        const WeightPricesPage = await import('../../pages/admin/weight-prices/WeightPricesPage.jsx');
        return { Component: WeightPricesPage.default };
      },
    },
    {
      path: 'customers/:customerId/pets',
      lazy: async () => {
        const CustomerPetsPage = await import('../../pages/admin/customers/CustomerPetsPage.jsx');
        return { Component: CustomerPetsPage.default };
      },
    },
    {
      path: 'booking-schedules',
      lazy: async () => {
        const BookingSchedulesPage = await import('../../pages/admin/booking-schedules/BookingSchedulesPage.jsx');
        return { Component: BookingSchedulesPage.default };
      },
    },
    {
      path: 'orders',
      lazy: async () => {
        const OrdersPage = await import('../../pages/admin/orders/OrdersPage.jsx');
        return { Component: OrdersPage.default };
      },
    },
    {
      path: 'reports',
      lazy: async () => {
        const ReportsPage = await import('../../pages/admin/reports/ReportsPage.jsx');
        return { Component: ReportsPage.default };
      },
    },
    {
      path: 'reports/tickets',
      element: <Navigate to="/admin/reports" replace />,
    },
    {
      path: '*',
      lazy: async () => {
        const AdminNotFoundPage = await import('../../pages/errors/AdminNotFoundPage.jsx');
        return { Component: AdminNotFoundPage.default };
      },
    },
  ].map((route) => ({ ...route, id: `admin:${route.path || 'index'}` })),
});
