import { useQuery } from '@tanstack/react-query';
import { api } from '~/lib/api.js';
export const useServicesReport = ({ startDate, endDate, queryConfig }) => useQuery({
  queryKey: ['services-report', { startDate, endDate }],
  queryFn: () => api.get('/ad/reports/services', { params: { startDate, endDate } }),
  ...queryConfig,
});
