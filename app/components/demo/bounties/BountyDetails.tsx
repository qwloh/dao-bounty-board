import { useBounty } from "../../../hooks/bounty/useBounty";
import { BountyState } from "../../../model/bounty.model";
import { _toSentenceCase } from "../../../utils/str-transform";

const statusColor: Record<keyof typeof BountyState, string> = {
  open: "blue",
  assigned: "violet",
  submissionUnderReview: "orange",
  completeAndPaid: "green",
};

export const BountyDetails = ({ bountyPK }: { bountyPK: string }) => {
  const { data: bounty, isLoading } = useBounty(bountyPK); // in the case of loading a list of bounties, this value should be prefilled by useBountiesByRealm
  return (
    <>
      {isLoading && <div>Loading...</div>}
      {!isLoading && !bounty && (
        <div className="text-slate-800 break-words">
          Bounty {bountyPK} does not exist
        </div>
      )}
      {bounty && (
        <div className="flex flex-col gap-y-2 rounded-lg p-4 bg-slate-100">
          <div>
            <p>Bounty address</p>
            <p className="text-slate-800 break-words">{bountyPK}</p>
          </div>
          <div className="flex gap-x-2 items-center">
            <p>Status</p>
            <div
              className={`p-1 rounded-md bg-${
                statusColor[bounty.state]
              }-100 text-${statusColor[bounty.state]}-400`}
            >
              {_toSentenceCase(bounty.state)}
            </div>
          </div>
          <p className="break-words">
            {JSON.stringify(
              bounty,
              (key, value) =>
                typeof value === "bigint" ? value.toString() : value // return everything else unchanged
            )}
          </p>
          <div className="flex flex-col bg-white rounded-lg p-2">
            <p>
              Reward payout temporarily withheld in separate account to ensure
              there is fund available to pay contributor
            </p>
            <div className="grid grid-cols-[132px_1fr] gap-x-4 py-1">
              <p>Amount</p>
              <p className="text-slate-800 min-w-0 break-words">
                {new Number(bounty.escrow.amount).valueOf() / 1000000}
              </p>
              <p>Token address</p>
              <p className="text-slate-800 min-w-0 break-words">
                {bounty.escrow.mint + ""}
              </p>
              <p>Escrow account address</p>
              <p className="text-slate-800 min-w-0 break-words">
                {bounty.escrow.address + ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
