import { isValidPublicKeyAddress } from "@metaplex-foundation/js-next";
import { getRealm } from "@solana/spl-governance";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useAnchorContext } from "../useAnchorContext";
import { useRealmInfos } from "./useRealmInfos";

export const useRealm = (
  // can be symbol or address
  realm: string
) => {
  const { connection } = useAnchorContext();
  const { data: realmInfos } = useRealmInfos();

  // use react-query for caching instead of useMemo
  // since only a single cache will be created for multiple hooks call
  // TODO: think of a better solution
  const { data: mapped } = useQuery(
    ["realm-mapping", realm],
    () => {
      console.log(
        "[UseRealm] get realmPubkeyStr run",
        realm,
        realmInfos?.length
      );

      let realmPubkeyStr;
      let realmInfo;

      if (isValidPublicKeyAddress(realm)) {
        realmInfo =
          realmInfos && realmInfos.find((r) => r.realmId.toString() === realm);
        realmPubkeyStr = realm;
      } else {
        realmInfo =
          realmInfos && realmInfos.find((r) => r.symbol.toString() === realm);
        realmPubkeyStr = realmInfo && realmInfo?.realmId.toString();
      }

      return { realmPubkeyStr, realmInfo };
    },
    {
      enabled: !!connection && !!realmInfos?.length,
    }
  );

  return useQuery(
    ["realm", mapped?.realmPubkeyStr],
    async () => {
      console.log("[UseRealm] getRealm run");
      const { realmPubkeyStr, realmInfo } = mapped;
      const res = await getRealm(connection, new PublicKey(realmPubkeyStr));
      return { ...res, metadata: realmInfo };
    },
    {
      enabled: !!connection && !!mapped,
      // for use by global onError
      meta: {
        hookName: "UseRealm",
        methodName: "getRealm",
      },
    }
  );
};
