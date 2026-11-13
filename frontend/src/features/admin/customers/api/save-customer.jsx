import { useMutation, useQueryClient } from '@tanstack/react-query';
import { USER_ROLES } from '~/app/config/constants.js';
import { api } from '~/lib/api.js';

export const createCustomer = ({ data }) =>
  api.post('/ad/users', { ...data, userRole: USER_ROLES.CUSTOMER });

export const updateCustomer = ({ data }) =>
  api.put(`/ad/users/${data.id}`, {
    name: data.name,
    phone: data.phone,
    address: data.address,
    is_deleted: data.is_deleted,
  });

const useCustomerMutation = (mutationFn, mutationConfig = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    ...restConfig,
    mutationFn,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      onSuccess?.(...args);
    },
  });
};

export const useCreateCustomer = ({ mutationConfig } = {}) =>
  useCustomerMutation(createCustomer, mutationConfig);

export const useUpdateCustomer = ({ mutationConfig } = {}) =>
  useCustomerMutation(updateCustomer, mutationConfig);
