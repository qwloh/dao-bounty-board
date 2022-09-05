import "dotenv/config";
import {
  AnchorProvider,
  Program,
  setProvider,
  Wallet,
} from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { DaoBountyBoard } from "../../../target/types/dao_bounty_board";
import { BOUNTY_BOARD_PROGRAM_ID, DUMMY_MINT_PK } from "../constants";
import { cleanUpBountyBoard } from "../../../tests/setup_fixtures/bounty_board";
import { cleanUpCreateBounty } from "../../../tests/setup_fixtures/bounty";
import { cleanUpContributorRecord } from "../../../tests/setup_fixtures/contributor_record";
import idl from "../../../target/idl/dao_bounty_board.json";
import {
  getBountyBoardAddress,
  getBountyBoardVaultAddress,
  getBountyEscrowAddress,
} from "./pda-utils";
import { deleteBounty, getBounties } from "../bounty";
import { getBountyApplications } from "../bounty-application";
import { getBountySubmissions } from "../bounty-submission";
import { getBountyActivities } from "../bounty-activity";
import { getAllContributorRecordsForRealm } from "../contributor-record";
import { getBountyBoardVaults } from "..";

// bounty board PDA 3q3na9snfaaVi5e4qNNFRzQiXyRF6RiFQ15aSPBWxtKf
// bounty board vault PDA EMZypZAEaHxGhJPbU6HCYYJxYzGnNGPDgmH1GsKcEjBN
// First vault mint ATA ApSd7STwzfVVopcMGVAHfHAAJ89g1y1RouCWphTwWN1m
// Council mint governance 63t4tEfLcBwRvhHuTX9BGVT1iHm5dJjez1Bbb5QS9XJF
// Contributor record 3Vcc8yZ8TStRVNGA79RFVNZ42PonYGztv7bLsD7Nje7B

(async () => {
  const paperWalletKeypair = Keypair.fromSecretKey(
    bs58.decode(process.env.SK as string)
  );

  const connection = new Connection(clusterApiUrl("devnet"), "recent");
  const provider = new AnchorProvider(
    connection,
    new Wallet(paperWalletKeypair),
    {
      commitment: "recent",
    }
  );
  setProvider(provider);

  const programId = new PublicKey(BOUNTY_BOARD_PROGRAM_ID);
  const program = new Program(
    JSON.parse(JSON.stringify(idl)),
    programId
  ) as Program<DaoBountyBoard>;

  console.log("--- All accounts to cleanup ---");
  const TEST_REALM_PK = new PublicKey(
    "885LdWunq8rh7oUM6kMjeGV56T6wYNMgb9o6P7BiT5yX"
  );
  const TEST_MINT_PK = new PublicKey(DUMMY_MINT_PK.USDC);
  const TEST_REALM_TREASURY_USDC_ATA = new PublicKey(
    "ApSd7STwzfVVopcMGVAHfHAAJ89g1y1RouCWphTwWN1m"
  );

  const [bountyBoardPDA] = await getBountyBoardAddress(TEST_REALM_PK);
  console.log(`Bounty board ${bountyBoardPDA}`);
  const bountyBoardVaults = await getBountyBoardVaults(
    provider,
    bountyBoardPDA
  );
  console.log(
    `Bounty board vaults ${bountyBoardVaults.length}`,
    bountyBoardVaults.map((v) => v.address.toString())
  );
  const contributorRecords = await getAllContributorRecordsForRealm(
    connection,
    program,
    TEST_REALM_PK
  );
  const contributorRecordPKs = contributorRecords.map((r) => new PublicKey(r));
  console.log(
    `Contributor records ${contributorRecordPKs.length}`,
    contributorRecords
  );

  const bountyPKs = await getBounties(connection, program, bountyBoardPDA);
  console.log(
    `Bounties ${bountyPKs.length}`,
    bountyPKs.map((b) => b.toString())
  );
  const bountyEscrowPKs = [];

  const bountyApplicationPKs = [];
  const bountySubmissionPKs = [];
  const bountyActivityPKs = [];
  for (const bountyPK of bountyPKs) {
    const escrowPK = await getBountyEscrowAddress(bountyPK, TEST_MINT_PK);
    bountyEscrowPKs.push(escrowPK);
    const applications = await getBountyApplications(program, bountyPK);
    const applicationPKs = applications.map((a) => a.pubkey);
    bountyApplicationPKs.push(...applicationPKs);
    const submissions = await getBountySubmissions(program, bountyPK);
    const submissionPKs = submissions.map((s) => s.pubkey);
    bountySubmissionPKs.push(...submissionPKs);
    const activities = await getBountyActivities(program, bountyPK);
    const activityPKs = activities.map((a) => a.pubkey);
    bountyActivityPKs.push(...activityPKs);
  }
  console.log(
    `Bounty escrows ${bountyEscrowPKs.length}`,
    bountyEscrowPKs.map((e) => e.toString())
  );
  console.log(
    `Bounty applications ${bountyApplicationPKs.length}`,
    bountyApplicationPKs.map((b) => b.toString())
  );
  console.log(
    `Bounty submissions ${bountySubmissionPKs.length}`,
    bountySubmissionPKs.map((s) => s.toString())
  );
  console.log(
    `Bounty activities ${bountyActivityPKs.length}`,
    bountyActivityPKs.map((a) => a.toString())
  );

  console.log("--- Cleanup logs ---");

  for (const activity of bountyActivityPKs) {
    await program.methods
      .closeBountyActivity()
      .accounts({
        bountyActivity: activity,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`Bounty activity ${activity} closed`);
  }

  for (const submission of bountySubmissionPKs) {
    await program.methods
      .closeBountySubmission()
      .accounts({
        bountySubmission: submission,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`Bounty submission ${submission} closed`);
  }

  for (const application of bountyApplicationPKs) {
    await program.methods
      .closeBountyApplication()
      .accounts({
        bountyApplication: application,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`Bounty application ${application} closed`);
  }

  for (const bounty of bountyPKs) {
    const bountyEscrow = await getBountyEscrowAddress(bounty, TEST_MINT_PK);
    const bountyBoardVault = await getBountyBoardVaultAddress(
      bountyBoardPDA,
      TEST_MINT_PK
    );
    await cleanUpCreateBounty(
      provider,
      program,
      bounty,
      bountyEscrow,
      bountyBoardVault
    );
  }

  for (const contributorRecord of contributorRecordPKs) {
    await program.methods
      .closeContributorRecord()
      .accounts({
        contributorRecord,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  const bountyBoardVaultPDA = await getBountyBoardVaultAddress(
    bountyBoardPDA,
    TEST_MINT_PK
  );
  await cleanUpBountyBoard(
    provider,
    program,
    bountyBoardPDA,
    bountyBoardVaultPDA,
    TEST_REALM_TREASURY_USDC_ATA
  );

  // const TEST_BOUNTY_BOARD_PK = new PublicKey(
  //   "3q3na9snfaaVi5e4qNNFRzQiXyRF6RiFQ15aSPBWxtKf"
  // );
  // const TEST_BOUNTY_BOARD_VAULT_PK = new PublicKey(
  //   "EMZypZAEaHxGhJPbU6HCYYJxYzGnNGPDgmH1GsKcEjBN"
  // );
  // const TEST_REALM_TREASURY_USDC_ATA = new PublicKey(
  //   "ApSd7STwzfVVopcMGVAHfHAAJ89g1y1RouCWphTwWN1m"
  // );
  // const TEST_CONTRIBUTOR_RECORD_PK = new PublicKey(
  //   "3Vcc8yZ8TStRVNGA79RFVNZ42PonYGztv7bLsD7Nje7B"
  // );
})();
