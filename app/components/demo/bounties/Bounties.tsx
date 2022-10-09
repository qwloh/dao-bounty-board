import { useBountiesByRealm } from "../../../hooks/bounty/useBountiesByRealm";
import { BountyState, Skill } from "../../../model/bounty.model";
import { _toSentenceCase } from "../../../utils/str-transform";
import { PaginationBar } from "../PaginationBar";
import { BountyDetails } from "./BountyDetails";
import { CreateBountyBtn } from "./buttons/CreateBountyBtn";
import { DeleteBounty } from "./DeleteBounty";

const filterOptionsSkills: (keyof typeof Skill)[] = [
  "development",
  "design",
  "marketing",
  "operations",
];
const filterOptionsState: (keyof typeof BountyState)[] = [
  "open",
  "assigned",
  "submissionUnderReview",
  "completeAndPaid",
];

export const Bounties = ({ realm }: { realm: string }) => {
  const {
    data: bounties,
    isLoading,
    // filter related methods
    filterParams,
    filter,
    clearFilter,
    clearAllFilters,
    // sort related methods
    activeSort,
    updateSort,
    clearSort,
    // pagination related methods
    pageParams,
    prevPage,
    nextPage,
    toPage,
  } = useBountiesByRealm({
    realm,
    blankFilters: {
      "account.skill": [] as (keyof typeof Skill)[], // typescript has problem inferencing empty arrays, other values are fine
      "account.state": [] as (keyof typeof BountyState)[],
      "account.tier": [] as string[],
    },
    pageSize: 3,
  });

  // const {
  //   data: processedBounties,
  //   // filter related methods
  //   filterParams,
  //   filter,
  //   clearFilter,
  //   clearAllFilters,
  //   // sort related methods
  //   activeSort,
  //   updateSort,
  //   clearSort,
  //   // pagination related methods
  //   prevPage,
  //   nextPage,
  //   toPage,
  // } = useFilterSortOrPaged({
  //   data: bounties,
  //   blankFilters: {
  //     "account.skill": [] as (keyof typeof Skill)[], // typescript has problem inferencing empty arrays, other values are fine
  //     "account.state": [] as (keyof typeof BountyState)[],
  //     "account.tier": [] as string[],
  //   },
  //   // initialSort: {}
  //   // pageSize: 10,
  // });

  return (
    <div className="flex gap-x-4 py-4 items-start">
      {/* Bounties */}
      <div className="basis-2/3 min-w-0 p-6 bg-white break-words flex flex-col gap-y-2 rounded-lg">
        <div className="text-lg font-bold">Bounties</div>
        <p>
          All bounties on a realm's bounty board (realm is Self DAO in this
          demo)
        </p>
        {/* Filter */}
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
            <div>Skill</div>
            <div className="flex gap-x-2">
              {filterOptionsSkills.map((o) => (
                <button
                  key={o}
                  className={`text-xs p-1 rounded-full border ${
                    filterParams["account.skill"].includes(o)
                      ? "bg-blue-100 text-blue-400 border-blue-400"
                      : " bg-slate-100 border-slate-400"
                  } `}
                  onClick={() => {
                    console.log(
                      "Filter params before click",
                      filterParams["account.skill"]
                    );
                    filter("account.skill", (currentValue) =>
                      filterParams["account.skill"].includes(o)
                        ? currentValue.filter((v) => v !== o)
                        : [...currentValue, o]
                    );
                  }}
                >
                  {_toSentenceCase(o)}
                </button>
              ))}
              <button
                className="text-xs p-1 text-rose-400"
                onClick={() => {
                  clearFilter("account.skill");
                }}
              >
                Clear skills filter
              </button>
            </div>
          </div>
          <div className="flex gap-x-4">
            <div>State</div>
            <div className="flex gap-x-2">
              {filterOptionsState.map((o) => (
                <button
                  key={o}
                  className={`text-xs p-1 rounded-full border ${
                    filterParams["account.state"].includes(o)
                      ? "bg-blue-100 text-blue-400 border-blue-400"
                      : " bg-slate-100 border-slate-400"
                  } `}
                  onClick={() => {
                    console.log(
                      "Filter params before click",
                      filterParams["account.state"]
                    );
                    filter("account.state", (currentValue) =>
                      filterParams["account.state"].includes(o)
                        ? currentValue.filter((v) => v !== o)
                        : [...currentValue, o]
                    );
                  }}
                >
                  {_toSentenceCase(o)}
                </button>
              ))}
              <button
                className="text-xs p-1 text-rose-400"
                onClick={() => {
                  clearFilter("account.state");
                }}
              >
                Clear bounty state filter
              </button>
            </div>
          </div>
        </div>
        {/* Sort */}
        <div className="py-2 flex gap-x-2 items-center">
          <div>Sort by</div>
          <div className="flex gap-x-2">
            <button
              className={`text-xs p-1 rounded-full border ${
                activeSort?.path === "account.bountyIndex"
                  ? "bg-blue-100 text-blue-400 border-blue-400"
                  : " bg-slate-100 border-slate-400"
              } `}
              onClick={() =>
                activeSort?.path === "account.bountyIndex"
                  ? clearSort()
                  : updateSort("account.bountyIndex", "desc")
              }
            >
              Newest
            </button>
            {/* <button
              className={`text-xs p-1 rounded-full border ${
                activeSort?.path === "account.bountyIndex"
                  ? "bg-blue-100 text-blue-400 border-blue-400"
                  : " bg-slate-100 border-slate-400"
              } `}
            >
              Reward
            </button> */}
          </div>
        </div>
        {/* Bounty counts & paging solution*/}
        <div className="py-2 flex justify-between items-center">
          <div>
            Bounties {bounties?.length !== undefined && `(${bounties?.length})`}
          </div>
          <PaginationBar
            pageParams={pageParams}
            prevPage={prevPage}
            nextPage={nextPage}
            toPage={toPage}
          />
        </div>
        {isLoading && (
          <div className="text-s text-slate-800 py-2">Loading...</div>
        )}
        {!isLoading && !bounties?.length && (
          <div className="text-s text-slate-800 py-2">No bounty</div>
        )}
        {!isLoading &&
          !!bounties?.length &&
          bounties.map((b) => (
            <BountyDetails key={b.pubkey} bountyPK={b.pubkey} />
          ))}
      </div>
      {/* Create and delete buttons */}
      <div className="basis-1/3 bg-white rounded-lg p-4">
        <div className="font-bold">Methods</div>
        <div className="py-4 flex flex-col gap-y-8">
          <div className="flex flex-col gap-y-4 p-4 border border-slate-200 rounded-lg">
            <div>Create a bounty with hard coded values</div>
            <div className="flex flex-col gap-y-2">
              <CreateBountyBtn
                realm={realm}
                args={{
                  title: "First bounty",
                  description: "Give me a website with marquee",
                  skill: Skill.operations,
                  tier: "Entry",
                }}
              />
              <div className="text-xs px-2">
                Edit props to `CreateBountyBtn` in Bounties.tsx to change bounty
                parameters
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-y-6 p-4 border border-slate-200 rounded-lg">
            <DeleteBounty realm={realm} />
          </div>
        </div>
      </div>
    </div>
  );
};
