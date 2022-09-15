import { AnchorProvider, Program } from "@project-serum/anchor";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { getBountyBoardVaults } from "./bounty-board";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import idl from "../../target/idl/dao_bounty_board.json";
import { BOUNTY_BOARD_PROGRAM_ID, DUMMY_MINT_PK } from "./constants";
import {
  getBountyBoardAddress,
  getBountyBoardVaultAddress,
  getBountyEscrowAddress,
} from "./utils";
import { getAllContributorRecordsForRealm } from "./contributor-record";
import { getBounties } from "./bounty";
import { getBountyApplications } from "./bounty-application";
import { getBountySubmissions } from "./bounty-submission";
import { getBountyActivities } from "./bounty-activity";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { PaperWallet } from "../utils/paper-wallet";

export const restart = async (connection: Connection) => {
  // setup

  // use paper wallet so don't have to approve operation for each .close() call from browser
  const paperWalletKeypair = Keypair.fromSecretKey(
    bs58.decode(process.env.SK as string)
  );

  const paperProvider = new AnchorProvider(
    connection,
    new PaperWallet(paperWalletKeypair, false),
    {
      commitment: "recent",
    }
  );

  const programId = new PublicKey(BOUNTY_BOARD_PROGRAM_ID);
  const program = new Program(
    JSON.parse(JSON.stringify(idl)),
    programId,
    paperProvider
  ) as Program<DaoBountyBoard>;

  // get all related accounts

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
    paperProvider,
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
  const contributorRecordPKs = contributorRecords.map(
    (r) => new PublicKey(r.pubkey)
  );
  console.log(
    `Contributor records ${contributorRecordPKs.length}`,
    contributorRecords
  );

  const bounties = await getBounties(connection, program, bountyBoardPDA);
  const bountyPKs = bounties.map((b) => new PublicKey(b.pubkey));
  console.log(`Bounties ${bountyPKs.length}`, bounties);
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
        user: paperProvider.wallet.publicKey,
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
        user: paperProvider.wallet.publicKey,
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
        user: paperProvider.wallet.publicKey,
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
    // close bounty escrow account first
    await program.methods
      .closeBountyEscrow()
      .accounts({
        bounty: bounty,
        bountyEscrow: bountyEscrow,
        bountyBoardVault: bountyBoardVault,
        user: paperProvider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log(`Bounty escrow acc ${bountyEscrow} closed`);

    // close bounty account
    await program.methods
      .closeBounty()
      .accounts({
        bounty: bounty,
        user: paperProvider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`Bounty acc ${bounty.toString()} closed`);
  }

  for (const contributorRecord of contributorRecordPKs) {
    await program.methods
      .closeContributorRecord()
      .accounts({
        contributorRecord: contributorRecord,
        user: paperProvider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`Contributor record acc ${contributorRecord} closed`);
  }

  // close bounty board vault account first
  const bountyBoardVaultPDA = await getBountyBoardVaultAddress(
    bountyBoardPDA,
    TEST_MINT_PK
  );
  await program.methods
    .closeBountyBoardVault()
    .accounts({
      bountyBoard: bountyBoardPDA,
      bountyBoardVault: bountyBoardVaultPDA,
      // FFeqLD5am9P3kPJAdXDUcymJirvkAe6GvbkZcva1RtRj
      // GZywBMtMyZTR5MnFJsnBkDrJHPWovHoc2P6sENFEzyZy
      realmTreasuryAta: TEST_REALM_TREASURY_USDC_ATA,
      user: paperProvider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
  console.log(
    `Bounty board vault acc ${bountyBoardVaultPDA.toString()} closed`
  );

  // close bounty board account
  await program.methods
    .closeBountyBoard()
    .accounts({
      bountyBoard: bountyBoardPDA,
      // 2FzQVjh1SMCr2dbdCpw5PwxvQVp5ugFoeJpmfdHgqsw8
      // 5b9FGEPHJqGoPa9XvdBsdD83gXYEKmJb6zWUsxxBigHj
      user: paperProvider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  console.log(`Bounty board acc ${bountyBoardPDA.toString()} closed`);
};
