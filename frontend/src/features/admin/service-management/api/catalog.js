import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '~/lib/api.js';
import { resolveMockImage } from '~/mocks/imageStore.js';

const CATALOG_QUERY_KEY = ['admin-service-catalog'];

export const useServiceCatalog = () => useQuery({
  queryKey: CATALOG_QUERY_KEY,
  queryFn: async () => {
    const catalog = await api.get('/services');
    return { ...catalog, dichvu: catalog.dichvu.map((row) => ({ ...row, hinhanhUrl: resolveMockImage(row.hinhanh) })) };
  },
});

export const useSaveCatalogItem = (resource, onSuccess) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data, imageFile }) => {
      let payload = data;
      if (resource === 'services' && imageFile) {
        const body = new FormData();
        body.append('file', imageFile);
        const { hinhanh } = await api.post('/service-images', body);
        payload = { ...data, hinhanh };
      }
      return id ? api.put(`/${resource}/${id}`, payload) : api.post(`/${resource}`, payload);
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
      onSuccess?.(result);
    },
  });
};

export const useDeleteCatalogItem = (resource, onSuccess) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/${resource}/${id}`),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
      onSuccess?.(result);
    },
  });
};
