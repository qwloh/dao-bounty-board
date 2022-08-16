import { AnchorProvider, Program, setProvider } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
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
  setupBountyBoard,
} from "./setup_fixtures/bounty_board";

describe.skip("assign bounty", () => {
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

  let TEST_REALM_PK = Keypair.generate().publicKey;
  let TEST_REALM_GOVERNANCE_PK = Keypair.fromSeed(
    TEST_REALM_PK.toBytes()
  ).publicKey;
  let TEST_BOUNTY_BOARD_PK;
  let TEST_BOUNTY_BOARD_VAULT_PK;
  let TEST_BOUNTY_PK;
  let TEST_BOUNTY_ESCROW_PK;
  let TEST_APPLICANT_PK = provider.wallet.publicKey;
  let TEST_CONTRIBUTOR_RECORD_PK;
  let TEST_BOUNTY_APPLICATION_PK;

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

    // set up bounty
    const { bountyPDA, bountyEscrowPDA } = await setupBounty(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_BOARD_VAULT_PK
    );
    TEST_BOUNTY_PK = bountyPDA;
    TEST_BOUNTY_ESCROW_PK = bountyEscrowPDA;

    console.log("Test applicant public key", TEST_APPLICANT_PK.toString());
    const { contributorRecordPDA, bountyApplicationPDA } =
      await setupBountyApplication(
        provider,
        program,
        TEST_BOUNTY_BOARD_PK,
        TEST_BOUNTY_PK,
        TEST_APPLICANT_PK
      );
    TEST_CONTRIBUTOR_RECORD_PK = contributorRecordPDA;
    TEST_BOUNTY_APPLICATION_PK = bountyApplicationPDA;
  });

  it("assign bounty to a bounty application and update both account correctly", async () => {
    const { updatedBountyAcc, updatedBountyApplicationAcc } =
      await assignBounty(
        provider,
        program,
        TEST_BOUNTY_PK,
        TEST_BOUNTY_APPLICATION_PK
      );

    assert.deepEqual(updatedBountyAcc.state, { assigned: {} });
    assert.equal(
      updatedBountyAcc.assignee.toString(),
      TEST_CONTRIBUTOR_RECORD_PK.toString()
    );
    assert.closeTo(
      updatedBountyAcc.assignedAt.toNumber(),
      new Date().getTime() / 1000,
      5000
    );

    assert.deepEqual(updatedBountyApplicationAcc.status, { assigned: {} });
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    // clean up bounty application created
    await cleanUpBountyApplication(
      provider,
      program,
      TEST_BOUNTY_APPLICATION_PK,
      TEST_CONTRIBUTOR_RECORD_PK
    );
    // clean up bounty-related accounts
    await cleanUpBounty(
      provider,
      program,
      TEST_BOUNTY_PK,
      TEST_BOUNTY_ESCROW_PK
    );
    // clean up bounty board-related accounts
    await cleanUpBountyBoard(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_BOARD_VAULT_PK
    );
  });
});
