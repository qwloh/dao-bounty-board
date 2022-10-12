import { useState } from "react";
import { AssignBountyBtn } from "./buttons/AssignBountyBtn";

export const AssignBounty = ({
  realm,
  bountyPK,
}: {
  realm: string;
  bountyPK: string;
}) => {
  const [applicationToAssign, setApplicationToAssign] = useState("");

  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex flex-col gap-y-2">
        <input
          type="text"
          placeholder="Address of application to assign"
          className="bg-slate-100 border-slate-400 text-slate-400 rounded-lg p-2 flex-1"
          onChange={(e) => setApplicationToAssign(e.currentTarget.value)}
        />
        <AssignBountyBtn
          realm={realm}
          bountyPK={bountyPK}
          bountyApplicationPK={applicationToAssign}
        />
      </div>
      <div className="text-xs px-2">Assign bounty to one of the applicants</div>
    </div>
  );
};
