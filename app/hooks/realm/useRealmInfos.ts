import { useQuery } from "@tanstack/react-query";

import { getCertifiedRealmInfos } from "../../api";
import { useAnchorContext } from "../useAnchorContext";

export const useRealmInfos = () => {
  const { provider } = useAnchorContext();

  return useQuery(
    ["realms-metadata"],
    // () => getRealms(provider.connection, new PublicKey(GOVERNANCE_PROGRAM_ID)),
    () => getCertifiedRealmInfos("devnet"),
    {
      enabled: !!provider,
    }
  );
};
