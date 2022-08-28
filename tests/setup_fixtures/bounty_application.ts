import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import {
  getBountyActivityAddress,
  getBountyApplicationAddress,
  getContributorRecordAddress,
} from "../utils/get_addresses";

export const applyToBounty = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  testBountyBoardPubkey: PublicKey,
  testBountyPubkey: PublicKey,
  bountyActivityIndex: number,
  testApplicantWallet: Keypair,
  validity: number // time in seconds
) => {
  const TEST_BOUNTY_BOARD_PK = testBountyBoardPubkey;
  const TEST_BOUNTY_PK = testBountyPubkey;
  const TEST_APPLICANT_WALLET = testApplicantWallet;
  const TEST_APPLICANT_PK = testApplicantWallet.publicKey;
  const VALIDITY = new BN(validity);

  const testApplicantWalletBalance = await provider.connection.getBalance(
    TEST_APPLICANT_PK
  );
  console.log(
    "Test applicant wallet lamport balance",
    testApplicantWalletBalance
  );

  const [TEST_APPLICANT_CONTRIBUTOR_RECORD_PDA] =
    await getContributorRecordAddress(TEST_BOUNTY_BOARD_PK, TEST_APPLICANT_PK);
  console.log(
    "Applicant contributor record PDA",
    TEST_APPLICANT_CONTRIBUTOR_RECORD_PDA.toString()
  );

  console.log("[ApplyToBounty] Current activity index", bountyActivityIndex);
  const [TEST_BOUNTY_APPLICATION_PDA] = await getBountyApplicationAddress(
    TEST_BOUNTY_PK,
    TEST_APPLICANT_CONTRIBUTOR_RECORD_PDA
  );
  console.log("Bounty application PDA", TEST_BOUNTY_APPLICATION_PDA.toString());

  const [TEST_BOUNTY_ACTIVITY_APPLY_PDA] = await getBountyActivityAddress(
    TEST_BOUNTY_PK,
    bountyActivityIndex
  );
  console.log(
    "Bounty activity (Apply) PDA",
    TEST_BOUNTY_ACTIVITY_APPLY_PDA.toString()
  );

  try {
    const tx = await program.methods
      .applyToBounty({
        validity: VALIDITY,
      })
      .accounts({
        bountyBoard: TEST_BOUNTY_BOARD_PK,
        bounty: TEST_BOUNTY_PK,
        bountyApplication: TEST_BOUNTY_APPLICATION_PDA,
        bountyActivity: TEST_BOUNTY_ACTIVITY_APPLY_PDA,
        contributorRecord: TEST_APPLICANT_CONTRIBUTOR_RECORD_PDA,
        applicant: TEST_APPLICANT_PK,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers([TEST_APPLICANT_WALLET])
      // .transaction();
      // .simulate();
      // .instruction();
      .rpc();
    // console.log(
    //   "Instruction",
    //   tx.keys.map((k) => ({ ...k, pubkey: k.pubkey.toString() }))
    // );
    // const res = await provider.connection.simulateTransaction(tx, [
    //   paperWallet,
    // ]);
    console.log("Your transaction signature", tx);
  } catch (err) {
    console.log("[ApplyToBounty] Transaction / Simulation fail.", err);
    throw err;
  }

  let bountyApplicationAcc;
  console.log("--- Bounty Application Acc ---");
  try {
    bountyApplicationAcc = await program.account.bountyApplication.fetch(
      TEST_BOUNTY_APPLICATION_PDA
    );
    console.log("Found", JSON.parse(JSON.stringify(bountyApplicationAcc)));
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  let applicantContributorRecordAcc;
  console.log("--- Contributor Record Acc ---");
  try {
    applicantContributorRecordAcc =
      await program.account.contributorRecord.fetch(
        TEST_APPLICANT_CONTRIBUTOR_RECORD_PDA
      );
    console.log(
      "Found",
      JSON.parse(JSON.stringify(applicantContributorRecordAcc))
    );
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  let bountyActivityApplyAcc;
  console.log("--- Bounty Activity (Apply) Acc ---");
  try {
    bountyActivityApplyAcc = await program.account.bountyActivity.fetch(
      TEST_BOUNTY_ACTIVITY_APPLY_PDA
    );
    console.log("Found", JSON.parse(JSON.stringify(bountyActivityApplyAcc)));
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  let updatedBountyAcc;
  console.log("--- Bounty Acc (After apply) ---");
  try {
    updatedBountyAcc = await program.account.bounty.fetch(TEST_BOUNTY_PK);
    console.log("Found. New activity_index", updatedBountyAcc.activityIndex);
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  return {
    bountyApplicationPDA: TEST_BOUNTY_APPLICATION_PDA,
    bountyApplicationAcc,
    applicantContributorRecordPDA: TEST_APPLICANT_CONTRIBUTOR_RECORD_PDA,
    applicantContributorRecordAcc,
    bountyActivityApplyPDA: TEST_BOUNTY_ACTIVITY_APPLY_PDA,
    bountyActivityApplyAcc,
    updatedBountyAcc,
  };
};

export const cleanUpApplyToBounty = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyApplicationPDA: PublicKey,
  applicantContributorRecordPDA: PublicKey,
  bountyActivityApplyPDA: PublicKey
) => {
  // clean up bounty activity: apply
  try {
    await program.methods
      .closeBountyActivity()
      .accounts({
        bountyActivity: bountyActivityApplyPDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`Bounty activity (Apply) acc ${bountyActivityApplyPDA} closed`);
  } catch (err) {
    console.log(
      `Error clearing bounty activity (Apply) acc ${bountyActivityApplyPDA}`,
      err.message
    );
  }
  // clean up bounty application
  try {
    await program.methods
      .closeBountyApplication()
      .accounts({
        bountyApplication: bountyApplicationPDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`Bounty application acc ${bountyApplicationPDA} closed`);
  } catch (err) {
    console.log(
      `Error clearing bounty application acc ${bountyApplicationPDA}`,
      err.message
    );
  }
  // clean up contributor record
  try {
    await program.methods
      .closeContributorRecord()
      .accounts({
        contributorRecord: applicantContributorRecordPDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(
      `Contributor record acc ${applicantContributorRecordPDA} closed`
    );
  } catch (err) {
    console.log(
      `Error clearing contributor record acc ${applicantContributorRecordPDA}`,
      err.message
    );
  }

  // clean up sol in applicant contributor account
};
