import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

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
        const HomeRoute = await import('../../pages/admin/home.jsx');
        return { Component: HomeRoute.default };
      },
    },
    {
      path: 'employees',
      lazy: async () => {
        const EmployeePage = await import('../../pages/admin/employees/index.jsx');
        return { Component: EmployeePage.default };
      },
    },
    {
      path: 'customers',
      lazy: async () => {
        const CustomerPage = await import('../../pages/admin/customers/index.jsx');
        return { Component: CustomerPage.default };
      },
    },
    {
      path: 'combos',
      lazy: async () => {
        const CombosPage = await import('../../pages/admin/combos/index.jsx');
        return { Component: CombosPage.default };
      },
    },
    {
      path: 'combos/create',
      lazy: async () => {
        const ComboEditorPage = await import('../../pages/admin/combos/create.jsx');
        return { Component: ComboEditorPage.default };
      },
    },
    {
      path: 'combos/:id/edit',
      lazy: async () => {
        const ComboEditorPage = await import('../../pages/admin/combos/edit.jsx');
        return { Component: ComboEditorPage.default };
      },
    },
    {
      path: 'services',
      lazy: async () => {
        const ServicesPage = await import('../../pages/admin/services/index.jsx');
        return { Component: ServicesPage.default };
      },
    },
    {
      path: 'weight-prices',
      lazy: async () => {
        const WeightPricesPage = await import('../../pages/admin/weight-prices/index.jsx');
        return { Component: WeightPricesPage.default };
      },
    },
    {
      path: 'customers/:customerId/pets',
      lazy: async () => {
        const CustomerPets = await import('../../pages/admin/customers/pets.jsx');
        return { Component: CustomerPets.default };
      },
    },
    {
      path: 'booking-schedules',
      lazy: async () => {
        const BookingSchedulesPage = await import('../../pages/admin/booking-schedules/index.jsx');
        return { Component: BookingSchedulesPage.default };
      },
    },
    {
      path: 'orders',
      lazy: async () => {
        const OrderManagement = await import('../../pages/admin/orders/index.jsx');
        return { Component: OrderManagement.default };
      },
    },
    {
      path: 'reports/tickets',
      lazy: async () => {
        const TicketReport = await import('../../pages/admin/reports/index.jsx');
        return { Component: TicketReport.default };
      },
    },
    {
      path: '*',
      lazy: async () => {
        const NotFoundRoute = await import('../../pages/not-found.jsx');
        return { Component: NotFoundRoute.default };
      },
    },
  ].map((route) => ({ ...route, id: `admin:${route.path || 'index'}` })),
});
