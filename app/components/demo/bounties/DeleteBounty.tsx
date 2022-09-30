import { useState } from "react";
import { DeleteBountyBtn } from "./buttons/DeleteBountyBtn";

export const DeleteBounty = ({ realm }: { realm: string }) => {
  const [bountyToDelete, setBountyToDelete] = useState("");

  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex flex-col gap-y-2">
        <input
          type="text"
          placeholder="Address/Public key of bounty to delete"
          className="bg-slate-100 border-slate-400 text-slate-400 rounded-lg p-2 flex-1"
          onChange={(e) => setBountyToDelete(e.currentTarget.value)}
        />
        <DeleteBountyBtn realm={realm} bountyPK={bountyToDelete} />
      </div>
      <div className="text-xs px-2">
        This operation is not allowed if bounty has already been assigned (to be
        fair to assignee?)
      </div>
    </div>
  );
};
