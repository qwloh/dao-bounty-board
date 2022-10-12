import { useRejectSubmission } from "../../../../hooks/bounty/useRejectSubmission";
import { MutationStateWrapper } from "../../MutationStateWrapper";

export const RejectSubmissionBtn = ({
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
    mutate: rejectSubmission,
    isLoading,
    status,
  } = useRejectSubmission(realm, bountyPK, {
    // UI based actions. Logging and refetching necessary data is already taken care of in the hook
    onSuccess: () => {},
    onError: () => {},
  });

  const handleRejectSubmission = () => {
    rejectSubmission(comment);
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
        onClick={handleRejectSubmission}
        disabled={!enabled}
      >
        Reject Submission
      </button>
    </MutationStateWrapper>
  );
};
