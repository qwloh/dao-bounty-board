import { PublicKey } from "@solana/web3.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBounty } from "../../api";
import { useAnchorContext } from "../useAnchorContext";

export const useBounty = (bountyPK: string) => {
  // check bountyPK is valid public key

  const { program } = useAnchorContext();
  const queryClient = useQueryClient();

  const queryResult = useQuery(
    ["bounty", bountyPK],
    async () => {
      console.log("[UseBounty] getBounty run");
      return getBounty(program, new PublicKey(bountyPK));
    },
    {
      enabled: !!program && !!bountyPK,
      // for use by global onError
      meta: {
        hookName: "UseBounty",
        methodName: "getBounty",
      },
    }
  );

  const flushDeletedBounty = (bountyPK: string) => {
    queryClient.removeQueries(["bounty", bountyPK]);
  };

  return {
    ...queryResult,
    flushDeletedBounty,
  };
};
