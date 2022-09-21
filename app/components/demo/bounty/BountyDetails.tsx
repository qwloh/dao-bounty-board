import { Bounty } from "../bounties/Bounty";
import { ApplyToBountyBtn } from "./buttons/ApplyToBountyBtn";
import { BountyActivities } from "./BountyActivities";
import { BountyApplications } from "./BountyApplications";
import { BountySubmissions } from "./BountySubmissions";
import { AssignBounty } from "./AssignBounty";
import { UnassignBounty } from "./UnassignBounty";
import { RequestChange } from "./RequestChange";
import { RejectSubmission } from "./RejectSubmission";
import { RejectStaleSubmission } from "./RejectStaleSubmission";
import { SubmitToBounty } from "./SubmitToBounty";
import { UpdateSubmission } from "./UpdateSubmission";
import { ForceAcceptSubmission } from "./ForceAcceptSubmission";
import { AcceptSubmission } from "./AcceptSubmission";
import { useState } from "react";
import { ContributorRecord } from "../contributor-record/ContributorRecord";
import { useAnchorContext } from "../../../hooks";

export const BountyDetails = ({ realm }: { realm: string }) => {
  // hard coded value
  const [bountyPK, setBountyPK] = useState("");
  const { wallet } = useAnchorContext();

  return (
    <div className="flex flex-col gap-y-2 py-4">
      <div className="bg-white rounded-lg p-4">
        <div className="font-bold">Me as contributor in realm</div>
        <ContributorRecord realm={realm} walletPK={wallet?.publicKey + ""} />
      </div>
      {/* Input bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Address of bounty to view details"
          className="bg-white border-slate-100 rounded-lg p-2 flex-1"
        />
        <button
          onClick={(e) => {
            const input = e.currentTarget
              .previousElementSibling as HTMLInputElement;
            setBountyPK(input.value);
          }}
          className="p-2 rounded-lg border-blue-400 bg-white w-max"
        >
          View
        </button>
      </div>
      {(!bountyPK || !bountyPK.trim()) && (
        <div className="bg-white rounded-lg p-4">
          Note: Copy paste a bounty address from previous page to view details
          of that bounty
        </div>
      )}
      {bountyPK && bountyPK.trim() && (
        <div className="flex gap-x-4  items-start">
          <div className="basis-2/3 min-w-0 flex flex-col gap-y-4">
            <div className="flex gap-x-4">
              {/* Bounty details */}
              <div className="basis-2/3 min-w-0 flex flex-col gap-y-1 bg-white rounded-lg p-4">
                <div className="font-bold">Bounty details</div>
                <Bounty bountyPK={bountyPK} />
              </div>
              {/* Bounty applications */}
              <div className="basis-1/3 min-w-0 bg-white rounded-lg p-4">
                <BountyApplications bountyPK={bountyPK} />
              </div>
            </div>
            {/* Bounty submissions */}
            <div className="bg-white rounded-lg p-4">
              <BountySubmissions bountyPK={bountyPK} />
            </div>
            {/* Bounty activity */}
            <div className="bg-white rounded-lg p-4">
              <BountyActivities bountyPK={bountyPK} />
            </div>
          </div>
          {/* Methods */}
          <div className="basis-1/3 bg-white rounded-lg p-4">
            <div className="font-bold">Methods</div>
            <div className="py-4 flex flex-col gap-y-8">
              {/* Methods available to anyone */}
              <div className="flex flex-col gap-y-4 p-4 border border-slate-200 rounded-lg">
                <div>Available to anyone</div>
                <ApplyToBountyBtn
                  realm={realm}
                  bountyPK={bountyPK}
                  validity={7 * 24 * 3600}
                />
              </div>
              {/* Methods available only to bounty creator */}
              <div className="flex flex-col gap-y-6 p-4 border border-slate-200 rounded-lg">
                <div>
                  Available only to bounty creator (or anyone who's authorized)
                </div>
                <AssignBounty realm={realm} bountyPK={bountyPK} />
                <div className="w-full h-px bg-slate-200"></div>
                <UnassignBounty realm={realm} bountyPK={bountyPK} />
                <div className="w-full h-px bg-slate-200"></div>
                <RequestChange realm={realm} bountyPK={bountyPK} />
                <div className="w-full h-px bg-slate-200"></div>
                <RejectStaleSubmission realm={realm} bountyPK={bountyPK} />
                <div className="w-full h-px bg-slate-200"></div>
                <RejectSubmission realm={realm} bountyPK={bountyPK} />
                <div className="w-full h-px bg-slate-200"></div>
                <AcceptSubmission realm={realm} bountyPK={bountyPK} />
              </div>
              {/* Methods available only to assignee */}
              <div className="flex flex-col gap-y-6 p-4 border border-slate-200 rounded-lg">
                <div>Available only to assignee</div>
                <SubmitToBounty realm={realm} bountyPK={bountyPK} />
                <div className="w-full h-px bg-slate-200"></div>
                <UpdateSubmission realm={realm} bountyPK={bountyPK} />
                <div className="w-full h-px bg-slate-200"></div>
                <ForceAcceptSubmission realm={realm} bountyPK={bountyPK} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
