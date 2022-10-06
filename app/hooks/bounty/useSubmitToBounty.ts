import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { submitToBounty } from "../../api";
import { CallbacksForUI } from "../../model/util.model";
import { useContributorRecord } from "../contributor-record/useContributorRecord";
import { useAnchorContext } from "../useAnchorContext";
import { useBounty } from "./useBounty";
import { useBountyActivities } from "./useBountyActivities";
import { useBountySubmissions } from "./useBountySubmissions";

export const useSubmitToBounty = (
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
        instructionToEnable: "Only assignee of the bounty can submit work",
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

    // not pending submission
    if (activeSubmission?.account?.state !== "pendingSubmission")
      return {
        enabled: false,
        instructionToEnable:
          "Use [Update Submission] button to update work after first submission",
      };

    return { enabled: true };
  }, [walletConnected, bountySubmissions]);

  const mutationResult = useMutation(
    (linkToSubmission: string) =>
      submitToBounty({
        provider,
        program,
        bounty: {
          pubkey: new PublicKey(bountyPK),
          // @ts-ignore
          account: bounty,
        },
        bountySubmissionPK: new PublicKey(bountySubmissions[0].pubkey), // assume latest submission must be the active submission
        assigneeContributorRecordPK: contributorRecord.pubkey,
        linkToSubmission,
      }),
    {
      onSuccess: (data, variables, context) => {
        refetchBounty();
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
