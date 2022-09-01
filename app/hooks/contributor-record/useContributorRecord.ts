import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { getContributorRecord } from "../../api";
import { useAnchorContext } from "../useAnchorContext";

export const useContributorRecord = (contributorRecordPK: string) => {
  const { program } = useAnchorContext();
  return useQuery(
    ["contributor-record", contributorRecordPK],
    () => {
      console.log("[UseContributorRecord] getContributorRecord run");
      return getContributorRecord(program, new PublicKey(contributorRecordPK));
    },
    {
      enabled: !!program,
    }
  );
};
