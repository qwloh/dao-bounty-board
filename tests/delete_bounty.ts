import {
  AnchorProvider,
  Program,
  setProvider,
  web3,
} from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
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
import { assertFulfilled, assertReject } from "./utils/assert-promise-utils";
import { sleep } from "./utils/common";

describe("delete bounty", () => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  setProvider(provider);

  const providerWalletPublicKey = provider.wallet.publicKey;
  console.log("Provider wallet public key", providerWalletPublicKey.toString());

  const programId = new web3.PublicKey(BOUNTY_BOARD_PROGRAM_ID);
  const program = new Program(
    JSON.parse(JSON.stringify(idl)),
    programId
  ) as Program<DaoBountyBoard>;

  /**
   * TEST
   */

  // accounts involved in this test
  const TEST_REALM_PK = new PublicKey(
    "EY3MSW2j1nmsd1qxvLPqHFuxk1CpyWb9MXxJru5VDpWh"
  );
  const TEST_REALM_GOVERNANCE = Keypair.fromSeed(TEST_REALM_PK.toBytes());
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
      "3vWafyZ5oDFqhbTanp8zoF5QjsZsEzMrEVfQcZms7CeV8ZbUuQAcbpE7VioCvue82ZF9R423VtJZudCjTVG2amgt"
    )
  );
  let TEST_APPLICANT_CONTRIBUTOR_RECORD_PK;
  let TEST_BOUNTY_APPLICATION_PK;
  let TEST_BOUNTY_ACTIVITY_APPLY_PK;

  // Test realm public key EY3MSW2j1nmsd1qxvLPqHFuxk1CpyWb9MXxJru5VDpWh
  // Test realm governance public key BaVJnCpBpGBYndrJUakA9yaVixLUmE1dMcGS5K3o4ndo
  // Bounty board PDA G5EjHh79mYNxL3gFB2XUEGAtYMPG9dkv819muWMoWrou
  // Bounty board vault PDA BYkyhNoLSeM4aLbEUcbF8ema1DzawwzfyeGKmcXknxU
  // Test creator contributor record PDA ABELpuiAe8FUHkZfzQRfT6Lod76bkaNAScWXF5pPBWMq
  // Bounty PDA CWvDuCnD1ACDmT9o8o6MzYx2gw6sjMEpb7WdyaZwmmsU
  // Bounty Escrow PDA EURAUp95H4Rba7ry5CNLC2n24jrPFFUnHMQyvmXkMtS1
  // Test applicant public key A8h4vFxZmQYUdrkhqdRodttfN5eaUH5e2xw6Bumonw92
  // Applicant contributor record PDA E6QHvisXKB6fJSUEGK2ypeB7pKVX9fnGVXuxfj3MfZre
  // Bounty application PDA EjkrboE5d3iduhBfoPV9aWXTkhhCfrKngrmqhoHg4NqD
  // Bounty activity (Apply) PDA 8f384ZiQJR4AnCfkvzA4kBjrPC8uPFmWQnbHwWypQhr6

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

    // add bounty tier config
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
  });

  it("should close bounty and bounty escrow account if bounty has not been assigned", async () => {
    try {
      const tx = await program.methods
        .deleteBounty()
        .accounts({
          bounty: TEST_BOUNTY_PK,
          bountyBoardVault: TEST_BOUNTY_BOARD_VAULT_PK,
          bountyEscrow: TEST_BOUNTY_ESCROW_PK,
          contributorRecord: TEST_CREATOR_CONTRIBUTOR_RECORD_PK,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        // .simulate();
        .rpc();
      console.log("[DeleteBounty] Your transaction signature", tx);
    } catch (err) {
      console.log("Transaction / Simulation fail.", err);
    }

    console.log("Assert bounty account is null");
    const bountyAcc = await program.account.bounty.fetchNullable(
      TEST_BOUNTY_PK
    );
    assert.isNull(bountyAcc);

    // try to get bounty board vault account, assert balance increase

    console.log("Assert getting bounty escrow account throws");
    await assertReject(
      () =>
        getAccount(
          provider.connection,
          TEST_BOUNTY_ESCROW_PK,
          "recent",
          TOKEN_PROGRAM_ID
        ),
      /TokenAccountNotFoundError/
    );
  });

  it("should throw if bounty has been assigned", async () => {
    console.log(
      "Test applicant public key",
      TEST_APPLICANT_WALLET.publicKey.toString()
    );
    console.log(
      "Test applicant secret key",
      bs58.encode(TEST_APPLICANT_WALLET.secretKey)
    );

    // assign bounty first
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
      7 * 24 * 3600 // 1 wk
    );
    TEST_BOUNTY_APPLICATION_PK = bountyApplicationPDA;
    TEST_APPLICANT_CONTRIBUTOR_RECORD_PK = applicantContributorRecordPDA;
    TEST_BOUNTY_ACTIVITY_APPLY_PK = bountyActivityApplyPDA;
    CURRENT_BOUNTY_ACTIVITY_INDEX = updatedBountyAcc.activityIndex;

    const { bountySubmissionPDA, bountyActivityAssignPDA } = await assignBounty(
      provider,
      program,
      TEST_BOUNTY_PK,
      TEST_BOUNTY_ASSIGN_COUNT,
      CURRENT_BOUNTY_ACTIVITY_INDEX,
      TEST_BOUNTY_APPLICATION_PK
    );
    // then do the exact same operation as above

    // const errorMatcher: RegExp = /BountyAlreadyAssignedHelloWorld/;
    await assertReject(
      () =>
        program.methods
          .deleteBounty()
          .accounts({
            bounty: TEST_BOUNTY_PK,
            bountyBoardVault: TEST_BOUNTY_BOARD_VAULT_PK,
            bountyEscrow: TEST_BOUNTY_ESCROW_PK,
            contributorRecord: TEST_CREATOR_CONTRIBUTOR_RECORD_PK,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .simulate(),
      /BountyAlreadyAssigned/
    );

    console.log("Assert bounty account is NOT null");
    const bountyAcc = await program.account.bounty.fetchNullable(
      TEST_BOUNTY_PK
    );
    assert.isNotNull(bountyAcc);

    // try to get bounty board vault account, assert balance increase

    console.log("Assert getting bounty escrow account does NOT throw");
    await assertFulfilled(() =>
      getAccount(
        provider.connection,
        TEST_BOUNTY_ESCROW_PK,
        "recent",
        TOKEN_PROGRAM_ID
      )
    );

    console.log(
      "Cleaning up bounty submission & bounty application related accounts"
    );
    // clean up bounty submission created from assign
    await cleanUpAssignBounty(
      provider,
      program,
      bountyActivityAssignPDA,
      bountySubmissionPDA
    );
    // clean up application related accounts
    await cleanUpApplyToBounty(
      provider,
      program,
      TEST_BOUNTY_APPLICATION_PK,
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PK, // bounty applicant
      TEST_BOUNTY_ACTIVITY_APPLY_PK
    );
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
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
