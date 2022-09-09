import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { getBounty } from "../../api";
import { useAnchorContext } from "../useAnchorContext";

export const useBounty = (bountyPK: string) => {
  // check bountyPK is valid public key

  const { program } = useAnchorContext();

  return useQuery(
    ["bounty", bountyPK],
    async () => {
      console.log("[UseBounty] getBounty run");
      return getBounty(program, new PublicKey(bountyPK));
    },
    {
      enabled: !!program,
      // for use by global onError
      meta: {
        hookName: "UseBounty",
        methodName: "getBounty",
      },
    }
  );
};
