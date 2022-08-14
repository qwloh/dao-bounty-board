import { ProgramAccount } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { createBounty, getBountiesForBoard } from "../api";
import { getBountyBoardAddress } from "../api/utils";
import { BountyBoard } from "../model/bounty-board.model";
import { useAnchorContext } from "./useAnchorContext";
import { useBountyBoard } from "./useBountyBoard";

export const useBounty = (realmPubkey: PublicKey) => {
  const { provider, program: bountyBoardProgram } = useAnchorContext();

  const { bountyBoard } = useBountyBoard(realmPubkey);

  const { data: bounties } = useQuery(
    ["bounties", bountyBoard?.publicKey],
    () => getBountiesForBoard(bountyBoardProgram, bountyBoard?.publicKey),
    {
      enabled: !!provider && !!bountyBoard?.publicKey,
    }
  );

  return {
    bounties,
    getBounty: (bountyPubkey: PublicKey) =>
      bounties.find((b) => b.publicKey.toString() === bountyPubkey.toString()),
    createBounty: ({ skill, tier, title, description }) =>
      createBounty({
        program: bountyBoardProgram,
        // @ts-ignore
        bountyBoard: bountyBoard,
        skill,
        tier,
        title,
        description,
      }),
    updateBounty: () => {},
    deleteBounty: () => {},
  };
};
