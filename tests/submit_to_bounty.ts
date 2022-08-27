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
  cleanUpSubmitToBlankSubmission,
  submitToBlankSubmission,
} from "./setup_fixtures/bounty_submission";
import {
  cleanUpContributorRecord,
  setupContributorRecord,
} from "./setup_fixtures/contributor_record";
import { assertReject } from "./utils/assert-promise-utils";
import { sleep } from "./utils/common";

describe("submit to bounty", () => {
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
    "9sTn6o4KYpgAFoDgpHTBUXAq7KKyjggn6UUxGqWG4Jnm"
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
      "65KGK8pxZ3a9JEKDJjmGZ24ZNnSDe7Yd4FfzqciSkKDrgyGXFSvMvmz4NXQkTADevNAApASAHBWLXokYgGthrtRQ"
    )
  );
  let TEST_APPLICANT_CONTRIBUTOR_RECORD_PK;
  let TEST_BOUNTY_APPLICATION_PK;
  let TEST_BOUNTY_ACTIVITY_APPLY_PK;

  let TEST_BOUNTY_SUBMISSION_PK;
  let TEST_BOUNTY_ACTIVITY_ASSIGN_PK;

  let TEST_BOUNTY_ACTIVITY_SUBMIT_PK;

  let TEST_2ND_APPLICANT_WALLET = Keypair.fromSecretKey(
    bs58.decode(
      "4ceNMUZaYGKgGnmC5g7bgLEBHhNcCBJBEnhPPheb6x3vQnVTDHpbbjtV36G3y54Lapjfrjj9sF2QiMNybjGG47oF"
    )
  );
  let TEST_2ND_APPLICANT_CONTRIBUTOR_RECORD_PK;

  // Test realm public key 9sTn6o4KYpgAFoDgpHTBUXAq7KKyjggn6UUxGqWG4Jnm
  // Test realm governance public key AmK8iLzxdvfRyxEM5ozYka1oF3uKtsH8sgTUXgGqNAAj
  // Bounty board PDA cvXhbpzDQtbth37nnzQDCEnHBfC4L7wFoZbVY3ssqLh
  // Bounty board vault PDA GeGbZQT4URWbZw8DEKUCqUktKAaU94Um717ZbTRbmaCx
  // Contributor record PDA EP8D1YNybZ2xJ4AoD3KbPqCn8NfWG4H8vs24jx4W6F54
  // Bounty PDA 7esffNtntzaHgpMAU7hysccrkksjC3VQnCH8Fi8oXJ1r
  // Bounty Escrow PDA EHP95GNYUPNWWsdjWUKocyNhpWArinowYBMe7qWL7NVC
  // Test applicant public key GvJT4nCmfm77PW1PVBTtE2tDNpR5Cmw3LnsfuuocBMS2
  // Test applicant contributor record PDA 4ufgBtgPMCso8VzWkZtYxFb9gZMjRBU8n52WRaJEuFFe
  // Bounty application PDA 5Tw8WVmJKiXcuEVhgnWrxP9MjgVoWnQ6HG3rHszC4KJs
  // Bounty activity (Apply) PDA 7mW2f2rvxj5FSSDp3Jkjq2by7rRMmzjq9Xc31Z54kigD
  // Test Bounty submission PDA CQw291Fuqtoq8zsBcpGe6heABeGE8MYYVo3Z9JST1QBa
  // Bounty activity (Assign) PDA 7qiShJ8U4Wkwqhjvhfe2L7W8EZMt3zi4CWvbCEM6iWwT
  // Bounty activity (Submit) PDA 2zqQbTSPu5Ke2zWAgkJHLw875z1Da3yXoV9y3SrpGRc1
  // Test 2nd applicant public key B6mH2BRDNguBJ9pVp41m7Nnj4jpN3xj6rJQ98iuCMfYm
  // Test 2nd applicant contributor record PDA 7g1XfEuLM9vQVk3RhbqcK4xBSKZ8fRmtSKep7NHJDbta

  // acc level fields involved in this test
  let TEST_BOUNTY_ASSIGN_COUNT;
  let CURRENT_BOUNTY_ACTIVITY_INDEX;
  let TEST_SUBMISSION_SUBMISSION_INDEX;

  // data for assertion
  const LINK_TO_SUBMISSION =
    "https://assets.reedpopcdn.com/shiny-bulbasaur-evolution-perfect-iv-stats-walrein-best-moveset-pokemon-go-9004-1642763882514.jpg/BROK/resize/690%3E/format/jpg/quality/75/shiny-bulbasaur-evolution-perfect-iv-stats-walrein-best-moveset-pokemon-go-9004-1642763882514.jpg";

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
      bountySubmissionPDA,
      bountySubmissionAcc,
      bountyActivityAssignPDA,
      bountyAccAfterAssign,
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
    TEST_SUBMISSION_SUBMISSION_INDEX = bountySubmissionAcc.submissionIndex;
  });

  it("update bounty submission acc correctly", async () => {
    const {
      bountyAccAfterSubmit,
      updatedBountySubmissionAcc,
      bountyActivitySubmitPDA,
      bountyActivitySubmitAcc,
    } = await submitToBlankSubmission(
      provider,
      program,
      TEST_BOUNTY_PK,
      CURRENT_BOUNTY_ACTIVITY_INDEX,
      TEST_BOUNTY_SUBMISSION_PK,
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
      TEST_APPLICANT_WALLET,
      LINK_TO_SUBMISSION
    );
    TEST_BOUNTY_ACTIVITY_SUBMIT_PK = bountyActivitySubmitPDA;
    // DON't update current_bounty_activity_index after actual test (^)

    // assert `bounty_submission` acc is updated accordingly
    assert.equal(
      updatedBountySubmissionAcc.linkToSubmission,
      LINK_TO_SUBMISSION
    );
    assert.deepEqual(updatedBountySubmissionAcc.state, { pendingReview: {} });
    assert.closeTo(
      updatedBountySubmissionAcc.firstSubmittedAt.toNumber(),
      new Date().getTime() / 1000,
      60
    );

    // assert `bounty_activity` (submit) is created correctly
    assert.equal(
      bountyActivitySubmitAcc.bounty.toString(),
      TEST_BOUNTY_PK.toString()
    );
    assert.equal(
      bountyActivitySubmitAcc.activityIndex,
      CURRENT_BOUNTY_ACTIVITY_INDEX
    );
    assert.closeTo(
      bountyActivitySubmitAcc.timestamp.toNumber(),
      new Date().getTime() / 1000,
      60
    );
    assert.equal(
      bountyActivitySubmitAcc.payload.submit.assigneeWallet.toString(),
      TEST_APPLICANT_WALLET.publicKey.toString() // assignee wallet
    );
    assert.equal(
      bountyActivitySubmitAcc.payload.submit.submissionIndex,
      TEST_SUBMISSION_SUBMISSION_INDEX
    );

    // assert `bounty` state is updated
    assert.deepEqual(bountyAccAfterSubmit.state, { submissionUnderReview: {} });
    assert.equal(
      bountyAccAfterSubmit.activityIndex,
      CURRENT_BOUNTY_ACTIVITY_INDEX + 1
    );
  });

  it("should not let non-assignee submit", async () => {
    console.log(
      "Test 2nd applicant public key",
      TEST_2ND_APPLICANT_WALLET.publicKey.toString()
    );
    console.log(
      "Test 2nd applicant secret key",
      bs58.encode(TEST_2ND_APPLICANT_WALLET.secretKey)
    );
    // add contributor record for 2nd applicant
    const { contributorRecordPDA: secondApplicantContributorRecordPDA } =
      await setupContributorRecord(
        provider,
        program,
        TEST_BOUNTY_BOARD_PK,
        TEST_2ND_APPLICANT_WALLET.publicKey,
        TEST_REALM_GOVERNANCE,
        "Core"
      );
    TEST_2ND_APPLICANT_CONTRIBUTOR_RECORD_PK =
      secondApplicantContributorRecordPDA;

    await assertReject(
      () =>
        submitToBlankSubmission(
          provider,
          program,
          TEST_BOUNTY_PK,
          CURRENT_BOUNTY_ACTIVITY_INDEX,
          TEST_BOUNTY_SUBMISSION_PK,
          TEST_2ND_APPLICANT_CONTRIBUTOR_RECORD_PK,
          TEST_2ND_APPLICANT_WALLET
        ),
      /NotAssignee/
    );

    // clean up contributor record for 2nd applicant
    console.log("Cleaning up 2nd applicant contributor record");
    await cleanUpContributorRecord(
      provider,
      program,
      TEST_2ND_APPLICANT_CONTRIBUTOR_RECORD_PK
    );
  });

  it("should throw if submission is not blank", async () => {
    // make first submission
    const { bountyAccAfterSubmit, bountyActivitySubmitPDA } =
      await submitToBlankSubmission(
        provider,
        program,
        TEST_BOUNTY_PK,
        CURRENT_BOUNTY_ACTIVITY_INDEX,
        TEST_BOUNTY_SUBMISSION_PK,
        TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
        TEST_APPLICANT_WALLET,
        LINK_TO_SUBMISSION
      );
    TEST_BOUNTY_ACTIVITY_SUBMIT_PK = bountyActivitySubmitPDA;
    CURRENT_BOUNTY_ACTIVITY_INDEX = bountyAccAfterSubmit.activityIndex;

    // then attempt to call the method again should fail
    await assertReject(
      () =>
        submitToBlankSubmission(
          provider,
          program,
          TEST_BOUNTY_PK,
          CURRENT_BOUNTY_ACTIVITY_INDEX,
          TEST_BOUNTY_SUBMISSION_PK,
          TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
          TEST_APPLICANT_WALLET,
          LINK_TO_SUBMISSION
        ),
      /NonBlankSubmission/
    );
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    // clean up bounty activity created at submit
    if (TEST_BOUNTY_ACTIVITY_SUBMIT_PK) {
      await cleanUpSubmitToBlankSubmission(
        provider,
        program,
        TEST_BOUNTY_ACTIVITY_SUBMIT_PK
      );
      TEST_BOUNTY_ACTIVITY_SUBMIT_PK = undefined;
    }
    // clean up accounts created from assign
    if (TEST_BOUNTY_ACTIVITY_ASSIGN_PK || TEST_BOUNTY_SUBMISSION_PK) {
      await cleanUpAssignBounty(
        provider,
        program,
        TEST_BOUNTY_ACTIVITY_ASSIGN_PK,
        TEST_BOUNTY_SUBMISSION_PK
      );
      TEST_BOUNTY_ACTIVITY_ASSIGN_PK = undefined;
      TEST_BOUNTY_SUBMISSION_PK = undefined;
    }
    // clean up bounty application created
    if (
      TEST_BOUNTY_APPLICATION_PK ||
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK ||
      TEST_BOUNTY_ACTIVITY_APPLY_PK
    ) {
      await cleanUpApplyToBounty(
        provider,
        program,
        TEST_BOUNTY_APPLICATION_PK,
        TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
        TEST_BOUNTY_ACTIVITY_APPLY_PK
      );
      TEST_BOUNTY_APPLICATION_PK = undefined;
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK = undefined;
      TEST_BOUNTY_ACTIVITY_APPLY_PK = undefined;
    }
    // clean up bounty-related accounts
    if (TEST_BOUNTY_PK || TEST_BOUNTY_ESCROW_PK) {
      await cleanUpCreateBounty(
        provider,
        program,
        TEST_BOUNTY_PK,
        TEST_BOUNTY_ESCROW_PK,
        TEST_BOUNTY_BOARD_VAULT_PK
      );
      TEST_BOUNTY_PK = undefined;
      TEST_BOUNTY_ESCROW_PK = undefined;
    }
    // clean up creator contributor record
    if (TEST_CREATOR_CONTRIBUTOR_RECORD_PK) {
      await cleanUpContributorRecord(
        provider,
        program,
        TEST_CREATOR_CONTRIBUTOR_RECORD_PK
      );
      TEST_CREATOR_CONTRIBUTOR_RECORD_PK = undefined;
    }
    // clean up bounty board-related accounts
    if (TEST_BOUNTY_BOARD_PK || TEST_BOUNTY_BOARD_VAULT_PK) {
      await cleanUpBountyBoard(
        provider,
        program,
        TEST_BOUNTY_BOARD_PK,
        TEST_BOUNTY_BOARD_VAULT_PK,
        TEST_REALM_TREASURY_USDC_ATA
      );
      TEST_BOUNTY_BOARD_PK = undefined;
      TEST_BOUNTY_BOARD_VAULT_PK = undefined;
    }
  });
});
