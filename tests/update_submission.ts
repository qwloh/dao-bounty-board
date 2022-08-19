import { AnchorProvider, Program, setProvider } from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Keypair, PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { BOUNTY_BOARD_PROGRAM_ID } from "../app/api/constants";
import idl from "../target/idl/dao_bounty_board.json";
import { DaoBountyBoard } from "../target/types/dao_bounty_board";
import {
  assignBounty,
  cleanUpBounty,
  setupBounty,
} from "./setup_fixtures/bounty";
import {
  cleanUpBountyApplication,
  setupBountyApplication,
} from "./setup_fixtures/bounty_application";
import {
  addBountyBoardTierConfig,
  cleanUpBountyBoard,
  seedBountyBoardVault,
  setupBountyBoard,
} from "./setup_fixtures/bounty_board";
import {
  cleanUpBountySubmission,
  setupBountySubmission,
  updateSubmission,
} from "./setup_fixtures/bounty_submission";
import {
  cleanUpContributorRecord,
  setupContributorRecord,
} from "./setup_fixtures/contributor_record";
import { assertReject } from "./utils/assert-promise-utils";

describe("update submission", () => {
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
    "DPbetRnHerQ2KHjv62V1EZ3CsyZFAcmrNwvbvLvUimou"
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
      "36okAqBf6emniQMeE1k6ypGcfZXoiNzbJGf5Ms9CtSRxg9GK6dfcVGgsyA42UjdURJnx6pgWhnbEvH9rgo2679u3"
    )
  );
  let TEST_APPLICANT_CONTRIBUTOR_RECORD_PK;
  let TEST_BOUNTY_APPLICATION_PK;
  let TEST_BOUNTY_SUBMISSION_PK;

  // Test realm public key DPbetRnHerQ2KHjv62V1EZ3CsyZFAcmrNwvbvLvUimou
  // Test realm governance public key mHdsrki8HHfGcpryeHA8VdZwNnsjXFuuc5zXoS3Qn4K
  // Bounty board PDA AyFHmU8Rt3tHtfdZpofEYEM5CnGVEkpfD3yJoaur6Xhk
  // Bounty board vault PDA 3tWMKF8QEbCTHdMfNiePByenn71ya3CsYejU2vtXC2e9
  // Test creator contributor record PDA 6S7eN5ZSB1Af2CpvGLaKwpKPJtAanRWvw6r5jMF4fWY
  // Bounty PDA BoGC5Y4F7gALzgufMxtMXepGz5sBozW54SJR1ste8wQ2
  // Bounty Escrow PDA 9f3Zh6GaCqaMd3vACiwQBqt2yVoayawWdf15pUPwUJkS
  // Test applicant public key BMLYHno2MR6RtyAiuMDyo8LgxhzmvdTijE3FG2jDu8uf
  // Test applicant contributor record PDA 9SWZGTZLw2iEP5UrJmJqjaomeRz4R2sksfbHJjaGMm9V
  // Bounty application PDA 8RFSufYsLXVARfos4GTgvC2twTTHVF2Uswb9S2n89eks
  // Bounty submission PDA GumW8PB1Toae4s3McnfdC3MADrqgV5TzMzhrCxxQ4Y5r

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
    const { bountyPDA, bountyEscrowPDA } = await setupBounty(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_BOARD_VAULT_PK,
      TEST_CREATOR_CONTRIBUTOR_RECORD_PK
    );
    TEST_BOUNTY_PK = bountyPDA;
    TEST_BOUNTY_ESCROW_PK = bountyEscrowPDA;

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
    await assignBounty(
      provider,
      program,
      TEST_BOUNTY_PK,
      TEST_BOUNTY_APPLICATION_PK
    );

    // create submission
    const { bountySubmissionPDA } = await setupBountySubmission(
      provider,
      program,
      TEST_BOUNTY_PK,
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
      TEST_APPLICANT_WALLET
    );
    TEST_BOUNTY_SUBMISSION_PK = bountySubmissionPDA;
  });

  it("update bounty submission acc correctly", async () => {
    const NEW_LINK_TO_SUBMISSION =
      "https://64.media.tumblr.com/172a6e167359e6b6832116ffac691e87/tumblr_inline_p7ja2uo4ZQ1qhvvv4_500.png";

    const { updatedBountySubmissionAcc } = await updateSubmission(
      provider,
      program,
      TEST_BOUNTY_SUBMISSION_PK,
      TEST_BOUNTY_PK,
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
      TEST_APPLICANT_WALLET,
      NEW_LINK_TO_SUBMISSION
    );

    assert.equal(
      updatedBountySubmissionAcc.linkToSubmission,
      NEW_LINK_TO_SUBMISSION
    );
    assert.deepEqual(updatedBountySubmissionAcc.state, { pendingReview: {} });
    assert.closeTo(
      updatedBountySubmissionAcc.updatedAt.toNumber(),
      new Date().getTime() / 1000,
      5000
    );

    // assert bounty activity
  });

  it("should not let non-original submitter update submission", async () => {
    await assertReject(
      () =>
        updateSubmission(
          provider,
          program,
          TEST_BOUNTY_SUBMISSION_PK,
          TEST_BOUNTY_PK,
          TEST_CREATOR_CONTRIBUTOR_RECORD_PK,
          undefined
        ),
      /AnchorError caused by account: bounty_submission. Error Code: ConstraintSeeds/
    );
  });

  // TODO: Test case on when submission state is not pendingReview nor changeRequested

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
