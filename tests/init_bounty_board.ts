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
  PROGRAM_AUTHORITY_SEED,
  TEST_DAO_PK,
} from "./constants";
import idl from "../target/idl/dao_bounty_board.json";
import { assert } from "chai";

describe("init bounty board", () => {
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

  it("should create bounty board PDA with correct data", async () => {
    //  const mockAccount = web3.Keypair.generate();
    const bountyBoardCreatorPublicKey = providerWalletPublicKey;

    // data
    const REALM_PK = new web3.PublicKey(TEST_DAO_PK);
    const realmGovernance = web3.Keypair.fromSeed(REALM_PK.toBytes());
    const CONFIG = {
      lastRevised: new BN(new Date().getTime() / 1000),
      tiers: [],
      roles: new BN(200),
      functions: new BN(300),
    };

    console.log(
      "Test realm governance public key",
      realmGovernance.publicKey.toString()
    ); // 25N47DNLjSt7LZS2HrvHVG1Qq1mCeLMy74YsWDAQfr4Y

    const [bountyBoardPDA, bump] = await web3.PublicKey.findProgramAddress(
      [utils.bytes.utf8.encode(PROGRAM_AUTHORITY_SEED), REALM_PK.toBytes()],
      programId
    );
    console.log("bountyBoardPDA", bountyBoardPDA.toString()); // 8B5wLgaVbGbi1WUmMceyusjVSKP24n8wZRwDNGsUHH1a

    const tx = await program.methods
      .initBountyBoard({
        realmPk: REALM_PK,
        config: CONFIG,
      })
      .accounts({
        // list of all affected accounts
        bountyBoard: bountyBoardPDA,
        realmGovernance: realmGovernance.publicKey,
        user: bountyBoardCreatorPublicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([realmGovernance])
      .rpc();

    console.log("Your transaction signature", tx);

    const account = await program.account.bountyBoard.fetch(bountyBoardPDA);
    console.log(account);

    assert.equal(account.realm.toString(), REALM_PK.toString());
    assert.equal(
      account.updateAuthority.toString(),
      realmGovernance.publicKey.toString()
    );
    assert.equal(account.bountyCount.toNumber(), 0);
    // assert.deepEqual(account.config, CONFIG);
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
