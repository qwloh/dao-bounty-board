import { useMemo, useState } from "react";

export type Sort<T> = { field: keyof T; order: "asc" | "desc" };

interface UseSortArgs<T> {
  filteredData: T[];
  initialSort?: Sort<T>; // not enabling multi-sort for now
}

export const useSort = <T>({ filteredData, initialSort }: UseSortArgs<T>) => {
  const [sort, setSort] = useState<Sort<T> | undefined>(initialSort);

  // create a copy so we don't mutate the original data
  const unsortedData = useMemo(() => {
    if (!filteredData) return [];
    return [...filteredData];
  }, [filteredData]);

  // sorted data based on Sort
  const sorted = useMemo(() => {
    if (!filteredData) return [];
    return sort ? unsortedData.sort(getSortComparator([sort])) : filteredData; // if sort is undefined, do nothing
  }, [filteredData, sort]);

  // functions to expose to hook consumer
  const updateSort = (field: keyof T, order: "asc" | "desc") => {
    setSort({
      field,
      order,
    });
  };

  const resetSort = () => {
    setSort(initialSort);
  };

  const clearSort = () => {
    setSort(undefined);
  };

  return {
    sorted,
    updateSort,
    resetSort,
    clearSort,
  };
};

const getSortComparator = <T>(sort: Sort<T>[]) => {
  // opportunity for improvement: allow dot notation in 'field' for nested value access
  return (a: T, b: T) => {
    let res = 0;
    let i = 0;
    do {
      const fieldToCompare = sort[i].field;
      const desiredOrder = sort[i].order;

      const fieldValueA = a[fieldToCompare];
      const fieldValueB = b[fieldToCompare];

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
