import { useRequestChangesToSubmission } from "../../../../hooks/bounty/useRequestChangesToSubmission";
import { ButtonWrapper } from "../../ButtonWrapper";

export const RequestChangeBtn = ({
  realm,
  bountyPK,
  comment,
}: {
  realm: string;
  bountyPK: string;
  comment: string;
}) => {
  const {
    enabled,
    instructionToEnable,
    mutate: requestChange,
    isLoading,
    status,
  } = useRequestChangesToSubmission(realm, bountyPK, {
    // UI based actions. Logging and refetching necessary data is already taken care of in the hook
    onSuccess: () => {},
    onError: () => {},
  });

  const handleRequestChange = () => {
    requestChange(comment);
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
        onClick={handleRequestChange}
        disabled={!enabled}
      >
        Request Change
      </button>
    </ButtonWrapper>
  );
};
