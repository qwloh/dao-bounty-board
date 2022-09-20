import { useRequestChangesToSubmission } from "../../../../hooks/bounty/useRequestChangesToSubmission";

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
    mutate: requestChange,
    isLoading,
    data,
  } = useRequestChangesToSubmission(realm, bountyPK, {
    // UI based actions. Logging and refetching necessary data is already taken care of in the hook
    onSuccess: () => {},
    onError: () => {},
  });

  const handleRequestChange = () => {
    requestChange(comment);
  };

  return (
    <div className="flex flex-col gap-2 items-start">
      <button
        className="border border-violet-400 bg-violet-100 text-violet-400 rounded-lg py-1 px-3"
        onClick={handleRequestChange}
      >
        Request Change
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
