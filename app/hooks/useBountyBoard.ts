import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import {
  getActiveBountyBoardProposal,
  getBountyBoard,
  proposeInitBountyBoard,
  proposeUpdateBountyBoardConfig,
} from "../api";
import {
  getBountyBoardAddress,
  InitialContributorWithRole,
} from "../api/utils";
import { BountyBoardConfig } from "../model/bounty-board.model";
import { useAnchorContext } from "./useAnchorContext";
import { useRealm } from "./useRealm";

export const useBountyBoard = (realmPubkey: PublicKey) => {
  const { provider, program: bountyBoardProgram } = useAnchorContext();

  const [bountyBoardPDA, setBountyBoardPDA] = useState(null);

  useEffect(() => {
    // the address if this realm has a bounty board
    (async () => {
      const [pda, bump] = await getBountyBoardAddress(realmPubkey);
      setBountyBoardPDA(pda);
    })();
  }, [provider]);

  const { data: bountyBoard } = useQuery(
    ["bounty-board", bountyBoardPDA],
    () => getBountyBoard(bountyBoardProgram, bountyBoardPDA),
    {
      enabled: !!provider,
    }
  );

  const { userRepresentationInDAO, realmTreasuries } = useRealm(realmPubkey);
  const [preferredRepresentation, setPreferredRepresentation] = useState(null);
  const [preferredTreasury, setPreferredTreasury] = useState(null);

  useEffect(() => {
    if (!userRepresentationInDAO || !realmTreasuries) {
      return;
    }
    (async () => {
      // if user is both council, community member, makes his council identity takes precendence
      const preferredRepresentation =
        userRepresentationInDAO.find((u) => u.council) ||
        userRepresentationInDAO[0];
      setPreferredRepresentation(preferredRepresentation);
      const preferredTreasury = preferredRepresentation.council
        ? realmTreasuries.find((t) => t.council)
        : realmTreasuries[0];
      if (!preferredTreasury) {
        throw Error(
          "Panik! No usable treasury identified for potential proposal initiation."
        );
      }
      setPreferredTreasury(preferredTreasury);
    })();
  }, [userRepresentationInDAO?.[0], realmTreasuries?.[0]]);

  const { data: activeBountyBoardProposals } = useQuery(
    ["bounty-board-proposal", bountyBoardPDA],
    () => {
      const governancesRelevantToProposal = realmTreasuries.map(
        (r) => r.governance
      );
      return getActiveBountyBoardProposal(
        bountyBoardProgram,
        governancesRelevantToProposal
      );
    },
    {
      enabled: !!provider,
    }
  );

  return {
    activeBountyBoardProposals,
    bountyBoard: { publicKey: bountyBoardPDA, account: bountyBoard },
    proposeInitBountyBoard: ({
      boardConfig,
      fundingAmount,
      initialContributorsWithRole,
    }: {
      boardConfig: BountyBoardConfig;
      fundingAmount: number;
      initialContributorsWithRole: InitialContributorWithRole[];
    }) =>
      proposeInitBountyBoard(
        bountyBoardProgram,
        realmPubkey,
        preferredRepresentation,
        bountyBoardPDA,
        boardConfig,
        preferredTreasury,
        fundingAmount,
        initialContributorsWithRole
      ),
    proposeUpdateBountyBoard: (boardConfig: BountyBoardConfig) =>
      proposeUpdateBountyBoardConfig(
        bountyBoardProgram,
        realmPubkey,
        preferredRepresentation,
        bountyBoardPDA,
        boardConfig
      ),
  };
};
