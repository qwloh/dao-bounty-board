import { useSelector } from "../useSelector";
import { useRealms } from "./useRealms";

export const useRealmsWithBountyBoard = () => {
  const { data: realms } = useRealms();
  return useSelector({
    data: realms,
    selector: (r) => !!r.bountyBoard,
    sorts: [
      { field: "bountyBoard", order: "desc" },
      { field: "meta", order: "desc" },
    ],
  });
};
