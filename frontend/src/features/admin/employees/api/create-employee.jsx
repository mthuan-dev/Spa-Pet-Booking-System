import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api.js";
import { USER_ROLES } from "~/app/config/constants.js";
import { mapAdminUser, userWriteRow } from '~/features/admin/users/mappers/userMapper.js';

export const createEmployee = ({ data }) => {
  return api.post(`/ad/users`, userWriteRow(data, USER_ROLES.ADMIN)).then(mapAdminUser);
};

export const useCreateEmployee = ({ mutationConfig }) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createEmployee,
  });
};
