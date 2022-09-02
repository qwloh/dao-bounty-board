import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getBountyBoard } from "../../api";
import { getBountyBoardAddress } from "../../api/utils";
import { useRealm } from "../realm/useRealm";
import { useAnchorContext } from "../useAnchorContext";

export const useBountyBoardByRealm = (
  // can be symbol or address
  realm: string
) => {
  const { program } = useAnchorContext();
  const { data: realmAccount } = useRealm(realm);
  const [bountyBoardPubkey, setBountyBoardPubkey] = useState(undefined);

  useEffect(() => {
    if (!realmAccount?.pubkey) return;
    console.log(
      "[UseBountyBoardByRealm] getBountyBoardAddress run",
      realmAccount?.pubkey + ""
    );
    getBountyBoardAddress(realmAccount?.pubkey).then(([pda]) =>
      setBountyBoardPubkey(pda.toString())
    );
  }, [realmAccount?.pubkey + ""]);

  return useQuery(
    ["bounty-board", bountyBoardPubkey],
    () => {
      console.log("UseBountyBoardByRealm] getBountyBoard run");
      return getBountyBoard(program, new PublicKey(bountyBoardPubkey));
    },
    {
      enabled: !!program && !!bountyBoardPubkey,
    }
  );
};
