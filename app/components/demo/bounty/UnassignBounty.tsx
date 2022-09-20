import { UnassignOverdueBountyBtn } from "./buttons/UnassignOverdueBountyBtn";

export const UnassignBounty = ({
  realm,
  bountyPK,
}: {
  realm: string;
  bountyPK: string;
}) => {
  return (
    <div className="flex flex-col gap-y-1">
      <UnassignOverdueBountyBtn realm={realm} bountyPK={bountyPK} />
      <div className="text-xs px-2">
        This is to protect DAO against flaky contributor. Bounty creator can
        trigger this if assignee fails to submit work within{" "}
        <code className="bg-slate-100 rounded-md">
          bounty.taskSubmissionWindow
        </code>{" "}
        (in seconds) since{" "}
        <code className="bg-slate-100 rounded-md">submission.assignedAt</code>{" "}
        (epoch seconds). Assignee's reputation will be deducted.
      </div>
    </div>
  );
};
