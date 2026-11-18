import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api.js";
import { mapAdminUser, userWriteRow } from '~/features/admin/users/mappers/userMapper.js';

export const updateEmployee = ({ data }) => {
  return api.put(`/users/${data?.id}`, userWriteRow(data)).then(mapAdminUser);
};

export const useUpdateEmployee = ({ mutationConfig }) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateEmployee,
  });
};
