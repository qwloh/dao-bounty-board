import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { applyToBounty } from "../../api";
import { MutationCallbacks } from "../../model/util.model";
import { useUserContributorRecordInRealm } from "../contributor-record/useUserContributorRecordInRealm";
import { useAnchorContext } from "../useAnchorContext";
import { useBounty } from "./useBounty";
import { useBountyActivities } from "./useBountyActivities";
import { useBountyApplications } from "./useBountyApplications";

export const useApplyToBounty = (
  // can be symbol or string
  realm: string,
  bountyPK: string,
  callbacks: MutationCallbacks = { onSuccess: undefined, onError: undefined }
) => {
  const { provider, program } = useAnchorContext();
  const { data: contributorRecord } = useUserContributorRecordInRealm(realm);
  const { data: bounty, refetch: refetchBounty } = useBounty(bountyPK);
  const { refetch: refetchBountyApplications } =
    useBountyApplications(bountyPK);
  const { refetch: refetchBountyActivities } = useBountyActivities(bountyPK);

  return useMutation(
    (validity: number) =>
      applyToBounty({
        provider,
        program,
        bountyBoardPK: bounty.bountyBoard,
        bounty: {
          pubkey: new PublicKey(bountyPK),
          // @ts-ignore
          account: bounty,
        },
        applicantContributorRecordPK: contributorRecord?.pubkey,
        validity,
      }),
    {
      onSuccess: (data, variables, context) => {
        refetchBounty();
        refetchBountyApplications();
        refetchBountyActivities();
        if (callbacks?.onSuccess) {
          callbacks.onSuccess(data, variables, context);
        }
      },
      onError: callbacks?.onError,
    }
  );
};
