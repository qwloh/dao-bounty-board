import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { getBountyActivities } from "../../api";
import { useAnchorContext } from "../useAnchorContext";

export const useBountyActivities = (bountyPK: string) => {
  // check bountyPK is valid public key

  const { program } = useAnchorContext();

  return useQuery(
    ["bounty-activities", bountyPK],
    async () => {
      console.log("[UseBountyActivities] getBountyActivities run");
      const activities = await getBountyActivities(
        program,
        new PublicKey(bountyPK)
      );
      const sortedActivities = activities.sort(
        // descending
        (a, b) => b.account.activityIndex - a.account.activityIndex
      );
      return sortedActivities;
    },
    {
      enabled: !!program,
    }
  );
};
