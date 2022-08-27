import { AnchorProvider, Program } from "@project-serum/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import { sleep } from "../utils/common";
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

  await sleep(800); // give time for the network to respond

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
  bountyPubkey: PublicKey,
  bountyActivityIndex: number,
  bountySubmissionPubkey: PublicKey,
  contributorRecordPubkey: PublicKey,
  contributorWallet: Keypair = undefined,
  comment: string = ""
) => {
  const TEST_BOUNTY_SUBMISSION_PK = bountySubmissionPubkey;
  const TEST_BOUNTY_PK = bountyPubkey;
  const TEST_CONTRIBUTOR_RECORD_PK = contributorRecordPubkey;
  const TEST_CONTRIBUTOR_WALLET = contributorWallet || provider.wallet;

  const SIGNERS = contributorWallet ? [contributorWallet] : [];

  console.log(
    "[RequestChangeToSubmission] Current activity index",
    bountyActivityIndex
  );
  const [TEST_BOUNTY_ACTIVITY_REQ_CHANGE_PDA] = await getBountyActivityAddress(
    TEST_BOUNTY_PK,
    bountyActivityIndex
  );
  console.log(
    "Bounty activity (Request Change) PDA",
    TEST_BOUNTY_ACTIVITY_REQ_CHANGE_PDA.toString()
  );

  try {
    const tx = await program.methods
      .requestChangesToSubmission({
        comment,
      })
      .accounts({
        bounty: TEST_BOUNTY_PK,
        bountySubmission: TEST_BOUNTY_SUBMISSION_PK,
        bountyActivity: TEST_BOUNTY_ACTIVITY_REQ_CHANGE_PDA,
        contributorRecord: TEST_CONTRIBUTOR_RECORD_PK,
        contributorWallet: TEST_CONTRIBUTOR_WALLET.publicKey,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers(SIGNERS)
      .rpc();

    console.log("Request change to submission successfully.");
    console.log("[RequestChange] Your transaction signature", tx);
  } catch (err) {
    console.log(
      "[RequestChangesToSubmission] Transaction / Simulation fail.",
      err
    );
    throw err;
  }

  await sleep(800); // give time for the network to respond

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

  let bountyActivityReqChangeAcc;
  console.log("--- Bounty Activity (Request Change) Acc ---");
  try {
    bountyActivityReqChangeAcc = await program.account.bountyActivity.fetch(
      TEST_BOUNTY_ACTIVITY_REQ_CHANGE_PDA
    );
    console.log("Found", bountyActivityReqChangeAcc);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  let bountyAccAfterReqChange;
  console.log("--- Bounty Acc (After Request Change) ---");
  try {
    bountyAccAfterReqChange = await program.account.bounty.fetch(
      TEST_BOUNTY_PK
    );
    console.log("Found", bountyAccAfterReqChange);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  return {
    bountyAccAfterReqChange,
    updatedBountySubmissionAcc,
    bountyActivityReqChangePDA: TEST_BOUNTY_ACTIVITY_REQ_CHANGE_PDA,
    bountyActivityReqChangeAcc,
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
  bountyPubkey: PublicKey,
  bountyActivityIndex: number,
  bountySubmissionPubkey: PublicKey,
  contributorRecordPubkey: PublicKey,
  contributorWallet: Keypair = undefined,
  linkToSubmission: string = ""
) => {
  const TEST_BOUNTY_PK = bountyPubkey;
  const TEST_BOUNTY_SUBMISSION_PK = bountySubmissionPubkey;
  const TEST_CONTRIBUTOR_RECORD_PK = contributorRecordPubkey;
  const TEST_CONTRIBUTOR_WALLET = contributorWallet || provider.wallet;

  const SIGNERS = contributorWallet ? [contributorWallet] : [];

  console.log("[UpdateSubmission] Current activity index", bountyActivityIndex);
  const [TEST_BOUNTY_ACTIVITY_UPDATE_SUB_PDA] = await getBountyActivityAddress(
    TEST_BOUNTY_PK,
    bountyActivityIndex
  );
  console.log(
    "Bounty activity (Update submission) PDA",
    TEST_BOUNTY_ACTIVITY_UPDATE_SUB_PDA.toString()
  );

  try {
    const tx = await program.methods
      .updateSubmission({
        linkToSubmission,
      })
      .accounts({
        bounty: TEST_BOUNTY_PK,
        bountySubmission: TEST_BOUNTY_SUBMISSION_PK,
        bountyActivity: TEST_BOUNTY_ACTIVITY_UPDATE_SUB_PDA,
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

  await sleep(800); // give time for the network to respond

  let updatedBountySubmissionAcc;
  console.log("--- Updated Bounty Submission Acc ---");
  try {
    updatedBountySubmissionAcc = await program.account.bountySubmission.fetch(
      TEST_BOUNTY_SUBMISSION_PK
    );
    console.log("Found", updatedBountySubmissionAcc);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  // get created bounty activity acc
  let bountyActivityUpdateSubAcc;
  console.log("--- Bounty Activity (Update Submission) Acc ---");
  try {
    bountyActivityUpdateSubAcc = await program.account.bountyActivity.fetch(
      TEST_BOUNTY_ACTIVITY_UPDATE_SUB_PDA
    );
    console.log(
      "Found",
      JSON.parse(JSON.stringify(bountyActivityUpdateSubAcc))
    );
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  let bountyAccAfterUpdateSubmission;
  console.log("--- Bounty Acc (After Update Submission) ---");
  try {
    bountyAccAfterUpdateSubmission = await program.account.bounty.fetch(
      TEST_BOUNTY_PK
    );
    console.log("Found", bountyAccAfterUpdateSubmission);
  } catch (err) {
    console.log(
      "Not found. Error",
      err.name,
      "for",
      TEST_BOUNTY_PK.toString(),
      err
    );
  }

  return {
    bountyAccAfterUpdateSubmission,
    updatedBountySubmissionAcc,
    bountyActivityUpdateSubPDA: TEST_BOUNTY_ACTIVITY_UPDATE_SUB_PDA,
    bountyActivityUpdateSubAcc,
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
  bountyPubkey: PublicKey,
  bountyActivityIndex: number,
  bountySubmissionPubkey: PublicKey,
  contributorRecordPubkey: PublicKey,
  contributorWallet: Keypair = undefined,
  comment: string = ""
) => {
  const TEST_BOUNTY_PK = bountyPubkey;
  const TEST_BOUNTY_SUBMISSION_PK = bountySubmissionPubkey;
  const TEST_CONTRIBUTOR_RECORD_PK = contributorRecordPubkey;
  const TEST_CONTRIBUTOR_WALLET = contributorWallet || provider.wallet;

  const SIGNERS = contributorWallet ? [contributorWallet] : [];

  console.log("[RejectSubmission] Current activity index", bountyActivityIndex);
  const [TEST_BOUNTY_ACTIVITY_REJECT_PDA] = await getBountyActivityAddress(
    TEST_BOUNTY_PK,
    bountyActivityIndex
  );
  console.log(
    "Bounty activity (Reject submission) PDA",
    TEST_BOUNTY_ACTIVITY_REJECT_PDA.toString()
  );

  try {
    const tx = await program.methods
      .rejectSubmission({
        comment,
      })
      .accounts({
        bounty: TEST_BOUNTY_PK,
        bountySubmission: TEST_BOUNTY_SUBMISSION_PK,
        bountyActivity: TEST_BOUNTY_ACTIVITY_REJECT_PDA,
        contributorRecord: TEST_CONTRIBUTOR_RECORD_PK,
        contributorWallet: TEST_CONTRIBUTOR_WALLET.publicKey,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers(SIGNERS)
      .rpc();

    console.log("Submission updated successfully.");
    console.log("[RejectSubmission] Your transaction signature", tx);
  } catch (err) {
    console.log("[RejectSubmission] Transaction / Simulation fail.", err);
    throw err;
  }

  await sleep(800); // give time for the network to respond

  let updatedBountySubmissionAcc;
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

  // get created bounty activity acc
  let bountyActivityRejectAcc;
  console.log("--- Bounty Activity (Reject) Acc ---");
  try {
    bountyActivityRejectAcc = await program.account.bountyActivity.fetch(
      TEST_BOUNTY_ACTIVITY_REJECT_PDA
    );
    console.log("Found", JSON.parse(JSON.stringify(bountyActivityRejectAcc)));
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  let bountyAccAfterReject;
  console.log("--- Updated Bounty Acc (After reject) ---");
  try {
    bountyAccAfterReject = await program.account.bounty.fetch(TEST_BOUNTY_PK);
    console.log("Found", bountyAccAfterReject);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  return {
    updatedBountySubmissionAcc,
    bountyAccAfterReject,
    bountyActivityRejectPDA: TEST_BOUNTY_ACTIVITY_REJECT_PDA,
    bountyActivityRejectAcc,
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
  bountyActivityIndex: number,
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

  console.log(
    "[RejectStaleSubmission] Current activity index",
    bountyActivityIndex
  );
  const [TEST_BOUNTY_ACTIVITY_REJ_STALE_PDA] = await getBountyActivityAddress(
    TEST_BOUNTY_PK,
    bountyActivityIndex
  );
  console.log(
    "Bounty activity (Reject Stale) PDA",
    TEST_BOUNTY_ACTIVITY_REJ_STALE_PDA.toString()
  );

  try {
    const tx = await program.methods
      .rejectStaleSubmission({
        comment,
      })
      .accounts({
        bounty: TEST_BOUNTY_PK,
        bountySubmission: TEST_BOUNTY_SUBMISSION_PK,
        bountyActivity: TEST_BOUNTY_ACTIVITY_REJ_STALE_PDA,
        assigneeContributorRecord: TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK,
        contributorRecord: TEST_CONTRIBUTOR_RECORD_PK,
        contributorWallet: TEST_CONTRIBUTOR_WALLET.publicKey,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers(SIGNERS)
      .rpc();

    console.log("Submission updated successfully.");
    console.log("[RejectStale] Your transaction signature", tx);
  } catch (err) {
    console.log("[RejectStaleSubmission] Transaction / Simulation fail.", err);
    throw err;
  }

  await sleep(800); // give time for the network to respond

  let updatedBountySubmissionAcc;
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

  let bountyAccAfterRejectStale;
  console.log("--- Updated Bounty Acc (After reject stale) ---");
  try {
    bountyAccAfterRejectStale = await program.account.bounty.fetch(
      TEST_BOUNTY_PK
    );
    console.log("Found", bountyAccAfterRejectStale);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  let updatedAssigneeContributorRecord;
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

  let bountyActivityRejStaleAcc;
  console.log("--- Bounty Activity (Reject Stale) Acc ---");
  try {
    bountyActivityRejStaleAcc = await program.account.bountyActivity.fetch(
      TEST_BOUNTY_ACTIVITY_REJ_STALE_PDA
    );
    console.log("Found", bountyActivityRejStaleAcc);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  return {
    bountyAccAfterRejectStale,
    updatedBountySubmissionAcc,
    updatedAssigneeContributorRecord,
    bountyActivityRejectStalePDA: TEST_BOUNTY_ACTIVITY_REJ_STALE_PDA,
    bountyActivityRejStaleAcc,
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
