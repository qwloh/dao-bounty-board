import { PublicKey } from "@solana/web3.js";
import { useQueryClient } from "@tanstack/react-query";
import { getPagedBounties } from "../../api";
import { useAsyncFetchMultiple } from "../helper/useAsyncFetchMultiple";
import { useAnchorContext } from "../useAnchorContext";

export const _usePagedBounties = (bountyPKs: string[] | undefined) => {
  const { program } = useAnchorContext();
  const queryClient = useQueryClient();

  const notFetched =
    bountyPKs &&
    bountyPKs.filter((pk) => !queryClient.getQueryData(["bounty", pk]));

  const { isLoading, error } = useAsyncFetchMultiple({
    queryFn: async (done) => {
      if (!notFetched) return;
      if (notFetched?.length === 0) {
        done();
        return;
      }
      console.log(
        "[_UsePagedBounties] getPagedBounties run",
        notFetched?.length
      );
      const newlyFetchedBounties = await getPagedBounties(
        program,
        notFetched.map((pk) => new PublicKey(pk))
      );
      newlyFetchedBounties.forEach((b) =>
        queryClient.setQueryData(["bounty", b.pubkey], b.account)
      );
      done();
    },
    dependencies: [notFetched],
  });

  return { isLoading, error };
};
