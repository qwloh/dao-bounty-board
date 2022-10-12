import { useQuery } from "@tanstack/react-query";
import { getActiveBountyBoardProposal } from "../../api";
import { useRealmProposalEntities } from "../realm/useRealmProposalEntities";
import { useAnchorContext } from "../useAnchorContext";

export const useActiveBountyBoardProposals = (
  // can be symbol or address
  realm: string
) => {
  const { program } = useAnchorContext();
  const { data: realmProposalEntities } = useRealmProposalEntities(realm);
  const realmPkStr =
    realmProposalEntities && realmProposalEntities[0]?.realm.toString();

  return useQuery(
    ["active-bounty-board-proposals", realmPkStr],
    () => {
      console.log(
        "[UseActiveBountyBoardProposals] getActiveBountyBoardProposal run"
      );
      return getActiveBountyBoardProposal(
        program,
        realmProposalEntities.map((p) => p.governance)
      );
    },
    {
      enabled: !!realmProposalEntities,
      // for use by global onError
      meta: {
        hookName: "UseActiveBountyBoardProposals",
        methodName: "getActiveBountyBoardProposal",
      },
    }
  );
};
