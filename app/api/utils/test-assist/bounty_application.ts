import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { DaoBountyBoard } from "../../../../target/types/dao_bounty_board";
import {
  getBountyApplicationAddress,
  getContributorRecordAddress,
} from "../pda-utils";

export const setupBountyApplication = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  testBountyBoardPubkey: PublicKey,
  testBountyPubkey: PublicKey,
  testApplicantPubkey: PublicKey
) => {
  const TEST_BOUNTY_BOARD_PK = testBountyBoardPubkey;
  const TEST_BOUNTY_PK = testBountyPubkey;
  const TEST_APPLICANT_PK = testApplicantPubkey;
  const VALIDITY = new BN(7 * 24 * 3600); // 1 wk

  const [TEST_CONTRIBUTOR_RECORD_PDA] = await getContributorRecordAddress(
    TEST_BOUNTY_BOARD_PK,
    TEST_APPLICANT_PK
  );
  console.log("Contributor record PDA", TEST_CONTRIBUTOR_RECORD_PDA.toString());

  const [TEST_BOUNTY_APPLICATION_PDA] = await getBountyApplicationAddress(
    TEST_BOUNTY_PK,
    TEST_CONTRIBUTOR_RECORD_PDA
  );
  console.log("Bounty application PDA", TEST_BOUNTY_APPLICATION_PDA.toString());

  try {
    const tx = await program.methods
      .applyToBounty({
        validity: VALIDITY,
      })
      .accounts({
        bountyBoard: TEST_BOUNTY_BOARD_PK,
        bounty: TEST_BOUNTY_PK,
        bountyApplication: TEST_BOUNTY_APPLICATION_PDA,
        contributorRecord: TEST_CONTRIBUTOR_RECORD_PDA,
        applicant: TEST_APPLICANT_PK,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      // .simulate();
      .rpc();
    console.log("Your transaction signature", tx);
  } catch (err) {
    console.log("[ApplyToBounty] Transaction / Simulation fail.", err);
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

  let contributorRecordAcc;
  console.log("--- Contributor Record Acc ---");
  try {
    contributorRecordAcc = await program.account.contributorRecord.fetch(
      TEST_CONTRIBUTOR_RECORD_PDA
    );
    console.log("Found", JSON.parse(JSON.stringify(contributorRecordAcc)));
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  return {
    bountyApplicationPDA: TEST_BOUNTY_APPLICATION_PDA,
    bountyApplicationAcc,
    contributorRecordPDA: TEST_CONTRIBUTOR_RECORD_PDA,
    contributorRecordAcc,
  };
};

export const cleanUpBountyApplication = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyApplicationPDA: PublicKey,
  contributorRecordPDA: PublicKey
) => {
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
        contributorRecord: contributorRecordPDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`Contributor record acc ${contributorRecordPDA} closed`);
  } catch (err) {
    console.log(
      `Error clearing contributor record acc ${contributorRecordPDA}`,
      err.message
    );
  }
};
