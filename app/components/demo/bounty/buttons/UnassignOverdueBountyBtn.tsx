import { useUnassignOverdueBounty } from "../../../../hooks/bounty/useUnassignOverdueBounty";

export const UnassignOverdueBountyBtn = ({
  realm,
  bountyPK,
}: {
  realm: string;
  bountyPK: string;
}) => {
  const {
    mutate: unassignOverdue,
    isLoading,
    data,
  } = useUnassignOverdueBounty(realm, bountyPK, {
    // UI based actions. Logging and refetching necessary data is already taken care of in the hook
    onSuccess: () => {},
    onError: () => {},
  });

  const handleUnassignOverdueBounty = () => {
    unassignOverdue();
  };

  return (
    <div className="flex flex-col gap-y-2">
      <button
        className="border border-violet-400 bg-violet-100 text-violet-400 rounded-lg py-1 px-3"
        onClick={handleUnassignOverdueBounty}
      >
        Unassign Bounty
      </button>
      {isLoading && "Sending..."}
      {data && (
        <div className="bg-green-100 rounded-lg text-xs text-green-500 py-1 px-3">
          Success.
        </div>
      )}
    </div>
  );
};
