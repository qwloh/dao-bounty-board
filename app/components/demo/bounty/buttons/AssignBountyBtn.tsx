import { useAssignBounty } from "../../../../hooks/bounty/useAssignBounty";
import { ButtonWrapper } from "../../ButtonWrapper";

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
    enabled,
    instructionToEnable,
    mutate: assign,
    isLoading,
    status,
  } = useAssignBounty(realm, bountyPK, {
    // UI based actions. Logging and refetching necessary data is already taken care of in the hook
    onSuccess: () => {},
    onError: () => {},
  });

  const handleAssign = () => {
    assign(bountyApplicationPK);
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
        onClick={handleAssign}
        disabled={!enabled}
      >
        Assign Bounty
      </button>
    </ButtonWrapper>
  );
};
