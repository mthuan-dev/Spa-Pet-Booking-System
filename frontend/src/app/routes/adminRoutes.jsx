import { currentUser } from '../../features/profile/mocks/customerRepository.js';
import LoadingScreen from '../../components/ui/LoadingScreen.jsx';

export const createAdminRoute = (queryClient) => ({
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
      path: 'carriage-layouts',
      lazy: async () => {
        const CarriagesManagement = await import('../../pages/admin/carriages/index.jsx');
        return { Component: CarriagesManagement.default };
      },
    },
    {
      path: 'carriage-layouts/create',
      lazy: async () => {
        const CreateCarriage = await import('../../pages/admin/carriages/create.jsx');
        return { Component: CreateCarriage.default };
      },
    },
    {
      path: 'carriage-layouts/:id',
      lazy: async () => {
        const CarriageDetails = await import('../../pages/admin/carriages/[id]/index.jsx');
        return { Component: CarriageDetails.default };
      },
    },
    {
      path: 'carriage-layouts/:id/edit',
      lazy: async () => {
        const EditCarriagePage = await import('../../pages/admin/carriages/[id]/edit.jsx');
        return { Component: EditCarriagePage.default };
      },
    },
    {
      path: 'seats',
      lazy: async () => {
        const SeatsManagement = await import('../../pages/admin/seat-types/index.jsx');
        return { Component: SeatsManagement.default };
      },
    },
    {
      path: 'trains',
      lazy: async () => {
        const TrainsManagement = await import('../../pages/admin/trains/index.jsx');
        return { Component: TrainsManagement.default };
      },
    },
    {
      path: 'trains/create',
      lazy: async () => {
        const CreateTrain = await import('../../pages/admin/trains/create.jsx');
        return { Component: CreateTrain.default };
      },
    },
    {
      path: 'trains/:id',
      lazy: async () => {
        const TrainDetails = await import('../../pages/admin/trains/[id]/index.jsx');
        return { Component: TrainDetails.default };
      },
    },
    {
      path: 'trains/:id/edit',
      lazy: async () => {
        const EditTrainPage = await import('../../pages/admin/trains/[id]/edit.jsx');
        return { Component: EditTrainPage.default };
      },
    },
    {
      path: 'customers/:customerId/pets',
      lazy: async () => {
        const CustomerPets = await import('../../pages/admin/customers/pets.jsx');
        return { Component: CustomerPets.default };
      },
      loader: async ({ params }) => {
        if (currentUser()?.role !== 'ADMIN') return null;
        const { CustomerPetsLoader } = await import('../../pages/admin/customers/pets.jsx');
        return CustomerPetsLoader(queryClient)({ params });
      },
    },
    {
      path: 'train-schedules',
      lazy: async () => {
        const TrainScheDulesPage = await import('../../pages/admin/train-schedules/index.jsx');
        return { Component: TrainScheDulesPage.default };
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
