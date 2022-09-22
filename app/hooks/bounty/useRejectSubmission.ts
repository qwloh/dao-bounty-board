import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { rejectSubmission } from "../../api";
import { CallbacksForUI } from "../../model/util.model";
import { useContributorRecord } from "../contributor-record/useContributorRecord";
import { useAnchorContext } from "../useAnchorContext";
import { useBounty } from "./useBounty";
import { useBountyActivities } from "./useBountyActivities";
import { useBountySubmissions } from "./useBountySubmissions";

export const useRejectSubmission = (
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

    // changeRequested
    if (
      activeSubmission &&
      activeSubmission.account.state === "changeRequested"
    )
      return {
        enabled: false,
        instructionToEnable: "Work not pending review",
      };

    // pendingSubmission, rejected, rejectedForUnaddressedChangeRequest, accepted, forceAccepted
    if (!activeSubmission || activeSubmission.account.state !== "pendingReview")
      return {
        enabled: false,
        instructionToEnable: "No work pending review",
      };

    // pendingReview, but min iterations count not reached
    const requestChangeCount = activeSubmission.account.requestChangeCount;
    if (requestChangeCount < 3)
      return {
        enabled: false,
        instructionToEnable: `This action will be enabled from the 3rd round of 'change request-update' iteration onwards. Current iteration count: ${requestChangeCount}/3. If the contributor does not respond to a change request within the configured time frame, use [RejectStaleSubmission] instead, in which the assignee's reputation will be deducted.`,
      };

    return { enabled: true };
  }, [walletConnected, bountySubmissions]);

  const mutationResult = useMutation(
    (comment: string) =>
      rejectSubmission({
        provider,
        program,
        bounty: {
          pubkey: new PublicKey(bountyPK),
          // @ts-ignore
          account: bounty,
        },
        bountySubmissionPK: bountySubmissions[0].pubkey, // assume latest submission must be the active submission
        reviewerContributorRecordPK: contributorRecord.pubkey,
        comment,
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
