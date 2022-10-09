import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { applyToBounty } from "../../api";
import { CallbacksForUI } from "../../model/util.model";
import { useContributorRecord } from "../contributor-record/useContributorRecord";
import { useAnchorContext } from "../useAnchorContext";
import { useBounty } from "./useBounty";
import { useBountyActivities } from "./useBountyActivities";
import { useBountyApplications } from "./useBountyApplications";

export const useApplyToBounty = (
  // can be symbol or string
  realm: string,
  bountyPK: string,
  callbacks: CallbacksForUI = { onSuccess: undefined, onError: undefined }
) => {
  const { provider, program, wallet, walletConnected } = useAnchorContext();
  const { data: contributorRecord, refetch: refetchContributors } =
    useContributorRecord(realm, {
      walletPK: wallet?.publicKey + "",
    });
  const { data: bounty, refetch: refetchBounty } = useBounty(bountyPK);
  const { refetch: refetchBountyApplications } =
    useBountyApplications(bountyPK);
  const { refetch: refetchBountyActivities } = useBountyActivities(bountyPK);

  const { enabled, instructionToEnable } = useMemo(() => {
    if (!walletConnected)
      return {
        enabled: false,
        instructionToEnable: "Connect your wallet first",
      };
    return { enabled: true };
  }, [walletConnected]);

  const mutationResult = useMutation(
    (validity: number) =>
      applyToBounty({
        provider,
        program,
        bountyBoardPK: bounty.bountyBoard,
        bounty: {
          pubkey: new PublicKey(bountyPK),
          // @ts-ignore
          account: bounty,
        },
        applicantContributorRecordPK: new PublicKey(contributorRecord?.pubkey),
        validity,
      }),
    {
      onSuccess: (data, variables, context) => {
        refetchBounty();
        refetchBountyApplications();
        refetchBountyActivities();
        refetchContributors();
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
