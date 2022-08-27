import { AnchorProvider, Program } from "@project-serum/anchor";
import {
  Account,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { DUMMY_MINT_PK } from "../../app/api/constants";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import { readableTokenAcc, sleep } from "../utils/common";
import {
  getBountyActivityAddress,
  getBountyAddress,
  getBountyEscrowAddress,
  getBountySubmissionAddress,
} from "../utils/get_addresses";

export enum Skill {
  Development = "development",
  Design = "design",
  Marketing = "marketing",
  Operations = "operations",
}

export const DEFAULT_BOUNTY_DETAILS = {
  title: "My First Bounty",
  description: "", // to be replaced with ipfs impl
  tier: "Entry",
  skill: { development: {} },
};

export const createBounty = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyBoardPubkey: PublicKey,
  bountyBoardVaultPubkey: PublicKey,
  contributorRecordPubkey: PublicKey,
  bountyDetails: typeof DEFAULT_BOUNTY_DETAILS = DEFAULT_BOUNTY_DETAILS
) => {
  const BOUNTY_BOARD_PK = bountyBoardPubkey;
  const BOUNTY_BOARD_VAULT_PK = bountyBoardVaultPubkey;
  const CONTRIBUTOR_RECORD_PK = contributorRecordPubkey;

  const BOUNTY_INDEX = 0;
  const REWARD_MINT_PK = new PublicKey(DUMMY_MINT_PK.USDC);
  const [BOUNTY_PDA] = await getBountyAddress(BOUNTY_BOARD_PK, BOUNTY_INDEX);
  console.log("Bounty PDA", BOUNTY_PDA.toString());

  const BOUNTY_ESCROW_PDA = await getBountyEscrowAddress(
    BOUNTY_PDA,
    REWARD_MINT_PK
  );
  console.log("Bounty Escrow PDA", BOUNTY_ESCROW_PDA.toString());

  try {
    const { title, description, tier, skill } = bountyDetails;
    const createBountyTx = await program.methods
      //@ts-ignore
      .createBounty({
        bountyBoard: BOUNTY_BOARD_PK,
        ...bountyDetails,
      })
      .accounts({
        bountyBoard: BOUNTY_BOARD_PK,
        bountyBoardVault: BOUNTY_BOARD_VAULT_PK,
        bounty: BOUNTY_PDA,
        bountyEscrow: BOUNTY_ESCROW_PDA,
        rewardMint: REWARD_MINT_PK,
        contributorRecord: CONTRIBUTOR_RECORD_PK,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      // .simulate();
      .rpc();
    console.log("Your transaction signature", createBountyTx);
  } catch (err) {
    console.log("Transaction / Simulation fail.", err);
  }

  await sleep(800); // give time for the network to respond

  let bountyAcc;
  console.log("--- Bounty Acc ---");
  try {
    bountyAcc = await program.account.bounty.fetch(BOUNTY_PDA);
    console.log("Found", JSON.parse(JSON.stringify(bountyAcc)));
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  let bountyEscrowAcc: Account;
  console.log("--- Bounty Escrow Acc ---");
  try {
    bountyEscrowAcc = await getAccount(
      provider.connection,
      BOUNTY_ESCROW_PDA,
      "recent",
      TOKEN_PROGRAM_ID
    );
    console.log("Found", readableTokenAcc(bountyEscrowAcc));
  } catch (err) {
    console.log(
      "Not found. Error",
      err.name,
      "for",
      BOUNTY_ESCROW_PDA.toString(),
      err
    );
  }

  return {
    bountyPDA: BOUNTY_PDA,
    bountyAcc,
    bountyEscrowPDA: BOUNTY_ESCROW_PDA,
    bountyEscrowAcc,
  };
};

export const cleanUpCreateBounty = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyPDA: PublicKey,
  bountyEscrowPDA: PublicKey,
  bountyBoardVaultPDA: PublicKey
) => {
  // close bounty escrow account first
  try {
    await program.methods
      .closeBountyEscrow()
      .accounts({
        bounty: bountyPDA,
        bountyEscrow: bountyEscrowPDA,
        bountyBoardVault: bountyBoardVaultPDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log(`Bounty escrow acc ${bountyEscrowPDA} closed`);
  } catch (err) {
    console.log(
      `Error clearing bounty escrow acc ${bountyEscrowPDA}`,
      err.message || err.name
    );
    return; // don't clear bounty board account if bounty board vault account is not successfully cleared
  }

  // close bounty account
  try {
    await program.methods
      .closeBounty()
      .accounts({
        bounty: bountyPDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`Bounty acc ${bountyPDA.toString()} closed`);
  } catch (err) {
    console.log(
      `Error clearing bounty acc ${bountyPDA.toString()}`,
      err.message
    );
  }
};

export const assignBounty = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyPubkey: PublicKey,
  bountyAssignCount: number,
  bountyActivityIndex: number,
  bountyApplicationPubkey: PublicKey
) => {
  const TEST_BOUNTY_PK = bountyPubkey;
  const TEST_BOUNTY_APPLICATION_PK = bountyApplicationPubkey;

  const [TEST_BOUNTY_SUBMISSION_PDA] = await getBountySubmissionAddress(
    bountyPubkey,
    bountyAssignCount
  );
  console.log("Bounty submission PDA", TEST_BOUNTY_SUBMISSION_PDA.toString());

  console.log("[AssignBounty] Current activity index", bountyActivityIndex);
  const [TEST_BOUNTY_ACTIVITY_ASSIGN_PDA] = await getBountyActivityAddress(
    TEST_BOUNTY_PK,
    bountyActivityIndex
  );
  console.log(
    "Bounty activity (Assign) PDA",
    TEST_BOUNTY_ACTIVITY_ASSIGN_PDA.toString()
  );

  try {
    const tx = await program.methods
      .assignBounty()
      .accounts({
        bounty: TEST_BOUNTY_PK,
        bountyApplication: TEST_BOUNTY_APPLICATION_PK,
        bountySubmission: TEST_BOUNTY_SUBMISSION_PDA,
        bountyActivity: TEST_BOUNTY_ACTIVITY_ASSIGN_PDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      // .simulate();
      .rpc();
    console.log("[AssignBounty] Your transaction signature", tx);
  } catch (err) {
    console.log("Transaction / Simulation fail.", err);
    throw err;
  }

  await sleep(800); // give time for the network to respond

  // get updated bounty acc
  let bountyAccAfterAssign;
  console.log("--- Bounty Acc (After Assign) ---");
  try {
    bountyAccAfterAssign = await program.account.bounty.fetch(TEST_BOUNTY_PK);
    console.log("Found", JSON.parse(JSON.stringify(bountyAccAfterAssign)));
  } catch (err) {
    console.log("Not found. Error", err.message);
  }
  // get updated bounty application acc
  let updatedBountyApplicationAcc;
  console.log("--- Bounty Application Acc ---");
  try {
    updatedBountyApplicationAcc = await program.account.bountyApplication.fetch(
      TEST_BOUNTY_APPLICATION_PK
    );
    console.log(
      "Found",
      JSON.parse(JSON.stringify(updatedBountyApplicationAcc))
    );
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  // get created bounty submission acc
  let bountySubmissionAcc;
  console.log("--- Bounty Submission Acc ---");
  try {
    bountySubmissionAcc = await program.account.bountySubmission.fetch(
      TEST_BOUNTY_SUBMISSION_PDA
    );
    console.log("Found", JSON.parse(JSON.stringify(bountySubmissionAcc)));
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  // get created bounty activity acc
  let bountyActivityAssignAcc;
  console.log("--- Bounty Activity (Assign) Acc ---");
  try {
    bountyActivityAssignAcc = await program.account.bountyActivity.fetch(
      TEST_BOUNTY_ACTIVITY_ASSIGN_PDA
    );
    console.log("Found", JSON.parse(JSON.stringify(bountyActivityAssignAcc)));
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  return {
    bountyAccAfterAssign,
    updatedBountyApplicationAcc,
    bountySubmissionPDA: TEST_BOUNTY_SUBMISSION_PDA,
    bountySubmissionAcc,
    bountyActivityAssignPDA: TEST_BOUNTY_ACTIVITY_ASSIGN_PDA,
    bountyActivityAssignAcc,
  };
};

export const cleanUpAssignBounty = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyActivityAssignPDA: PublicKey,
  bountySubmissionPDA: PublicKey
) => {
  // clean up bounty activity: assign
  try {
    await program.methods
      .closeBountyActivity()
      .accounts({
        bountyActivity: bountyActivityAssignPDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(
      `Bounty activity (Assign) acc ${bountyActivityAssignPDA} closed`
    );
  } catch (err) {
    console.log(
      `Error clearing bounty activity (Assign) acc ${bountyActivityAssignPDA}`,
      err.message
    );
  }
  // clean up bounty submission created from assign
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

export const unassignOverdueBounty = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyPubkey: PublicKey,
  bountyActivityIndex: number,
  currentBountySubmissionPubkey: PublicKey,
  assigneeContributorRecordPubkey: PublicKey,
  bountyCreatorContributorRecordPubkey: PublicKey,
  bountyCreatorWallet: Keypair = undefined,
  comment: string = ""
) => {
  const TEST_BOUNTY_PK = bountyPubkey;
  const TEST_BOUNTY_SUBMISSION_PK = currentBountySubmissionPubkey;
  const TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK = assigneeContributorRecordPubkey;
  const TEST_CONTRIBUTOR_RECORD_PK = bountyCreatorContributorRecordPubkey;
  const TEST_CONTRIBUTOR_WALLET = bountyCreatorWallet || provider.wallet;

  const SIGNERS = bountyCreatorWallet ? [bountyCreatorWallet] : [];

  console.log(
    "[UnassignOverdueBounty] Current activity index",
    bountyActivityIndex
  );
  const [TEST_BOUNTY_ACTIVITY_UNASSIGN_PDA] = await getBountyActivityAddress(
    TEST_BOUNTY_PK,
    bountyActivityIndex
  );
  console.log(
    "Bounty activity (Unassign Overdue) PDA",
    TEST_BOUNTY_ACTIVITY_UNASSIGN_PDA.toString()
  );

  try {
    const unassignTx = await program.methods
      //@ts-ignore
      .unassignOverdueBounty({
        comment,
      })
      .accounts({
        bounty: TEST_BOUNTY_PK,
        bountySubmission: TEST_BOUNTY_SUBMISSION_PK,
        bountyActivity: TEST_BOUNTY_ACTIVITY_UNASSIGN_PDA,
        assigneeContributorRecord: TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK,
        contributorRecord: TEST_CONTRIBUTOR_RECORD_PK,
        contributorWallet: TEST_CONTRIBUTOR_WALLET.publicKey,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers(SIGNERS)
      // .simulate();
      .rpc();
    console.log("Your transaction signature", unassignTx);
  } catch (err) {
    console.log("[UnassignOverdueBounty] Transaction / Simulation fail.", err);
    throw err;
  }

  await sleep(800); // give time for the network to respond

  let updatedBountySubmissionAcc;
  console.log("--- Bounty Submission Acc (After Unassign) ---");
  try {
    updatedBountySubmissionAcc = await program.account.bountySubmission.fetch(
      TEST_BOUNTY_SUBMISSION_PK
    );
    console.log("Found", updatedBountySubmissionAcc);
  } catch (err) {
    console.log(
      "Not found. Error",
      err.name,
      "for",
      TEST_BOUNTY_SUBMISSION_PK.toString(),
      err
    );
  }

  let bountyAccAfterUnassign;
  console.log("--- Bounty Acc (After Unassign) ---");
  try {
    bountyAccAfterUnassign = await program.account.bounty.fetch(TEST_BOUNTY_PK);
    console.log("Found", bountyAccAfterUnassign);
  } catch (err) {
    console.log(
      "Not found. Error",
      err.name,
      "for",
      TEST_BOUNTY_PK.toString(),
      err
    );
  }

  let updatedAssigneeContributorRecord;
  console.log("--- Assignee Contributor Record (After Unassign) ---");
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

  // get created bounty activity acc
  let bountyActivityUnassignAcc;
  console.log("--- Bounty Activity (Unassign Overdue) Acc ---");
  try {
    bountyActivityUnassignAcc = await program.account.bountyActivity.fetch(
      TEST_BOUNTY_ACTIVITY_UNASSIGN_PDA
    );
    console.log("Found", JSON.parse(JSON.stringify(bountyActivityUnassignAcc)));
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  return {
    bountyAccAfterUnassign,
    updatedBountySubmissionAcc,
    updatedAssigneeContributorRecord,
    bountyActivityUnassignPDA: TEST_BOUNTY_ACTIVITY_UNASSIGN_PDA,
    bountyActivityUnassignAcc,
  };
};

export const cleanUpUnassignOverdue = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyActivityUnassignPDA: PublicKey
) => {
  // clean up bounty activity: Unassign Overdue
  try {
    await program.methods
      .closeBountyActivity()
      .accounts({
        bountyActivity: bountyActivityUnassignPDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(
      `Bounty activity (Unassign Overdue) acc ${bountyActivityUnassignPDA} closed`
    );
  } catch (err) {
    console.log(
      `Error clearing bounty activity (unassign Overdue) acc ${bountyActivityUnassignPDA}`,
      err.message
    );
  }
};
