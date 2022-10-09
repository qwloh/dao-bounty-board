import { useContributorRecord } from "../../../hooks/contributor-record/useContributorRecord";

interface ContributorRecordArgs {
  realm: string;
  walletOrContributorRecordPK: {
    walletPK?: string;
    contributorRecordPK?: string;
  };
}

export const ContributorRecord = ({
  realm,
  walletOrContributorRecordPK,
}: ContributorRecordArgs) => {
  const { data: contributorRecord, isLoading } = useContributorRecord(
    realm,
    walletOrContributorRecordPK
  );

  const { walletPK, contributorRecordPK } = walletOrContributorRecordPK;

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {!isLoading && !contributorRecord?.account && (
        <div className="text-slate-800">
          Record does not exist for{" "}
          {walletPK ? `wallet ${walletPK}` : contributorRecordPK} in this realm
        </div>
      )}
      {contributorRecord?.account && (
        <div className="flex flex-col gap-y-2">
          <div className="grid grid-cols-[max-content_1fr] gap-x-2 items-start">
            <p>Record address</p>
            <p className="text-slate-800 break-words min-w-0">
              {contributorRecord?.pubkey + ""}
            </p>
            <p>Associated wallet</p>
            <p className="text-slate-800 break-words min-w-0">
              {contributorRecord?.account?.associatedWallet + ""}
            </p>
            <p>Reputation</p>
            <p className="text-slate-800 break-words min-w-0">
              {contributorRecord?.account.reputation.toNumber()}
            </p>
          </div>
          <p className="break-words">{JSON.stringify(contributorRecord)}</p>
        </div>
      )}
    </>
  );
};
