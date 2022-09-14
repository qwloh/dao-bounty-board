import { useRealms } from "./useRealms";
import { useSelector } from "../useSelector";

export const useRestRealms = () => {
  const { data: realms } = useRealms();
  return useSelector({
    data: realms,
    selector: (r) => !r.userIdentities?.length && !r.bountyBoard, // user not a member + no bounty board
    sorts: [
      { field: "bountyBoard", order: "desc" },
      { field: "meta", order: "desc" },
    ],
  });
};
