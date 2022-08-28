import { AnchorProvider, Program, setProvider } from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Keypair, PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { BOUNTY_BOARD_PROGRAM_ID } from "../app/api/constants";
import idl from "../target/idl/dao_bounty_board.json";
import { DaoBountyBoard } from "../target/types/dao_bounty_board";
import {
  assignBounty,
  cleanUpAssignBounty,
  cleanUpCreateBounty,
  createBounty,
} from "./setup_fixtures/bounty";
import {
  cleanUpApplyToBounty,
  applyToBounty,
} from "./setup_fixtures/bounty_application";
import {
  addBountyBoardTierConfig,
  cleanUpBountyBoard,
  seedBountyBoardVault,
  setupBountyBoard,
} from "./setup_fixtures/bounty_board";
import {
  cleanUpContributorRecord,
  setupContributorRecord,
} from "./setup_fixtures/contributor_record";
import { assertReject } from "./utils/assert-promise-utils";
import { sleep } from "./utils/common";

describe("assign bounty", () => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  setProvider(provider);

  const providerWalletPublicKey = provider.wallet.publicKey;
  console.log("Provider wallet public key", providerWalletPublicKey.toString());

  const programId = new PublicKey(BOUNTY_BOARD_PROGRAM_ID);
  const program = new Program(
    JSON.parse(JSON.stringify(idl)),
    programId
  ) as Program<DaoBountyBoard>;

  // accounts involved in this test
  let TEST_REALM_PK = new PublicKey(
    "E2aMhD53dVQXeLeahVeA6gPq4RwfdtCdRQNVBTgb3bLZ"
  );
  let TEST_REALM_GOVERNANCE = Keypair.fromSeed(TEST_REALM_PK.toBytes());
  const TEST_REALM_TREASURY_USDC_ATA = new PublicKey(
    "EoCo8zx6fZiAmwNxG1xqLKHYtsQapNx39wWTJvGZaZwq"
  ); // my own ATA for the mint
  let TEST_BOUNTY_BOARD_PK;
  let TEST_BOUNTY_BOARD_VAULT_PK;

  let TEST_BOUNTY_PK;
  let TEST_BOUNTY_ESCROW_PK;
  let TEST_CREATOR_CONTRIBUTOR_RECORD_PK;

  let TEST_APPLICANT_WALLET = Keypair.fromSecretKey(
    bs58.decode(
      "2rbbsGD3LUDn6fmD8NU9o1YA9dyvvj1uBTZiJ32WqkxZs9pfParg3JZuSHZHfAPr3hy4e9dxsacuhdcd8vS3HfuC"
    )
  );
  let TEST_APPLICANT_CONTRIBUTOR_RECORD_PK;
  let TEST_BOUNTY_APPLICATION_PK;
  let TEST_BOUNTY_ACTIVITY_APPLY_PK;

  let TEST_2ND_APPLICANT_WALLET = Keypair.fromSecretKey(
    bs58.decode(
      "46M2VLp1a2gTqWA66YwdJWyJA7eqMA8nE2FY2yn7jT4RAt5JaUTuxKgEHDyMk4qABD5L3egHa1tnRX1bRXQderJE"
    )
  );
  let TEST_2ND_APPLICANT_CONTRIBUTOR_RECORD_PK;
  let TEST_2ND_BOUNTY_APPLICATION_PK;
  let TEST_2ND_BOUNTY_ACTIVITY_APPLY_PK;

  let TEST_BOUNTY_SUBMISSION_PDA;
  let TEST_BOUNTY_ACTIVITY_ASSIGN_PDA;

  // test realm public key E2aMhD53dVQXeLeahVeA6gPq4RwfdtCdRQNVBTgb3bLZ
  // Test realm governance public key CWtEZrgWftwmhFUWtmXoEGJCsB4y3ivdmv49Mde5ueqX
  // Bounty board PDA Fv4QRqNpSUkLZTwDZrsKF6qbvy5iFBVU4S1CPA4kNCTG
  // Bounty board vault PDA 5LPFgP1FcEdM7TpBKkFwczUzKhR7k1zexgt8cQKMN8XA
  // Creator contributor record public key 7oqEVQDqGLu8FpZJFhj38pGUBmmhTNGcCkNTYRFLfayX
  // Bounty PDA G8UupxD78jyWUSaNxcNs4deg4WSi95nkmcEWp5DTdFJg
  // Bounty Escrow PDA 6J68dVEsUk5Sh3CQaix5LcXSEJkegpn4zvmuS5GPLWGY
  // Test applicant public key 5yiacWPEQMiXfZvU4h7saeo4wWb2GbBC3zRoJ5UzY6Mg
  // Test applicant contributor record PDA HV9VcYCz5PDkvp6ces2Tf8wiABqVDt6LExGphNgPXxrx
  // Bounty application PDA 7JcN4MhWqHJN6Pb2Vwyb51B8Sb6vLnT4VxMTcTTHY2FE
  // Bounty activity (Apply) PDA BgrCC3t1zdGaWb3yte9TAJURLUKT67sQdboX1uXkcUzg
  // Test 2nd applicant public key 5v9WTC8HfW7TQydoYL4X2zjLVKBoUkc5q5mvFgWe1dR4
  // Test 2nd Applicant contributor record PDA GEfwnE6ssXcwoF12j64HEF63gGxuRwfbV2xx9iSZ8tXp
  // 2nd Bounty application PDA FbvtDf9eXqLEw9fbynNDpgLHcVi74LSXU3p7AEjpoEsT
  // Test 2nd Bounty activity (Apply) PDA pX26Qs6P4HSQXFCorg8BxvPSKYd54AEnS3aTD45j9U2
  // Test Bounty submission PDA C2Z72dXJajNRH2FDc9ENaK2GdAGVrx3r8VbxuXBDKXCW
  // Bounty activity (Assign) PDA JaxqZJyUYXtgVa4YwFoFyxdAqVPYSd8bZNjL3ECy2CE

  // acc level fields involved in this test
  let TEST_BOUNTY_ASSIGN_COUNT;
  let CURRENT_BOUNTY_ACTIVITY_INDEX;

  beforeEach(async () => {
    await sleep(800); // delay 800ms between each test
    console.log("-----------------------------");

    console.log("Test realm public key", TEST_REALM_PK.toString());
    // set up bounty board
    const { bountyBoardPDA, bountyBoardVaultPDA } = await setupBountyBoard(
      provider,
      program,
      TEST_REALM_PK
    );
    TEST_BOUNTY_BOARD_PK = bountyBoardPDA;
    TEST_BOUNTY_BOARD_VAULT_PK = bountyBoardVaultPDA;

    // add tiers config
    await addBountyBoardTierConfig(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_REALM_GOVERNANCE
    );

    // seed bounty board vault
    await seedBountyBoardVault(
      provider,
      bountyBoardVaultPDA,
      TEST_REALM_TREASURY_USDC_ATA,
      provider.wallet.publicKey
    );

    // set up contributor record
    const { contributorRecordPDA } = await setupContributorRecord(
      provider,
      program,
      bountyBoardPDA,
      provider.wallet.publicKey,
      TEST_REALM_GOVERNANCE,
      "Core"
    );
    TEST_CREATOR_CONTRIBUTOR_RECORD_PK = contributorRecordPDA;

    // set up bounty
    const { bountyPDA, bountyAcc, bountyEscrowPDA } = await createBounty(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_BOARD_VAULT_PK,
      TEST_CREATOR_CONTRIBUTOR_RECORD_PK
    );
    TEST_BOUNTY_PK = bountyPDA;
    TEST_BOUNTY_ESCROW_PK = bountyEscrowPDA;
    TEST_BOUNTY_ASSIGN_COUNT = bountyAcc.assignCount;
    CURRENT_BOUNTY_ACTIVITY_INDEX = bountyAcc.activityIndex;

    // set up an application to bounty
    console.log(
      "Test applicant public key",
      TEST_APPLICANT_WALLET.publicKey.toString()
    );
    console.log(
      "Test applicant secret key",
      bs58.encode(TEST_APPLICANT_WALLET.secretKey)
    );
    const {
      applicantContributorRecordPDA,
      bountyApplicationPDA,
      bountyActivityApplyPDA,
      updatedBountyAcc,
    } = await applyToBounty(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_PK,
      CURRENT_BOUNTY_ACTIVITY_INDEX,
      TEST_APPLICANT_WALLET,
      7 * 24 * 3600 // 1wk
    );
    TEST_APPLICANT_CONTRIBUTOR_RECORD_PK = applicantContributorRecordPDA;
    TEST_BOUNTY_APPLICATION_PK = bountyApplicationPDA;
    TEST_BOUNTY_ACTIVITY_APPLY_PK = bountyActivityApplyPDA;
    CURRENT_BOUNTY_ACTIVITY_INDEX = updatedBountyAcc.activityIndex;
  });

  it("assign bounty to a bounty application and update both account correctly", async () => {
    const {
      bountyAccAfterAssign,
      updatedBountyApplicationAcc,
      bountySubmissionPDA,
      bountySubmissionAcc,
      bountyActivityAssignPDA,
      bountyActivityAssignAcc,
    } = await assignBounty(
      provider,
      program,
      TEST_BOUNTY_PK,
      TEST_BOUNTY_ASSIGN_COUNT,
      CURRENT_BOUNTY_ACTIVITY_INDEX,
      TEST_BOUNTY_APPLICATION_PK
    );
    TEST_BOUNTY_SUBMISSION_PDA = bountySubmissionPDA;
    TEST_BOUNTY_ACTIVITY_ASSIGN_PDA = bountyActivityAssignPDA;
    // DON't update current_bounty_activity_index after actual test (^)

    // assert blank `bounty_submission` acc is created with correct fields
    assert.equal(
      bountySubmissionAcc.bounty.toString(),
      TEST_BOUNTY_PK.toString()
    );
    assert.equal(bountySubmissionAcc.submissionIndex, TEST_BOUNTY_ASSIGN_COUNT);
    assert.deepEqual(bountySubmissionAcc.state, { pendingSubmission: {} });
    assert.equal(
      bountySubmissionAcc.assignee.toString(),
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK.toString()
    );
    assert.closeTo(
      bountySubmissionAcc.assignedAt.toNumber(),
      new Date().getTime() / 1000,
      60
    );

    // assert `bounty` acc is updated properly
    assert.deepEqual(bountyAccAfterAssign.state, { assigned: {} });
    assert.equal(
      bountyAccAfterAssign.assignCount,
      TEST_BOUNTY_ASSIGN_COUNT + 1
    );
    assert.equal(
      bountyAccAfterAssign.activityIndex,
      CURRENT_BOUNTY_ACTIVITY_INDEX + 1
    );

    // assert ` bounty_application` acc status is updated
    assert.deepEqual(updatedBountyApplicationAcc.status, { assigned: {} });

    // assert `bounty_activity` acc is created correctly
    assert.equal(
      bountyActivityAssignAcc.bounty.toString(),
      TEST_BOUNTY_PK.toString()
    );
    assert.equal(
      bountyActivityAssignAcc.activityIndex,
      CURRENT_BOUNTY_ACTIVITY_INDEX
    );
    assert.closeTo(
      bountyActivityAssignAcc.timestamp.toNumber(),
      new Date().getTime() / 1000,
      60
    );
    assert.equal(
      bountyActivityAssignAcc.payload.assign.actorWallet.toString(),
      provider.wallet.publicKey // bounty creator
    );
    assert.equal(
      bountyActivityAssignAcc.payload.assign.assigneeWallet.toString(),
      TEST_APPLICANT_WALLET.publicKey.toString()
    );
    assert.equal(
      bountyActivityAssignAcc.payload.assign.submissionIndex,
      bountySubmissionAcc.submissionIndex
    );
  });

  it("fails if attempt to assign for an assigned bounty", async () => {
    // assign first
    const {
      bountyAccAfterAssign,
      bountySubmissionPDA,
      bountyActivityAssignPDA,
    } = await assignBounty(
      provider,
      program,
      TEST_BOUNTY_PK,
      TEST_BOUNTY_ASSIGN_COUNT,
      CURRENT_BOUNTY_ACTIVITY_INDEX,
      TEST_BOUNTY_APPLICATION_PK
    );
    TEST_BOUNTY_SUBMISSION_PDA = bountySubmissionPDA;
    TEST_BOUNTY_ACTIVITY_ASSIGN_PDA = bountyActivityAssignPDA;
    CURRENT_BOUNTY_ACTIVITY_INDEX = bountyAccAfterAssign.activityIndex;

    // set up a second application
    console.log(
      "Test 2nd applicant public key",
      TEST_2ND_APPLICANT_WALLET.publicKey.toString()
    );
    console.log(
      "Test 2nd applicant secret key",
      bs58.encode(TEST_2ND_APPLICANT_WALLET.secretKey)
    );
    const {
      updatedBountyAcc: finalBountyAcc,
      applicantContributorRecordPDA,
      bountyApplicationPDA,
      bountyActivityApplyPDA,
    } = await applyToBounty(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_PK,
      CURRENT_BOUNTY_ACTIVITY_INDEX,
      TEST_2ND_APPLICANT_WALLET,
      7 * 24 * 3600 // 1 wk
    );
    TEST_2ND_APPLICANT_CONTRIBUTOR_RECORD_PK = applicantContributorRecordPDA;
    TEST_2ND_BOUNTY_APPLICATION_PK = bountyApplicationPDA;
    TEST_2ND_BOUNTY_ACTIVITY_APPLY_PK = bountyActivityApplyPDA;
    CURRENT_BOUNTY_ACTIVITY_INDEX = finalBountyAcc.activityIndex;

    // attempt to re-assign to 2nd applicant
    await assertReject(
      () =>
        assignBounty(
          provider,
          program,
          TEST_BOUNTY_PK,
          bountyAccAfterAssign.assignCount,
          CURRENT_BOUNTY_ACTIVITY_INDEX,
          TEST_2ND_BOUNTY_APPLICATION_PK
        ),
      /BountyAlreadyAssigned/
    );

    // clean up 2nd bounty application
    console.log("Cleaning up 2nd bounty application");
    await cleanUpApplyToBounty(
      provider,
      program,
      TEST_2ND_BOUNTY_APPLICATION_PK,
      TEST_2ND_APPLICANT_CONTRIBUTOR_RECORD_PK,
      TEST_2ND_BOUNTY_ACTIVITY_APPLY_PK
    );
  });

  it("fails if attempt to assign to an expired application", async () => {
    // set up a second application with short validity
    console.log(
      "Test 2nd applicant public key",
      TEST_2ND_APPLICANT_WALLET.publicKey.toString()
    );
    console.log(
      "Test 2nd applicant secret key",
      bs58.encode(TEST_2ND_APPLICANT_WALLET.secretKey)
    );

    const {
      updatedBountyAcc,
      applicantContributorRecordPDA,
      bountyApplicationPDA,
      bountyActivityApplyPDA,
    } = await applyToBounty(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_PK,
      CURRENT_BOUNTY_ACTIVITY_INDEX,
      TEST_2ND_APPLICANT_WALLET,
      1 // 1 s
    );
    TEST_2ND_APPLICANT_CONTRIBUTOR_RECORD_PK = applicantContributorRecordPDA;
    TEST_2ND_BOUNTY_APPLICATION_PK = bountyApplicationPDA;
    TEST_2ND_BOUNTY_ACTIVITY_APPLY_PK = bountyActivityApplyPDA;
    CURRENT_BOUNTY_ACTIVITY_INDEX = updatedBountyAcc.activityIndex;

    console.log("Enter sleep");
    await sleep(2000); // sleep 2s to ensure application has expired
    console.log("Exit sleep");

    // attempt to assign to 2nd applicant with short application validity
    await assertReject(
      () =>
        assignBounty(
          provider,
          program,
          TEST_BOUNTY_PK,
          TEST_BOUNTY_ASSIGN_COUNT,
          CURRENT_BOUNTY_ACTIVITY_INDEX,
          TEST_2ND_BOUNTY_APPLICATION_PK
        ),
      /BountyApplicationExpired/
    );

    // clean up 2nd bounty application
    console.log("Cleaning up 2nd bounty application");
    await cleanUpApplyToBounty(
      provider,
      program,
      TEST_2ND_BOUNTY_APPLICATION_PK,
      TEST_2ND_APPLICANT_CONTRIBUTOR_RECORD_PK,
      TEST_2ND_BOUNTY_ACTIVITY_APPLY_PK
    );
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");

    if (TEST_BOUNTY_ACTIVITY_ASSIGN_PDA || TEST_BOUNTY_SUBMISSION_PDA) {
      // if assertRejects fails, the extra bounty submission created with TEST_2ND_APPLICATION may not be cleaned up
      await cleanUpAssignBounty(
        provider,
        program,
        TEST_BOUNTY_ACTIVITY_ASSIGN_PDA,
        TEST_BOUNTY_SUBMISSION_PDA
      );
    }

    // clean up bounty application created
    await cleanUpApplyToBounty(
      provider,
      program,
      TEST_BOUNTY_APPLICATION_PK,
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
      TEST_BOUNTY_ACTIVITY_APPLY_PK
    );
    // clean up bounty-related accounts
    await cleanUpCreateBounty(
      provider,
      program,
      TEST_BOUNTY_PK,
      TEST_BOUNTY_ESCROW_PK,
      TEST_BOUNTY_BOARD_VAULT_PK
    );
    // clean up creator contributor record
    await cleanUpContributorRecord(
      provider,
      program,
      TEST_CREATOR_CONTRIBUTOR_RECORD_PK
    );
    // clean up bounty board-related accounts
    await cleanUpBountyBoard(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_BOARD_VAULT_PK,
      TEST_REALM_TREASURY_USDC_ATA
    );
  });
});
