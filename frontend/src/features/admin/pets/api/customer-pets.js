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

// Read
export const useCustomerPets = (customerId) => useQuery(customerPetsQuery(customerId));

export function useSaveCustomerPet(customerId, mutationConfig = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig;
  return useMutation({
    ...restConfig,
    mutationFn: async ({ pet, remove = false, imageFile }) => {
      const basePath = `/users/${customerId}/pets`;
      if (remove) return api.delete(`${basePath}/${pet.maThuCung}`);
      let payload = pet;
      if (imageFile) {
        const body = new FormData();
        body.append('file', imageFile);
        const { hinhAnh } = await api.post('/pet-images', body);
        payload = { ...pet, hinhAnh };
      }
      return payload.maThuCung
        ? api.put(`${basePath}/${payload.maThuCung}`, payload)
        : api.post(basePath, payload);
    },
    onSuccess: async (...args) => {
      // Đánh dấu Query này cũ -> RQuery tự fetch lại danh sách mới
      await queryClient.invalidateQueries({ queryKey: customerPetsQuery(customerId).queryKey });
      onSuccess?.(...args);
    },
  });
}
