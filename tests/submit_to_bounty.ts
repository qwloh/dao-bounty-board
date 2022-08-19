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
} from "./setup_fixtures/bounty_submission";
import {
  cleanUpContributorRecord,
  setupContributorRecord,
} from "./setup_fixtures/contributor_record";
import { assertReject } from "./utils/assert-promise-utils";

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
  let TEST_BOUNTY_SUBMISSION_PDA;
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
  // Bounty submission PDA 8BuJSD8tc7aKwtsYbjJVTxHcoGy651jY8TngMap5qmzR
  // Test 2nd applicant public key B6mH2BRDNguBJ9pVp41m7Nnj4jpN3xj6rJQ98iuCMfYm
  // Test 2nd applicant contributor record PDA 7g1XfEuLM9vQVk3RhbqcK4xBSKZ8fRmtSKep7NHJDbta

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
  });

  it("create bounty submission acc correctly", async () => {
    const LINK_TO_SUBMISSION =
      "https://assets.reedpopcdn.com/shiny-bulbasaur-evolution-perfect-iv-stats-walrein-best-moveset-pokemon-go-9004-1642763882514.jpg/BROK/resize/690%3E/format/jpg/quality/75/shiny-bulbasaur-evolution-perfect-iv-stats-walrein-best-moveset-pokemon-go-9004-1642763882514.jpg";

    const { bountySubmissionPDA, bountySubmissionAcc } =
      await setupBountySubmission(
        provider,
        program,
        TEST_BOUNTY_PK,
        TEST_APPLICANT_CONTRIBUTOR_RECORD_PK,
        TEST_APPLICANT_WALLET,
        LINK_TO_SUBMISSION
      );
    TEST_BOUNTY_SUBMISSION_PDA = bountySubmissionPDA;

    assert.equal(
      bountySubmissionAcc.bounty.toString(),
      TEST_BOUNTY_PK.toString()
    );
    assert.equal(bountySubmissionAcc.linkToSubmission, LINK_TO_SUBMISSION);
    assert.equal(
      bountySubmissionAcc.contributorRecord.toString(),
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK.toString()
    );
    assert.deepEqual(bountySubmissionAcc.state, { pendingReview: {} });
    assert.equal(bountySubmissionAcc.requestChangeCount, 0);
    assert.closeTo(
      bountySubmissionAcc.firstSubmittedAt.toNumber(),
      new Date().getTime() / 1000,
      5000
    );

    const updatedBounty = await program.account.bounty.fetch(TEST_BOUNTY_PK);
    assert.deepEqual(updatedBounty.state, { submissionUnderReview: {} });
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
        setupBountySubmission(
          provider,
          program,
          TEST_BOUNTY_PK,
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

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    // clean up bounty submission created
    await cleanUpBountySubmission(
      provider,
      program,
      TEST_BOUNTY_SUBMISSION_PDA
    );
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
