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
import { BOUNTY_BOARD_PROGRAM_ID } from "../app/api/constants";
import {
  cleanUpBountyBoard,
  setupBountyBoard,
} from "./setup_fixtures/bounty_board";
import { cleanUpBounty, setupBounty } from "./setup_fixtures/bounty";

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

  // accounts to cleanup
  const TEST_REALM_PK = new PublicKey(
    "9MEf1ogzSCr4YCneQ53WuFcqaiF4f95JxGLrt3rnSjDL"
  );
  let TEST_BOUNTY_BOARD_PK;
  let TEST_BOUNTY_BOARD_VAULT_PK;
  let TEST_BOUNTY_PDA;
  let TEST_BOUNTY_ESCROW_PDA;

  // Test realm public key 9MEf1ogzSCr4YCneQ53WuFcqaiF4f95JxGLrt3rnSjDL
  // Test realm governance public key AcA9bZqnc1CBKCSP1ZzQJ3hj4xCriy7QnWM7TiKPqPt1
  // Bounty board PDA Hdg9bA8UWrfGiSKaCHSMXEJaQpvXA8id1xaHQRahv5n7
  // Bounty board vault PDA 57RDcJsNJGFS1RJSxrcfun9tdLgAC4DHN9yrbmjeTstA
  // Bounty PDA 5xT7816aQ8kpJzVNWDBaMYS8GTmcF3qd4zN1tC3njaXM
  // Bounty Escrow PDA 77ByK52JEothrMCFu4HRiPhobXWHbPH9P2uKKmMqL7uj

  beforeEach(async () => {
    console.log("Test realm public key", TEST_REALM_PK.toString());
    const { bountyBoardPDA, bountyBoardVaultPDA } = await setupBountyBoard(
      provider,
      program,
      TEST_REALM_PK
    );
    TEST_BOUNTY_BOARD_PK = bountyBoardPDA;
    TEST_BOUNTY_BOARD_VAULT_PK = bountyBoardVaultPDA;
  });

  it("should create bounty PDA with correct data", async () => {
    const { bountyAcc, bountyPDA, bountyEscrowAcc, bountyEscrowPDA } =
      await setupBounty(
        provider,
        program,
        TEST_BOUNTY_BOARD_PK,
        TEST_BOUNTY_BOARD_VAULT_PK
      );
    TEST_BOUNTY_PDA = bountyPDA;
    TEST_BOUNTY_ESCROW_PDA = bountyEscrowPDA;

    // test bounty acc create correctly
    assert.equal(
      bountyAcc.bountyBoard.toString(),
      TEST_BOUNTY_BOARD_PK.toString()
    );

    // test bounty escrow acc created and funded
    assert.equal(bountyEscrowAcc.owner.toString(), TEST_BOUNTY_PDA.toString());

    // test bounty board account bounty_count updated
    const bountyBoardAcc = await program.account.bountyBoard.fetch(
      TEST_BOUNTY_BOARD_PK
    );
    console.log("--- Bounty Board Acc ---");
    assert.equal(bountyBoardAcc.bountyCount.toNumber(), 1);
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    await cleanUpBounty(
      provider,
      program,
      TEST_BOUNTY_PDA,
      TEST_BOUNTY_ESCROW_PDA
    );
    await cleanUpBountyBoard(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_BOARD_VAULT_PK
    );
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
