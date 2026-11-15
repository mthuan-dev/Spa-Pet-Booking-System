import { queryOptions, useQuery } from '@tanstack/react-query';
import { USER_ROLES } from '~/app/config/constants.js';
import { api } from '~/lib/api.js';
import { mapAdminUserPage } from '~/features/admin/users/mappers/userMapper.js';

export const getCustomers = (page, size, keyword) => {
  return api.get(`/ad/users`, {
    params: {
      role: USER_ROLES.CUSTOMER,
      page,
      size,
      keyword,
    },
  }).then(mapAdminUserPage);
};

export const getCustomersQueryOptions = ({ page, size, keyword }) => {
  return queryOptions({
    queryKey: page ? ['customers', { page, size, keyword }] : ['customers'],
    queryFn: () => getCustomers(page, size, keyword),
  });
};

export const useCustomers = ({ queryConfig, page, size, keyword }) => {
  return useQuery({
    ...getCustomersQueryOptions({ page, size, keyword }),
    ...queryConfig,
  });
};
