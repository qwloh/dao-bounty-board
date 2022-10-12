import { useQuery } from "@tanstack/react-query";
import { getContributorRecords } from "../../api";
import { useRealm } from "../realm/useRealm";
import { useAnchorContext } from "../useAnchorContext";

export const _useContributorRecordsByRealm = (
  // can be either address or symbol
  realm: string
) => {
  const { connection, program } = useAnchorContext();
  const { data: realmAccount } = useRealm(realm);

  return useQuery(
    ["contributors", realmAccount?.pubkey + ""],
    async () => {
      console.log("[_useContributorsByRealm] getContributorRecords run");
      return getContributorRecords(connection, program, realmAccount?.pubkey);
    },
    {
      enabled: !!program && !!realmAccount,
      // for use by global onError
      meta: {
        hookName: "_useContributorsByRealm",
        methodName: "getContributorRecords",
      },
    }
  );
};
