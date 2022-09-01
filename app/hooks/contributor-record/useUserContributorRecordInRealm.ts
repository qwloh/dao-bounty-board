import { useQuery } from "@tanstack/react-query";
import { getContributorRecordAddress } from "../../api/utils";
import { useBountyBoardByRealm } from "../bounty-board/useBountyBoardByRealm";
import { useAnchorContext } from "../useAnchorContext";
import { useContributorRecord } from "./useContributorRecord";

export const useUserContributorRecordInRealm = (
  // could be symbol or address
  realm: string
) => {
  const { wallet } = useAnchorContext();
  const { data: bountyBoard } = useBountyBoardByRealm(realm);

  // use react query to memoize... cuz more effective than useMemo because it's not affected by mounting/unmounting
  const { data: contributorPKStr } = useQuery(
    ["wallet-to-contributor-record", bountyBoard?.pubkey],
    async () => {
      const [contributorRecordPK] = await getContributorRecordAddress(
        bountyBoard.pubkey,
        wallet.publicKey
      );
      const contributorRecordPKStr = contributorRecordPK.toString();
      console.log(
        "[UseUserContributorRecordInRealm] calculated contributor record pk",
        contributorRecordPKStr
      );
      return contributorRecordPKStr;
    },
    {
      enabled: !!wallet && !!bountyBoard,
    }
  );

  return useContributorRecord(contributorPKStr); // null if such record d.n.e.
};
