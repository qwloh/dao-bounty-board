import { getRealms } from "@solana/spl-governance";
import { PublicKey } from "@solana/web3.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GOVERNANCE_PROGRAM_ID } from "../../api/constants";
import { RealmInfoAsJSON, UIRealmsItem } from "../../model/realm.model";
import { useAnchorContext } from "../useAnchorContext";
import realmInfos from "../../public/realms/devnet.json";
import { getAllBountyBoards } from "../../api";
import { getUserRealms } from "../../api/realm";
import { _toMap } from "../../utils/data-transform";

export const useRealms = () => {
  const queryClient = useQueryClient();
  const { connection, program, wallet } = useAnchorContext();

  return useQuery(
    ["realm-all"],
    async () => {
      console.log("[UseRealms] getUiRealms run");

      const realms = await getRealms(
        connection,
        new PublicKey(GOVERNANCE_PROGRAM_ID)
      ); // support only the non testnet program

      const realmInfoMap = _toMap<RealmInfoAsJSON>(
        realmInfos,
        (rInfo) => rInfo.realmId
      );

      const bountyBoards = await getAllBountyBoards(connection, program);
      const bountyBoardMap = _toMap(
        bountyBoards,
        (b) => b.account.realm.toString(),
        (b) => b.pubkey
      );

      const userRealms = await getUserRealms(connection, wallet.publicKey);

      const uiRealms: UIRealmsItem[] = [];

      for (const realm of realms) {
        const realmPkStr = realm.pubkey.toString();
        const realmInfo = realmInfoMap[realmPkStr];
        const bountyBoard = bountyBoardMap[realmPkStr];
        const userIdentities = userRealms[realmPkStr] || [];

        const uiRealmsItem = {
          pubkey: realm.pubkey,
          name: realm.account.name,
          votingProposalCount: realm.account.votingProposalCount,
          meta: realmInfo,
          bountyBoard,
          userIdentities,
        };
        // push to uiRealms
        uiRealms.push(uiRealmsItem);

        // build symbol-address mapping for DAOs with metadata
        if (realmInfo?.symbol) {
          queryClient.setQueryData(["realm-mapping", realmInfo.symbol], {
            realmPubkeyStr: realmPkStr,
            realmInfo,
          });
        }

        // data normalization
        // queryClient.setQueryData(["realm", realmPkStr], uiRealmsItem);
        // cannot do this as it will block all processes and cause app to hang
      }

      console.log(`[UseRealms] ${uiRealms.length} realms found.`);

      return uiRealms; // don't care about sorting at this level
    },
    {
      enabled: !!connection && !!program && !!realmInfos,
      // for use by global onError
      meta: {
        hookName: "UseRealms",
        methodName: "getUiRealms",
      },
    }
  );
};
