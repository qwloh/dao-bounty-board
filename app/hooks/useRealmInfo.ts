import { PublicKey } from "@solana/web3.js";
import { useQuery } from "react-query";
import { useRealmInfos } from "./useRealmInfos";

export const useRealmInfo = (realmProgramId: PublicKey) => {
  const { realmInfos } = useRealmInfos();

  const { data: realmInfo } = useQuery(
    ["realm-metadata", realmProgramId],
    () => {
      if (realmInfos && realmProgramId) {
        return realmInfos.find(
          (r) => r.programId.toString() === realmProgramId.toString()
        );
      }
    },
    {
      enabled: !!realmInfos,
    }
  );

  return {
    realmInfo,
  };
};
