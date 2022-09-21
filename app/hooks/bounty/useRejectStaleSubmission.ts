import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
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
  const { provider, program, wallet } = useAnchorContext();
  const { data: contributorRecord, refetch: refetchContributorRecord } =
    useContributorRecord(realm, wallet?.publicKey);
  const { data: bounty, refetch: refetchBounty } = useBounty(bountyPK);
  const { data: bountySubmissions, refetch: refetchBountySubmissions } =
    useBountySubmissions(bountyPK);
  const { refetch: refetchBountyActivities } = useBountyActivities(bountyPK);

  return useMutation(
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
};
