import { PublicKey } from "@solana/web3.js";
import { useQueryClient } from "@tanstack/react-query";
import { getPagedBounties } from "../../api";
import { useAsyncFetchMultiple } from "../helper/useAsyncFetchMultiple";
import { useAnchorContext } from "../useAnchorContext";

export const _usePagedBounties = (bountyPKs: string[]) => {
  const { program } = useAnchorContext();
  const queryClient = useQueryClient();

  const notFetched = bountyPKs.filter(
    (pk) => !queryClient.getQueryData(["bounty", pk])
  );

  const { isLoading, error } = useAsyncFetchMultiple({
    queryFn: async () => {
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
    },
    dependencies: [notFetched],
    enabled: notFetched?.length > 0,
  });

  return { isLoading, error };
};
