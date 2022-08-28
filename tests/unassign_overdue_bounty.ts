import { AnchorProvider, Program, setProvider } from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { assert } from "chai";
import { BOUNTY_BOARD_PROGRAM_ID, DUMMY_MINT_PK } from "../app/api/constants";
import idl from "../target/idl/dao_bounty_board.json";
import { DaoBountyBoard } from "../target/types/dao_bounty_board";
import {
  assignBounty,
  cleanUpCreateBounty,
  DEFAULT_BOUNTY_DETAILS,
  createBounty,
  unassignOverdueBounty,
  cleanUpAssignBounty,
  cleanUpUnassignOverdue,
} from "./setup_fixtures/bounty";
import {
  cleanUpApplyToBounty,
  applyToBounty,
} from "./setup_fixtures/bounty_application";
import {
  addBountyBoardTierConfig,
  cleanUpBountyBoard,
  getTiersInVec,
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

describe("unassign overdue bounty", () => {
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
    "DgmX5b4tG3foyTQ318iBmyH2kGLwemayyYRERJeJexRV"
  );
  let TEST_REALM_GOVERNANCE = Keypair.fromSeed(TEST_REALM_PK.toBytes());
  const TEST_REALM_TREASURY_USDC_ATA = new PublicKey(
    "EoCo8zx6fZiAmwNxG1xqLKHYtsQapNx39wWTJvGZaZwq"
  ); // my own ATA for the mint
  // accounts to cleanup

  let TEST_BOUNTY_BOARD_PK;
  let TEST_BOUNTY_BOARD_VAULT_PK;

  let TEST_BOUNTY_PK;
  let TEST_BOUNTY_ESCROW_PK;
  let TEST_CREATOR_CONTRIBUTOR_RECORD_PK;

  let TEST_APPLICANT_WALLET = Keypair.fromSecretKey(
    bs58.decode(
      "5VqP3B2tf9k4ftpKGxGa76HjcG6XwgVnuQFSq1rkMhz3Z8SYNZTjb1R7Nh317iWoWAaMZ2uBbpJrPuYoRhjDfLN2"
    )
  );
  let TEST_APPLICANT_CONTRIBUTOR_RECORD_PK;
  let TEST_BOUNTY_APPLICATION_PK;
  let TEST_BOUNTY_ACTIVITY_APPLY_PK;

  let TEST_BOUNTY_SUBMISSION_PK;
  let TEST_BOUNTY_ACTIVITY_ASSIGN_PK;

  let TEST_BOUNTY_ACTIVITY_UNASSIGN_PK;

  let TEST_BOUNTY_ACTIVITY_SUBMIT_PK;

  // Test realm public key DgmX5b4tG3foyTQ318iBmyH2kGLwemayyYRERJeJexRV
  // Test realm governance public key 5hvuXjmDGzepp3BcRgzVbLFQjv168fBrP3QUbqZL6jMv
  // Bounty board PDA 3SkMwBmibrVBxMtc3vGKRn4bGbVuMFAe2sbjM9aC3Laf
  // Bounty board vault PDA A94aEtcetRDSTjjKLGJtFUTsTX7JTwckA7LhKT24guPR
  // Test creator contributor record PDA FQvWf2Fsmvz7zdj9jnrneDaAPyhatWRELPGFJK893pht
  // Bounty PDA nJs4at2ANw4EuUHEhiD65WG6fWrcpYAJzbcaLPrPMDT
  // Bounty Escrow PDA BwtsaqasLGHhCLeY1zK4UnLdYKebCvAwCsqar3Md5zcZ
  // Test applicant public key 316N9TnNT8sfQS21SGVyAPyufQsZScFHjjbYMaSw3G46
  // Test applicant secret key 5VqP3B2tf9k4ftpKGxGa76HjcG6XwgVnuQFSq1rkMhz3Z8SYNZTjb1R7Nh317iWoWAaMZ2uBbpJrPuYoRhjDfLN2
  // Applicant contributor record PDA G2bMUHDS48sHtKke5LCTmk9Ux95XkDV1UgkhnwMUCcf8
  // Bounty application PDA 9XfGA6ubGxtPLHKxi1Sc3uJGETYDXkLjyCXBGnYZ8mWN
  // Bounty activity (Apply) PDA Eb2T9fWQzT6GUPkStF8fPofAXS11qVxXzNK1H45MrG1Q
  // Bounty submission PDA HdAjvib6M2JhBAtQb2nuMELisefzQGiUm1RofNov3DHE
  // Bounty activity (Assign) PDA Bxv9GGvPPhyinw5GNyiVraDCCfMFGKbSd7DDWbZMwifG
  // Bounty activity (Unassign overdue) PDA 53ttHZto1QQtBYa1uYXoAkYmDsaMjfgQA1JfzA3NXKnZ

  // acc level fields involved in this test
  let TEST_BOUNTY_ASSIGN_COUNT;
  let CURRENT_BOUNTY_ACTIVITY_INDEX;
  let TEST_SUBMISSION_SUBMISSION_INDEX;

  // test specific setup fn
  const setupAssignedBountyWithVaryingTier = async (tierName: string) => {
    // in this test, Entry tier bounty is set to have task submission window of 1 s to facilitate testing

    // set up bounty
    const { bountyPDA, bountyEscrowPDA, bountyAcc } = await createBounty(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_BOARD_VAULT_PK,
      TEST_CREATOR_CONTRIBUTOR_RECORD_PK,
      {
        ...DEFAULT_BOUNTY_DETAILS,
        tier: tierName,
      }
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
  };

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

    // add tiers config (with custom/non-default windows for Entry tier)
    await addBountyBoardTierConfig(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_REALM_GOVERNANCE,
      getTiersInVec(new PublicKey(DUMMY_MINT_PK.USDC)).map((t) => {
        switch (t.tierName) {
          case "Entry":
            t.taskSubmissionWindow = 1;
            t.submissionReviewWindow = 1;
            t.addressChangeReqWindow = 1;
          case "A":
            t.minRequiredSkillsPt = new BN(0);
            t.minRequiredReputation = 0;
          default:
        }
        return t;
      })
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
  });

  it("unassign bounty correctly", async () => {
    await setupAssignedBountyWithVaryingTier("Entry"); // 1 sec for quick overdue
    await sleep(2000); // sleep 2s to ensure duration rlly overdue
    const TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK =
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK;

    const {
      bountyAccAfterUnassign,
      updatedBountySubmissionAcc,
      updatedAssigneeContributorRecord,
      bountyActivityUnassignPDA,
      bountyActivityUnassignAcc,
    } = await unassignOverdueBounty(
      provider,
      program,
      TEST_BOUNTY_PK,
      CURRENT_BOUNTY_ACTIVITY_INDEX,
      TEST_BOUNTY_SUBMISSION_PK,
      TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK,
      TEST_CREATOR_CONTRIBUTOR_RECORD_PK,
      undefined // use provider.wallet to sign
    );
    TEST_BOUNTY_ACTIVITY_UNASSIGN_PK = bountyActivityUnassignPDA;
    // DON't update current_bounty_activity_index after actual test (^)

    // assert `bounty_submission` acc is updated correctly
    assert.deepEqual(updatedBountySubmissionAcc.state, {
      unassignedForOverdue: {},
    });
    assert.closeTo(
      updatedBountySubmissionAcc.unassignedAt.toNumber(),
      new Date().getTime() / 1000,
      60 // 1 min tolerance
    );

    // assert reputation is deducted from `contributor_record` of assignee
    assert.equal(
      updatedAssigneeContributorRecord.reputation.toNumber(),
      0 - bountyAccAfterUnassign.rewardReputation
    );
    assert.equal(
      updatedAssigneeContributorRecord.recentRepChange.toNumber(),
      -1 * bountyAccAfterUnassign.rewardReputation
    );

    // assert bounty activity
    assert.equal(
      bountyActivityUnassignAcc.bounty.toString(),
      TEST_BOUNTY_PK.toString()
    );
    assert.equal(
      bountyActivityUnassignAcc.activityIndex,
      CURRENT_BOUNTY_ACTIVITY_INDEX
    );
    assert.closeTo(
      bountyActivityUnassignAcc.timestamp.toNumber(),
      new Date().getTime() / 1000,
      60
    );
    assert.equal(
      bountyActivityUnassignAcc.payload.unassignOverdue.actorWallet.toString(),
      provider.wallet.publicKey.toString() // bounty creator wallet
    );
    assert.equal(
      bountyActivityUnassignAcc.payload.unassignOverdue.submissionIndex,
      TEST_SUBMISSION_SUBMISSION_INDEX
    );
    assert.equal(
      bountyActivityUnassignAcc.payload.unassignOverdue.assigneeWallet.toString(),
      TEST_APPLICANT_WALLET.publicKey.toString()
    );
    assert.equal(
      bountyActivityUnassignAcc.payload.unassignOverdue.repDeducted,
      bountyAccAfterUnassign.rewardReputation
    );

    // assert `bounty` acc is updated correctly
    assert.deepEqual(bountyAccAfterUnassign.state, { open: {} });
    assert.equal(bountyAccAfterUnassign.unassignCount, 1);
    assert.equal(
      bountyAccAfterUnassign.activityIndex,
      CURRENT_BOUNTY_ACTIVITY_INDEX + 1
    );
  });

  it("should not let non-creator unassign bounty", async () => {
    await setupAssignedBountyWithVaryingTier("Entry"); // duration doesn't matter
    const TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK =
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK;
    await assertReject(
      () =>
        unassignOverdueBounty(
          provider,
          program,
          TEST_BOUNTY_PK,
          CURRENT_BOUNTY_ACTIVITY_INDEX,
          TEST_BOUNTY_SUBMISSION_PK,
          TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK,
          // unassign as applicant instead of bounty creator
          TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
          TEST_APPLICANT_WALLET
        ),
      /NotAuthorizedToUnassignBounty/
    );
  });

  it("should throw if deadline has not passed", async () => {
    await setupAssignedBountyWithVaryingTier("A"); // arbitrarily 1wk
    const TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK =
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK;
    await assertReject(
      () =>
        unassignOverdueBounty(
          provider,
          program,
          TEST_BOUNTY_PK,
          CURRENT_BOUNTY_ACTIVITY_INDEX,
          TEST_BOUNTY_SUBMISSION_PK,
          TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK,
          TEST_CREATOR_CONTRIBUTOR_RECORD_PK,
          undefined // use provider.wallet to sign
        ),
      /NotOverdue/
    );
  });

  it("should throw if assignee has already submitted his work", async () => {
    await setupAssignedBountyWithVaryingTier("Entry"); // should throw even if time is after deadline
    await sleep(2000);
    // create submission
    const { bountyAccAfterSubmit, bountyActivitySubmitPDA } =
      await submitToBlankSubmission(
        provider,
        program,
        TEST_BOUNTY_PK,
        CURRENT_BOUNTY_ACTIVITY_INDEX,
        TEST_BOUNTY_SUBMISSION_PK,
        TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
        TEST_APPLICANT_WALLET
      );
    TEST_BOUNTY_ACTIVITY_SUBMIT_PK = bountyActivitySubmitPDA;
    CURRENT_BOUNTY_ACTIVITY_INDEX = bountyAccAfterSubmit.activityIndex;

    const TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK =
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK;
    await assertReject(
      () =>
        unassignOverdueBounty(
          provider,
          program,
          TEST_BOUNTY_PK,
          CURRENT_BOUNTY_ACTIVITY_INDEX,
          TEST_BOUNTY_SUBMISSION_PK,
          TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK,
          TEST_CREATOR_CONTRIBUTOR_RECORD_PK,
          undefined // use provider.wallet to sign
        ),
      /NotOverdue/
    );
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    // clean up bounty activity created at unassign
    if (TEST_BOUNTY_ACTIVITY_UNASSIGN_PK) {
      await cleanUpUnassignOverdue(
        provider,
        program,
        TEST_BOUNTY_ACTIVITY_UNASSIGN_PK
      );
      TEST_BOUNTY_ACTIVITY_UNASSIGN_PK = undefined;
    }
    // clean up bounty activity created from submit
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
