import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api.js";
import { getEmployeesQueryOptions } from "./get-employees.jsx";

export const createEmployee = ({ data }) => {
  return api.post(`/ad/users`, data);
};

export const useCreateEmployee = ({ mutationConfig }) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getEmployeesQueryOptions.queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createEmployee,
  });
};
