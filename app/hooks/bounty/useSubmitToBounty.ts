import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { submitToBounty } from "../../api";
import { CallbacksForUI } from "../../model/util.model";
import { useUserContributorRecordInRealm } from "../contributor-record/useUserContributorRecordInRealm";
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
  const { provider, program } = useAnchorContext();
  const { data: contributorRecord } = useUserContributorRecordInRealm(realm);
  const { data: bounty, refetch: refetchBounty } = useBounty(bountyPK);
  const { data: bountySubmissions, refetch: refetchBountySubmissions } =
    useBountySubmissions(bountyPK);
  const { refetch: refetchBountyActivities } = useBountyActivities(bountyPK);

  return useMutation(
    (linkToSubmission: string) =>
      submitToBounty({
        provider,
        program,
        bounty: {
          pubkey: new PublicKey(bountyPK),
          // @ts-ignore
          account: bounty,
        },
        bountySubmissionPK: bountySubmissions[0].pubkey, // assume latest submission must be the active submission
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
};
