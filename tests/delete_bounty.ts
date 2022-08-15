import {
  AnchorProvider,
  Program,
  setProvider,
  web3,
} from "@project-serum/anchor";
import { getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
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
  cleanUpBountyBoard,
  seedBountyBoardVault,
  setupBountyBoard,
} from "./setup_fixtures/bounty_board";
import {
  cleanUpContributorRecord,
  setupContributorRecord,
} from "./setup_fixtures/contributor_record";
import { assertFulfilled, assertReject } from "./utils/assert-promise-utils";

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

  // accounts to cleanup
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
  let TEST_BOUNTY_APPLICATION_PK;
  let TEST_CONTRIBUTOR_RECORD_PK;

  // Test realm public key EY3MSW2j1nmsd1qxvLPqHFuxk1CpyWb9MXxJru5VDpWh
  // Test realm governance public key BaVJnCpBpGBYndrJUakA9yaVixLUmE1dMcGS5K3o4ndo
  // Bounty board PDA 4nXW7fuNcaEGA2TdVqX9atZzVuSJSuu34AZSFEAa7uiS
  // Bounty board vault PDA 53Dfs6Pgc6NFFCD6BNQkv42PdbX6hbDPQhPV6Umsech6
  // Bounty PDA 6CmM9Xw4KU2JufxUSfE73vqDghYmJqMY9Mcu7UrLdj9Q
  // Bounty Escrow PDA DxAqMun3NQ65JjCJ5PFrGxWpfccc7WVWKNkyBfWkqFMa

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
    TEST_CONTRIBUTOR_RECORD_PK = contributorRecordPDA;

    // set up bounty
    const { bountyPDA, bountyEscrowPDA } = await setupBounty(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_BOARD_VAULT_PK,
      TEST_CONTRIBUTOR_RECORD_PK
    );
    TEST_BOUNTY_PK = bountyPDA;
    TEST_BOUNTY_ESCROW_PK = bountyEscrowPDA;
  });

  it("should close bounty and bounty escrow account if bounty has not been assigned", async () => {
    try {
      const tx = await program.methods
        .deleteBounty()
        .accounts({
          bounty: TEST_BOUNTY_PK,
          bountyBoardVault: TEST_BOUNTY_BOARD_VAULT_PK,
          bountyEscrow: TEST_BOUNTY_ESCROW_PK,
          contributorRecord: TEST_CONTRIBUTOR_RECORD_PK,
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
    // assign bounty first
    const TEST_APPLICANT_PK = provider.wallet.publicKey;
    const { bountyApplicationPDA, contributorRecordPDA } =
      await setupBountyApplication(
        provider,
        program,
        TEST_BOUNTY_BOARD_PK,
        TEST_BOUNTY_PK,
        TEST_APPLICANT_PK
      );
    TEST_BOUNTY_APPLICATION_PK = bountyApplicationPDA;
    TEST_CONTRIBUTOR_RECORD_PK = contributorRecordPDA;
    await assignBounty(
      provider,
      program,
      TEST_BOUNTY_PK,
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
            contributorRecord: TEST_CONTRIBUTOR_RECORD_PK,
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
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    // clean up application related accounts
    await cleanUpBountyApplication(
      provider,
      program,
      TEST_BOUNTY_APPLICATION_PK,
      TEST_CONTRIBUTOR_RECORD_PK // bounty applicant
    );

    // clean up bounty related accounts
    await cleanUpBounty(
      provider,
      program,
      TEST_BOUNTY_PK,
      TEST_BOUNTY_ESCROW_PK,
      TEST_BOUNTY_BOARD_VAULT_PK
    );

    // clean up contributor records
    await cleanUpContributorRecord(
      provider,
      program,
      TEST_CONTRIBUTOR_RECORD_PK // bounty creator
    );

    // close bounty board related accounts
    await cleanUpBountyBoard(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_BOARD_VAULT_PK,
      TEST_REALM_TREASURY_USDC_ATA
    );
  });
});
