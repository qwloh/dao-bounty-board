import { ContributorRecordItem } from "../../model/contributor-record.model";
import { BountyBoardProgramAccount } from "../../model/util.model";
import { FilterParams } from "../ui-list-engine/useFilter";
import { useFilterSortOrPaged } from "../ui-list-engine/useFilterSortOrPaged";
import { Sort } from "../ui-list-engine/useSort";
import { _useContributorRecordsByRealm } from "./_useContributorRecordsByRealm";
import { _usePagedContributorRecords } from "./_usePagedContributorRecords";

interface useContributorsByRealmArgs<
  FP extends FilterParams<BountyBoardProgramAccount<ContributorRecordItem>>
> {
  realm: string; // can be address or symbol
  blankFilters?: FP;
  initialSort?: Sort<BountyBoardProgramAccount<ContributorRecordItem>>;
  pageSize?: number;
}

export const useContributorsByRealm = <
  FP extends FilterParams<BountyBoardProgramAccount<ContributorRecordItem>>
>({
  realm,
  blankFilters,
  initialSort,
  pageSize,
}: useContributorsByRealmArgs<FP>) => {
  const {
    data: contributorRecordItems,
    isLoading: isLoadingContributorRecordItems,
    error: errorLoadingContributorRecordItems,
    ...restQueryResult
  } = _useContributorRecordsByRealm(realm);

  const {
    data: processed,
    isProcessing,
    ...restMethods
  } = useFilterSortOrPaged({
    data: contributorRecordItems,
    blankFilters,
    initialSort,
    pageSize,
  });

  const { isLoading: isFetchingMultiple, error: errorFetchingMultiple } =
    _usePagedContributorRecords(
      processed ? processed.map((p) => p.pubkey) : []
    );

  return {
    data: processed,
    isLoading:
      isLoadingContributorRecordItems || isProcessing || isFetchingMultiple,
    // error: errorLoadingBountyItems || errorFetchingMultiple,
    ...restQueryResult,
    ...restMethods,
  };
};
