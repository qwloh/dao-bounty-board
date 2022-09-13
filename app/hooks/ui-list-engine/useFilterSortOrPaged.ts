import { _toMap } from "../../utils/data-transform";
import { FilterParams, useFilter } from "./useFilter";
import { Sort, useSort } from "./useSort";

interface UseFilterSortOrPagedArgs<T> {
  data: T[];
  initialFilters?: FilterParams<T>; // keys to expose for user filtering
  initialSort?: Sort<T>; // no multi-sort functionality for now
  pageSize?: number; // no pagination if undefined
}

export const useFilterSortOrPaged = <T>({
  data,
  initialFilters,
  initialSort,
  pageSize,
}: UseFilterSortOrPagedArgs<T>) => {
  const { filtered, filter, clearFilter, clearAllFilters } = useFilter({
    data,
    initialFilters,
  });

  const { sorted, updateSort, resetSort, clearSort } = useSort({
    filteredData: filtered,
    initialSort,
  });

  return {
    // data: filtered,
    filter,
    clearFilter,
    clearAllFilters,
    data: sorted,
    updateSort,
    resetSort,
    clearSort,
  };
};
