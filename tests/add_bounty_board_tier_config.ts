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
import { BOUNTY_BOARD_PROGRAM_ID } from "../app/api/constants";
import {
  addBountyBoardTierConfig,
  cleanUpBountyBoard,
  DEFAULT_TIERS,
  setupBountyBoard,
} from "./setup_fixtures/bounty_board";
import { assertReject } from "./utils/assert-promise-utils";
import { sleep } from "./utils/common";

describe("add bounty board tier config", () => {
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
    "F1UQeTStc4r8tSXhTKF8Ms2zJt4L2Dtv5SNwNruCZwqt"
  );
  const TEST_REALM_GOVERNANCE = Keypair.fromSeed(TEST_REALM_PK.toBytes());
  const TEST_REALM_TREASURY_USDC_ATA = new PublicKey(
    "EoCo8zx6fZiAmwNxG1xqLKHYtsQapNx39wWTJvGZaZwq"
  ); // my own ATA for the mint
  let TEST_BOUNTY_BOARD_PDA; // accounts to close after tests
  let TEST_BOUNTY_BOARD_VAULT_PDA;

  //  Test realm public key F1UQeTStc4r8tSXhTKF8Ms2zJt4L2Dtv5SNwNruCZwqt
  //  Test realm governance public key xkpe744XA3B95aiPNz98rUqdcdaUnLR5wej1i4sd9wf
  //  Bounty board PDA Fe13wMhcWkUu4LVxjgQKeKfPsFfKkxWZDZ4sTM9VEtW5
  //  Bounty board vault PDA CqRBrtTU3WQMm1YydksZ2nDhe7eKYyUMqum1hYLECLXq

  /**
   * TEST
   */

  beforeEach(async () => {
    await sleep(800); // delay 800ms between each test
    console.log("-----------------------------");

    console.log("Test realm public key", TEST_REALM_PK.toString());
    // set up bounty board
    const { bountyBoardPDA, bountyBoardVaultPDA, realmGovernancePk } =
      await setupBountyBoard(provider, program, TEST_REALM_PK);
    TEST_BOUNTY_BOARD_PDA = bountyBoardPDA;
    TEST_BOUNTY_BOARD_VAULT_PDA = bountyBoardVaultPDA;
  });

  it("should update tier config successfully", async () => {
    const { updatedBountyBoardAcc } = await addBountyBoardTierConfig(
      provider,
      program,
      TEST_BOUNTY_BOARD_PDA,
      TEST_REALM_GOVERNANCE
    );

    for (const [idx, tier] of DEFAULT_TIERS.entries()) {
      assert.equal(
        tier.tierName,
        updatedBountyBoardAcc.config.tiers[idx].tierName
      );
      assert.equal(
        tier.difficultyLevel,
        updatedBountyBoardAcc.config.tiers[idx].difficultyLevel
      );
      assert.equal(
        tier.payoutMint.toString(),
        updatedBountyBoardAcc.config.tiers[idx].payoutMint.toString()
      );
      assert.equal(
        tier.reputationReward,
        updatedBountyBoardAcc.config.tiers[idx].reputationReward
      );
      assert.equal(
        tier.payoutReward.toNumber(),
        updatedBountyBoardAcc.config.tiers[idx].payoutReward.toNumber()
      );
      assert.equal(
        tier.skillsPtReward.toNumber(),
        updatedBountyBoardAcc.config.tiers[idx].skillsPtReward.toNumber()
      );
      assert.equal(
        tier.minRequiredReputation,
        updatedBountyBoardAcc.config.tiers[idx].minRequiredReputation
      );
      assert.equal(
        tier.minRequiredSkillsPt.toNumber(),
        updatedBountyBoardAcc.config.tiers[idx].minRequiredSkillsPt.toNumber()
      );
      assert.equal(
        tier.taskSubmissionWindow,
        updatedBountyBoardAcc.config.tiers[idx].taskSubmissionWindow
      );
      assert.equal(
        tier.submissionReviewWindow,
        updatedBountyBoardAcc.config.tiers[idx].submissionReviewWindow
      );
      assert.equal(
        tier.addressChangeReqWindow,
        updatedBountyBoardAcc.config.tiers[idx].addressChangeReqWindow
      );
    }
  });

  it("should throw if tier has already been set", async () => {
    // add first
    await addBountyBoardTierConfig(
      provider,
      program,
      TEST_BOUNTY_BOARD_PDA,
      TEST_REALM_GOVERNANCE
    );

    await assertReject(
      () =>
        addBountyBoardTierConfig(
          provider,
          program,
          TEST_BOUNTY_BOARD_PDA,
          TEST_REALM_GOVERNANCE
        ),
      /TiersAlreadyConfigured/
    );
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    await cleanUpBountyBoard(
      provider,
      program,
      TEST_BOUNTY_BOARD_PDA,
      TEST_BOUNTY_BOARD_VAULT_PDA,
      TEST_REALM_TREASURY_USDC_ATA
    );
  });
});
