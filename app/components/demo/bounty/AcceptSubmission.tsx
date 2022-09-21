import { useState } from "react";

export const AcceptSubmission = ({
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
        <div className="flex flex-col gap-y-2">
          <button className="border border-slate-400 bg-slate-100 text-slate-400 rounded-lg py-1 px-3">
            Accept submission
          </button>
        </div>
      </div>
      <div className="text-xs px-2">
        On trigger, payout will be automatically released to contributor, and
        contributor's reputation and skills point incremented accordingly .
        **Methods for Chris to practice, not ready yet
      </div>
    </div>
  );
};
