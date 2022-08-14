import { AnchorProvider, Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { DaoBountyBoard } from "../../../../target/types/dao_bounty_board";
import {
  getBountySubmissionAddress,
  getContributorRecordAddress,
} from "../pda-utils";

export const setupBountySubmission = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyBoardPubkey: PublicKey,
  bountyPubkey: PublicKey,
  contributorWalletPubkey: PublicKey
) => {
  const TEST_BOUNTY_BOARD_PK = bountyBoardPubkey;
  const TEST_BOUNTY_PK = bountyPubkey;
  const TEST_CONTRIBUTOR_WALLET_PK = contributorWalletPubkey;

  const [TEST_CONTRIBUTOR_RECORD_PK] = await getContributorRecordAddress(
    TEST_BOUNTY_BOARD_PK,
    TEST_CONTRIBUTOR_WALLET_PK
  );
  console.log(
    "Test contributor record public key",
    TEST_CONTRIBUTOR_RECORD_PK.toString()
  );

  const [bountySubmissionPDA] = await getBountySubmissionAddress(
    TEST_BOUNTY_PK,
    TEST_CONTRIBUTOR_RECORD_PK
  );
  console.log("Bounty submission PDA", bountySubmissionPDA.toString());

  const LINK_TO_SUBMISSION =
    "https://assets.reedpopcdn.com/shiny-bulbasaur-evolution-perfect-iv-stats-walrein-best-moveset-pokemon-go-9004-1642763882514.jpg/BROK/resize/690%3E/format/jpg/quality/75/shiny-bulbasaur-evolution-perfect-iv-stats-walrein-best-moveset-pokemon-go-9004-1642763882514.jpg";

  try {
    const tx = await program.methods
      .submitToBounty({
        bountyPk: TEST_BOUNTY_PK,
        linkToSubmission: LINK_TO_SUBMISSION,
        contributorRecordPk: TEST_CONTRIBUTOR_RECORD_PK,
      })
      .accounts({
        bountySubmission: bountySubmissionPDA,
        contributorWallet: TEST_CONTRIBUTOR_WALLET_PK,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .rpc();

    console.log("Your transaction signature", tx);
  } catch (err) {
    console.log("Transaction / Simulation fail.", err);
  }

  console.log("--- Bounty Submission Acc ---");
  let bountySubmissionAcc;
  try {
    bountySubmissionAcc = await program.account.bountySubmission.fetch(
      bountySubmissionPDA
    );
    console.log("Found", bountySubmissionAcc);
  } catch (err) {
    console.log("Not found. Error", err.message, err);
    return;
  }

  return {
    contributorRecordPubkey: TEST_CONTRIBUTOR_RECORD_PK,
    bountySubmissionPDA,
    bountySubmissionAcc,
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
