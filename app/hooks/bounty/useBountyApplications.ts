import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { getBounty } from "../../api";
import { getBountyApplications } from "../../api/bounty-application";
import { useAnchorContext } from "../useAnchorContext";

export const useBountyApplications = (bountyPK: string) => {
  // check bountyPK is valid public key

  const { program } = useAnchorContext();

  return useQuery(
    ["bounty-applications", bountyPK],
    async () => {
      console.log("[UseBountyApplications] getBountyApplications run");
      return getBountyApplications(program, new PublicKey(bountyPK));
    },
    {
      enabled: !!program,
      // for use by global onError
      meta: {
        hookName: "UseBountyApplications",
        methodName: "getBountyApplications",
      },
    }
  );
};
