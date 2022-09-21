import { useApplyToBounty } from "../../../../hooks/bounty/useApplyToBounty";
import { MutationStateWrapper } from "../../MutationStateWrapper";

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
    status,
  } = useApplyToBounty(realm, bountyPK, {
    // UI based actions. Logging and refetching necessary data is already taken care of in the hook
    onSuccess: () => {},
    onError: () => {},
  });

  const handleApplyToBounty = () => {
    apply(validity);
  };

  return (
    <MutationStateWrapper
      enabled={enabled}
      instructionToEnable={instructionToEnable}
      isLoading={isLoading}
      success={status === "success"}
    >
      <button
        className={`border rounded-lg py-1 px-3 ${
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
    </MutationStateWrapper>
  );
};
