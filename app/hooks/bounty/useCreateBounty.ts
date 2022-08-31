import { useMutation } from "@tanstack/react-query";
import { createBounty } from "../../api";
import { Skill } from "../../model/bounty.model";
import { useBountyBoardByRealm } from "../bounty-board/useBountyBoardByRealm";
import { useAnchorContext } from "../useAnchorContext";

export const useCreateBounty = (
  // can be symbol or address
  realm: string
) => {
  const { program } = useAnchorContext();
  const { data: bountyBoard } = useBountyBoardByRealm(realm);

  return useMutation(
    (bountyDetails: {
      title: string;
      description: string;
      skill: Skill;
      tier: string;
    }) =>
      createBounty({
        program,
        // @ts-ignore
        bountyBoard,
        ...bountyDetails,
      })
  );
};
