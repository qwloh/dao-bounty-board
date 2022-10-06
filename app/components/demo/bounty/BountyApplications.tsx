import { PublicKey } from "@solana/web3.js";
import { useBountyApplications } from "../../../hooks/bounty/useBountyApplications";
import { useContributorRecord } from "../../../hooks/contributor-record/useContributorRecord";
import { BountyApplicationStatus } from "../../../model/bounty-application.model";
import { _toSentenceCase } from "../../../utils/str-transform";

export const ApplicantRecord = ({
  realm,
  applicantWalletPK,
}: {
  realm: string;
  applicantWalletPK: PublicKey;
}) => {
  const { data: contributorRecord, isLoading } = useContributorRecord(
    realm,
    applicantWalletPK
  );

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {!isLoading && !contributorRecord?.account && (
        <div className="text-slate-800">
          Record does not exist for wallet {applicantWalletPK + ""} in this
          realm
        </div>
      )}
      {contributorRecord?.account && (
        <div className="flex flex-col gap-y-2 p-2 bg-white rounded-lg">
          <p>Applicant "resume"</p>
          <div className="grid grid-cols-[max-content_1fr] gap-x-2 items-center">
            <p>Reputation</p>
            <p className="text-slate-800 break-words">
              {contributorRecord?.account.reputation.toNumber()}
            </p>
            <p>Bounties completed</p>
            <p className="text-slate-800 break-words">
              {contributorRecord?.account.bountyCompleted}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

const statusColor: Record<keyof typeof BountyApplicationStatus, string> = {
  notAssigned: "blue",
  assigned: "violet",
};

export const BountyApplications = ({
  realm,
  bountyPK,
}: {
  realm: string;
  bountyPK: string;
}) => {
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
            key={a.pubkey}
            className="bg-slate-100 rounded-lg p-2 flex flex-col gap-y-2"
          >
            <div>
              <p>Application object address</p>
              <p className="text-slate-800 break-words">{a.pubkey}</p>
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
            <ApplicantRecord
              realm={realm}
              applicantWalletPK={a.account.applicant}
            />
          </div>
        ))}
    </div>
  );
};
