import { _toMap } from "../../utils/data-transform";
import { FilterParams, useFilter } from "./useFilter";
import { usePaged } from "./usePaged";
import { Sort, useSort } from "./useSort";

interface UseFilterSortOrPagedArgs<T> {
  data: T[];
  initialFilters?: FilterParams<T>; // field name is key of T, value can be either boolean, string, array, or predicate function
  initialSort?: Sort<T>; // no multi-sort functionality for now
  pageSize?: number; // no pagination if undefined
  // expose initialPage: number if required eventually
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

  const { currentPage, pageParams, prevPage, nextPage, toPage, addPage } =
    usePaged({
      sortedData: sorted,
      pageSize,
    });

  return {
    // data: filtered,
    filter,
    clearFilter,
    clearAllFilters,
    // data: sorted,
    updateSort,
    resetSort,
    clearSort,
    data: currentPage,
    pageParams,
    prevPage,
    nextPage,
    toPage,
    addPage,
  };
};
