import { useBountyApplications } from "../../../hooks/bounty/useBountyApplications";
import { BountyApplicationStatus } from "../../../model/bounty-application.model";
import { _toSentenceCase } from "../../../utils/str-transform";

const statusColor: Record<keyof typeof BountyApplicationStatus, string> = {
  notAssigned: "blue",
  assigned: "violet",
};

export const BountyApplications = ({ bountyPK }: { bountyPK: string }) => {
  const { data: bountyApplications, isLoading } =
    useBountyApplications(bountyPK);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="font-bold">Applications</div>
      {isLoading && <div>Loading...</div>}
      {!isLoading && !bountyApplications?.length && (
        <div className="text-slate-800">No applications yet</div>
      )}
      {!!bountyApplications?.length &&
        bountyApplications.map((a) => (
          <div
            key={a.pubkey.toString()}
            className="bg-slate-100 rounded-lg p-2 flex flex-col gap-y-2"
          >
            <div>
              <p>Application object address</p>
              <p className="text-slate-800 break-words">
                {a.pubkey.toString()}
              </p>
            </div>
            <div className="flex gap-x-2 items-center">
              <p>Status</p>
              <div
                className={`p-1 rounded-md bg-${
                  statusColor[a.account.status]
                }-100 text-${statusColor[a.account.status]}-400`}
              >
                {_toSentenceCase(a.account.status)}
              </div>
            </div>
            <p className="break-words">{JSON.stringify(a.account)}</p>
            {/* possible to pull applicant's resume in DAO here */}
          </div>
        ))}
    </div>
  );
};
