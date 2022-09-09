import { useQuery } from "@tanstack/react-query";
import { getCertifiedRealmInfos } from "../../api";
import { useAnchorContext } from "../useAnchorContext";

export const useRealmInfos = () => {
  const { provider } = useAnchorContext();

  return useQuery(
    ["realms-metadata"],
    // () => getRealms(provider.connection, new PublicKey(GOVERNANCE_PROGRAM_ID)),
    () => {
      console.log("[UseRealmInfos] getCertifiedRealmInfos run");
      return getCertifiedRealmInfos("devnet");
    },
    {
      enabled: !!provider,
      // for use by global onError
      meta: {
        hookName: "UseRealmInfos",
        methodName: "getCertifiedRealmInfos",
      },
    }
  );
};
