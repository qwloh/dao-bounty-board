import { get } from "lodash";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { DeepKeys } from "../../model/util.model";
import { makeNonBlocking } from "../../utils/promisify";

export type Sort<T> = { path: DeepKeys<T>; order: "asc" | "desc" };

interface UseSortArgs<T> {
  filteredData: T[];
  initialSort?: Sort<T>; // not enabling multi-sort for now
}

interface UseSortState<T> {
  sort?: Sort<T>;
  isSorting: boolean;
  sorted: T[];
}

export const useSort = <T>({ filteredData, initialSort }: UseSortArgs<T>) => {
  const [sortState, setSortState] = useState<UseSortState<T>>({
    sort: initialSort,
    isSorting: true,
    sorted: filteredData,
  });

  // const [sort, setSort] = useState<Sort<T> | undefined>(initialSort);

  // sorted data based on Sort
  // const sorted = useMemo(() => {
  //   if (!filteredData) return [];
  //   return sort
  //     ? [...filteredData].sort(getSortComparator([sort])) // create a new reference every time a sort happens to notify downstream users
  //     : filteredData; // if sort is undefined, do nothing
  // }, [filteredData, sort]);

  // const [sortResult, setSortResult] = useState({
  //   sorted: [],
  //   isSorting: true,
  // });

  useEffect(() => {
    console.log("Run: sort", sortState);
    if (!filteredData) return;
    setSortState((s) => ({ ...s, isSorting: true }));
    makeNonBlocking(() =>
      sortState.sort
        ? [...filteredData].sort(getSortComparator([sortState.sort]))
        : filteredData
    )
      .then((sorted) =>
        setSortState((s) => ({ ...s, sorted, isSorting: false }))
      )
      .catch((e) => {
        console.error("Sort error", e);
        setSortState((s) => ({ ...s, isSorting: false }));
      });
  }, [filteredData, sortState.sort]);

  // functions to expose to hook consumer
  const updateSort = (path: DeepKeys<T>, order: "asc" | "desc") => {
    setSortState((s) => ({
      ...s,
      sort: { path, order },
      isSorting: true,
    }));
    // setSort({
    //   path,
    //   order,
    // });
  };

  const resetSort = () => {
    setSortState((s) => ({
      ...s,
      sort: initialSort,
      isSorting: true,
    }));
    // setSort(initialSort);
  };

  const clearSort = () => {
    setSortState((s) => ({
      ...s,
      sort: undefined,
      isSorting: true,
    }));
    // setSort(undefined);
  };

  return {
    // sorted,
    sorted: sortState.sorted,
    isSorting: sortState.isSorting,
    activeSort: sortState.sort,
    // sorted: sortResult.sorted,
    // isSorting: sortResult.isSorting,
    // activeSort: sort,
    updateSort,
    resetSort,
    clearSort,
  };
};

export const getSortComparator = <T>(sort: Sort<T>[]) => {
  // opportunity for improvement: allow dot notation in 'field' for nested value access
  return (a: T, b: T) => {
    let res = 0;
    let i = 0;
    do {
      const path = sort[i].path;
      const desiredOrder = sort[i].order;

      const fieldValueA = get(a, path);
      const fieldValueB = get(b, path);

      if (typeof fieldValueA === "string" && typeof fieldValueB === "string") {
        // add method to handle when either value is undefined | null
        res =
          desiredOrder === "asc"
            ? fieldValueA.localeCompare(fieldValueB)
            : fieldValueB.localeCompare(fieldValueA);
      } else if (
        typeof fieldValueA === "number" &&
        typeof fieldValueB === "number"
      ) {
        // add method to handle when either value is undefined | null
        // does not include number like strings, i.e. "123"
        res =
          desiredOrder === "asc"
            ? fieldValueA - fieldValueB
            : fieldValueB - fieldValueA;
      } else {
        // treat everything else as boolean sort, i.e. has value > no value
        res =
          !!fieldValueA === !!fieldValueB
            ? 0
            : desiredOrder === "asc"
            ? !!fieldValueA
              ? 1
              : -1
            : !!fieldValueA
            ? -1
            : 1;
      }
      i++;
    } while (res === 0 && i < sort.length);
    return res;
  };
};
