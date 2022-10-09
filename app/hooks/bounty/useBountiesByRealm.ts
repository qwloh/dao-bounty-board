import { BountyItem } from "../../model/bounty.model";
import { BountyBoardProgramAccount } from "../../model/util.model";
import { FilterParams } from "../ui-list-engine/useFilter";
import { useFilterSortOrPaged } from "../ui-list-engine/useFilterSortOrPaged";
import { Sort } from "../ui-list-engine/useSort";
import { _useBountiesByRealm } from "./_useBountiesByRealm";
import { _usePagedBounties } from "./_usePagedBounties";

interface UseBountiesByRealmArgs<
  FP extends FilterParams<BountyBoardProgramAccount<BountyItem>>
> {
  realm: string; // can be address or symbol
  blankFilters?: FP;
  initialSort?: Sort<BountyBoardProgramAccount<BountyItem>>;
  pageSize?: number;
}

export const useBountiesByRealm = <
  FP extends FilterParams<BountyBoardProgramAccount<BountyItem>>
>({
  realm,
  blankFilters,
  initialSort,
  pageSize,
}: UseBountiesByRealmArgs<FP>) => {
  const {
    data: bountyItems,
    isLoading: isLoadingBountyItems,
    error: errorLoadingBountyItems,
    ...restQueryResult
  } = _useBountiesByRealm(realm);

  const {
    data: processed,
    isProcessing,
    ...restMethods
  } = useFilterSortOrPaged({
    data: bountyItems,
    blankFilters,
    initialSort,
    pageSize,
  });

  const { isLoading: isFetchingMultiple, error: errorFetchingMultiple } =
    _usePagedBounties(processed ? processed.map((p) => p.pubkey) : []);

  return {
    data: processed,
    isLoading: isLoadingBountyItems || isProcessing || isFetchingMultiple,
    // error: errorLoadingBountyItems || errorFetchingMultiple,
    ...restQueryResult,
    ...restMethods,
  };
};
