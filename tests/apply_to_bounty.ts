import { AnchorProvider, Program, setProvider } from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { assert } from "chai";
import { BOUNTY_BOARD_PROGRAM_ID } from "../app/api/constants";
import { setupContributorRecord } from "../app/api/utils";
import idl from "../target/idl/dao_bounty_board.json";
import { DaoBountyBoard } from "../target/types/dao_bounty_board";
import { cleanUpBounty, setupBounty } from "./setup_fixtures/bounty";
import {
  cleanUpBountyApplication,
  setupBountyApplication,
} from "./setup_fixtures/bounty_application";
import {
  addBountyBoardTierConfig,
  cleanUpBountyBoard,
  getRolesInVec,
  seedBountyBoardVault,
  setupBountyBoard,
} from "./setup_fixtures/bounty_board";
import { cleanUpContributorRecord } from "./setup_fixtures/contributor_record";

describe("apply to bounty", () => {
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
    "ERnGrQLSFk7CG15kPqRC9JeuV8zLq5cje29ycJUmsnzQ"
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
      "542ZkFLa8T3cc3deiFdzXSe1NmoyPSc3fWfhjBNsPdSzCBxWMXyiTb3Cifnz5NY95NjsX3gofn4Chgri3TRVzAJW"
    )
  );
  let TEST_APPLICANT_CONTRIBUTOR_RECORD_PDA;
  let TEST_BOUNTY_APPLICATION_PDA;

  // Test realm public key ERnGrQLSFk7CG15kPqRC9JeuV8zLq5cje29ycJUmsnzQ
  // Test realm governance public key Ex1qQwFhSGd9zWDDUcPMdm85Yhbf4B7sHUae72cD7j3T
  // Bounty board PDA 5PFZkApNNfJcYoZ74KFmQqmqsqYspWaAAo42ZpgotE6J
  // Bounty board vault PDA 7bKRsSgshVbRHFSsHFpG571cxDki86jtPRRRouJ5Tz72
  // Creator contributor record G8XKMsgaDsFVAPzUNfnRV7VKZWqVQzJFhocpgxjFPVuD
  // Bounty PDA AuJ3NLKM9YDH58kYiqJTC9PJKmo5AnDzMSsrmWkJxnri
  // Bounty escrow PDA 5CiRmJmWk8mpqg7GrrfP3Z5vJ2atZ5Rs9Q1cDnhodFz7
  // Test applicant public key J5DH6VirxDNgih8wvUGDhDABwZVTEAHPtz1LRUamLFFg
  // Test applicant secret key 542ZkFLa8T3cc3deiFdzXSe1NmoyPSc3fWfhjBNsPdSzCBxWMXyiTb3Cifnz5NY95NjsX3gofn4Chgri3TRVzAJW
  // Applicant contributor record PDA 72Ad1wVNGa4HYnZaK4JcCjhbPnPo7TRkKRePnUqDds27
  // Bounty application PDA FqdhNR8vrERcQ5UHoBhWR7J82UG5HGjEd38yEJmW9Htt

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
  });

  it("create bounty application acc correctly", async () => {
    console.log(
      "Test applicant public key",
      TEST_APPLICANT_WALLET.publicKey.toString()
    );
    console.log(
      "Test applicant secret key",
      bs58.encode(TEST_APPLICANT_WALLET.secretKey)
    );

    const {
      bountyApplicationPDA,
      bountyApplicationAcc,
      applicantContributorRecordPDA,
      applicantContributorRecordAcc,
    } = await setupBountyApplication(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_PK,
      TEST_APPLICANT_WALLET,
      7 * 24 * 3600 // 1 wk
    );
    TEST_BOUNTY_APPLICATION_PDA = bountyApplicationPDA;
    TEST_APPLICANT_CONTRIBUTOR_RECORD_PDA = applicantContributorRecordPDA;

    // assert bounty application is okay
    assert.equal(
      bountyApplicationAcc.bounty.toString(),
      TEST_BOUNTY_PK.toString()
    );
    assert.equal(
      bountyApplicationAcc.applicant.toString(),
      TEST_APPLICANT_WALLET.publicKey.toString()
    );
    assert.equal(
      bountyApplicationAcc.contributorRecord.toString(),
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PDA.toString()
    );
    assert.equal(
      bountyApplicationAcc.validity.toNumber(),
      new BN(7 * 24 * 3600).toNumber()
    );
    // applied_at
    assert.deepEqual(bountyApplicationAcc.status, { notAssigned: {} });

    // assert contributorRecordAcc is created
    assert.isTrue(applicantContributorRecordAcc.initialized);
    assert.equal(
      applicantContributorRecordAcc.bountyBoard.toString(),
      TEST_BOUNTY_BOARD_PK.toString()
    );
    assert.equal(
      applicantContributorRecordAcc.realm.toString(),
      TEST_REALM_PK.toString()
    );
    assert.equal(
      applicantContributorRecordAcc.associatedWallet.toString(),
      TEST_APPLICANT_WALLET.publicKey.toString()
    );
    const defaultRole = getRolesInVec().find((r) => r.default);
    assert.equal(applicantContributorRecordAcc.role, defaultRole.roleName);

    assert.equal(applicantContributorRecordAcc.reputation.toNumber(), 0);
    assert.isEmpty(applicantContributorRecordAcc.skillsPt);
    assert.equal(applicantContributorRecordAcc.bountyCompleted, 0);
    assert.equal(applicantContributorRecordAcc.recentRepChange, 0);
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    // clean up bounty application created
    await cleanUpBountyApplication(
      provider,
      program,
      TEST_BOUNTY_APPLICATION_PDA,
      TEST_APPLICANT_CONTRIBUTOR_RECORD_PDA
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
