import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { updateSubmission } from "../../api";
import { CallbacksForUI } from "../../model/util.model";
import { useContributorRecord } from "../contributor-record/useContributorRecord";
import { useAnchorContext } from "../useAnchorContext";
import { useBounty } from "./useBounty";
import { useBountyActivities } from "./useBountyActivities";
import { useBountySubmissions } from "./useBountySubmissions";

export const useUpdateSubmission = (
  // can be symbol or string
  realm: string,
  bountyPK: string,
  callbacks: CallbacksForUI = { onSuccess: undefined, onError: undefined }
) => {
  const { provider, program, wallet, walletConnected } = useAnchorContext();
  const { data: contributorRecord } = useContributorRecord(realm, {
    walletPK: wallet?.publicKey + "",
  });
  const { data: bounty, refetch: refetchBounty } = useBounty(bountyPK);
  const { data: bountySubmissions, refetch: refetchBountySubmissions } =
    useBountySubmissions(bountyPK);
  const { refetch: refetchBountyActivities } = useBountyActivities(bountyPK);

  const { enabled, instructionToEnable } = useMemo(() => {
    if (!walletConnected)
      return {
        enabled: false,
        instructionToEnable: "Connect your wallet first",
      };

    const activeSubmission =
      !!bountySubmissions?.length && bountySubmissions[0];

    // no assignment / not assignee
    if (
      !activeSubmission ||
      activeSubmission.account.assignee.toString() !==
        contributorRecord.pubkey.toString()
    )
      return {
        enabled: false,
        instructionToEnable:
          "Only assignee of the bounty can update submission",
      };

    // concluded
    const concluded = [
      "rejected",
      "rejectedForUnaddressedChangeRequest",
      "accepted",
      "forceAccepted",
    ].includes(activeSubmission?.account?.state);
    if (concluded)
      return {
        enabled: false,
        instructionToEnable: "Submission already concluded",
      };

    // pendingSubmission
    if (activeSubmission?.account?.state === "pendingSubmission")
      return {
        enabled: false,
        instructionToEnable:
          "Use [Submit To Bounty] button to make first submission",
      };

    return { enabled: true };
  }, [walletConnected, bountySubmissions]);

  const mutationResult = useMutation(
    (linkToSubmission: string) =>
      updateSubmission({
        provider,
        program,
        bounty: {
          pubkey: new PublicKey(bountyPK),
          // @ts-ignore
          account: bounty,
        },
        bountySubmissionPK: new PublicKey(bountySubmissions[0].pubkey), // assume latest submission must be the active submission
        assigneeContributorRecordPK: new PublicKey(contributorRecord.pubkey),
        linkToSubmission,
      }),
    {
      onSuccess: (data, variables, context) => {
        refetchBounty(); // with updated activity index
        refetchBountySubmissions();
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
