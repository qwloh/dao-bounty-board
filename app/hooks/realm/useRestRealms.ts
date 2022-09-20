import { useRealms } from "./useRealms";
import { useSelector } from "../useSelector";
import { useUserRealms } from "./useUserRealms";

export const useRestRealms = () => {
  const { data: realms } = useRealms();
  const { data: userRealms } = useUserRealms();

  return useSelector({
    data: realms,
    selector: (r) =>
      !r.bountyBoard && // no bounty board
      (!userRealms || // ignore the next condition if `userRealms` is not available yet
        !userRealms
          .map((uRealm) => uRealm.pubkey.toString())
          .includes(r.pubkey.toString())), // user not a member
    sorts: [
      { field: "bountyBoard", order: "desc" },
      { field: "meta", order: "desc" },
    ],
    selectorDependencies: [userRealms],
  });
};
