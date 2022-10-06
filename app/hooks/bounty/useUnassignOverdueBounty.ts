import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { unassignOverdueBounty } from "../../api";
import { CallbacksForUI } from "../../model/util.model";
import { useContributorRecord } from "../contributor-record/useContributorRecord";
import { useAnchorContext } from "../useAnchorContext";
import { useBounty } from "./useBounty";
import { useBountyActivities } from "./useBountyActivities";
import { useBountySubmissions } from "./useBountySubmissions";

export const useUnassignOverdueBounty = (
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
    const concluded = [
      "rejected",
      "rejectedForUnaddressedChangeRequest",
      "accepted",
      "forceAccepted",
    ].includes(activeSubmission?.account?.state);

    if (!activeSubmission || concluded)
      return {
        enabled: false,
        instructionToEnable: "No active assignment to unassign",
      };

    if (activeSubmission.account.state !== "pendingSubmission")
      return {
        enabled: false,
        instructionToEnable:
          "Assignee has already submitted work. [Request change] instead, or [Reject] the submission if a consensus cannot be reached after 3 rounds of iteration",
      };

    const taskSubmissionWindow = bounty?.taskSubmissionWindow;
    const nowInEpochSecs = new Date().getTime() / 1000;
    const bountyOverdueAt =
      activeSubmission.account.assignedAt.toNumber() + taskSubmissionWindow;
    const bountyOverdue = nowInEpochSecs > bountyOverdueAt;
    if (!bountyOverdue)
      return {
        enabled: false,
        instructionToEnable: `Bounty not overdue yet. Assignee has until ${new Date(
          bountyOverdueAt * 1000
        ).toISOString()} to submit his work`,
      };

    return { enabled: true };
  }, [walletConnected, bountySubmissions]);

  const mutationResult = useMutation(
    () =>
      unassignOverdueBounty({
        provider,
        program,
        bounty: {
          pubkey: new PublicKey(bountyPK),
          // @ts-ignore
          account: bounty,
        },
        bountySubmissionPK: new PublicKey(bountySubmissions[0].pubkey), // assume latest submission must be the active submission
        assigneeContributorRecordPK: bountySubmissions[0].account.assignee,
        reviewerContributorRecordPK: contributorRecord.pubkey,
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
