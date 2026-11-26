import { queryOptions, useQuery } from '@tanstack/react-query';
import { USER_ROLES } from '~/app/config/constants.js';
import { mapAdminUserPage } from '~/features/admin/users/mappers/userMapper.js';
import { graphqlRequest } from '~/api/graphql.js';

// frontend\src\api\graphql.js -> POST /api/graphql
export const getCustomers = (page = 1, size = 8, keyword) => {
  // Promise {playload.data} -> Promise { adminUsers: {..} }
  return graphqlRequest(`
    query AdminUsers($role: VaiTro!, $page: Int!, $size: Int!, $keyword: String) {
      adminUsers(role: $role, page: $page, size: $size, keyword: $keyword) {
        content { maNguoiDung hoTen email soDienThoai vaiTro trangThai ngayTao ngayCapNhat }
        number size totalElements totalPages
      }
    }
  `, { role: USER_ROLES.CUSTOMER, page, size, keyword: keyword || null })
    .then((data) => mapAdminUserPage(data.adminUsers)); // Dịch data
};

export const getCustomersQueryOptions = ({ page, size, keyword }) => {
  return queryOptions({
    queryKey: page ? ['customers', { page, size, keyword }] : ['customers'],
    queryFn: () => getCustomers(page, size, keyword),
  });
};

export const useCustomers = ({ queryConfig, page, size, keyword }) => {
  // Đưa (qKey, qFn) cho useQuery dùng
  return useQuery({
    ...getCustomersQueryOptions({ page, size, keyword }),
    ...queryConfig,
  });
};
