import { useState } from "react";
import { SubmitToBountyBtn } from "./buttons/SubmitToBountyBtn";

export const SubmitToBounty = ({
  realm,
  bountyPK,
}: {
  realm: string;
  bountyPK: string;
}) => {
  const [linkToSubmission, setLinkToSubmission] = useState("");

  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex gap-x-4 items-center">
        <input
          type="text"
          placeholder="Link to submission"
          className="bg-slate-100 border-slate-400 text-slate-400 rounded-lg p-2 flex-1"
          onChange={(e) => setLinkToSubmission(e.currentTarget.value)}
        />
        <SubmitToBountyBtn
          realm={realm}
          bountyPK={bountyPK}
          linkToSubmission={linkToSubmission}
        />
      </div>
      <div className="text-xs px-2">For assignee to submit work</div>
    </div>
  );
};
