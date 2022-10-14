import { PublicKey } from "@solana/web3.js";
import { useQueryClient } from "@tanstack/react-query";
import { getPagedContributorRecords } from "../../api";
import { useAsyncFetchMultiple } from "../helper/useAsyncFetchMultiple";
import { useAnchorContext } from "../useAnchorContext";

export const _usePagedContributorRecords = (
  contributorRecordPKs: string[] | undefined
) => {
  const { program } = useAnchorContext();
  const queryClient = useQueryClient();

  const notFetched =
    contributorRecordPKs &&
    contributorRecordPKs.filter(
      (pk) => !queryClient.getQueryData(["contributor-record", pk])
    );

  const { isLoading, error } = useAsyncFetchMultiple({
    queryFn: async (done) => {
      if (!notFetched) return;
      if (notFetched?.length === 0) {
        done();
        return;
      }
      console.log(
        "[_usePagedContributors] getPagedContributorRecords run",
        notFetched?.length
      );
      const newlyFetchedBounties = await getPagedContributorRecords(
        program,
        notFetched.map((pk) => new PublicKey(pk))
      );
      newlyFetchedBounties.forEach((b) =>
        queryClient.setQueryData(["contributor-record", b.pubkey], b)
      );
    },
    dependencies: [notFetched],
  });

  return { isLoading, error };
};
