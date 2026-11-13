import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '~/lib/api.js';

const CATALOG_QUERY_KEY = ['admin-service-catalog'];

export const useServiceCatalog = () => useQuery({
  queryKey: CATALOG_QUERY_KEY,
  queryFn: () => api.get('/ad/services'),
});

export const useSaveCatalogItem = (resource, onSuccess) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => id
      ? api.put(`/ad/${resource}/${id}`, data)
      : api.post(`/ad/${resource}`, data),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
      onSuccess?.(result);
    },
  });
};
