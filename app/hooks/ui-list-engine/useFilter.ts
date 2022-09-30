import { useMemo, useState } from "react";
import { _toMap } from "../../utils/data-transform";
import { clone, get, setWith } from "lodash";
import { DeepKeys, DeepValue, SimpleObject } from "../../model/util.model";

export type FilterParams<T> = {
  [key in DeepKeys<T>]?:
    | DeepValue<T, key>
    | DeepValue<T, key>[]
    | boolean
    | ((v: DeepValue<T, key>) => boolean);
};

interface UseFilterArgs<T extends object, FP extends FilterParams<T>> {
  data: T[];
  blankFilters: FP; // put all fields that will be subjected to filtering with their default values here, helps with typing downstream
  // TODO: implement initialFilters in the future
}

export const useFilter = <T extends SimpleObject, FP extends FilterParams<T>>({
  data,
  blankFilters,
}: UseFilterArgs<T, FP>) => {
  const [filterParams, setFilterParams] = useState<FP>(blankFilters);

  // filtered data based on filterParams
  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter(getFilterPredicate(filterParams));
  }, [data, filterParams]);

  // functions to expose to hook consumer
  const filter = <F extends keyof FP>(
    path: F,
    valueOrFn: FP[F] | ((v: FP[F]) => FP[F])
  ) => {
    setFilterParams((fp) => {
      if (typeof valueOrFn === "function") {
        const currentFilterValue = get(filterParams, path);
        // @ts-ignore: known bug https://github.com/microsoft/TypeScript/issues/37663
        const newFilterValue = valueOrFn(currentFilterValue);
        return setWith(clone(fp), path, newFilterValue, clone);
      }
      return setWith(clone(fp), path, valueOrFn, clone);
    });
    // clone required as setWith mutates fp by default, first clone shallow-copies first level keys, second clone copies only nested value on the path
  };

  const clearFilter = (path: keyof FP) => {
    const blankFilterValue = get(blankFilters, path);
    setFilterParams((fp) => setWith(clone(fp), path, blankFilterValue, clone));
  };

  const clearAllFilters = () => {
    setFilterParams(blankFilters);
  };

  return {
    filtered,
    filterParams,
    filter,
    clearFilter,
    clearAllFilters,
  };
};

const getFilterPredicate = <T extends object>(
  filterParams: FilterParams<T>
) => {
  return (d) => {
    // for loop to combine all keys on filter params to achieve 'AND' conditions effect between keys
    for (const key of Object.keys(filterParams)) {
      // dot notation access
      const val = get(d, key);
      const filterVal = filterParams[key];
      if (!isSelectedByFilter(val, filterVal)) return false;
    }
    // return true if the for loop above never evaluates to false
    return true;
  };
};

export const isSelectedByFilter = (val, filterVal) => {
  if (typeof filterVal === "boolean") {
    if (!!val !== filterVal) return false;
  }
  if (typeof filterVal === "function") {
    if (!filterVal(val)) return false;
  }
  if (typeof filterVal === "string") {
    if (val !== filterVal) return false;
  }
  if (Array.isArray(filterVal) && filterVal.length !== 0) {
    if (!filterVal.includes(val)) return false;
  }
  return true;
};
