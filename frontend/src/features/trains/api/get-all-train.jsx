import { useQuery } from '@tanstack/react-query';
import { api } from '~/lib/api.js';

export const getAllTrain = () => {
  return api.get(`/ad/trains`);
};

export const useGetAllTrain = () => {
  return useQuery({
    queryKey: ['all-train'],
    queryFn: getAllTrain,
  });
};
