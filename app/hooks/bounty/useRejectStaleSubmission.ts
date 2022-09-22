import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { rejectStaleSubmission } from "../../api";
import { CallbacksForUI } from "../../model/util.model";
import { useContributorRecord } from "../contributor-record/useContributorRecord";
import { useAnchorContext } from "../useAnchorContext";
import { useBounty } from "./useBounty";
import { useBountyActivities } from "./useBountyActivities";
import { useBountySubmissions } from "./useBountySubmissions";

export const useRejectStaleSubmission = (
  // can be symbol or string
  realm: string,
  bountyPK: string,
  callbacks: CallbacksForUI = { onSuccess: undefined, onError: undefined }
) => {
  const { provider, program, wallet, walletConnected } = useAnchorContext();
  const { data: contributorRecord, refetch: refetchContributorRecord } =
    useContributorRecord(realm, wallet?.publicKey);
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

    // pendingReview
    if (activeSubmission && activeSubmission.account.state === "pendingReview")
      return {
        enabled: false,
        instructionToEnable:
          "There is updated content pending review. This submission is not stale",
      };

    // pendingSubmission, rejected, rejectedForUnaddressedChangeRequest, accepted, forceAccepted
    if (
      !activeSubmission ||
      activeSubmission.account.state !== "changeRequested"
    )
      return {
        enabled: false,
        instructionToEnable: "No work pending review",
      };

    // changeRequested, but submission not stale
    const addressChangeReqWindow = bounty?.addressChangeReqWindow;
    const nowInEpochSecs = new Date().getTime() / 1000;
    const submissionStaleAt =
      activeSubmission.account.changeRequestedAt.toNumber() +
      addressChangeReqWindow;
    const submissionStale = nowInEpochSecs > submissionStaleAt;
    if (!submissionStale)
      return {
        enabled: false,
        instructionToEnable: `Submission not stale yet. Assignee has until ${new Date(
          submissionStaleAt * 1000
        ).toISOString()} to address change request`,
      };

    return { enabled: true };
  }, [walletConnected, bountySubmissions]);

  const mutationResult = useMutation(
    (comment: string) =>
      rejectStaleSubmission({
        provider,
        program,
        bounty: {
          pubkey: new PublicKey(bountyPK),
          // @ts-ignore
          account: bounty,
        },
        bountySubmissionPK: bountySubmissions[0].pubkey, // assume latest submission must be the active submission
        assigneeContributorRecordPK: bountySubmissions[0].account.assignee,
        reviewerContributorRecordPK: contributorRecord.pubkey,
        comment,
      }),
    {
      onSuccess: (data, variables, context) => {
        refetchBounty();
        refetchBountySubmissions();
        refetchBountyActivities();
        refetchContributorRecord();
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
