import { useQuery } from "@tanstack/react-query";
import { getBounties } from "../../api";
import { useBountyBoardByRealm } from "../bounty-board/useBountyBoardByRealm";
import { useAnchorContext } from "../useAnchorContext";

export const useBountiesByRealm = (
  // can be either address or symbol
  realm: string
) => {
  const { provider, program } = useAnchorContext();
  const { data: bountyBoard } = useBountyBoardByRealm(realm);

  return useQuery(
    ["bounties", bountyBoard?.account?.realm + ""],
    async () => {
      console.log("[UseBountiesByRealm] getBounties run");
      return getBounties(provider.connection, program, bountyBoard?.pubkey);
    },
    {
      enabled: !!program && !!bountyBoard,
    }
  );
};
