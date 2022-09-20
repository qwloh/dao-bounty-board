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
      <div className="flex gap-x-4 items-center">
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
        Reject submission. Can be triggered if assignee's work is still not up
        to standard after 3 rounds of iterations.
      </div>
    </div>
  );
};
