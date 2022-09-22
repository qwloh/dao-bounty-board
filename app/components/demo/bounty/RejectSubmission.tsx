import { useState } from "react";
import { RejectSubmissionBtn } from "./buttons/RejectSubmissionBtn";

export const RejectSubmission = ({
  realm,
  bountyPK,
}: {
  realm: string;
  bountyPK: string;
}) => {
  const [comment, setComment] = useState("");

  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex flex-col gap-y-2">
        <input
          type="text"
          placeholder="Comment"
          className="bg-slate-100 border-slate-400 text-slate-400 rounded-lg p-2 flex-1"
          onChange={(e) => setComment(e.currentTarget.value)}
        />
        <RejectSubmissionBtn
          realm={realm}
          bountyPK={bountyPK}
          comment={comment}
        />
      </div>
      <div className="text-xs px-2">
        Reject submission. A minimum of 3 rounds of "change request-update"
        iteration is needed before this action can be triggered. This is to
        encourage common ground seeking between bounty creator and contributor
        before ultimately rejecting a submission, which is a huge waste of time
        and effort for both the bounty creator and contributor
      </div>
    </div>
  );
};
