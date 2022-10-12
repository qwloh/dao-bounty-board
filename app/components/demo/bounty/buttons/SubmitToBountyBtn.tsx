import { useSubmitToBounty } from "../../../../hooks/bounty/useSubmitToBounty";
import { MutationStateWrapper } from "../../MutationStateWrapper";

export const SubmitToBountyBtn = ({
  realm,
  bountyPK,
  linkToSubmission,
}: {
  realm: string;
  bountyPK: string;
  linkToSubmission: string;
}) => {
  const {
    enabled,
    instructionToEnable,
    mutate: submitToBounty,
    isLoading,
    status,
  } = useSubmitToBounty(realm, bountyPK, {
    // UI based actions. Logging and refetching necessary data is already taken care of in the hook
    onSuccess: () => {},
    onError: () => {},
  });

  const handleSubmitToBounty = () => {
    submitToBounty(linkToSubmission);
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
        onClick={handleSubmitToBounty}
        disabled={!enabled}
      >
        Submit to Bounty
      </button>
    </MutationStateWrapper>
  );
};
