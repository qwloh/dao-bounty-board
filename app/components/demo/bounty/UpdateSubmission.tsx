import { useState } from "react";
import { UpdateSubmissionBtn } from "./buttons/UpdateSubmissionBtn";

export const UpdateSubmission = ({
  realm,
  bountyPK,
}: {
  realm: string;
  bountyPK: string;
}) => {
  const [linkToSubmission, setLinkToSubmission] = useState("");

  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex flex-col gap-y-2">
        <input
          type="text"
          placeholder="Link to submission"
          className="bg-slate-100 border-slate-400 text-slate-400 rounded-lg p-2 flex-1"
          onChange={(e) => setLinkToSubmission(e.currentTarget.value)}
        />
        <UpdateSubmissionBtn
          realm={realm}
          bountyPK={bountyPK}
          linkToSubmission={linkToSubmission}
        />
      </div>
      <div className="text-xs px-2">
        For assignee to update submission or address changes requested
      </div>
    </div>
  );
};
