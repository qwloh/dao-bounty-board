import { AnchorProvider, Program, setProvider } from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Keypair, PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { BOUNTY_BOARD_PROGRAM_ID, DUMMY_MINT_PK } from "../app/api/constants";
import idl from "../target/idl/dao_bounty_board.json";
import { DaoBountyBoard } from "../target/types/dao_bounty_board";
import {
  assignBounty,
  cleanUpBounty,
  DEFAULT_BOUNTY_DETAILS,
  setupBounty,
  unassignOverdueBounty,
} from "./setup_fixtures/bounty";
import {
  cleanUpBountyApplication,
  setupBountyApplication,
} from "./setup_fixtures/bounty_application";
import {
  addBountyBoardTierConfig,
  cleanUpBountyBoard,
  getTiersInVec,
  seedBountyBoardVault,
  setupBountyBoard,
} from "./setup_fixtures/bounty_board";
import {
  cleanUpBountySubmission,
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
  let TEST_BOUNTY_SUBMISSION_PK;

  // Test realm public key DgmX5b4tG3foyTQ318iBmyH2kGLwemayyYRERJeJexRV
  // Test realm governance public key 5hvuXjmDGzepp3BcRgzVbLFQjv168fBrP3QUbqZL6jMv
  // Bounty board PDA 3SkMwBmibrVBxMtc3vGKRn4bGbVuMFAe2sbjM9aC3Laf
  // Bounty board vault PDA A94aEtcetRDSTjjKLGJtFUTsTX7JTwckA7LhKT24guPR
  // Test creator contributor record PDA FQvWf2Fsmvz7zdj9jnrneDaAPyhatWRELPGFJK893pht
  // Bounty PDA nJs4at2ANw4EuUHEhiD65WG6fWrcpYAJzbcaLPrPMDT
  // Bounty Escrow PDA BwtsaqasLGHhCLeY1zK4UnLdYKebCvAwCsqar3Md5zcZ
  // Test applicant public key 316N9TnNT8sfQS21SGVyAPyufQsZScFHjjbYMaSw3G46
  // Test applicant secret key 5VqP3B2tf9k4ftpKGxGa76HjcG6XwgVnuQFSq1rkMhz3Z8SYNZTjb1R7Nh317iWoWAaMZ2uBbpJrPuYoRhjDfLN2
  // Test applicant wallet lamport balance 0
  // Applicant contributor record PDA G2bMUHDS48sHtKke5LCTmk9Ux95XkDV1UgkhnwMUCcf8
  // Bounty application PDA 9XfGA6ubGxtPLHKxi1Sc3uJGETYDXkLjyCXBGnYZ8mWN
  // Bounty submission PDA HdAjvib6M2JhBAtQb2nuMELisefzQGiUm1RofNov3DHE

  // test specific setup fn
  const setupAssignedBountyWithVaryingTier = async (tierName: string) => {
    // in this test, Entry tier bounty is set to have task submission window of 1 s to facilitate testing

    // set up bounty
    const { bountyPDA, bountyEscrowPDA, bountyAcc } = await setupBounty(
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
    const TEST_BOUNTY_ASSIGN_COUNT = bountyAcc.assignCount;

    // create bounty application
    console.log(
      "Test applicant public key",
      TEST_APPLICANT_WALLET.publicKey.toString()
    );
    console.log(
      "Test applicant secret key",
      bs58.encode(TEST_APPLICANT_WALLET.secretKey)
    );
    const { applicantContributorRecordPDA, bountyApplicationPDA } =
      await setupBountyApplication(
        provider,
        program,
        TEST_BOUNTY_BOARD_PK,
        TEST_BOUNTY_PK,
        TEST_APPLICANT_WALLET,
        7 * 24 * 3600 // 1wk
      );
    TEST_APPLICANT_CONTRIBUTOR_RECORD_PK = applicantContributorRecordPDA;
    TEST_BOUNTY_APPLICATION_PK = bountyApplicationPDA;

    // assign bounty
    const { bountySubmissionPDA } = await assignBounty(
      provider,
      program,
      TEST_BOUNTY_PK,
      TEST_BOUNTY_ASSIGN_COUNT,
      TEST_BOUNTY_APPLICATION_PK
    );
    TEST_BOUNTY_SUBMISSION_PK = bountySubmissionPDA;
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

    // add tiers config (with custom/non-default windows for Entry tier)
    await addBountyBoardTierConfig(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_REALM_GOVERNANCE,
      getTiersInVec(new PublicKey(DUMMY_MINT_PK.USDC)).map((t) => {
        if (t.tierName !== "Entry") return t;
        t.taskSubmissionWindow = 1;
        t.submissionReviewWindow = 1;
        t.addressChangeReqWindow = 1;
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
      updatedBountySubmissionAcc,
      updatedBountyAcc,
      updatedAssigneeContributorRecord,
    } = await unassignOverdueBounty(
      provider,
      program,
      TEST_BOUNTY_PK,
      TEST_BOUNTY_SUBMISSION_PK,
      TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK,
      TEST_CREATOR_CONTRIBUTOR_RECORD_PK,
      undefined // use provider.wallet to sign
    );

    // assert `bounty_submission` acc is updated correctly
    assert.deepEqual(updatedBountySubmissionAcc.state, {
      unassignedForOverdue: {},
    });
    assert.closeTo(
      updatedBountySubmissionAcc.unassignedAt.toNumber(),
      new Date().getTime() / 1000,
      60 // 1 min tolerance
    );

    // assert `bounty` acc is updated correctly
    assert.deepEqual(updatedBountyAcc.state, { open: {} });
    assert.equal(updatedBountyAcc.unassignCount, 1);

    // assert reputation is deducted from `contributor_record` of assignee
    assert.equal(
      updatedAssigneeContributorRecord.reputation.toNumber(),
      0 - updatedBountyAcc.rewardReputation
    );
    assert.equal(
      updatedAssigneeContributorRecord.recentRepChange.toNumber(),
      -1 * updatedBountyAcc.rewardReputation
    );

    // assert bounty activity
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
    await submitToBlankSubmission(
      provider,
      program,
      TEST_BOUNTY_PK,
      TEST_BOUNTY_SUBMISSION_PK,
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
      TEST_APPLICANT_WALLET
    );
    const TEST_ASSIGNEE_CONTRIBUTOR_RECORD_PK =
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK;
    await assertReject(
      () =>
        unassignOverdueBounty(
          provider,
          program,
          TEST_BOUNTY_PK,
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
    // clean up bounty submission created
    await cleanUpBountySubmission(provider, program, TEST_BOUNTY_SUBMISSION_PK);
    // clean up bounty application created
    await cleanUpBountyApplication(
      provider,
      program,
      TEST_BOUNTY_APPLICATION_PK,
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK
    );
    // clean up bounty-related accounts
    await cleanUpBounty(
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
