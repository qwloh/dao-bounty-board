import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { getBountyActivities, getBountySubmissions } from "../../api";
import { useAnchorContext } from "../useAnchorContext";

export const useBountySubmissions = (bountyPK: string) => {
  // check bountyPK is valid public key

  const { program } = useAnchorContext();

  return useQuery(
    ["bounty-submissions", bountyPK],
    async () => {
      console.log("[UseBountySubmissions] getBountySubmissions run");
      const submissions = await getBountySubmissions(
        program,
        new PublicKey(bountyPK)
      );
      const sortedSubmissions = submissions.sort(
        // descending
        (a, b) => b.account.submissionIndex - a.account.submissionIndex
      );
      return sortedSubmissions;
    },
    {
      enabled: !!program,
      // for use by global onError
      meta: {
        hookName: "UseBountySubmissions",
        methodName: "getBountySubmissions",
      },
    }
  );
};
