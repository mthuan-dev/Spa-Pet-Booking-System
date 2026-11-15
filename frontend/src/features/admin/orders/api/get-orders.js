import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '~/lib/api.js';
import { mapBookingBundle } from '~/features/bookings/mappers/bookingMapper.js';

export const getOrders = ({ startDate, endDate, paymentMethod, status, keyword, page, size }) => {
  return api.get(`/ad/bookings`, {
    params: { startDate, endDate, paymentMethod, status, keyword, page, size },
  }).then((result) => ({ ...result, items: result.items.map(mapBookingBundle) }));
};

export const getOrdersQueryOptions = ({ startDate, endDate, paymentMethod, status, keyword, page, size }) => {
  return queryOptions({
    queryKey: ['use-orders', { startDate, endDate, paymentMethod, status, keyword, page, size }],
    queryFn: () => getOrders({ startDate, endDate, paymentMethod, status, keyword, page, size }),
  });
};

export const useOrders = ({ queryConfig, startDate, endDate, paymentMethod, status, keyword, page, size }) => {
  return useQuery({
    ...getOrdersQueryOptions({ startDate, endDate, paymentMethod, status, keyword, page, size }),
    ...queryConfig,
  });
};
