import { AnchorProvider, Program } from "@project-serum/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import { getBountyActivityAddress } from "../utils/get_addresses";

export const submitToBlankSubmission = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyPubkey: PublicKey,
  bountyActivityIndex: number,
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

  console.log("[SubmitToBounty] Current activity index", bountyActivityIndex);
  const [TEST_BOUNTY_ACTIVITY_SUBMIT_PDA] = await getBountyActivityAddress(
    TEST_BOUNTY_PK,
    bountyActivityIndex
  );
  console.log(
    "Bounty activity (Submit) PDA",
    TEST_BOUNTY_ACTIVITY_SUBMIT_PDA.toString()
  );

  try {
    const tx = await program.methods
      .submitToBounty({
        linkToSubmission: LINK_TO_SUBMISSION,
      })
      .accounts({
        bounty: TEST_BOUNTY_PK,
        bountySubmission: TEST_BOUNTY_SUBMISSION_PK,
        bountyActivity: TEST_BOUNTY_ACTIVITY_SUBMIT_PDA,
        contributorRecord: TEST_CONTRIBUTOR_RECORD_PK,
        contributorWallet: TEST_CONTRIBUTOR_WALLET.publicKey,
        systemProgram: SystemProgram.programId,
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

  let updatedBountySubmissionAcc;
  console.log("--- Bounty Submission Acc (After First Submit) ---");
  try {
    updatedBountySubmissionAcc = await program.account.bountySubmission.fetch(
      TEST_BOUNTY_SUBMISSION_PK
    );
    console.log("Found", updatedBountySubmissionAcc);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  let bountyActivitySubmitAcc;
  console.log("--- Bounty Activity (Submit) Acc ---");
  try {
    bountyActivitySubmitAcc = await program.account.bountyActivity.fetch(
      TEST_BOUNTY_ACTIVITY_SUBMIT_PDA
    );
    console.log("Found", bountyActivitySubmitAcc);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  let bountyAccAfterSubmit;
  console.log("--- Bounty Acc (After First Submit) ---");
  try {
    bountyAccAfterSubmit = await program.account.bounty.fetch(TEST_BOUNTY_PK);
    console.log("Found", bountyAccAfterSubmit);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  return {
    bountyAccAfterSubmit,
    updatedBountySubmissionAcc,
    bountyActivitySubmitPDA: TEST_BOUNTY_ACTIVITY_SUBMIT_PDA,
    bountyActivitySubmitAcc,
  };
};

export const cleanUpSubmitToBlankSubmission = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyActivitySubmitPDA: PublicKey
) => {
  // clean up bounty activity: Submit
  try {
    await program.methods
      .closeBountyActivity()
      .accounts({
        bountyActivity: bountyActivitySubmitPDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(
      `Bounty activity (Submit) acc ${bountyActivitySubmitPDA} closed`
    );
  } catch (err) {
    console.log(
      `Error clearing bounty activity (Submit) acc ${bountyActivitySubmitPDA}`,
      err.message
    );
  }
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

export const cleanUpRequestChangesToSubmission = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyActivityReqChangePDA: PublicKey
) => {
  // clean up bounty activity: Request Change
  try {
    await program.methods
      .closeBountyActivity()
      .accounts({
        bountyActivity: bountyActivityReqChangePDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(
      `Bounty activity (Request Change) acc ${bountyActivityReqChangePDA} closed`
    );
  } catch (err) {
    console.log(
      `Error clearing bounty activity (Request Change) acc ${bountyActivityReqChangePDA}`,
      err.message
    );
  }
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

export const cleanUpUpdateSubmission = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyActivityUpdateSubmissionPDA: PublicKey
) => {
  // clean up bounty activity: Update Submission
  try {
    await program.methods
      .closeBountyActivity()
      .accounts({
        bountyActivity: bountyActivityUpdateSubmissionPDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(
      `Bounty activity (Update Submission) acc ${bountyActivityUpdateSubmissionPDA} closed`
    );
  } catch (err) {
    console.log(
      `Error clearing bounty activity (Update Submission) acc ${bountyActivityUpdateSubmissionPDA}`,
      err.message
    );
  }
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

export const cleanUpRejectSubmission = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyActivityRejectPDA: PublicKey
) => {
  // clean up bounty activity: Reject
  try {
    await program.methods
      .closeBountyActivity()
      .accounts({
        bountyActivity: bountyActivityRejectPDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(
      `Bounty activity (Reject) acc ${bountyActivityRejectPDA} closed`
    );
  } catch (err) {
    console.log(
      `Error clearing bounty activity (Reject) acc ${bountyActivityRejectPDA}`,
      err.message
    );
  }
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

export const cleanUpRejectStaleSubmission = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyActivityRejectStalePDA: PublicKey
) => {
  // clean up bounty activity: Reject Stale
  try {
    await program.methods
      .closeBountyActivity()
      .accounts({
        bountyActivity: bountyActivityRejectStalePDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(
      `Bounty activity (Reject Stale) acc ${bountyActivityRejectStalePDA} closed`
    );
  } catch (err) {
    console.log(
      `Error clearing bounty activity (Reject Stale) acc ${bountyActivityRejectStalePDA}`,
      err.message
    );
  }
};
