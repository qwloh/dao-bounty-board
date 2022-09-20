import { useAssignBounty } from "../../../../hooks/bounty/useAssignBounty";

export const AssignBountyBtn = ({
  realm,
  bountyPK,
  bountyApplicationPK,
}: {
  realm: string;
  bountyPK: string;
  bountyApplicationPK: string;
}) => {
  const {
    mutate: assign,
    isLoading,
    data,
  } = useAssignBounty(realm, bountyPK, {
    // UI based actions. Logging and refetching necessary data is already taken care of in the hook
    onSuccess: () => {},
    onError: () => {},
  });

  const handleAssign = () => {
    assign(bountyApplicationPK);
  };

  return (
    <div className="flex flex-col gap-y-2 items-start">
      <button
        className="border border-violet-400 bg-violet-100 text-violet-400 rounded-lg py-1 px-3"
        onClick={handleAssign}
      >
        Assign Bounty
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
