import {
  Program,
  web3,
  setProvider,
  AnchorProvider,
} from "@project-serum/anchor";
import idl from "../target/idl/dao_bounty_board.json";
import { assert } from "chai";
import { DaoBountyBoard } from "../target/types/dao_bounty_board";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BOUNTY_BOARD_PROGRAM_ID, DUMMY_MINT_PK } from "../app/api/constants";
import {
  addBountyBoardTierConfig,
  cleanUpBountyBoard,
  getTiersInVec,
  seedBountyBoardVault,
  setupBountyBoard,
} from "./setup_fixtures/bounty_board";
import {
  cleanUpCreateBounty,
  DEFAULT_BOUNTY_DETAILS,
  createBounty,
} from "./setup_fixtures/bounty";
import {
  cleanUpContributorRecord,
  setupContributorRecord,
} from "./setup_fixtures/contributor_record";
import { sleep } from "./utils/common";

describe("create bounty", () => {
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

  const TEST_REALM_PK = new PublicKey(
    "9MEf1ogzSCr4YCneQ53WuFcqaiF4f95JxGLrt3rnSjDL"
  );
  const TEST_REALM_GOVERNANCE = Keypair.fromSeed(TEST_REALM_PK.toBytes());
  const TEST_REALM_TREASURY_USDC_ATA = new PublicKey(
    "EoCo8zx6fZiAmwNxG1xqLKHYtsQapNx39wWTJvGZaZwq"
  ); // my own ATA for the mint
  // accounts to cleanup
  let TEST_BOUNTY_BOARD_PK;
  let TEST_BOUNTY_BOARD_VAULT_PK;
  let TEST_CONTRIBUTOR_RECORD_PK;
  let TEST_BOUNTY_PDA;
  let TEST_BOUNTY_ESCROW_PDA;

  // Test realm public key 9MEf1ogzSCr4YCneQ53WuFcqaiF4f95JxGLrt3rnSjDL
  // Test realm governance public key AcA9bZqnc1CBKCSP1ZzQJ3hj4xCriy7QnWM7TiKPqPt1
  // Bounty board PDA Hdg9bA8UWrfGiSKaCHSMXEJaQpvXA8id1xaHQRahv5n7
  // Bounty board vault PDA 57RDcJsNJGFS1RJSxrcfun9tdLgAC4DHN9yrbmjeTstA
  // Bounty PDA 5xT7816aQ8kpJzVNWDBaMYS8GTmcF3qd4zN1tC3njaXM
  // Bounty Escrow PDA 77ByK52JEothrMCFu4HRiPhobXWHbPH9P2uKKmMqL7uj

  // data to help assertion
  let TEST_BOUNTY_BOARD_BOUNTY_INDEX;

  beforeEach(async () => {
    await sleep(800); // delay 800ms between each test
    console.log("-----------------------------");

    console.log("Test realm public key", TEST_REALM_PK.toString());
    const { bountyBoardPDA, bountyBoardVaultPDA, bountyBoardAcc } =
      await setupBountyBoard(provider, program, TEST_REALM_PK);
    TEST_BOUNTY_BOARD_PK = bountyBoardPDA;
    TEST_BOUNTY_BOARD_VAULT_PK = bountyBoardVaultPDA;
    TEST_BOUNTY_BOARD_BOUNTY_INDEX = bountyBoardAcc.bountyIndex;

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
    TEST_CONTRIBUTOR_RECORD_PK = contributorRecordPDA;
  });

  it("should create bounty PDA with correct data", async () => {
    const { bountyAcc, bountyPDA, bountyEscrowAcc, bountyEscrowPDA } =
      await createBounty(
        provider,
        program,
        TEST_BOUNTY_BOARD_PK,
        TEST_BOUNTY_BOARD_VAULT_PK,
        TEST_CONTRIBUTOR_RECORD_PK,
        DEFAULT_BOUNTY_DETAILS
      );
    TEST_BOUNTY_PDA = bountyPDA;
    TEST_BOUNTY_ESCROW_PDA = bountyEscrowPDA;

    // test bounty acc create correctly, with creator, tier reward properly populated
    assert.equal(
      bountyAcc.bountyBoard.toString(),
      TEST_BOUNTY_BOARD_PK.toString()
    );
    assert.equal(
      bountyAcc.bountyIndex.toNumber(),
      TEST_BOUNTY_BOARD_BOUNTY_INDEX.toNumber()
    );

    assert.deepEqual(bountyAcc.state, { open: {} });

    assert.equal(
      bountyAcc.creator.toString(),
      TEST_CONTRIBUTOR_RECORD_PK.toString()
    );

    assert.equal(bountyAcc.title, DEFAULT_BOUNTY_DETAILS.title);
    assert.equal(bountyAcc.description, DEFAULT_BOUNTY_DETAILS.description);
    assert.deepEqual(bountyAcc.skill, DEFAULT_BOUNTY_DETAILS.skill);
    assert.equal(bountyAcc.tier, DEFAULT_BOUNTY_DETAILS.tier);

    const defaultTiers = getTiersInVec(new PublicKey(DUMMY_MINT_PK.USDC));
    const tierConfig = defaultTiers.find(
      (t) => t.tierName === DEFAULT_BOUNTY_DETAILS.tier
    );
    assert.equal(
      bountyAcc.taskSubmissionWindow,
      tierConfig.taskSubmissionWindow
    );
    assert.equal(
      bountyAcc.submissionReviewWindow,
      tierConfig.submissionReviewWindow
    );
    assert.equal(
      bountyAcc.addressChangeReqWindow,
      tierConfig.addressChangeReqWindow
    );
    assert.equal(
      bountyAcc.rewardMint.toString(),
      tierConfig.payoutMint.toString()
    );
    assert.equal(
      bountyAcc.rewardPayout.toNumber(),
      tierConfig.payoutReward.toNumber()
    );
    assert.equal(
      bountyAcc.rewardSkillPt.toNumber(),
      tierConfig.skillsPtReward.toNumber()
    );
    assert.equal(bountyAcc.rewardReputation, tierConfig.reputationReward);
    assert.equal(
      bountyAcc.minRequiredReputation,
      tierConfig.minRequiredReputation
    );
    assert.equal(
      bountyAcc.minRequiredSkillsPt.toNumber(),
      tierConfig.minRequiredSkillsPt.toNumber()
    );

    assert.equal(bountyAcc.assignCount, 0);
    assert.equal(bountyAcc.unassignCount, 0);
    assert.equal(bountyAcc.activityIndex, 0);
    assert.isNull(bountyAcc.completedAt);

    // test bounty escrow acc created and funded
    assert.equal(bountyEscrowAcc.owner.toString(), TEST_BOUNTY_PDA.toString());
    assert.equal(
      Number(bountyEscrowAcc.amount),
      tierConfig.payoutReward.toNumber()
    );

    // test bounty board account bounty_count updated
    const bountyBoardAcc = await program.account.bountyBoard.fetch(
      TEST_BOUNTY_BOARD_PK
    );
    console.log("--- Bounty Board Acc ---");
    assert.equal(bountyBoardAcc.bountyIndex.toNumber(), 1);
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    // clean up bounty-related accounts
    if (TEST_BOUNTY_PDA || TEST_BOUNTY_ESCROW_PDA) {
      await cleanUpCreateBounty(
        provider,
        program,
        TEST_BOUNTY_PDA,
        TEST_BOUNTY_ESCROW_PDA,
        TEST_BOUNTY_BOARD_VAULT_PK
      );
      TEST_BOUNTY_PDA = undefined;
      TEST_BOUNTY_ESCROW_PDA = undefined;
    }
    // clean up creator contributor record
    if (TEST_CONTRIBUTOR_RECORD_PK) {
      await cleanUpContributorRecord(
        provider,
        program,
        TEST_CONTRIBUTOR_RECORD_PK
      );
      TEST_CONTRIBUTOR_RECORD_PK = undefined;
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

// created tx
// [
//   '3U2WepHkhPtvQdL6xLTeEQjbtmT9MHSKwBguWcuzaqXx',
//   '9QjaAPQ4kV7eeyH1YWnZVWBACmkyRboEVSUpBGrdRJRV',
//   '11111111111111111111111111111111',
//   'H72kd3NLBGpsc1DcPk5bnjJtu7BXzwNSDFa2BeVQaTEL'
// ]
// [
//   {
//     accounts: [ 1, 0, 2 ],
//     data: 'Cnez6kRzjuQXwNRoixipquwSavjse71M8jUR7TDX7BeCMEiEKKfN75P',
//     programIdIndex: 3
//   }
// ]

// bounty board init
// {
//   realm: PublicKey {
//     _bn: <BN: 69d1c7966aab0a6ad720bb5cc9a8c7d2cb09e7c01b9a8b7f9b294d07457536be>
//   },
//   updateAuthority: PublicKey { _bn: <BN: 0> },
//   dummy: ''
// }
