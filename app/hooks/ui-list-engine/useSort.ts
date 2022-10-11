import { get } from "lodash";
import { useEffect, useState } from "react";
import { DeepKeys } from "../../model/util.model";
import { makeNonBlocking } from "../../utils/promisify";

export type Sort<T> = { path: DeepKeys<T>; order: "asc" | "desc" };

interface UseSortArgs<T> {
  filteredData: T[];
  initialSort?: Sort<T>; // not enabling multi-sort for now
}

export const useSort = <T>({ filteredData, initialSort }: UseSortArgs<T>) => {
  // splitting states doesn't matter anymore because multiple `setStates` calls in an effect are batched since React 18
  const [isSorting, setIsSorting] = useState(true);
  const [activeSort, setActiveSort] = useState(initialSort);
  const [sorted, setSorted] = useState(filteredData);

  useEffect(() => {
    if (activeSort) setIsSorting(true);
  }, [filteredData]);

  useEffect(() => {
    console.log("Run: sort", filteredData?.length, isSorting);
    if (!filteredData) return;

    setIsSorting(true);
    makeNonBlocking(() =>
      activeSort
        ? [...filteredData].sort(getSortComparator([activeSort]))
        : filteredData
    )
      .then((sorted) => {
        setSorted(sorted);
        setIsSorting(false);
      })
      .catch((e) => {
        console.error("Sort error", e);
        setIsSorting(false);
      });
  }, [filteredData, activeSort]);

  // functions to expose to hook consumer
  const updateSort = (path: DeepKeys<T>, order: "asc" | "desc") => {
    setIsSorting(true);
    setActiveSort({ path, order });
  };

  const resetSort = () => {
    setIsSorting(true);
    setActiveSort(initialSort);
  };

  const clearSort = () => {
    setIsSorting(true);
    setActiveSort(undefined);
  };

  return {
    sorted,
    activeSort,
    isSorting,
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

// const updateSort = (path: DeepKeys<T>, order: "asc" | "desc") => {
//   setSort({
//     path,
//     order,
//   });
// };

// const resetSort = () => {
//   setSort(initialSort);
// };

// const clearSort = () => {
//   setSort(undefined);
// };
