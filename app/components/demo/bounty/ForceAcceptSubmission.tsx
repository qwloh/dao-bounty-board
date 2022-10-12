export const ForceAcceptSubmission = ({
  realm,
  bountyPK,
}: {
  realm: string;
  bountyPK: string;
}) => {
  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex flex-col gap-y-2">
        <button className="border border-slate-400 bg-slate-100 text-slate-400 rounded-lg py-1 px-3">
          Force Accept submission
        </button>
      </div>
      <div className="text-xs px-2 whitespace-pre-wrap">
        This is to protect contributor against irresponsible DAO bounty creator.
        Contributor can trigger this if bounty creator/reviewer hasn't respond
        to submission after{" "}
        <code className="bg-slate-100 rounded-md">
          bounty.submissionReviewWindow
        </code>{" "}
        (in seconds) since{" "}
        <code className="bg-slate-100 rounded-md">submission.updatedAt</code>{" "}
        (epoch seconds). Payout will be automatically made to contributor.
        **Methods for Chris to practice, not ready yet
      </div>
    </div>
  );
};
