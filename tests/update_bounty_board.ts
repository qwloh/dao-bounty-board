import {
  Program,
  web3,
  BN,
  setProvider,
  AnchorProvider,
} from "@project-serum/anchor";

import idl from "../target/idl/dao_bounty_board.json";
import { assert } from "chai";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BOUNTY_BOARD_PROGRAM_ID, DUMMY_MINT_PK } from "../app/api/constants";
import {
  cleanUpBountyBoard,
  getRolesInVec,
  setupBountyBoard,
} from "./setup_fixtures/bounty_board";

const getTiersInVec = (PAYOUT_MINT: PublicKey) => [
  {
    tierName: "Entry",
    difficultyLevel: "First contribution",
    minRequiredReputation: 0,
    minRequiredSkillsPt: 0,
    reputationReward: 10,
    skillsPtReward: 10,
    payoutReward: 50,
    payoutMint: PAYOUT_MINT,
  },
  {
    tierName: "A",
    difficultyLevel: "Easy",
    minRequiredReputation: 50,
    minRequiredSkillsPt: 50,
    reputationReward: 20,
    skillsPtReward: 20,
    payoutReward: 200,
    payoutMint: PAYOUT_MINT,
  },
  {
    tierName: "AA",
    difficultyLevel: "Moderate",
    minRequiredReputation: 100,
    minRequiredSkillsPt: 100,
    reputationReward: 50,
    skillsPtReward: 50,
    payoutReward: 500,
    payoutMint: PAYOUT_MINT,
  },
  {
    tierName: "S",
    difficultyLevel: "Complex",
    minRequiredReputation: 500,
    minRequiredSkillsPt: 500,
    reputationReward: 100,
    skillsPtReward: 100,
    payoutReward: 2000,
    payoutMint: PAYOUT_MINT,
  },
];

describe.only("update bounty board config", () => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  setProvider(provider);

  const providerWalletPublicKey = provider.wallet.publicKey;
  console.log("Provider wallet public key", providerWalletPublicKey.toString());

  const programId = new web3.PublicKey(BOUNTY_BOARD_PROGRAM_ID);
  const program = new Program(JSON.parse(JSON.stringify(idl)), programId);

  // const TEST_REALM_PK =
  let TEST_REALM_PK = new PublicKey(
    "ES8pbaPfrKmuAeccci5s6nJkaR8FWPpUhdQCrvPy3Rb4"
  );
  let TEST_REALM_GOVERNANCE = Keypair.fromSeed(TEST_REALM_PK.toBytes());
  let TEST_BOUNTY_BOARD_PDA; // accounts to close after tests
  let TEST_BOUNTY_BOARD_VAULT_PDA;

  // Test Realm public key ES8pbaPfrKmuAeccci5s6nJkaR8FWPpUhdQCrvPy3Rb4
  // Test realm governance public key HqvGKv7bjGMKS9G38WQtwDSf1nSrstq51EWBGewHsbCR
  // Bounty board PDA Cr1KLGZrDJKbk5S7p8NRUFmy3hWZXPZPecPyQe4Vh58x
  // Bounty board vault PDA 6GTHjSVZdntWN2nfoMFTYMU3Qxgc1QYekqLikU9moh9L

  /**
   * TEST
   */

  beforeEach(async () => {
    console.log("Test realm public key", TEST_REALM_PK.toString());
    // set up bounty board
    const { bountyBoardPDA, bountyBoardVaultPDA, realmGovernancePk } =
      await setupBountyBoard(provider, program, TEST_REALM_PK);
    TEST_BOUNTY_BOARD_PDA = bountyBoardPDA;
    TEST_BOUNTY_BOARD_VAULT_PDA = bountyBoardVaultPDA;
  });

  it("should update bounty board PDA with correct config", async () => {
    // data
    const PAYOUT_MINT = new web3.PublicKey(DUMMY_MINT_PK.USDC);
    const CONFIG = {
      lastRevised: new BN(new Date().getTime() / 1000),
      tiers: getTiersInVec(PAYOUT_MINT),
      roles: getRolesInVec().map((r) =>
        r.roleName === "Core" ? { ...r, roleName: "Core_updated" } : r
      ),
    };
    console.log("New config roles", JSON.stringify(CONFIG.roles));

    try {
      const updateBountyBoardTx = await program.methods
        .updateBountyBoard({
          config: CONFIG,
        })
        .accounts({
          // list of all affected accounts
          bountyBoard: TEST_BOUNTY_BOARD_PDA,
          realmGovernance: TEST_REALM_GOVERNANCE.publicKey,
        })
        .signers([TEST_REALM_GOVERNANCE])
        .rpc();

      console.log("Your transaction signature", updateBountyBoardTx);
    } catch (err) {
      console.log("[UpdateBountyBoard] Transaction / Simulation fail.", err);
    }

    const updatedBountyBoardAcc = await program.account.bountyBoard.fetch(
      TEST_BOUNTY_BOARD_PDA
    );
    console.log(updatedBountyBoardAcc);

    assert.deepEqual(
      updatedBountyBoardAcc.config.tiers.map((t) => ({
        ...t,
        payoutMint: t.payoutMint.toString(),
      })),
      CONFIG.tiers.map((t) => ({
        ...t,
        payoutMint: t.payoutMint.toString(),
      }))
    );

    assert.deepEqual(updatedBountyBoardAcc.config.roles, CONFIG.roles);
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    await cleanUpBountyBoard(
      provider,
      program,
      TEST_BOUNTY_BOARD_PDA,
      TEST_BOUNTY_BOARD_VAULT_PDA
    );
  });
});
