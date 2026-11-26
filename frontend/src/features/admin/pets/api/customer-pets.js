import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '~/api/client.js';
import { mapAdminUser } from '~/features/admin/users/mappers/userMapper.js';

export const customerPetsQuery = (customerId) => ({
  queryKey: ['customer-pets', String(customerId)],
  staleTime: 30_000,
  queryFn: async () => {
    const result = await api.get(`/users/${customerId}/pets`);
    return { ...result, customer: mapAdminUser(result.customer) };
  },
});

// GET /api/users/:customerId/pets
export const useCustomerPets = (customerId) => useQuery(customerPetsQuery(customerId));

export async function saveCustomerPet(customerId, { pet, remove = false, imageFile }) {
  const basePath = `/users/${customerId}/pets`;
  const { maThuCung, ...values } = pet;
  if (remove) return api.delete(`${basePath}/${maThuCung}`); // DELETE
  let payload = values;
  if (imageFile) {
    payload = new FormData();
    payload.append('pet', new Blob([JSON.stringify(values)], { type: 'application/json' }));
    payload.append('file', imageFile);
  }
  return maThuCung
    ? api.put(`${basePath}/${maThuCung}`, payload)    // PUT
    : api.post(basePath, payload);                    // POST
}

export function useSaveCustomerPet(customerId, mutationConfig = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig;
  return useMutation({
    ...restConfig,
    mutationFn: (values) => saveCustomerPet(customerId, values),
    onSuccess: async (...args) => {
      // Đánh dấu Query này cũ -> RQuery tự fetch lại danh sách mới (invalidateQueries)
      await queryClient.invalidateQueries({ queryKey: customerPetsQuery(customerId).queryKey });
      onSuccess?.(...args);
    },
  });
}
