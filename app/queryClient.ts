import { QueryCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err, { meta }) =>
      console.error(`[${meta.hookName}] ${meta.methodName} run failed.`, err),
  }),
});
queryClient.setDefaultOptions({
  queries: {
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  },
});
