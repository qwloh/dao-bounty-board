import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";

export const getBountyActivities = (
  program: Program<DaoBountyBoard>,
  bountyPK: PublicKey
) =>
  program.account.bountyActivity.all([
    {
      memcmp: {
        offset: 8, // after anchor's account discriminator
        bytes: bountyPK.toString(),
      },
    },
  ]);
