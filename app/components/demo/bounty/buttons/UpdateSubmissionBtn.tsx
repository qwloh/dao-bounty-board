import { useUpdateSubmission } from "../../../../hooks/bounty/useUpdateSubmission";

export const UpdateSubmissionBtn = ({
  realm,
  bountyPK,
  linkToSubmission,
}: {
  realm: string;
  bountyPK: string;
  linkToSubmission: string;
}) => {
  const {
    mutate: updateSubmission,
    isLoading,
    data,
  } = useUpdateSubmission(realm, bountyPK, {
    // UI based actions. Logging and refetching necessary data is already taken care of in the hook
    onSuccess: () => {},
    onError: () => {},
  });

  const handleUpdateSubmission = () => {
    updateSubmission(linkToSubmission);
  };

  return (
    <div className="flex flex-col gap-2 items-start">
      <button
        className="border border-violet-400 bg-violet-100 text-violet-400 rounded-lg py-1 px-3"
        onClick={handleUpdateSubmission}
      >
        Update Submission
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