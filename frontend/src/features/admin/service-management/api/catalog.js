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
    mutationFn: async ({ id, data, imageFile }) => {
      let payload = data;
      if (resource === 'services' && imageFile) {
        const body = new FormData();
        body.append('file', imageFile);
        const { hinhanh } = await api.post('/ad/service-images', body);
        payload = { ...data, hinhanh };
      }
      return id ? api.put(`/ad/${resource}/${id}`, payload) : api.post(`/ad/${resource}`, payload);
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
      onSuccess?.(result);
    },
  });
};
