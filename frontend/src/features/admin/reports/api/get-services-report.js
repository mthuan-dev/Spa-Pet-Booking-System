import { useQuery } from '@tanstack/react-query';
import { api } from '~/api/client.js';
export const useServicesReport = ({ startDate, endDate, queryConfig }) => useQuery({
  queryKey: ['services-report', { startDate, endDate }],
  queryFn: () => api.get('/reports/services', { params: { startDate, endDate } }),
  ...queryConfig,
});
