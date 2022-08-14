import { AnchorProvider, Program } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { DaoBountyBoard } from "../../../../target/types/dao_bounty_board";
import { getContributorRecordAddress } from "../pda-utils";

export const setupContributorRecord = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyBoardPubkey: PublicKey,
  contributorWalletPubkey: PublicKey,
  realmGovernance: Keypair,
  roleName: string
) => {
  const TEST_BOUNTY_BOARD_PK = bountyBoardPubkey;
  const TEST_CONTRIBUTOR_WALLET_PK = contributorWalletPubkey;
  const TEST_ROLE_NAME = roleName;
  const TEST_REALM_GOVERNANCE = realmGovernance;

  const [TEST_CONTRIBUTOR_RECORD_PDA] = await getContributorRecordAddress(
    TEST_BOUNTY_BOARD_PK,
    TEST_CONTRIBUTOR_WALLET_PK
  );
  console.log("Contributor record PDA", TEST_CONTRIBUTOR_RECORD_PDA.toString());

  try {
    const tx = await program.methods
      //@ts-ignore
      .addContributorWithRole({
        contributorWallet: TEST_CONTRIBUTOR_WALLET_PK,
        roleName: TEST_ROLE_NAME,
      })
      .accounts({
        bountyBoard: TEST_BOUNTY_BOARD_PK,
        contributorRecord: TEST_CONTRIBUTOR_RECORD_PDA,
        realmGovernance: TEST_REALM_GOVERNANCE.publicKey,
        proposalExecutor: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([TEST_REALM_GOVERNANCE])
      // .instruction();
      .rpc();
    console.log("Your transaction signature", tx);
  } catch (err) {
    console.log("[AddContributorWithRole] Transaction / Simulation fail.", err);
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
    contributorRecordPDA: TEST_CONTRIBUTOR_RECORD_PDA,
    contributorRecordAcc,
  };
};

export const cleanUpContributorRecord = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  contributorRecordPDA: PublicKey
) => {
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
    return;
  }
};
