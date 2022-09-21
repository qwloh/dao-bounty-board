import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { getContributorRecord } from "../../api";
import { getContributorRecordAddress } from "../../api/utils";
import { useBountyBoardByRealm } from "../bounty-board/useBountyBoardByRealm";
import { useAnchorContext } from "../useAnchorContext";

export const useContributorRecord = (realm: string, walletPK: string) => {
  const { program } = useAnchorContext();
  const { data: bountyBoard } = useBountyBoardByRealm(realm);

  return useQuery(
    ["contributor-record", realm, walletPK],
    async () => {
      console.log("[UseContributorRecord] getContributorRecord run", walletPK);
      const walletPubkey = new PublicKey(walletPK);
      const [contributorRecordPK] = await getContributorRecordAddress(
        bountyBoard.pubkey,
        walletPubkey
      );
      const account = await getContributorRecord(program, contributorRecordPK);
      return {
        pubkey: contributorRecordPK,
        account,
      };
    },
    {
      enabled: !!program && !!walletPK && !!bountyBoard,
      // for use by global onError
      meta: {
        hookName: "UseContributorRecord",
        methodName: "getContributorRecord",
      },
    }
  );
};
