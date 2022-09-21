import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { assignBounty } from "../../api";
import { CallbacksForUI } from "../../model/util.model";
import { useContributorRecord } from "../contributor-record/useContributorRecord";
import { useAnchorContext } from "../useAnchorContext";
import { useBounty } from "./useBounty";
import { useBountyActivities } from "./useBountyActivities";
import { useBountyApplications } from "./useBountyApplications";
import { useBountySubmissions } from "./useBountySubmissions";

export const useAssignBounty = (
  // can be symbol or string
  realm: string,
  bountyPK: string,
  callbacks: CallbacksForUI = { onSuccess: undefined, onError: undefined }
) => {
  const { provider, program, wallet, walletConnected } = useAnchorContext();
  const { data: contributorRecord } = useContributorRecord(
    realm,
    wallet?.publicKey
  );
  const { data: bounty, refetch: refetchBounty } = useBounty(bountyPK);
  const { refetch: refetchBountySubmissions } = useBountySubmissions(bountyPK);
  const { data: bountyApplications, refetch: refetchBountyApplications } =
    useBountyApplications(bountyPK);
  const { refetch: refetchBountyActivities } = useBountyActivities(bountyPK);

  const { enabled, instructionToEnable } = useMemo(() => {
    if (!walletConnected)
      return {
        enabled: false,
        instructionToEnable: "Connect your wallet first",
      };
    if (bounty && bounty?.state !== "open")
      return {
        enabled: false,
        instructionToEnable:
          "Bounty already assigned. To assign to another application, either unassign or reject previous assignment",
      };
    if (!bountyApplications?.length)
      return {
        enabled: false,
        instructionToEnable:
          "No application yet. Create some bounty applications by applying to bounty first.",
      };
    return { enabled: true };
  }, [walletConnected, bounty?.state !== "open", bountyApplications?.length]);

  const mutationResult = useMutation(
    (bountyApplicationPK: string) =>
      assignBounty({
        provider,
        program,
        bounty: {
          pubkey: new PublicKey(bountyPK),
          // @ts-ignore
          account: bounty,
        },
        bountyApplicationPK: new PublicKey(bountyApplicationPK),
        contributorRecordPK: contributorRecord.pubkey,
      }),
    {
      onSuccess: (data, variables, context) => {
        refetchBounty();
        refetchBountySubmissions();
        refetchBountyApplications();
        refetchBountyActivities();
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
