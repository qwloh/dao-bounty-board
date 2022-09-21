import { useDeleteBounty } from "../../../../hooks/bounty/useDeleteBounty";
import { ButtonWrapper } from "../../ButtonWrapper";

export const DeleteBountyBtn = ({
  realm,
  bountyPK,
}: {
  realm: string;
  bountyPK: string;
}) => {
  const {
    enabled,
    instructionToEnable,
    mutate: deleteBounty,
    isLoading,
    status,
  } = useDeleteBounty(realm, bountyPK, {
    // UI based actions. Logging and refetching necessary data is already taken care of in the hook
    onSuccess: () => {},
    onError: () => {},
  });

  const handleDeleteBounty = () => {
    deleteBounty();
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
            ? "border-rose-400 bg-rose-100 text-rose-400"
            : "border-slate-400 bg-slate-100 text-slate-400"
        }
      `}
        onClick={handleDeleteBounty}
        disabled={!enabled}
      >
        Delete bounty
      </button>
    </ButtonWrapper>
  );
};
