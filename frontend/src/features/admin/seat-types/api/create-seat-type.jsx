import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '~/lib/api.js';
import { getSeatTypesQueryOptions } from './get-seat-types.jsx';

export const createSeatType = ({ data }) => {
  return api.post('/seat-types', data);
};

export const useCreateSeatType = ({ mutationConfig }) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getSeatTypesQueryOptions.queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createSeatType,
  });
};
