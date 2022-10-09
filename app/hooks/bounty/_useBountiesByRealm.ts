import { useQuery } from "@tanstack/react-query";
import { getBounties } from "../../api";
import { useBountyBoardByRealm } from "../bounty-board/useBountyBoardByRealm";
import { useAnchorContext } from "../useAnchorContext";

export const _useBountiesByRealm = (
  // can be either address or symbol
  realm: string
) => {
  const { connection, program } = useAnchorContext();
  const { data: bountyBoard } = useBountyBoardByRealm(realm);

  return useQuery(
    ["bounties", bountyBoard?.account?.realm + ""],
    async () => {
      console.log("[_useBountiesByRealm] getBounties run");
      return getBounties(connection, program, bountyBoard?.pubkey);
    },
    {
      enabled: !!program && !!bountyBoard,
      // for use by global onError
      meta: {
        hookName: "_useBountiesByRealm",
        methodName: "getBounties",
      },
    }
  );
};
