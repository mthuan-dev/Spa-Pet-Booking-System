import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '~/api/client.js';
import { mapBookingResponse } from '~/features/bookings/mappers/bookingMapper.js';

export const getOrders = ({ startDate, endDate, paymentMethod, status, keyword, page, size }) => {
  return api.get('/admin/bookings', {
    params: { startDate, endDate, paymentMethod, status, keyword, page, size },
  }).then((result) => ({ ...result, items: result.items.map(mapBookingResponse) }));
};

export const getOrdersQueryOptions = ({ startDate, endDate, paymentMethod, status, keyword, page, size }) => {
  return queryOptions({
    queryKey: ['use-orders', 'createdAt', { startDate, endDate, paymentMethod, status, keyword, page, size }],
    queryFn: () => getOrders({ startDate, endDate, paymentMethod, status, keyword, page, size }),
  });
};

export const useOrders = ({ queryConfig, startDate, endDate, paymentMethod, status, keyword, page, size }) => {
  return useQuery({
    ...getOrdersQueryOptions({ startDate, endDate, paymentMethod, status, keyword, page, size }),
    ...queryConfig,
  });
};
