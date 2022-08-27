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
  cleanUpRequestChangesToSubmission,
  cleanUpSubmitToBlankSubmission,
  cleanUpUpdateSubmission,
  requestChangesToSubmission,
  submitToBlankSubmission,
  updateSubmission,
} from "./setup_fixtures/bounty_submission";
import {
  cleanUpContributorRecord,
  setupContributorRecord,
} from "./setup_fixtures/contributor_record";
import { assertReject } from "./utils/assert-promise-utils";
import { sleep } from "./utils/common";

describe("request changes to submission", () => {
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
    "3YRjL7fVXahX8zS7cKmtb5ZTARdCzXtsaFmtxKwdAWDP"
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
      "3GGasDpSXoKLWG8FRBgQ8Sc55MgAyqdeqbcmzkmTqUwfXrDaf4JXrMQWDcACsysiUFBhwijddoEZCMYBta4zG8Kv"
    )
  );
  let TEST_APPLICANT_CONTRIBUTOR_RECORD_PK;
  let TEST_BOUNTY_APPLICATION_PK;
  let TEST_BOUNTY_ACTIVITY_APPLY_PK;

  let TEST_BOUNTY_SUBMISSION_PK;
  let TEST_BOUNTY_ACTIVITY_ASSIGN_PK;

  let TEST_BOUNTY_ACTIVITY_SUBMIT_PK;
  const TEST_BOUNTY_ACTIVITY_REQ_CHANGE_PKS = [];
  const TEST_BOUNTY_ACTIVITY_UPDATE_SUB_PKS = [];

  // Test realm public key 3YRjL7fVXahX8zS7cKmtb5ZTARdCzXtsaFmtxKwdAWDP
  // Test realm governance public key DdzNtH4aXz1ZdMGnuj9UEbMuoszoq5EQeEFyF4tG1EXm
  // Bounty board PDA FZkX7TDas96pjR5wm2QnTeAWzcs6fYL8mx8QMmGva27u
  // Bounty board vault PDA 3mpoknTM2RNNZeUQ5MKYmUeGEeUaQjj8zLHE1h4PXmBU
  // Test creator Contributor record PDA cCCdru2CAHSaseA4VWyFFV9ejzcZ3r7MhnvVM1XD4MA
  // Bounty PDA 2FEhaFo4YtZeXdvy3B6mfmTMidbG1CUCzJQNEdde1wAS
  // Bounty Escrow PDA D4CzsFk3qBZYZnetsZLbmYS4fDMdrsvudx7UixeUXTNR
  // Test applicant public key 28M8zp37GSxmdQWEUyeuFHXEgB6YuosaehXKHFr1BuSc
  // Test applicant contributor record PDA DBLtdjCPPCA449xfsAo9fgnr37NguQURHMdM9PADAaGf
  // Bounty application PDA 7TiA6bxCzfqzKDK4pFx8f9qFnMDvW1EEGfy8jA4ai5k2
  //
  // Bounty submission PDA 4cNU6aqYqmJkXYGXeM5MnxY6pqE4ucVWJmdQ6Hq9NVz7
  //

  // acc level fields involved in this test
  let TEST_BOUNTY_ASSIGN_COUNT;
  let CURRENT_BOUNTY_ACTIVITY_INDEX;
  let TEST_SUBMISSION_SUBMISSION_INDEX;

  // test specific setup fn
  const accelerateIteration = async (iterationCount: number) => {
    for (let i = 0; i < iterationCount; i++) {
      await sleep(800); // sprinkle in waits to give time for the network to respond

      const { bountyAccAfterReqChange, bountyActivityReqChangePDA } =
        await requestChangesToSubmission(
          provider,
          program,
          TEST_BOUNTY_PK,
          CURRENT_BOUNTY_ACTIVITY_INDEX,
          TEST_BOUNTY_SUBMISSION_PK,
          TEST_CREATOR_CONTRIBUTOR_RECORD_PK,
          undefined // sign with provider.wallet
        );
      TEST_BOUNTY_ACTIVITY_REQ_CHANGE_PKS.push(bountyActivityReqChangePDA);
      CURRENT_BOUNTY_ACTIVITY_INDEX = bountyAccAfterReqChange.activityIndex;

      await sleep(800); // sprinkle in waits to give time for the network to respond

      const { bountyAccAfterUpdateSubmission, bountyActivityUpdateSubPDA } =
        await updateSubmission(
          provider,
          program,
          TEST_BOUNTY_PK,
          CURRENT_BOUNTY_ACTIVITY_INDEX,
          TEST_BOUNTY_SUBMISSION_PK,
          TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
          TEST_APPLICANT_WALLET
        );
      TEST_BOUNTY_ACTIVITY_UPDATE_SUB_PKS.push(bountyActivityUpdateSubPDA);
      CURRENT_BOUNTY_ACTIVITY_INDEX =
        bountyAccAfterUpdateSubmission.activityIndex;
    }
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
      bountySubmissionAcc,
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
    TEST_SUBMISSION_SUBMISSION_INDEX = bountySubmissionAcc.submissionIndex;
  });

  it("update state of bounty submission acc correctly", async () => {
    // submit work to the blank submission to change state of submission to PendingReview
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

    const COMMENT = "Please redo.";

    const {
      bountyAccAfterReqChange,
      updatedBountySubmissionAcc,
      bountyActivityReqChangePDA,
      bountyActivityReqChangeAcc,
    } = await requestChangesToSubmission(
      provider,
      program,
      TEST_BOUNTY_PK,
      CURRENT_BOUNTY_ACTIVITY_INDEX,
      TEST_BOUNTY_SUBMISSION_PK,
      TEST_CREATOR_CONTRIBUTOR_RECORD_PK,
      undefined, // use provider's wallet to sign
      COMMENT
    );
    TEST_BOUNTY_ACTIVITY_REQ_CHANGE_PKS.push(bountyActivityReqChangePDA);
    // DON't update current_bounty_activity_index after actual test (^)

    // assert `bounty_submission` updated correctly
    assert.deepEqual(updatedBountySubmissionAcc.state, { changeRequested: {} });
    assert.closeTo(
      updatedBountySubmissionAcc.changeRequestedAt.toNumber(),
      new Date().getTime() / 1000,
      60
    );
    assert.equal(updatedBountySubmissionAcc.requestChangeCount, 1);

    // assert `bounty_activity` created correctly
    assert.equal(
      bountyActivityReqChangeAcc.bounty.toString(),
      TEST_BOUNTY_PK.toString()
    );
    assert.equal(
      bountyActivityReqChangeAcc.activityIndex,
      CURRENT_BOUNTY_ACTIVITY_INDEX
    );
    assert.closeTo(
      bountyActivityReqChangeAcc.timestamp.toNumber(),
      new Date().getTime() / 1000,
      60
    );
    assert.equal(
      bountyActivityReqChangeAcc.payload.requestChange.actorWallet.toString(),
      provider.wallet.publicKey.toString() // bounty creator wallet
    );
    assert.equal(
      bountyActivityReqChangeAcc.payload.requestChange.submissionIndex,
      TEST_SUBMISSION_SUBMISSION_INDEX
    );
    assert.equal(
      bountyActivityReqChangeAcc.payload.requestChange.comment,
      COMMENT
    );

    // assert `activity_index` on `bounty` incremented
    assert.equal(
      bountyAccAfterReqChange.activityIndex,
      CURRENT_BOUNTY_ACTIVITY_INDEX + 1
    );
  });

  it("should not let non-creator request changes", async () => {
    // submit work to the blank submission to change state of submission to PendingReview
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

    await assertReject(
      () =>
        requestChangesToSubmission(
          provider,
          program,
          TEST_BOUNTY_PK,
          CURRENT_BOUNTY_ACTIVITY_INDEX,
          TEST_BOUNTY_SUBMISSION_PK,
          TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
          TEST_APPLICANT_WALLET
        ),
      /NotAuthorizedToReviewSubmission/
    );
  });

  it("should throw when submission state is not PendingReview", async () => {
    // request changes without first submitting work
    await assertReject(
      () =>
        requestChangesToSubmission(
          provider,
          program,
          TEST_BOUNTY_PK,
          CURRENT_BOUNTY_ACTIVITY_INDEX,
          TEST_BOUNTY_SUBMISSION_PK,
          TEST_CREATOR_CONTRIBUTOR_RECORD_PK
        ),
      /NotPendingReview/
    );
  });

  it("should throw if change request has already been made 3 times prior", async () => {
    // submit work to the blank submission to change state of submission to PendingReview
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
    CURRENT_BOUNTY_ACTIVITY_INDEX = bountyAccAfterSubmit.activityIndex; // accelerate request_change_count to 3

    await accelerateIteration(3);

    // request changes for the 4th time
    await assertReject(
      () =>
        requestChangesToSubmission(
          provider,
          program,
          TEST_BOUNTY_PK,
          CURRENT_BOUNTY_ACTIVITY_INDEX,
          TEST_BOUNTY_SUBMISSION_PK,
          TEST_CREATOR_CONTRIBUTOR_RECORD_PK
        ),
      /ChangeRequestQuotaReached/
    );
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    // clean up every bounty activity created from update submission
    if (TEST_BOUNTY_ACTIVITY_UPDATE_SUB_PKS.length) {
      console.log(
        `Clearing ${TEST_BOUNTY_ACTIVITY_UPDATE_SUB_PKS.length} Bounty Activity (Update Submission) Acc`
      );
      for (const bountyActivityUpdateSubPK of TEST_BOUNTY_ACTIVITY_UPDATE_SUB_PKS) {
        await cleanUpUpdateSubmission(
          provider,
          program,
          bountyActivityUpdateSubPK
        );
      }
      TEST_BOUNTY_ACTIVITY_UPDATE_SUB_PKS.length = 0;
    }
    // clean up every bounty activity created from req changes
    if (TEST_BOUNTY_ACTIVITY_REQ_CHANGE_PKS.length) {
      console.log(
        `Clearing ${TEST_BOUNTY_ACTIVITY_REQ_CHANGE_PKS.length} Bounty Activity (Request Change) Acc`
      );
      for (const bountyActivityReqChangePK of TEST_BOUNTY_ACTIVITY_REQ_CHANGE_PKS) {
        await cleanUpRequestChangesToSubmission(
          provider,
          program,
          bountyActivityReqChangePK
        );
      }
      TEST_BOUNTY_ACTIVITY_REQ_CHANGE_PKS.length = 0;
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
