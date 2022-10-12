import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { createBounty } from "../../api";
import { Skill } from "../../model/bounty.model";
import { CallbacksForUI } from "../../model/util.model";
import { useBountyBoardByRealm } from "../bounty-board/useBountyBoardByRealm";
import { useAnchorContext } from "../useAnchorContext";
import { _useBountiesByRealm } from "./_useBountiesByRealm";

export interface CreateBountyArgs {
  title: string;
  description: string;
  skill: Skill;
  tier: string;
}

export const useCreateBounty = (
  // can be symbol or address
  realm: string,
  callbacks: CallbacksForUI = { onSuccess: undefined, onError: undefined }
) => {
  const { program, walletConnected } = useAnchorContext();
  const {
    data: bountyBoard,
    refetch: refetchBountyBoard,
    isLoading: isLoadingBountyBoard,
  } = useBountyBoardByRealm(realm);
  const { refetch: refetchBounties } = _useBountiesByRealm(realm);

  const { enabled, instructionToEnable } = useMemo(() => {
    if (!walletConnected)
      return {
        enabled: false,
        instructionToEnable: "Connect your wallet first",
      };
    if (isLoadingBountyBoard)
      return {
        enabled: false,
        instructionToEnable: "Loading...",
      };
    if (!bountyBoard?.account)
      return {
        enabled: false,
        instructionToEnable:
          "Your realm does not have a bounty board set up. You can submit a proposal to set up one.",
      };

    return { enabled: true };
  }, [walletConnected, bountyBoard?.account]);

  const mutationResult = useMutation(
    (bountyDetails: CreateBountyArgs) =>
      createBounty({
        program,
        // @ts-ignore
        bountyBoard,
        ...bountyDetails,
      }),
    {
      onSuccess: (data, variables, context) => {
        refetchBountyBoard();
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
