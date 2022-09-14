import { useCallback, useMemo } from "react";
import { getSortComparator, Sort } from "./ui-list-engine/useSort";

/**
 * util hook for app to select a subset of data to render (with memoization)
 * - selector cannot change after declaration. For user input-based filtering, use `useFilter.ts`
 * - can pass in an optional sort parameter
 */

interface UseSelectorArgs<T> {
  data: T[];
  selector: (d: T) => boolean;
  sorts?: Sort<T>[]; // support sort by multiple field
}

export const useSelector = <T>({
  data,
  selector,
  sorts,
}: UseSelectorArgs<T>) => {
  const filterPredicate = useCallback(selector, []); // expect selector to never change since declaration, so never refresh

  return useMemo(() => {
    if (!data) return [];
    console.log("Selector run");
    const filtered = data.filter(filterPredicate);
    return sorts ? filtered.sort(getSortComparator(sorts)) : filtered;
  }, [data, filterPredicate]);
};
