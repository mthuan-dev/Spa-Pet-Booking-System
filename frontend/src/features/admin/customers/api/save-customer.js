import { useMutation, useQueryClient } from '@tanstack/react-query';
import { USER_ROLES } from '~/app/config/constants.js';
import { api } from '~/api/client.js';
import { mapAdminUser, userWriteRow } from '~/features/admin/users/mappers/userMapper.js';

// POST /api/users
export const createCustomer = ({ data }) =>
  api.post('/users', userWriteRow(data, USER_ROLES.CUSTOMER)).then(mapAdminUser);

// PUT /api/users/:id
export const updateCustomer = ({ data }) =>
  api.put(`/users/${data.id}`, userWriteRow(data)).then(mapAdminUser);

// Tạo / Sửa xong -> React Query cập nhật lại nếu dữ liệu cũ (invalidateQueries)
const useCustomerMutation = (mutationFn, mutationConfig = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    ...restConfig,
    mutationFn,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      await queryClient.invalidateQueries({ queryKey: ['customer-pets'] });
      onSuccess?.(...args);
    },
  });
};

export const useCreateCustomer = ({ mutationConfig } = {}) =>
  useCustomerMutation(createCustomer, mutationConfig);

export const useUpdateCustomer = ({ mutationConfig } = {}) =>
  useCustomerMutation(updateCustomer, mutationConfig);
