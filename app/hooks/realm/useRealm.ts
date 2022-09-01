import { isValidPublicKeyAddress } from "@metaplex-foundation/js-next";
import { getRealm } from "@solana/spl-governance";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAnchorContext } from "../useAnchorContext";
import { useRealmInfos } from "./useRealmInfos";

export const useRealm = (
  // can be symbol or address
  realm: string
) => {
  const { provider } = useAnchorContext();
  const { data: realmInfos } = useRealmInfos();

  // use this to prevent running `isValidPublicKeyAddress` & filtering realmInfos every time this hook re-renders
  // may still run if hook gets unmounted and re-mounted tho (?)
  const [realmPubkeyStr, realmInfo] = useMemo(() => {
    console.log("[UseMemo] get realmPubkeyStr run", realm, realmInfos?.length);

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

    return [realmPubkeyStr, realmInfo];
  }, [realm, realmInfos?.length]);

  const queryResult = useQuery(
    ["realm", realmPubkeyStr],
    async () => {
      console.log("[UseRealm] getRealm run");
      return getRealm(provider.connection, new PublicKey(realmPubkeyStr));
    },
    {
      enabled: !!provider && !!realmPubkeyStr,
    }
  );

  return {
    ...queryResult,
    data: queryResult.data
      ? {
          ...queryResult.data,
          metadata: realmInfo,
        }
      : queryResult.data,
  };
};
