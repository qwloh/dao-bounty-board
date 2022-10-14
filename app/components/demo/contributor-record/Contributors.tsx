import { useBountyBoardByRealm } from "../../../hooks/bounty-board/useBountyBoardByRealm";
import { useContributorsByRealm } from "../../../hooks/contributor-record/useContributorsByRealm";
import { useDebouncedLoader } from "../../../hooks/helper/useDebouncedLoader";
import { _toSentenceCase } from "../../../utils/str-transform";
import { PaginationBar } from "../PaginationBar";
import { ContributorRecord } from "./ContributorRecord";

export const Contributors = ({ realm }: { realm: string }) => {
  const { data: bountyBoard } = useBountyBoardByRealm(realm);
  const {
    data: contributors,
    isLoading,
    // filter related
    filterParams,
    filter,
    clearFilter,
    clearAllFilters,
    // sort related
    activeSort,
    updateSort,
    clearSort,
    // paging related
    pageParams,
    prevPage,
    nextPage,
    toPage,
  } = useContributorsByRealm({
    realm,
    blankFilters: { "account.role": [] },
    pageSize: 2,
  });

  const { isLoading: debouncedLoading } = useDebouncedLoader({ isLoading });

  return (
    <div className="flex gap-x-4 py-4 items-start">
      <div className="basis-2/3 min-w-0 p-6 bg-white break-words flex flex-col gap-y-2 rounded-lg">
        <div className="text-lg font-bold">Contributors</div>
        <p>
          All contributors on a realm's bounty board (realm is Self DAO in this
          demo)
        </p>
        {/* Filter */}
        {bountyBoard?.account?.config?.roles && (
          <div className="py-2 flex flex-col gap-y-2">
            <div className="flex gap-x-2 items-center">
              <div>Filter by</div>
              <button
                className="text-xs p-1 text-rose-400"
                onClick={() => {
                  clearAllFilters();
                }}
              >
                Clear all filters
              </button>
            </div>
            <div className="flex gap-x-4">
              <div>Role</div>
              <div className="flex gap-x-2">
                {bountyBoard?.account?.config?.roles
                  .map((r) => r.roleName)
                  .map((rn) => (
                    <button
                      key={rn}
                      className={`text-xs p-1 rounded-full border ${
                        filterParams["account.role"].includes(rn)
                          ? "bg-blue-100 text-blue-400 border-blue-400"
                          : " bg-slate-100 border-slate-400"
                      } `}
                      onClick={() => {
                        console.log(
                          "Filter params before click",
                          filterParams["account.state"]
                        );
                        filter("account.role", (currentValue) =>
                          filterParams["account.role"].includes(rn)
                            ? currentValue.filter((v) => v !== rn)
                            : [...currentValue, rn]
                        );
                      }}
                    >
                      {_toSentenceCase(rn)}
                    </button>
                  ))}

                <button
                  className="text-xs p-1 text-rose-400"
                  onClick={() => {
                    clearFilter("account.role");
                  }}
                >
                  Clear role filter
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Sort */}
        <div className="py-2 flex gap-x-2 items-center">
          <div>Sort by</div>
          <button
            className={`text-xs p-1 rounded-full border ${
              activeSort?.path === "account.reputation"
                ? "bg-blue-100 text-blue-400 border-blue-400"
                : " bg-slate-100 border-slate-400"
            } `}
            onClick={() =>
              activeSort?.path === "account.reputation"
                ? clearSort()
                : updateSort("account.reputation", "desc")
            }
          >
            Highest reputation
          </button>
        </div>
        {/* Bounty counts & paging solution*/}
        <div className="py-2 flex justify-between items-center">
          <div>Contributors</div>
          <PaginationBar
            pageParams={pageParams}
            prevPage={prevPage}
            nextPage={nextPage}
            toPage={toPage}
          />
        </div>
        {debouncedLoading && (
          <div className="text-s text-slate-800 py-2">Loading...</div>
        )}
        {!debouncedLoading && !contributors?.length && (
          <div className="text-s text-slate-800 py-2">No contributors</div>
        )}
        {!debouncedLoading && !!contributors?.length && (
          <div className="flex flex-col gap-y-6 py-3">
            {contributors.map((b) => (
              <ContributorRecord
                key={b.pubkey}
                realm={realm}
                walletOrContributorRecordPK={{ contributorRecordPK: b.pubkey }}
              />
            ))}
          </div>
        )}
      </div>
      {/* Instructions to add contributors */}
      <div className="basis-1/3 bg-white rounded-lg p-4 flex flex-col gap-y-6">
        <div>Two ways to add contributors</div>
        <div className="flex flex-col gap-y-1">
          <div className="text-slate-800">
            1. Add contributor record with default role when non-contributor
            applies to a bounty
          </div>
          <div>Change a wallet and apply to any bounty</div>
        </div>
        <div className="w-full h-px bg-slate-200"></div>
        <div className="flex flex-col gap-y-1">
          <div className="text-slate-800">
            2. Add / promote contributors with specified role via Proposal
          </div>
          <div>To do</div>
        </div>
      </div>
    </div>
  );
};
