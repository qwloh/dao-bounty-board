import { useMemo, useState } from "react";
import { _toMap } from "../../utils/data-transform";

export type FilterParams<T> = Record<
  string,
  boolean | string | any[] | ((d: T) => boolean)
>;

interface UseFilterArgs<T> {
  data: T[];
  initialFilters?: FilterParams<T>;
}

export const useFilter = <T>({ data, initialFilters }: UseFilterArgs<T>) => {
  const [filterParams, setFilterParams] = useState<FilterParams<T> | {}>(
    initialFilters || {}
  );

  // filtered data based on filterParams
  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter(getFilterPredicate(filterParams));
  }, [data, filterParams]);

  // functions to expose to hook consumer
  const filter = (field: keyof T, value: any) => {
    setFilterParams((fp) => ({ ...fp, [field]: value }));
  };

  const clearFilter = (field: keyof T) => {
    setFilterParams((fp) => ({ ...fp, [field]: undefined }));
  };

  const clearAllFilters = () => {
    setFilterParams({});
  };

  return {
    filtered,
    filter,
    clearFilter,
    clearAllFilters,
  };
};

const getFilterPredicate = <T>(filterParams: FilterParams<T>) => {
  // opportunity for improvement: allow dot notation  for nested value access
  return (d) => {
    // a bunch of filters
    for (const [key, value] of Object.entries(filterParams)) {
      if (typeof value === "boolean") {
        if (!!d[key] !== value) return false;
      }
      if (typeof value === "string") {
        if (d[key] !== value) return false;
      }
      if (Array.isArray(value)) {
        if (!value.includes(d[key])) return false;
      }
      if (typeof value === "function") {
        if (!value(d[key])) return false;
      }
    }
    // return true if the for loop above never evaluates to false
    return true;
  };
};
