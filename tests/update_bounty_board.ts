import {
  Program,
  web3,
  BN,
  setProvider,
  AnchorProvider,
  utils,
} from "@project-serum/anchor";
import {
  BOUNTY_BOARD_PROGRAM_ID,
  PAYOUT_MINT_PK,
  PROGRAM_AUTHORITY_SEED,
  TEST_DAO_PK,
} from "./constants";
import idl from "../target/idl/dao_bounty_board.json";
import { assert } from "chai";
import { PublicKey } from "@solana/web3.js";

const getTiersInVec = (PAYOUT_MINT: PublicKey) => [
  {
    tierName: "Entry",
    difficultyLevel: "First contribution",
    minRequiredReputation: 0,
    minRequiredSKillsPt: 0,
    reputationReward: 10,
    skillsPtReward: 10,
    payoutReward: 50,
    payoutMint: PAYOUT_MINT,
  },
  {
    tierName: "A",
    difficultyLevel: "Easy",
    minRequiredReputation: 50,
    minRequiredSKillsPt: 50,
    reputationReward: 20,
    skillsPtReward: 20,
    payoutReward: 200,
    payoutMint: PAYOUT_MINT,
  },
  {
    tierName: "AA",
    difficultyLevel: "Moderate",
    minRequiredReputation: 100,
    minRequiredSKillsPt: 100,
    reputationReward: 50,
    skillsPtReward: 50,
    payoutReward: 500,
    payoutMint: PAYOUT_MINT,
  },
  {
    tierName: "S",
    difficultyLevel: "Complex",
    minRequiredReputation: 500,
    minRequiredSKillsPt: 500,
    reputationReward: 100,
    skillsPtReward: 100,
    payoutReward: 2000,
    payoutMint: PAYOUT_MINT,
  },
];

describe.skip("update bounty board config", () => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  setProvider(provider);

  const providerWalletPublicKey = provider.wallet.publicKey;
  console.log("Provider wallet public key", providerWalletPublicKey.toString());

  const programId = new web3.PublicKey(BOUNTY_BOARD_PROGRAM_ID);
  const program = new Program(JSON.parse(JSON.stringify(idl)), programId);

  /**
   * TEST
   */

  it("should update bounty board PDA with correct config", async () => {
    // data
    const REALM_PK = new web3.PublicKey(TEST_DAO_PK);
    const realmGovernance = web3.Keypair.fromSeed(REALM_PK.toBytes());
    const PAYOUT_MINT = new web3.PublicKey(PAYOUT_MINT_PK);
    const CONFIG = {
      lastRevised: new BN(new Date().getTime() / 1000),
      tiers: getTiersInVec(PAYOUT_MINT),
      roles: new BN(250),
      functions: new BN(350),
    };

    console.log(
      "Test realm governance public key",
      realmGovernance.publicKey.toString()
    );

    const [bountyBoardPDA, bump] = await web3.PublicKey.findProgramAddress(
      [utils.bytes.utf8.encode(PROGRAM_AUTHORITY_SEED), REALM_PK.toBytes()],
      programId
    );
    console.log("bountyBoardPDA", bountyBoardPDA.toString());

    const tx = await program.methods
      .updateBountyBoard({
        config: CONFIG,
      })
      .accounts({
        // list of all affected accounts
        bountyBoard: bountyBoardPDA,
        realmGovernance: realmGovernance.publicKey,
      })
      .signers([realmGovernance])
      // .instruction();
      .rpc();

    // console.log(ix.keys.map((k) => ({ ...k, pubkey: k.pubkey.toString() })));
    // console.log(ix.programId.toString());

    console.log("Your transaction signature", tx);

    const account = await program.account.bountyBoard.fetch(bountyBoardPDA);
    console.log(account);

    // assert.equal(account.config.tiers.toNumber(), CONFIG.tiers.toNumber());
    // assert.equal(
    //   account.config.functions.toNumber(),
    //   CONFIG.functions.toNumber()
    // );
    // assert.equal(account.config.roles.toNumber(), CONFIG.roles.toNumber());
  });
});
