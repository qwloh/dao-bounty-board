import { PublicKey } from "@solana/web3.js";
import { useContributorRecord } from "../../../hooks/contributor-record/useContributorRecord";

export const ContributorRecord = ({
  realm,
  walletPK,
}: {
  realm: string;
  walletPK: PublicKey;
}) => {
  const { data: contributorRecord, isLoading } = useContributorRecord(
    realm,
    walletPK
  );
  return (
    <>
      {isLoading && <div>Loading...</div>}
      {!isLoading && !contributorRecord?.account && (
        <div className="text-slate-800">
          Record does not exist for wallet {walletPK + ""} in this realm
        </div>
      )}
      {contributorRecord?.account && (
        <div className="flex flex-col gap-y-2">
          <div className="grid grid-cols-[max-content_1fr] gap-x-2 items-center">
            <p>Record address</p>
            <p className="text-slate-800 break-words">
              {contributorRecord?.pubkey + ""}
            </p>
            <p>Associated wallet</p>
            <p className="text-slate-800 break-words">{walletPK + ""}</p>
            <p>Reputation</p>
            <p className="text-slate-800 break-words">
              {contributorRecord?.account.reputation.toNumber()}
            </p>
          </div>
          <p className="break-words">{JSON.stringify(contributorRecord)}</p>
        </div>
      )}
    </>
  );
};
