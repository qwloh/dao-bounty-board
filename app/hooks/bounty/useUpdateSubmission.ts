import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { submitToBounty, updateSubmission } from "../../api";
import { CallbacksForUI } from "../../model/util.model";
import { useUserContributorRecordInRealm } from "../contributor-record/useUserContributorRecordInRealm";
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
  const { provider, program } = useAnchorContext();
  const { data: contributorRecord } = useUserContributorRecordInRealm(realm);
  const { data: bounty } = useBounty(bountyPK);
  const { data: bountySubmissions, refetch: refetchBountySubmissions } =
    useBountySubmissions(bountyPK);
  const { refetch: refetchBountyActivities } = useBountyActivities(bountyPK);

  return useMutation(
    (linkToSubmission: string) =>
      updateSubmission({
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
        refetchBountySubmissions();
        refetchBountyActivities();
        if (callbacks?.onSuccess) {
          callbacks.onSuccess(data, variables, context);
        }
      },
      onError: callbacks?.onError,
    }
  );
};
