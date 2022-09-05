import { AnchorProvider, Program } from "@project-serum/anchor";
import { PublicKey, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import { BountySubmission } from "../model/bounty-submission.model";
import { Bounty } from "../model/bounty.model";
import { BountyBoardProgramAccount } from "../model/util.model";
import { getBountyActivityAddress } from "./utils";

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
  provider: AnchorProvider;
  program: Program<DaoBountyBoard>;
  bounty: { pubkey: PublicKey; account: Bounty };
  bountySubmissionPK: PublicKey;
  assigneeContributorRecordPK: PublicKey;
  linkToSubmission: string;
}

export const updateSubmission = async ({
  provider,
  program,
  bounty,
  bountySubmissionPK,
  assigneeContributorRecordPK,
  linkToSubmission,
}: UpdateSubmissionArgs) => {
  console.log("Bounty Submission PK", bountySubmissionPK.toString());
  const { pubkey: bountyPK, account: bountyAcc } = bounty;

  console.log("Current activity index", bountyAcc.activityIndex);
  const [bountyActivityPDA] = await getBountyActivityAddress(
    bountyPK,
    bountyAcc.activityIndex
  );
  console.log(
    "Bounty activity (Update Submission) PDA",
    bountyActivityPDA.toString()
  );

  return program.methods
    .updateSubmission({
      linkToSubmission,
    })
    .accounts({
      bounty: bountyPK,
      bountySubmission: bountySubmissionPK,
      bountyActivity: bountyActivityPDA,
      contributorRecord: assigneeContributorRecordPK,
      contributorWallet: provider.wallet.publicKey,
      clock: SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
};

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
