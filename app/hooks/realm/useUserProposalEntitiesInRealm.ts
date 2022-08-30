import { useMemo } from "react";
import { useRealmProposalEntities } from "./useRealmProposalEntities";
import { useUserRealms } from "./useUserRealms";

export const useUserProposalEntitiesInRealm = (
  // can be symbol or address
  realm: string
) => {
  const { data: realmProposalEntities } = useRealmProposalEntities(realm);
  const { data: userRealms } = useUserRealms();

  const userProposalEntitiesInRealm = useMemo(() => {
    console.log(
      "[UseMemo] getUserProposalEntitiesInRealm run",
      realmProposalEntities,
      userRealms
    );
    if (!realmProposalEntities?.length || !Object.keys(userRealms).length)
      return [];

    const realmPK = realmProposalEntities[0].realm.toString();

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
  }, [realmProposalEntities, userRealms]);

  console.log(
    "[UseUserProposalEntitiesInRealm] rendered",
    userProposalEntitiesInRealm?.length
  );

  return userProposalEntitiesInRealm;
};
