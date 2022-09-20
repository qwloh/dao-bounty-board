import { useBountySubmissions } from "../../../hooks/bounty/useBountySubmissions";
import { BountySubmissionState } from "../../../model/bounty-submission.model";
import { _toSentenceCase } from "../../../utils/str-transform";

const statusColor: Record<keyof typeof BountySubmissionState, string> = {
  pendingSubmission: "blue",
  unassignedForOverdue: "rose",
  pendingReview: "violet",
  changeRequested: "orange",
  rejected: "rose",
  rejectedForUnaddressedChangeRequest: "rose",
  accepted: "green",
  forceAccepted: "lime",
};

export const BountySubmissions = ({ bountyPK }: { bountyPK: string }) => {
  const { data: bountySubmissions, isLoading } = useBountySubmissions(bountyPK);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="font-bold">Submissions</div>
      {isLoading && <div>Loading...</div>}
      {!isLoading && !bountySubmissions?.length && (
        <div className="text-slate-800">No submissions yet</div>
      )}
      {!!bountySubmissions?.length &&
        bountySubmissions.map((s) => (
          <div
            key={s.pubkey.toString()}
            className=" bg-slate-100 rounded-lg p-2 flex flex-col gap-y-2"
          >
            <div>
              <p>Submission object address</p>
              <p className="text-slate-800 break-words">
                {s.pubkey.toString()}
              </p>
            </div>
            <div className="flex gap-x-2 items-center">
              <p>Status</p>
              <div
                className={`p-1 rounded-md bg-${
                  statusColor[s.account.state]
                }-100 text-${statusColor[s.account.state]}-400`}
              >
                {_toSentenceCase(s.account.state)}
              </div>
            </div>
            <div className="flex gap-x-2 items-center">
              <p>Link to submission:</p>
              <p className="text-slate-800 break-words">
                {s.account.linkToSubmission || "-"}
              </p>
            </div>
            <p className="break-words">{JSON.stringify(s.account)}</p>
          </div>
        ))}
    </div>
  );
};
