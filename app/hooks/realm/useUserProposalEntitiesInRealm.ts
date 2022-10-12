import { useQuery } from "@tanstack/react-query";
import { RealmProposalEntity, UserVotingIdentity } from "../../api/realm";
import { useAnchorContext } from "../useAnchorContext";
import { useRealmProposalEntities } from "./useRealmProposalEntities";
import { useUserRealms } from "./useUserRealms";

export interface UserProposalEntity
  extends RealmProposalEntity,
    UserVotingIdentity {}

export const useUserProposalEntitiesInRealm = (
  // can be symbol or address
  realm: string
) => {
  const { wallet, walletConnected } = useAnchorContext();
  const { data: realmProposalEntities } = useRealmProposalEntities(realm);
  const { data: userRealms } = useUserRealms();

  const realmPK =
    realmProposalEntities && realmProposalEntities[0].realm.toString();

  return useQuery(
    ["realm", "user-proposal-entities", realmPK, wallet?.publicKey],
    () => {
      console.log(
        "[UseUserProposalEntitiesInRealm] getUserProposalEntitiesInRealm run"
      );

      if (!realmProposalEntities?.length || !userRealms?.length) return []; // redundant guard against data not ready

      const relevantUserRealm = userRealms.find(
        (r) => r.pubkey.toString() === realmPK
      );
      if (!relevantUserRealm) return [];

      return relevantUserRealm.userIdentities.map((data) => {
        // merge fields from the two hooks
        const correspondingRealmProposalEntities = realmProposalEntities.find(
          (pe) =>
            pe.governingTokenMint.toString() ===
            data.governingTokenMint.toString()
        );
        return {
          ...data,
          ...correspondingRealmProposalEntities,
        };
      });
    },
    {
      enabled: !!walletConnected && !!realmProposalEntities && !!userRealms,
      // for use by global onError
      meta: {
        hookName: "UseUserProposalEntitiesInRealm",
        methodName: "getUserProposalEntitiesInRealm",
      },
    }
  );
};
