import { useQuery } from '@tanstack/react-query';
import { api } from '~/lib/api.js';
export const useCustomersReport = ({ startDate, endDate, queryConfig }) => useQuery({
  queryKey: ['customers-report', { startDate, endDate }],
  queryFn: () => api.get('/reports/customers', { params: { startDate, endDate } }),
  ...queryConfig,
});
