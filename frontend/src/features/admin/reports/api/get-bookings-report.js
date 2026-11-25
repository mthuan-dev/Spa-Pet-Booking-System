import { useQuery } from '@tanstack/react-query';
import { api } from '~/api/client.js';
export const useBookingsReport = ({ startDate, endDate, queryConfig }) => useQuery({
  queryKey: ['bookings-report', { startDate, endDate }],
  queryFn: () => api.get('/reports/bookings', { params: { startDate, endDate } }),
  ...queryConfig,
});
