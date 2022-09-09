import { useQuery } from "@tanstack/react-query";
import { RealmProposalEntity, UserRealm } from "../../api/realm";
import { useAnchorContext } from "../useAnchorContext";
import { useRealmProposalEntities } from "./useRealmProposalEntities";
import { useUserRealms } from "./useUserRealms";

export interface UserProposalEntity extends RealmProposalEntity, UserRealm {}

export const useUserProposalEntitiesInRealm = (
  // can be symbol or address
  realm: string
) => {
  const { wallet } = useAnchorContext();
  const { data: realmProposalEntities } = useRealmProposalEntities(realm);
  const { data: userRealms } = useUserRealms();

  const realmPK =
    realmProposalEntities && realmProposalEntities[0].realm.toString();

  return useQuery(
    ["user-proposal-entities-in-realm", realmPK, wallet?.publicKey],
    () => {
      console.log(
        "[UseUserProposalEntitiesInRealm] getUserProposalEntitiesInRealm run"
      );
      if (!realmProposalEntities?.length || !Object.keys(userRealms).length)
        return [];

      if (!userRealms[realmPK]) return [];

      return userRealms[realmPK].map((data) => {
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
      enabled: !!wallet && !!realmProposalEntities && !!userRealms,
      // for use by global onError
      meta: {
        hookName: "UseUserProposalEntitiesInRealm",
        methodName: "getUserProposalEntitiesInRealm",
      },
    }
  );
};
