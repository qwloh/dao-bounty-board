import { RejectStaleSubmissionBtn } from "./buttons/RejectStaleSubmissionBtn";

export const RejectStaleSubmission = ({
  realm,
  bountyPK,
}: {
  realm: string;
  bountyPK: string;
}) => {
  return (
    <div className="flex flex-col gap-y-1">
      <RejectStaleSubmissionBtn
        realm={realm}
        bountyPK={bountyPK}
        comment={""}
      />
      <div className="text-xs px-2">
        This is also to protect DAO if contributor does not follow through the
        change request. Bounty creator can trigger this if assignee has not
        addressed change requested within{" "}
        <code className="bg-slate-100 rounded-md">
          bounty.addressChangeReqWindow
        </code>{" "}
        (seconds) since{" "}
        <code className="bg-slate-100 rounded-md">
          submission.changeRequestedAt
        </code>{" "}
        (epoch seconds). Assignee's reputation will be deducted.
      </div>
    </div>
  );
};
