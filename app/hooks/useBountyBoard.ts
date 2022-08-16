import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import {
  getActiveBountyBoardProposal,
  getBountyBoard,
  getBountyBoardVaults,
  proposeInitBountyBoard as _proposeInitBountyBoard,
  // proposeUpdateBountyBoardConfig as _proposeUpdateBountyBoardConfig,
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
  console.log("[QW log] Bounty board PDA", bountyBoardPDA);

  useEffect(() => {
    // the address if this realm has a bounty board
    (async () => {
      if (!realmPubkey) return;
      const [pda, bump] = await getBountyBoardAddress(realmPubkey);
      setBountyBoardPDA(pda);
    })();
  }, [provider, realmPubkey]);

  const { data: bountyBoard } = useQuery(
    ["bounty-board", bountyBoardPDA],
    () => getBountyBoard(bountyBoardProgram, bountyBoardPDA),
    {
      enabled: !!provider && !!bountyBoardPDA,
    }
  );
  console.log("[QW log] Bounty board", bountyBoard);

  const { data: bountyBoardVaults } = useQuery(
    ["bounty-board", bountyBoardPDA, "vaults"],
    () => getBountyBoardVaults(provider, bountyBoardPDA),
    {
      enabled: !!provider && !!bountyBoardPDA,
    }
  );

  const { userRepresentationInDAO, realmTreasuries } = useRealm(realmPubkey);
  console.log("[QW log] User rep in DAO", userRepresentationInDAO);
  console.log("[QW log] Realm treasuries", realmTreasuries);

  const [preferredRepresentation, setPreferredRepresentation] = useState(null);
  const [preferredTreasury, setPreferredTreasury] = useState(null);

  useEffect(() => {
    if (
      !userRepresentationInDAO ||
      !userRepresentationInDAO.length ||
      !realmTreasuries ||
      !realmTreasuries.length
    ) {
      console.log("[QW log] Skip filling preferred identities");
      return;
    }
    console.log("[QW log] Filling preferred identities");
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
  }, [provider, userRepresentationInDAO?.[0], realmTreasuries?.[0]]);

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

  const proposeInitBountyBoard = ({
    boardConfig,
    fundingAmount,
    initialContributorsWithRole,
  }: {
    boardConfig: BountyBoardConfig;
    fundingAmount: number;
    initialContributorsWithRole: InitialContributorWithRole[];
  }) => {
    if (
      !realmPubkey ||
      !preferredRepresentation ||
      !bountyBoardPDA ||
      !preferredTreasury
    ) {
      throw Error(
        `Button not ready yet. Please retry in a min. Missing ${
          !realmPubkey && "realm pubkey"
        } ${!preferredRepresentation && "preferredRepresentation"} ${
          !bountyBoardPDA && "bountyBoardPDA"
        } ${!preferredTreasury && "preferredTreasury"}`
      );
    }

    return _proposeInitBountyBoard(
      bountyBoardProgram,
      realmPubkey,
      preferredRepresentation,
      bountyBoardPDA,
      boardConfig,
      preferredTreasury,
      fundingAmount,
      initialContributorsWithRole
    );
  };

  // disabling for now due to potential complication
  // const proposeUpdateBountyBoard = (boardConfig: BountyBoardConfig) =>
  //   _proposeUpdateBountyBoardConfig(
  //     bountyBoardProgram,
  //     realmPubkey,
  //     preferredRepresentation,
  //     bountyBoardPDA,
  //     boardConfig
  //   );

  return {
    activeBountyBoardProposals,
    bountyBoard: { publicKey: bountyBoardPDA, account: bountyBoard },
    bountyBoardVaults,
    proposeInitBountyBoard,
    // proposeUpdateBountyBoard,
  };
};
