import { AnchorProvider, Program, setProvider } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { BOUNTY_BOARD_PROGRAM_ID } from "../app/api/constants";
import idl from "../target/idl/dao_bounty_board.json";
import { DaoBountyBoard } from "../target/types/dao_bounty_board";
import {
  cleanUpBountyBoard,
  setupBountyBoard,
} from "./setup_fixtures/bounty_board";
import {
  cleanUpContributorRecord,
  setupContributorRecord,
} from "./setup_fixtures/contributor_record";
import { sleep } from "./utils/common";

describe("add contributor with role", () => {
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
    "7HvUepoKUmWLtTc2ihCRUG7MEdp45V7rCyBDeBgRGFjj"
  );
  let TEST_REALM_GOVERNANCE = Keypair.fromSeed(TEST_REALM_PK.toBytes());
  const TEST_REALM_TREASURY_USDC_ATA = new PublicKey(
    "EoCo8zx6fZiAmwNxG1xqLKHYtsQapNx39wWTJvGZaZwq"
  ); // my own ATA for the mint
  let TEST_BOUNTY_BOARD_PK;
  let TEST_BOUNTY_BOARD_VAULT_PK;
  let TEST_CONTRIBUTOR_RECORD_PDA;

  // Test realm public key 7HvUepoKUmWLtTc2ihCRUG7MEdp45V7rCyBDeBgRGFjj
  // Test realm governance public key 4gcXTHFbUTsWnnH6y2pQJvKNbneaCUSXX5b2vcpS3xNH
  // Bounty board PDA 2tXfjm3F4SSwWnDBBy2H81MeRLUUx67QNGgEYmBZaGJq
  // Bounty board vault PDA GYhav3DSCrtBfxR8cAP7J6QN77T3iBjcapZiHLqm9zfR
  // Contributor record PDA 6pks4WpJu41j9RcaySmQkm6o3i66yzwdmw87SANMNqEW

  beforeEach(async () => {
    await sleep(800); // delay 800ms between each test
    console.log("-----------------------------");

    console.log("Test realm public key", TEST_REALM_PK.toString());
    const { bountyBoardPDA, bountyBoardVaultPDA } = await setupBountyBoard(
      provider,
      program,
      TEST_REALM_PK
    );
    TEST_BOUNTY_BOARD_PK = bountyBoardPDA;
    TEST_BOUNTY_BOARD_VAULT_PK = bountyBoardVaultPDA;
  });

  it("create contributor record acc correctly", async () => {
    const TEST_ASSOCIATED_WALLET = provider.wallet.publicKey;
    const TEST_ROLE_NAME = "Contributor";

    const { contributorRecordAcc, contributorRecordPDA } =
      await setupContributorRecord(
        provider,
        program,
        TEST_BOUNTY_BOARD_PK,
        TEST_ASSOCIATED_WALLET,
        TEST_REALM_GOVERNANCE,
        TEST_ROLE_NAME
      );
    TEST_CONTRIBUTOR_RECORD_PDA = contributorRecordPDA;

    assert.isTrue(contributorRecordAcc.initialized);
    assert.equal(
      contributorRecordAcc.bountyBoard.toString(),
      TEST_BOUNTY_BOARD_PK.toString()
    );
    assert.equal(
      contributorRecordAcc.realm.toString(),
      TEST_REALM_PK.toString()
    );
    assert.equal(
      contributorRecordAcc.associatedWallet.toString(),
      TEST_ASSOCIATED_WALLET.toString()
    );
    assert.equal(contributorRecordAcc.role, TEST_ROLE_NAME);

    assert.equal(contributorRecordAcc.reputation.toNumber(), 0);
    assert.isEmpty(contributorRecordAcc.skillsPt);
    assert.equal(contributorRecordAcc.bountyCompleted, 0);
    assert.equal(contributorRecordAcc.recentRepChange, 0);
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    // clean up acc created
    await cleanUpContributorRecord(
      provider,
      program,
      TEST_CONTRIBUTOR_RECORD_PDA
    );

    // clean up bounty board related accounts
    await cleanUpBountyBoard(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_BOARD_VAULT_PK,
      TEST_REALM_TREASURY_USDC_ATA
    );
  });
});
