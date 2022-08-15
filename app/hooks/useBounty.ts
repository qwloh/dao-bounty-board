import { PublicKey } from "@solana/web3.js";
import { useQuery } from "react-query";
import {
  createBounty as _createBounty,
  deleteBounty as _deleteBounty,
  getBountiesForBoard,
} from "../api";
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

  const getBounty = (bountyPubkey: PublicKey) =>
    bounties.find((b) => b.publicKey.toString() === bountyPubkey.toString());

  const createBounty = ({ skill, tier, title, description }) =>
    _createBounty({
      program: bountyBoardProgram,
      // @ts-ignore
      bountyBoard,
      skill,
      tier,
      title,
      description,
    });

  const deleteBounty = (bountyPubkey: PublicKey) =>
    _deleteBounty({
      program: bountyBoardProgram,
      bountyBoardPubkey: bountyBoard?.publicKey,
      // @ts-ignore
      bounty: getBounty(bountyPubkey),
    });

  return {
    bounties,
    getBounty,
    createBounty,
    updateBounty: () => {},
    deleteBounty,
  };
};
