import { useSelector } from "../useSelector";
import { useRealms } from "./useRealms";
import { useUserRealms } from "./useUserRealms";

export const useRealmsWithBountyBoard = () => {
  const { data: realms, isLoading: isLoadingRealms } = useRealms();
  const { data: userRealms, isLoading: isLoadingUserRealms } = useUserRealms();

  // no `isLoading` feedback available from `useSelector` yet
  const data = useSelector({
    data: realms,
    selector: (r) =>
      !!r.bountyBoard && // has bounty board
      (!userRealms || // ignore the next condition if `userRealms` is not available yet
        !userRealms
          .map((uRealm) => uRealm.pubkey.toString())
          .includes(r.pubkey.toString())), // user not a member
    sorts: [{ path: "meta", order: "desc" }],
    selectorDependencies: [userRealms],
  });

  return {
    data,
    isLoading: isLoadingRealms || isLoadingUserRealms,
  };
};
