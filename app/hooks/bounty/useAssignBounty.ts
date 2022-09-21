import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
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
  const { provider, program, wallet } = useAnchorContext();
  const { data: contributorRecord } = useContributorRecord(
    realm,
    wallet?.publicKey
  );
  const { data: bounty, refetch: refetchBounty } = useBounty(bountyPK);
  const { refetch: refetchBountySubmissions } = useBountySubmissions(bountyPK);
  const { refetch: refetchBountyApplications } =
    useBountyApplications(bountyPK);
  const { refetch: refetchBountyActivities } = useBountyActivities(bountyPK);

  return useMutation(
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
};
