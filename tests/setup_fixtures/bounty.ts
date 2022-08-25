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
import { readableTokenAcc } from "../utils/common";
import {
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

export const setupBounty = async (
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

  let bountyAcc;
  let bountyEscrowAcc: Account;
  console.log("--- Bounty Acc ---");
  try {
    bountyAcc = await program.account.bounty.fetch(BOUNTY_PDA);
    console.log("Found", JSON.parse(JSON.stringify(bountyAcc)));
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

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

export const assignBounty = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyPubkey: PublicKey,
  bountyAssignCount: number,
  bountyApplicationPubkey: PublicKey
) => {
  const TEST_BOUNTY_PK = bountyPubkey;
  const TEST_BOUNTY_APPLICATION_PK = bountyApplicationPubkey;

  const [bountySubmissionPDA] = await getBountySubmissionAddress(
    bountyPubkey,
    bountyAssignCount
  );
  console.log("Bounty submission PDA", bountySubmissionPDA.toString());

  try {
    const tx = await program.methods
      .assignBounty()
      .accounts({
        bounty: TEST_BOUNTY_PK,
        bountyApplication: TEST_BOUNTY_APPLICATION_PK,
        bountySubmission: bountySubmissionPDA,
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

  // get updated bounty acc
  let updatedBountyAcc;
  console.log("--- Bounty Acc (After Assign) ---");
  try {
    updatedBountyAcc = await program.account.bounty.fetch(TEST_BOUNTY_PK);
    console.log("Found", JSON.parse(JSON.stringify(updatedBountyAcc)));
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
      bountySubmissionPDA
    );
    console.log("Found", JSON.parse(JSON.stringify(bountySubmissionAcc)));
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  return {
    updatedBountyAcc,
    updatedBountyApplicationAcc,
    bountySubmissionPDA,
    bountySubmissionAcc,
  };
};

export const unassignOverdueBounty = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyPubkey: PublicKey,
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
  try {
    const unassignTx = await program.methods
      //@ts-ignore
      .unassignOverdueBounty({
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
      // .simulate();
      .rpc();
    console.log("Your transaction signature", unassignTx);
  } catch (err) {
    console.log("[UnassignOverdueBounty] Transaction / Simulation fail.", err);
    throw err;
  }

  let updatedBountySubmissionAcc;
  let updatedBountyAcc;
  let updatedAssigneeContributorRecord;

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

  console.log("--- Bounty Acc (After Unassign) ---");
  try {
    updatedBountyAcc = await program.account.bounty.fetch(TEST_BOUNTY_PK);
    console.log("Found", updatedBountyAcc);
  } catch (err) {
    console.log(
      "Not found. Error",
      err.name,
      "for",
      TEST_BOUNTY_PK.toString(),
      err
    );
  }

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

  return {
    updatedBountySubmissionAcc,
    updatedBountyAcc,
    updatedAssigneeContributorRecord,
  };
};

export const cleanUpBounty = async (
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
