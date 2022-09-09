import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { getContributorRecord } from "../../api";
import { useAnchorContext } from "../useAnchorContext";

export const useContributorRecord = (contributorRecordPK: string) => {
  const { program } = useAnchorContext();
  return useQuery(
    ["contributor-record", contributorRecordPK],
    async () => {
      console.log(
        "[UseContributorRecord] getContributorRecord run",
        contributorRecordPK
      );
      const pubkey = new PublicKey(contributorRecordPK);
      const account = await getContributorRecord(program, pubkey);
      return {
        pubkey,
        account,
      };
    },
    {
      enabled: !!program && !!contributorRecordPK,
      // for use by global onError
      meta: {
        hookName: "UseContributorRecord",
        methodName: "getContributorRecord",
      },
    }
  );
};
