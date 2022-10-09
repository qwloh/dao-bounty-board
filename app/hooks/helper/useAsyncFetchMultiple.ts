import { useEffect, useLayoutEffect, useState } from "react";

// simple alternative to useQuery where having a query key does not makes sense

interface UseAysncFetchMultipleArgs {
  queryFn: () => Promise<void>; // data should be set into query cache, and access via useQuery
  dependencies: any[];
  enabled: boolean;
}

export const useAsyncFetchMultiple = ({
  queryFn,
  dependencies,
  enabled,
}: UseAysncFetchMultipleArgs) => {
  const [error, setError] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || isLoading) return;
    setIsLoading(true);
    queryFn()
      .then(() => setIsLoading(false))
      .catch((e) => {
        setIsLoading(false);
        setError(e);
      });
  }, [...dependencies, enabled]);

  return {
    isLoading,
    error,
  };
};
