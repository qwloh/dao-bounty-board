import { useUnassignOverdueBounty } from "../../../../hooks/bounty/useUnassignOverdueBounty";
import { ButtonWrapper } from "../../ButtonWrapper";

export const UnassignOverdueBountyBtn = ({
  realm,
  bountyPK,
}: {
  realm: string;
  bountyPK: string;
}) => {
  const {
    enabled,
    instructionToEnable,
    mutate: unassignOverdue,
    isLoading,
    status,
  } = useUnassignOverdueBounty(realm, bountyPK, {
    // UI based actions. Logging and refetching necessary data is already taken care of in the hook
    onSuccess: () => {},
    onError: () => {},
  });

  const handleUnassignOverdueBounty = () => {
    unassignOverdue();
  };

  return (
    <ButtonWrapper
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
        onClick={handleUnassignOverdueBounty}
        disabled={!enabled}
      >
        Unassign Bounty
      </button>
    </ButtonWrapper>
  );
};
