import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getContributorRecord } from "../../api";
import { getContributorRecordAddress } from "../../api/utils";
import { useBountyBoardByRealm } from "../bounty-board/useBountyBoardByRealm";
import { useAnchorContext } from "../useAnchorContext";

export const useContributorRecord = (
  realm: string,
  {
    walletPK,
    contributorRecordPK,
  }: { walletPK?: string; contributorRecordPK?: string }
) => {
  const { program } = useAnchorContext();
  const { data: bountyBoard } = useBountyBoardByRealm(realm);

  const [contributorRecordPubkey, setContributorRecordPubkey] = useState(
    contributorRecordPK || ""
  );

  useEffect(() => {
    if (bountyBoard?.pubkey && walletPK && !contributorRecordPubkey) {
      getContributorRecordAddress(bountyBoard?.pubkey, new PublicKey(walletPK))
        .then(([pda, bump]) => {
          setContributorRecordPubkey(pda.toString());
        })
        .catch(console.error);
    }
  }, [bountyBoard?.pubkey, walletPK, contributorRecordPK]);

  return useQuery(
    ["contributor-record", contributorRecordPubkey],
    async () => {
      console.log(
        "[UseContributorRecord] getContributorRecord run",
        walletPK,
        contributorRecordPubkey
      );
      const account = await getContributorRecord(
        program,
        new PublicKey(contributorRecordPubkey)
      );
      return {
        pubkey: contributorRecordPubkey,
        account,
      };
    },
    {
      enabled: !!program && !!bountyBoard && !!contributorRecordPubkey,
      // for use by global onError
      meta: {
        hookName: "UseContributorRecord",
        methodName: "getContributorRecord",
      },
    }
  );
};
