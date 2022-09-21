import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { deleteBounty } from "../../api";
import { CallbacksForUI } from "../../model/util.model";
import { useAnchorContext } from "../useAnchorContext";
import { useBountiesByRealm } from "./useBountiesByRealm";
import { useBounty } from "./useBounty";

export const useDeleteBounty = (
  realm: string,
  bountyPK: string,
  callbacks: CallbacksForUI = { onSuccess: undefined, onError: undefined }
) => {
  const { program, walletConnected } = useAnchorContext();
  const { data: bounty, flushDeletedBounty } = useBounty(bountyPK);

  const { data: bounties, refetch: refetchBounties } =
    useBountiesByRealm(realm);

  const { enabled, instructionToEnable } = useMemo(() => {
    if (!walletConnected)
      return {
        enabled: false,
        instructionToEnable: "Connect your wallet first",
      };
    if (!bounties?.length)
      return {
        enabled: false,
        instructionToEnable: "No bounty. Create some bounties first.",
      };
    return { enabled: true };
  }, [walletConnected, bounties?.length]);

  const mutationResult = useMutation(
    () => {
      if (!bountyPK || !bountyPK.trim()) return; // do nothing
      return deleteBounty({
        program,
        bounty: {
          pubkey: new PublicKey(bountyPK),
          // @ts-ignore
          account: bounty,
        },
      });
    },
    {
      onSuccess: (data, variables, context) => {
        flushDeletedBounty(bountyPK);
        refetchBounties();
        if (callbacks?.onSuccess) {
          callbacks.onSuccess(data, variables, context);
        }
      },
      onError: (err, variables, context) => {
        console.error(err);
        if (callbacks?.onError) {
          callbacks?.onError(err, variables, context);
        }
      },
    }
  );

  return {
    enabled,
    instructionToEnable,
    ...mutationResult,
  };
};
