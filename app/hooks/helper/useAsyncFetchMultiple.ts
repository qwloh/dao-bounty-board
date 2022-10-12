import { useEffect, useLayoutEffect, useState } from "react";

// simple alternative to useQuery where having a query key does not makes sense

interface UseAysncFetchMultipleArgs {
  queryFn: (done: () => void) => Promise<void>; // data should be set into query cache, and access via useQuery
  dependencies: any[];
}

export const useAsyncFetchMultiple = ({
  queryFn,
  dependencies,
}: UseAysncFetchMultipleArgs) => {
  const [error, setError] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const done = () => setIsLoading(false);
    queryFn(done).catch((e) => {
      setIsLoading(false);
      setError(e);
    });
  }, dependencies);

  return {
    isLoading,
    error,
  };
};
