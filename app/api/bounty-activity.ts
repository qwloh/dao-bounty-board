import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import {
  BountyActivity,
  BountyActivityType,
} from "../model/bounty-activity.model";
import { BountyBoardProgramAccount } from "../model/util.model";

export const getBountyActivities = async (
  program: Program<DaoBountyBoard>,
  bountyPK: PublicKey
): Promise<BountyBoardProgramAccount<BountyActivity>[]> => {
  const anchorProgAccounts = await program.account.bountyActivity.all([
    {
      memcmp: {
        offset: 8, // after anchor's account discriminator
        bytes: bountyPK.toString(),
      },
    },
  ]);
  // @ts-ignore, return type is hard asserted
  return anchorProgAccounts.map((acc) => ({
    pubkey: acc.publicKey.toString(),
    account: {
      ...acc.account,
      type: BountyActivityType[
        BountyActivityType[Object.keys(acc.account.payload)[0]]
      ],
    },
  }));
};
