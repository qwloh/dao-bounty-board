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
    enabled,
    instructionToEnable,
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
        className={`border rounded-lg py-1 px-3
${
  enabled
    ? "border-violet-400 bg-violet-100 text-violet-400"
    : "border-slate-400 bg-slate-100 text-slate-400"
}
        `}
        onClick={handleApplyToBounty}
        disabled={!enabled}
      >
        Apply To Bounty
      </button>
      {/* On disable */}
      {instructionToEnable && (
        <div className="bg-rose-100 rounded-lg text-xs text-rose-400 py-1 px-3">
          {instructionToEnable}
        </div>
      )}
      {/* On sending */}
      {isLoading && "Sending..."}
      {/* On success */}
      {data && (
        <div className="bg-green-100 rounded-lg text-xs text-green-500 py-1 px-3">
          Success.
        </div>
      )}
    </div>
  );
};
