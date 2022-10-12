import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";

// can make this into a component if want to reuse more frequently
export const useDebouncedLoader = ({
  isLoading,
  waitTime = 300,
  persistTime = 500,
}) => {
  const [loading, setLoading] = useState<boolean>(undefined);
  const setLoadingTrueDebounced = useCallback(
    debounce(() => {
      console.log("Debounced: Set loading true run", Date.now());
      setLoading(true);
    }, waitTime), // wait at least 300ms before showing loader
    [waitTime]
  );

  const setLoadingFalseDebounced = useCallback(
    debounce(() => {
      console.log("Debounced: Set loading false run", Date.now());
      setLoading(false);
    }, persistTime), // wait at least `persistTime` before hiding loader
    [persistTime]
  );

  useEffect(() => {
    if (loading === undefined) {
      setLoading(isLoading);
      return;
    }
    if (isLoading) {
      console.log("Debounced: isLoading toggled to true", Date.now());
      setLoadingFalseDebounced.cancel();
      setLoadingTrueDebounced();
    } else {
      console.log("Debounced: isLoading toggled to false", Date.now());
      setLoadingTrueDebounced.cancel();
      setLoadingFalseDebounced();
    }
  }, [isLoading, setLoadingFalseDebounced, setLoadingTrueDebounced]);

  return { isLoading: loading };
};
