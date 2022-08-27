import {
  Program,
  web3,
  setProvider,
  AnchorProvider,
} from "@project-serum/anchor";

import idl from "../target/idl/dao_bounty_board.json";
import { assert } from "chai";
import { DaoBountyBoard } from "../target/types/dao_bounty_board";
import { PublicKey } from "@solana/web3.js";
import { DUMMY_MINT_PK, BOUNTY_BOARD_PROGRAM_ID } from "../app/api/constants";
import {
  cleanUpBountyBoard,
  setupBountyBoard,
} from "./setup_fixtures/bounty_board";

describe("init bounty board", () => {
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

  const TEST_REALM_PK = new PublicKey(
    "E1gZDYQWPJV3RVBbijC8zoMhEXppA19ShXessDHKWCNM"
  );
  const TEST_REALM_TREASURY_USDC_ATA = new PublicKey(
    "EoCo8zx6fZiAmwNxG1xqLKHYtsQapNx39wWTJvGZaZwq"
  ); // my own ATA for the mint
  let TEST_BOUNTY_BOARD_PDA; // accounts to close after tests
  let TEST_BOUNTY_BOARD_VAULT_PDA;
  /**
   * TEST
   */

  it("should create bounty board PDA with correct data", async () => {
    // data

    // Test Realm public key E1gZDYQWPJV3RVBbijC8zoMhEXppA19ShXessDHKWCNM
    // Test realm governance public key DdDbZKSVEGbANBxudt59EX3ZYyU65SjL6yw6FTAjdM6s
    // Bounty board PDA BsJMGpu8AMkQn9M2gKUdkquY4AM7p9GXoY2VU5LZaJdy
    // Bounty board vault PDA 2WWuEfye4YqKvZyHkmrZuZRqgT7RDJ7o4uo3y1hywo7g

    const {
      realmGovernancePk,
      bountyBoardPDA,
      bountyBoardAcc,
      bountyBoardVaultPDA,
      bountyBoardVaultAcc,
    } = await setupBountyBoard(provider, program, TEST_REALM_PK);
    TEST_BOUNTY_BOARD_PDA = bountyBoardPDA;
    TEST_BOUNTY_BOARD_VAULT_PDA = bountyBoardVaultPDA;

    assert.equal(bountyBoardAcc.realm.toString(), TEST_REALM_PK.toString());
    assert.equal(
      bountyBoardAcc.authority.toString(),
      realmGovernancePk.toString()
    );
    assert.equal(bountyBoardAcc.bountyIndex.toNumber(), 0);
    // assert.deepEqual(account.config, CONFIG);

    // assert bounty board is owner of vault
    assert.equal(
      bountyBoardVaultAcc.owner.toString(),
      bountyBoardPDA.toString()
    );
    assert.equal(bountyBoardVaultAcc.mint.toString(), DUMMY_MINT_PK.USDC);
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    // clean up bounty board-related accounts
    if (TEST_BOUNTY_BOARD_PDA || TEST_BOUNTY_BOARD_VAULT_PDA) {
      await cleanUpBountyBoard(
        provider,
        program,
        TEST_BOUNTY_BOARD_PDA,
        TEST_BOUNTY_BOARD_VAULT_PDA,
        TEST_REALM_TREASURY_USDC_ATA
      );
      TEST_BOUNTY_BOARD_PDA = undefined;
      TEST_BOUNTY_BOARD_VAULT_PDA = undefined;
    }
  });
});
