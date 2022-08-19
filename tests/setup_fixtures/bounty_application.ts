import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import {
  getBountyApplicationAddress,
  getContributorRecordAddress,
} from "../utils/get_addresses";

export const setupBountyApplication = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  testBountyBoardPubkey: PublicKey,
  testBountyPubkey: PublicKey,
  testApplicantWallet: Keypair,
  validity: number // time in seconds
) => {
  const TEST_BOUNTY_BOARD_PK = testBountyBoardPubkey;
  const TEST_BOUNTY_PK = testBountyPubkey;
  const TEST_APPLICANT_WALLET = testApplicantWallet;
  const TEST_APPLICANT_PK = testApplicantWallet.publicKey;
  const VALIDITY = new BN(validity);

  // airdrop applicant wallet some sol
  // uncomment as required
  // try {
  //   const airdropTx = await provider.connection.requestAirdrop(
  //     TEST_APPLICANT_PK,
  //     1e9
  //   );
  //   console.log("Airdrop test applicant tx", airdropTx);
  //   const testApplicantWalletBalance = await provider.connection.getBalance(
  //     TEST_APPLICANT_PK
  //   );
  //   console.log(
  //     "Test applicant wallet lamport balance",
  //     testApplicantWalletBalance
  //   );
  // } catch (err) {
  //   console.error(`Error to airdrop ${TEST_APPLICANT_PK} sol`);
  // }

  const [TEST_APPLICANT_CONTRIBUTOR_RECORD_PDA] =
    await getContributorRecordAddress(TEST_BOUNTY_BOARD_PK, TEST_APPLICANT_PK);
  console.log(
    "Applicant contributor record PDA",
    TEST_APPLICANT_CONTRIBUTOR_RECORD_PDA.toString()
  );

  const [TEST_BOUNTY_APPLICATION_PDA] = await getBountyApplicationAddress(
    TEST_BOUNTY_PK,
    TEST_APPLICANT_CONTRIBUTOR_RECORD_PDA
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
        contributorRecord: TEST_APPLICANT_CONTRIBUTOR_RECORD_PDA,
        applicant: TEST_APPLICANT_PK,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers([TEST_APPLICANT_WALLET])
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

  return {
    bountyApplicationPDA: TEST_BOUNTY_APPLICATION_PDA,
    bountyApplicationAcc,
    applicantContributorRecordPDA: TEST_APPLICANT_CONTRIBUTOR_RECORD_PDA,
    applicantContributorRecordAcc,
  };
};

export const cleanUpBountyApplication = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyApplicationPDA: PublicKey,
  applicantContributorRecordPDA: PublicKey
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
