import { AnchorProvider, Program } from "@project-serum/anchor";
import { Keypair, PublicKey, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
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

export const rejectSubmission = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountySubmissionPubkey: PublicKey,
  bountyPubkey: PublicKey,
  contributorRecordPubkey: PublicKey,
  contributorWallet: Keypair = undefined,
  comment: string = ""
) => {
  const TEST_BOUNTY_PK = bountyPubkey;
  const TEST_BOUNTY_SUBMISSION_PK = bountySubmissionPubkey;
  const TEST_CONTRIBUTOR_RECORD_PK = contributorRecordPubkey;
  const TEST_CONTRIBUTOR_WALLET = contributorWallet || provider.wallet;

  const SIGNERS = contributorWallet ? [contributorWallet] : [];

  try {
    const tx = await program.methods
      .rejectSubmission({
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

    console.log("Submission updated successfully.");
    console.log("Your transaction signature", tx);
  } catch (err) {
    console.log("[RejectSubmission] Transaction / Simulation fail.", err);
    throw err;
  }

  let updatedBountySubmissionAcc;
  let updatedBountyAcc;

  console.log("--- Updated Bounty Submission Acc (After reject) ---");
  try {
    updatedBountySubmissionAcc = await program.account.bountySubmission.fetch(
      TEST_BOUNTY_SUBMISSION_PK
    );
    console.log("Found", updatedBountySubmissionAcc);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  console.log("--- Updated Bounty Acc (After reject) ---");
  try {
    updatedBountyAcc = await program.account.bounty.fetch(TEST_BOUNTY_PK);
    console.log("Found", updatedBountyAcc);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  return {
    updatedBountySubmissionAcc,
    updatedBountyAcc,
  };
};

export const rejectStaleSubmission = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyPubkey: PublicKey,
  bountySubmissionPubkey: PublicKey,
  assigneeContributorRecordPubkey: PublicKey,
  contributorRecordPubkey: PublicKey,
  contributorWallet: Keypair = undefined,
  comment: string = ""
) => {
  const TEST_BOUNTY_PK = bountyPubkey;
  const TEST_BOUNTY_SUBMISSION_PK = bountySubmissionPubkey;
  const TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK = assigneeContributorRecordPubkey;
  const TEST_CONTRIBUTOR_RECORD_PK = contributorRecordPubkey;
  const TEST_CONTRIBUTOR_WALLET = contributorWallet || provider.wallet;

  const SIGNERS = contributorWallet ? [contributorWallet] : [];
  try {
    const tx = await program.methods
      .rejectStaleSubmission({
        comment,
      })
      .accounts({
        bounty: TEST_BOUNTY_PK,
        bountySubmission: TEST_BOUNTY_SUBMISSION_PK,
        assigneeContributorRecord: TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK,
        contributorRecord: TEST_CONTRIBUTOR_RECORD_PK,
        contributorWallet: TEST_CONTRIBUTOR_WALLET.publicKey,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers(SIGNERS)
      .rpc();

    console.log("Submission updated successfully.");
    console.log("Your transaction signature", tx);
  } catch (err) {
    console.log("[RejectStaleSubmission] Transaction / Simulation fail.", err);
    throw err;
  }

  let updatedBountySubmissionAcc;
  let updatedBountyAcc;
  let updatedAssigneeContributorRecord;

  console.log("--- Updated Bounty Submission Acc (After reject stale) ---");
  try {
    updatedBountySubmissionAcc = await program.account.bountySubmission.fetch(
      TEST_BOUNTY_SUBMISSION_PK
    );
    console.log("Found", updatedBountySubmissionAcc);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  console.log("--- Updated Bounty Acc (After reject stale) ---");
  try {
    updatedBountyAcc = await program.account.bounty.fetch(TEST_BOUNTY_PK);
    console.log("Found", updatedBountyAcc);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  console.log("--- Assignee Contributor Record (After reject stale) ---");
  if (updatedBountySubmissionAcc) {
    try {
      updatedAssigneeContributorRecord =
        await program.account.contributorRecord.fetch(
          TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK
        );
      console.log("Found", updatedAssigneeContributorRecord);
    } catch (err) {
      console.log(
        "Not found. Error",
        err.name,
        "for",
        TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK.toString(),
        err
      );
    }
  }

  return {
    updatedBountySubmissionAcc,
    updatedBountyAcc,
    updatedAssigneeContributorRecord,
  };
};
