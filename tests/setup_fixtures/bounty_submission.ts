import { AnchorProvider, Program } from "@project-serum/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";

export const submitToBlankSubmission = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyPubkey: PublicKey,
  bountySubmissionPubkey: PublicKey,
  contributorRecordPubkey: PublicKey,
  contributorWallet: Keypair,
  linkToSubmission: string = ""
) => {
  const TEST_BOUNTY_PK = bountyPubkey;
  const TEST_BOUNTY_SUBMISSION_PK = bountySubmissionPubkey;
  const TEST_CONTRIBUTOR_RECORD_PK = contributorRecordPubkey;
  const TEST_CONTRIBUTOR_WALLET = contributorWallet;
  const LINK_TO_SUBMISSION = linkToSubmission;

  try {
    const tx = await program.methods
      .submitToBounty({
        linkToSubmission: LINK_TO_SUBMISSION,
      })
      .accounts({
        bounty: TEST_BOUNTY_PK,
        bountySubmission: TEST_BOUNTY_SUBMISSION_PK,
        contributorRecord: TEST_CONTRIBUTOR_RECORD_PK,
        contributorWallet: TEST_CONTRIBUTOR_WALLET.publicKey,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers([TEST_CONTRIBUTOR_WALLET])
      .rpc();

    console.log("Your transaction signature", tx);
  } catch (err) {
    console.log(
      "[SubmitToBlankSubmission] Transaction / Simulation fail.",
      err
    );
    throw err;
  }

  console.log("--- Bounty Submission Acc (After First Submit) ---");
  let updatedBountySubmissionAcc;
  try {
    updatedBountySubmissionAcc = await program.account.bountySubmission.fetch(
      TEST_BOUNTY_SUBMISSION_PK
    );
    console.log("Found", updatedBountySubmissionAcc);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  return {
    updatedBountySubmissionAcc,
  };
};

export const requestChangesToSubmission = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountySubmissionPubkey: PublicKey,
  bountyPubkey: PublicKey,
  contributorRecordPubkey: PublicKey,
  contributorWallet: Keypair = undefined,
  comment: string = ""
) => {
  const TEST_BOUNTY_SUBMISSION_PK = bountySubmissionPubkey;
  const TEST_BOUNTY_PK = bountyPubkey;
  const TEST_CONTRIBUTOR_RECORD_PK = contributorRecordPubkey;
  const TEST_CONTRIBUTOR_WALLET = contributorWallet || provider.wallet;

  const SIGNERS = contributorWallet ? [contributorWallet] : [];

  try {
    const tx = await program.methods
      .requestChangesToSubmission({
        comment,
      })
      .accounts({
        bounty: TEST_BOUNTY_PK,
        bountySubmission: TEST_BOUNTY_SUBMISSION_PK,
        contributorRecord: TEST_CONTRIBUTOR_RECORD_PK,
        contributorWallet: TEST_CONTRIBUTOR_WALLET.publicKey,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers(SIGNERS)
      .rpc();

    console.log("Request change to submission successfully.");
    console.log("Your transaction signature", tx);
  } catch (err) {
    console.log(
      "[RequestChangesToSubmission] Transaction / Simulation fail.",
      err
    );
    throw err;
  }

  console.log("--- Updated Bounty Submission Acc ---");
  let updatedBountySubmissionAcc;
  try {
    updatedBountySubmissionAcc = await program.account.bountySubmission.fetch(
      TEST_BOUNTY_SUBMISSION_PK
    );
    console.log("Found", updatedBountySubmissionAcc);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  return {
    updatedBountySubmissionAcc,
  };
};

export const updateSubmission = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountySubmissionPubkey: PublicKey,
  bountyPubkey: PublicKey,
  contributorRecordPubkey: PublicKey,
  contributorWallet: Keypair = undefined,
  linkToSubmission: string = ""
) => {
  const TEST_BOUNTY_PK = bountyPubkey;
  const TEST_BOUNTY_SUBMISSION_PK = bountySubmissionPubkey;
  const TEST_CONTRIBUTOR_RECORD_PK = contributorRecordPubkey;
  const TEST_CONTRIBUTOR_WALLET = contributorWallet || provider.wallet;

  const SIGNERS = contributorWallet ? [contributorWallet] : [];

  try {
    const tx = await program.methods
      .updateSubmission({
        linkToSubmission,
      })
      .accounts({
        bounty: TEST_BOUNTY_PK,
        bountySubmission: TEST_BOUNTY_SUBMISSION_PK,
        contributorRecord: TEST_CONTRIBUTOR_RECORD_PK,
        contributorWallet: TEST_CONTRIBUTOR_WALLET.publicKey,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers(SIGNERS)
      .rpc();

    console.log("Submission updated successfully.");
    console.log("Your transaction signature", tx);
  } catch (err) {
    console.log("[Update Submission] Transaction / Simulation fail.", err);
    throw err;
  }

  console.log("--- Updated Bounty Submission Acc ---");
  let updatedBountySubmissionAcc;
  try {
    updatedBountySubmissionAcc = await program.account.bountySubmission.fetch(
      TEST_BOUNTY_SUBMISSION_PK
    );
    console.log("Found", updatedBountySubmissionAcc);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  return {
    updatedBountySubmissionAcc,
  };
};

export const cleanUpBountySubmission = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountySubmissionPDA: PublicKey
) => {
  try {
    await program.methods
      .closeBountySubmission()
      .accounts({
        bountySubmission: bountySubmissionPDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`Bounty submission acc ${bountySubmissionPDA} closed`);
  } catch (err) {
    console.log(
      `Error clearing bounty submission acc ${bountySubmissionPDA}`,
      err.message
    );
    return;
  }
};
