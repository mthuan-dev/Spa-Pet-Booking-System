import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '~/lib/api.js';
import { mapAdminUser } from '~/features/admin/users/mappers/userMapper.js';

export const customerPetsQuery = (customerId) => ({
  queryKey: ['customer-pets', String(customerId)],
  queryFn: async () => {
    const result = await api.get(`/users/${customerId}/pets`);
    return { ...result, customer: mapAdminUser(result.customer) };
  },
});

export const useCustomerPets = (customerId) => useQuery(customerPetsQuery(customerId));

export function useSaveCustomerPet(customerId, mutationConfig = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig;
  return useMutation({
    ...restConfig,
    mutationFn: ({ pet, remove = false }) => {
      const basePath = `/users/${customerId}/pets`;
      if (remove) return api.delete(`${basePath}/${pet.maThuCung}`);
      return pet.maThuCung
        ? api.put(`${basePath}/${pet.maThuCung}`, pet)
        : api.post(basePath, pet);
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: customerPetsQuery(customerId).queryKey });
      onSuccess?.(...args);
    },
  });
}
