import { useApplyToBounty } from "../../../../hooks/bounty/useApplyToBounty";

export const ApplyToBountyBtn = ({
  realm,
  bountyPK,
  validity,
}: {
  realm: string;
  bountyPK: string;
  validity: number;
}) => {
  const {
    mutate: apply,
    isLoading,
    data,
  } = useApplyToBounty(realm, bountyPK, {
    // UI based actions. Logging and refetching necessary data is already taken care of in the hook
    onSuccess: () => {},
    onError: () => {},
  });

  const handleApplyToBounty = () => {
    apply(validity);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        className="border border-violet-400 bg-violet-100 text-violet-400 rounded-lg py-1 px-3"
        onClick={handleApplyToBounty}
      >
        Apply To Bounty
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
