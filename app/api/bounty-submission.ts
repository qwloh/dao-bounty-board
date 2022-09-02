import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import { BountySubmission } from "../model/bounty-submission.model";
import { BountyBoardProgramAccount } from "../model/util.model";

export const getBountySubmissions = async (
  program: Program<DaoBountyBoard>,
  bountyPK: PublicKey
): Promise<BountyBoardProgramAccount<BountySubmission>[]> => {
  const anchorProgAccounts = await program.account.bountySubmission.all([
    {
      memcmp: {
        offset: 8, // after anchor's account discriminator
        bytes: bountyPK.toString(),
      },
    },
  ]);
  // @ts-ignore, return type is hard asserted
  return anchorProgAccounts.map((acc) => ({
    pubkey: acc.publicKey,
    account: acc.account,
  }));
};

interface UpdateSubmissionArgs {
  program: Program<DaoBountyBoard>;
}

export const updateSubmission = async ({ program }: UpdateSubmissionArgs) => {};

interface RequestChangesToSubmissionArgs {
  program: Program<DaoBountyBoard>;
}

export const requestChangesToSubmission = async ({
  program,
}: RequestChangesToSubmissionArgs) => {};

interface RejectStaleSubmissionArgs {
  program: Program<DaoBountyBoard>;
}

export const rejectStaleSubmission = async ({
  program,
}: RejectStaleSubmissionArgs) => {};

interface RejectSubmissionArgs {
  program: Program<DaoBountyBoard>;
}

export const rejectSubmission = async ({ program }: RejectSubmissionArgs) => {};
