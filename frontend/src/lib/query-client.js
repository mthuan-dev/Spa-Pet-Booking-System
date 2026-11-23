import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = error?.response?.status ?? error?.status;
        return !(status >= 400 && status < 500) && failureCount < 3;
      },
    },
  },
})
