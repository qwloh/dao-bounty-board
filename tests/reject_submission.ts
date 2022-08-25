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
  rejectSubmission,
  requestChangesToSubmission,
  submitToBlankSubmission,
  updateSubmission,
} from "./setup_fixtures/bounty_submission";
import {
  cleanUpContributorRecord,
  setupContributorRecord,
} from "./setup_fixtures/contributor_record";
import { assertReject } from "./utils/assert-promise-utils";

describe("reject submission", () => {
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
    "DbHx5G1tnyNowB2QE6gQ4naMhCajRFt1qTmnvkoLeJsp"
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
      "iyLzQv9Z7S9211jWYqvaKAgvZ6Y8wNJvPfrgDpvLH7ymArtGtU3hxpVoPTcEwNjtcfzLBDKBffVzgbtAZUNuFsA"
    )
  );
  let TEST_APPLICANT_CONTRIBUTOR_RECORD_PK;
  let TEST_BOUNTY_APPLICATION_PK;
  let TEST_BOUNTY_ACTIVITY_APPLY_PK;

  let TEST_BOUNTY_SUBMISSION_PK;
  let TEST_BOUNTY_ACTIVITY_ASSIGN_PK;

  // Test realm public key DbHx5G1tnyNowB2QE6gQ4naMhCajRFt1qTmnvkoLeJsp
  // Test realm governance public key 35aVVbDFniRgTVXG38LhgVzuy2M6AXEN8fBfVNA91NgW
  // Bounty board PDA Epca2LNwoGPu9KbkHeoKmGfeBdhjkUbgKtvi4PvWjsQz
  // Bounty board vault PDA 9xjgAjpn19kVS7BkRbmiQChDJCZmy5q6QXtGuDZyCwFp
  // Test creator contributor record PDA 7dhvZXKUexExfqSJN2BgUDhdWZx3YUMwUkXnjbRffy7d
  // Test applicant public key DUzWFaSfEYFesRuTS2jbMcivphVor26DEJzaS6KYufMv
  // Test applicant secret key iyLzQv9Z7S9211jWYqvaKAgvZ6Y8wNJvPfrgDpvLH7ymArtGtU3hxpVoPTcEwNjtcfzLBDKBffVzgbtAZUNuFsA
  // Test applicant wallet lamport balance 0
  // Applicant contributor record PDA HNzW3d8RJ7BZ1pUumZEDR1JTnw5t4aprcZnUCQB7SLQY
  // Bounty application PDA 2846KxjH2YwTTuYuKVTX5VS8mgmrXTCdaiL4UZ7yWuUr
  // Bounty activity (Apply) PDA CGwczNQww7jFVB2skoMrwQwWQDT9KtyZdJ5C8WmaWsfE
  // Bounty submission PDA 314BvwETHHjn9wv9HGn4y9jNvMvHXi29xEB78gpU9m2s
  // Bounty activity (Assign) PDA 8dsVbm1b82oGWb5MgxSJFkXw9QAbPx1bsc5iB44odZyE

  // acc level fields involved in this test
  let TEST_BOUNTY_ASSIGN_COUNT;
  let CURRENT_BOUNTY_ACTIVITY_INDEX;

  // test specific setup fn
  const accelerateIteration = async (iterationCount: number) => {
    for (let i = 0; i < iterationCount; i++) {
      await requestChangesToSubmission(
        provider,
        program,
        TEST_BOUNTY_SUBMISSION_PK,
        TEST_BOUNTY_PK,
        TEST_CREATOR_CONTRIBUTOR_RECORD_PK,
        undefined // sign with provider.wallet
      );
      await updateSubmission(
        provider,
        program,
        TEST_BOUNTY_SUBMISSION_PK,
        TEST_BOUNTY_PK,
        TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
        TEST_APPLICANT_WALLET
      );
    }
  };

  beforeEach(async () => {
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
    const { bountyPDA, bountyEscrowPDA, bountyAcc } = await createBounty(
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

    // create bounty application
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

    // assign bounty
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
    TEST_BOUNTY_SUBMISSION_PK = bountySubmissionPDA;
    TEST_BOUNTY_ACTIVITY_ASSIGN_PK = bountyActivityAssignPDA;
    CURRENT_BOUNTY_ACTIVITY_INDEX = bountyAccAfterAssign.activityIndex;

    // create bounty submission
    await submitToBlankSubmission(
      provider,
      program,
      TEST_BOUNTY_PK,
      TEST_BOUNTY_SUBMISSION_PK,
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
      TEST_APPLICANT_WALLET
    );
  });

  it("update bounty acc and bounty submission acc correctly after rejection", async () => {
    // do something to make request change count hit 3
    await accelerateIteration(3);

    const { updatedBountySubmissionAcc, updatedBountyAcc } =
      await rejectSubmission(
        provider,
        program,
        TEST_BOUNTY_SUBMISSION_PK,
        TEST_BOUNTY_PK,
        TEST_CREATOR_CONTRIBUTOR_RECORD_PK,
        undefined // use provider.wallet to sign
      );

    // assert `bounty_submission` acc is updated correctly
    assert.deepEqual(updatedBountySubmissionAcc.state, {
      rejected: {},
    });
    assert.closeTo(
      updatedBountySubmissionAcc.rejectedAt.toNumber(),
      new Date().getTime() / 1000,
      60 // 1 min tolerance
    );

    // assert `bounty` acc is updated correctly
    assert.deepEqual(updatedBountyAcc.state, { open: {} });
    assert.equal(updatedBountyAcc.unassignCount, 1);

    // assert bounty activity
  });

  it("should not let non-creator reject bounty", async () => {
    await assertReject(
      () =>
        rejectSubmission(
          provider,
          program,
          TEST_BOUNTY_SUBMISSION_PK,
          TEST_BOUNTY_PK,
          // reject as applicant instead of bounty creator
          TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
          TEST_APPLICANT_WALLET
        ),
      /NotAuthorizedToRejectSubmission/
    );
  });

  it("should throw if min iteration count not reached", async () => {
    await assertReject(
      () =>
        rejectSubmission(
          provider,
          program,
          TEST_BOUNTY_SUBMISSION_PK,
          TEST_BOUNTY_PK,
          TEST_CREATOR_CONTRIBUTOR_RECORD_PK,
          undefined // use provider.wallet to sign
        ),
      /MinIterationCountNotReached/
    );
  });

  it("on 3rd request change, should not let creator reject bounty before contributor update submission to address changes", async () => {
    // create submission
    await accelerateIteration(2);
    // 3rd request
    await requestChangesToSubmission(
      provider,
      program,
      TEST_BOUNTY_SUBMISSION_PK,
      TEST_BOUNTY_PK,
      TEST_CREATOR_CONTRIBUTOR_RECORD_PK,
      undefined // sign with provider.wallet
    );

    await assertReject(
      () =>
        rejectSubmission(
          provider,
          program,
          TEST_BOUNTY_SUBMISSION_PK,
          TEST_BOUNTY_PK,
          TEST_CREATOR_CONTRIBUTOR_RECORD_PK,
          undefined // use provider.wallet to sign
        ),
      /MinIterationCountNotReached/
    );
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    // clean up accounts created from assign
    await cleanUpAssignBounty(
      provider,
      program,
      TEST_BOUNTY_ACTIVITY_ASSIGN_PK,
      TEST_BOUNTY_SUBMISSION_PK
    );
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
