import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { getBountyBoard } from "../../api";
import { getBountyBoardAddress } from "../../api/utils";
import { useRealm } from "../realm/useRealm";
import { useAnchorContext } from "../useAnchorContext";

export const useBountyBoardByRealm = (
  // can be symbol or address
  realm: string
) => {
  const { program } = useAnchorContext();
  const { data: realmAccount } = useRealm(realm);

  return useQuery(
    ["bounty-board", realmAccount?.pubkey],
    async () => {
      console.log("[UseBountyBoardByRealm] getBountyBoard run");
      const [bountyBoardPubkey] = await getBountyBoardAddress(
        realmAccount?.pubkey
      );
      console.log(
        "[UseBountyBoardByRealm] Bounty board pub key",
        bountyBoardPubkey.toString()
      );
      return getBountyBoard(program, new PublicKey(bountyBoardPubkey));
    },
    {
      enabled: !!program && !!realmAccount,
      // for use by global onError
      meta: {
        hookName: "UseBountyBoardByRealm",
        methodName: "getBountyBoard",
      },
    }
  );
};
