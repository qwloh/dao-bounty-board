import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { proposeInitBountyBoard } from "../../api";
import { InitialContributorWithRole } from "../../api/utils";
import { BountyBoardConfig } from "../../model/bounty-board.model";
import { useRealm } from "../realm/useRealm";
import { UserProposalEntity } from "../realm/useUserProposalEntitiesInRealm";
import { useAnchorContext } from "../useAnchorContext";

export interface ProposeInitBountyBoardArgs {
  userProposalEntity: UserProposalEntity;
  boardConfig: BountyBoardConfig;
  firstVaultMint: PublicKey;
  amountToFundBountyBoardVault: number;
  initialContributorsWithRole: InitialContributorWithRole[];
}

export const useProposeInitBountyBoard = (
  // can be symbol or address
  realm: string
) => {
  const { program } = useAnchorContext();
  const { data: realmAccount } = useRealm(realm);

  return useMutation(
    ({
      userProposalEntity,
      boardConfig,
      firstVaultMint,
      amountToFundBountyBoardVault,
      initialContributorsWithRole,
    }: ProposeInitBountyBoardArgs) =>
      proposeInitBountyBoard(
        program,
        realmAccount?.pubkey,
        userProposalEntity,
        boardConfig,
        firstVaultMint,
        amountToFundBountyBoardVault,
        initialContributorsWithRole
      )
  );
};
