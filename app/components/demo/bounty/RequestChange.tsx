import { useState } from "react";
import { RequestChangeBtn } from "./buttons/RequestChangeBtn";

export const RequestChange = ({
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
        <RequestChangeBtn realm={realm} bountyPK={bountyPK} comment={comment} />
      </div>
      <div className="text-xs px-2">
        Request change to assignee's submission. Can do up to 3 times, then will
        have to decide either to reject or accept.
      </div>
    </div>
  );
};
