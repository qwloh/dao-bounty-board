import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { getBountyBoard, getBountyBoardVaults } from "../../api";
import { getBountyBoardAddress } from "../../api/utils";
import { useRealm } from "../realm/useRealm";
import { useAnchorContext } from "../useAnchorContext";

export const useBountyBoardVaults = (
  // can be symbol or address
  realm: string
) => {
  const { connection } = useAnchorContext();
  const { data: realmAccount } = useRealm(realm);

  return useQuery(
    ["bounty-board", "vaults", realmAccount?.pubkey],
    async () => {
      console.log("[useBountyBoardVaults] getBountyBoardVaults run");
      const [bountyBoardPubkey] = await getBountyBoardAddress(
        realmAccount?.pubkey
      );
      console.log(
        "[useBountyBoardVaults] Bounty board pub key",
        bountyBoardPubkey.toString()
      );
      return getBountyBoardVaults(connection, new PublicKey(bountyBoardPubkey));
    },
    {
      enabled: !!connection && !!realmAccount,
      // for use by global onError
      meta: {
        hookName: "useBountyBoardVaults",
        methodName: "getBountyBoard",
      },
    }
  );
};
