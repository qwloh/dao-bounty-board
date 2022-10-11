import { useEffect, useState } from "react";
import { _toMap } from "../../utils/data-transform";
import { clone, get, setWith } from "lodash";
import { DeepKeys, DeepValue, SimpleObject } from "../../model/util.model";
import { makeNonBlocking } from "../../utils/promisify";

export type FilterParams<T> = {
  [key in DeepKeys<T>]?:
    | DeepValue<T, key>
    | DeepValue<T, key>[]
    | boolean
    | ((v: DeepValue<T, key>) => boolean);
};

interface UseFilterArgs<T extends object, FP extends FilterParams<T>> {
  data: T[];
  blankFilters?: FP; // put all fields that will be subjected to filtering with their default values here, helps with typing downstream
  // TODO: implement initialFilters in the future
}

export const useFilter = <T extends SimpleObject, FP extends FilterParams<T>>({
  data,
  blankFilters,
}: UseFilterArgs<T, FP>) => {
  // splitting states doesn't matter anymore because multiple `setStates` calls in an effect are batched since React 18
  const [isFiltering, setIsFiltering] = useState(true);
  const [filterParams, setFilterParams] = useState<FP>(blankFilters);
  const [filtered, setFiltered] = useState(data);

  useEffect(() => {
    console.log("Run: filter", data?.length, isFiltering);
    if (!data) return;
    if (data && !blankFilters) {
      setIsFiltering(false); // equivalent to hook disabled if blankFilters is not provided
      return;
    }

    setIsFiltering(true);
    makeNonBlocking(() => data.filter(getFilterPredicate(filterParams)))
      .then((filtered) => {
        setFiltered(filtered);
        setIsFiltering(false);
      })
      .catch((e) => {
        console.error("Filter error", e);
        setIsFiltering(false);
      });
  }, [data, filterParams]);

  // functions to expose to hook consumer
  const filter = <F extends keyof FP>(
    path: F,
    valueOrFn: FP[F] | ((v: FP[F]) => FP[F])
  ) => {
    if (!blankFilters)
      throw new Error("blankFilters needed for filter operation");
    setIsFiltering(true);
    setFilterParams((fp) => {
      if (typeof valueOrFn === "function") {
        const currentFilterValue = get(fp, path);
        // @ts-ignore: known bug https://github.com/microsoft/TypeScript/issues/37663
        const newFilterValue = valueOrFn(currentFilterValue);
        return setWith(clone(fp), path, newFilterValue, clone);
      } else {
        return setWith(clone(fp), path, valueOrFn, clone);
      }
    });
  };

  const clearFilter = (path: keyof FP) => {
    if (!blankFilters)
      throw new Error("blankFilters needed for filter operation");

    setIsFiltering(true);
    setFilterParams((fp) => {
      const blankFilterValue = get(blankFilters, path);
      return setWith(clone(fp), path, blankFilterValue, clone);
    });
  };

  const clearAllFilters = () => {
    if (!blankFilters)
      throw new Error("blankFilters needed for filter operation");

    setIsFiltering(true);
    setFilterParams(blankFilters);
  };

  return {
    filtered,
    filterParams,
    isFiltering,
    filter,
    clearFilter,
    clearAllFilters,
  };
};

export const getFilterPredicate = <T extends object>(
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

// filtered data based on filterParams
// const filtered = useMemo(() => {
//   if (!data) return [];
//   if (!blankFilters) return data; // equivalent to hook disabled if blankFilters is not provided

//   setIsFiltering(true);
//   console.log("Filtering", isFiltering);
//   const filtered = data.filter(getFilterPredicate(filterParams));
//   setIsFiltering(false);
//   return filtered;
//   // return data.filter(getFilterPredicate(filterParams));
// }, [data, filterParams]);

// setFilterState((fp) => {
//   if (typeof valueOrFn === "function") {
//     const currentFilterValue = get(filterState, path);
//     // @ts-ignore: known bug https://github.com/microsoft/TypeScript/issues/37663
//     const newFilterValue = valueOrFn(currentFilterValue);
//     return setWith(clone(fp), path, newFilterValue, clone);
//   }
//   return setWith(clone(fp), path, valueOrFn, clone);
// });
// clone required as setWith mutates fp by default, first clone shallow-copies first level keys, second clone copies only nested value on the path

// const clearFilter = (path: keyof FP) => {
//   if (!blankFilters)
//     throw new Error("blankFilters needed for filter operation");
//   setFilterResult({ filtered: data, isFiltering: true });
//   const blankFilterValue = get(blankFilters, path);
//   setFilterState((fp) => setWith(clone(fp), path, blankFilterValue, clone));
// };

// const clearAllFilters = () => {
//   if (!blankFilters)
//     throw new Error("blankFilters needed for filter operation");
//   setFilterResult({ filtered: data, isFiltering: true });
//   setFilterState(blankFilters);
// };
