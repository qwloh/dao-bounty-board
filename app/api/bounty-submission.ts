import { AnchorProvider, Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import {
  BountySubmission,
  BountySubmissionState,
} from "../model/bounty-submission.model";
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
    pubkey: acc.publicKey.toString(),
    account: {
      ...acc.account,
      // convert rust enums into more convenient form
      // original: state: {pendingSubmission: {}}
      // after conversion: state: 'pendingSubmission'
      state:
        BountySubmissionState[
          BountySubmissionState[Object.keys(acc.account.state)[0]]
        ],
    },
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
      systemProgram: SystemProgram.programId,
      clock: SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
};

interface RequestChangesToSubmissionArgs {
  provider: AnchorProvider;
  program: Program<DaoBountyBoard>;
  bounty: { pubkey: PublicKey; account: Bounty };
  bountySubmissionPK: PublicKey;
  reviewerContributorRecordPK: PublicKey; // limited to bounty creator currently
  comment: string;
}

export const requestChangesToSubmission = async ({
  provider,
  program,
  bounty,
  bountySubmissionPK,
  reviewerContributorRecordPK,
  comment,
}: RequestChangesToSubmissionArgs) => {
  console.log("Bounty Submission PK", bountySubmissionPK.toString());
  const { pubkey: bountyPK, account: bountyAcc } = bounty;

  console.log("Current activity index", bountyAcc.activityIndex);
  const [bountyActivityPDA] = await getBountyActivityAddress(
    bountyPK,
    bountyAcc.activityIndex
  );
  console.log(
    "Bounty activity (Request Change to Submission) PDA",
    bountyActivityPDA.toString()
  );

  return program.methods
    .requestChangesToSubmission({
      comment,
    })
    .accounts({
      bounty: bountyPK,
      bountySubmission: bountySubmissionPK,
      bountyActivity: bountyActivityPDA,
      contributorRecord: reviewerContributorRecordPK,
      contributorWallet: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      clock: SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
};

interface RejectStaleSubmissionArgs {
  provider: AnchorProvider;
  program: Program<DaoBountyBoard>;
  bounty: { pubkey: PublicKey; account: Bounty };
  bountySubmissionPK: PublicKey;
  assigneeContributorRecordPK: PublicKey;
  reviewerContributorRecordPK: PublicKey; // limited to bounty creator currently
  comment: string;
}

export const rejectStaleSubmission = async ({
  provider,
  program,
  bounty,
  bountySubmissionPK,
  assigneeContributorRecordPK,
  reviewerContributorRecordPK,
}: RejectStaleSubmissionArgs) => {
  console.log("Bounty Submission PK", bountySubmissionPK.toString());
  const { pubkey: bountyPK, account: bountyAcc } = bounty;

  console.log("Current activity index", bountyAcc.activityIndex);
  const [bountyActivityPDA] = await getBountyActivityAddress(
    bountyPK,
    bountyAcc.activityIndex
  );
  console.log(
    "Bounty activity (Reject Stale) PDA",
    bountyActivityPDA.toString()
  );

  return program.methods
    .rejectStaleSubmission()
    .accounts({
      bounty: bountyPK,
      bountySubmission: bountySubmissionPK,
      bountyActivity: bountyActivityPDA,
      assigneeContributorRecord: assigneeContributorRecordPK,
      contributorRecord: reviewerContributorRecordPK,
      contributorWallet: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      clock: SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
};

interface RejectSubmissionArgs {
  provider: AnchorProvider;
  program: Program<DaoBountyBoard>;
  bounty: { pubkey: PublicKey; account: Bounty };
  bountySubmissionPK: PublicKey;
  reviewerContributorRecordPK: PublicKey; // limited to bounty creator currently
  comment: string;
}

export const rejectSubmission = async ({
  provider,
  program,
  bounty,
  bountySubmissionPK,
  reviewerContributorRecordPK,
  comment,
}: RejectSubmissionArgs) => {
  console.log("Bounty Submission PK", bountySubmissionPK.toString());
  const { pubkey: bountyPK, account: bountyAcc } = bounty;

  console.log("Current activity index", bountyAcc.activityIndex);
  const [bountyActivityPDA] = await getBountyActivityAddress(
    bountyPK,
    bountyAcc.activityIndex
  );
  console.log("Bounty activity (Reject) PDA", bountyActivityPDA.toString());

  return program.methods
    .rejectSubmission({
      comment,
    })
    .accounts({
      bounty: bountyPK,
      bountySubmission: bountySubmissionPK,
      bountyActivity: bountyActivityPDA,
      contributorRecord: reviewerContributorRecordPK,
      contributorWallet: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      clock: SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
};
