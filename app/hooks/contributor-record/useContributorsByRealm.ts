import { PublicKey } from "@solana/web3.js";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getAllContributorRecordsForRealm,
  getPagedContributorRecords,
} from "../../api";
import {
  getSliceFromAllElements,
  getNextPageParam,
} from "../../api/utils/pagination-utils";
import { useRealm } from "../realm/useRealm";
import { useAnchorContext } from "../useAnchorContext";

export const usePagedContributorsByRealm = (
  // can be symbol or address
  realm: string,
  pageSize: number
) => {
  const queryClient = useQueryClient();
  const { provider, program } = useAnchorContext();
  const { data: realmAccount } = useRealm(realm);

  // get a list of public keys
  const { data: allContributorsOfRealmPK } = useQuery(
    ["contributor-records-all", realmAccount?.pubkey],
    () => {
      console.log(
        "[UsePagedContributorsByRealm] getAllContributorRecordsForRealm run"
      );
      return getAllContributorRecordsForRealm(
        provider.connection,
        program,
        realmAccount.pubkey
      );
    },
    {
      enabled: !!realmAccount,
    }
  );

  return useInfiniteQuery(
    ["contributor-records-paged", realmAccount?.pubkey],
    async ({ pageParam = { page: 0, size: pageSize } }) => {
      console.log(
        "[UsePagedContributorsByRealm] getPagedContributorRecords run",
        allContributorsOfRealmPK.length
      );
      const { page, size } = pageParam;
      const pagedAddresses = getSliceFromAllElements(
        allContributorsOfRealmPK,
        page,
        size
      );

      const pagedResult = await getPagedContributorRecords(
        program,
        pagedAddresses.map((pk) => new PublicKey(pk))
      );

      // data normalization
      for (const res of pagedResult) {
        queryClient.setQueryData(
          ["contributor-record", res.pubkey.toString()],
          res
        );
      }

      return {
        page,
        size,
        totalElements: allContributorsOfRealmPK.length,
        content: pagedResult.map((res) => res.pubkey.toString()),
      };
    },
    {
      enabled: !!realmAccount && !!allContributorsOfRealmPK,
      getNextPageParam,
    }
  );
};
