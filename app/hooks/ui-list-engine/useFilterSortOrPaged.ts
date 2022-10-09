import { useEffect, useState } from "react";
import { _toMap } from "../../utils/data-transform";
import { FilterParams, useFilter } from "./useFilter";
import { usePaged } from "./usePaged";
import { Sort, useSort } from "./useSort";

interface UseFilterSortOrPagedArgs<
  T extends object,
  FP extends FilterParams<T>
> {
  data: T[];
  blankFilters: FP; // field name is key of T, value can be either boolean, string, array, or predicate function
  initialSort?: Sort<T>; // no multi-sort functionality for now
  pageSize?: number; // no pagination if undefined
  // expose initialPage: number if required eventually
}

export const useFilterSortOrPaged = <
  T extends object,
  FP extends FilterParams<T>
>({
  data,
  blankFilters,
  initialSort,
  pageSize,
}: UseFilterSortOrPagedArgs<T, FP>) => {
  const {
    filtered,
    isFiltering,
    filterParams,
    filter,
    clearFilter,
    clearAllFilters,
  } = useFilter({
    data,
    blankFilters,
  });

  const { sorted, isSorting, activeSort, updateSort, resetSort, clearSort } =
    useSort({
      filteredData: filtered,
      initialSort,
    });

  const {
    currentPage,
    isPaging,
    pageParams,
    prevPage,
    nextPage,
    toPage,
    addPage,
  } = usePaged({
    sortedData: sorted,
    pageSize,
  });

  return {
    // data: filtered,
    filterParams,
    filter,
    clearFilter,
    clearAllFilters,
    // data: sorted,
    activeSort,
    updateSort,
    resetSort,
    clearSort,
    data: currentPage,
    pageParams,
    prevPage,
    nextPage,
    toPage,
    addPage,

    isProcessing: isFiltering || isSorting || isPaging,
  };
};
