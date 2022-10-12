import { useQuery } from "@tanstack/react-query";
import { RealmInfoAsJSON } from "../../model/realm.model";
import devnetRealms from "../../public/realms/devnet.json";

export const useRealmInfos = () => {
  return useQuery(
    ["realms-metadata"],
    () => {
      console.log("[UseRealmInfos] getCertifiedRealmInfos run");
      return devnetRealms as RealmInfoAsJSON[];
    },
    {
      // no enabled check needed, should run  regardless if user has connected wallet
      // for use by global onError
      meta: {
        hookName: "UseRealmInfos",
        methodName: "getCertifiedRealmInfos",
      },
    }
  );
};
