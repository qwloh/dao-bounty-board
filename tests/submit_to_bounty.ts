import { AnchorProvider, Program, setProvider } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { BOUNTY_BOARD_PROGRAM_ID } from "../app/api/constants";
import idl from "../target/idl/dao_bounty_board.json";
import { DaoBountyBoard } from "../target/types/dao_bounty_board";
import {
  cleanUpBountySubmission,
  setupBountySubmission,
} from "./setup_fixtures/bounty_submission";

describe("submit to bounty", () => {
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

  let ACC_CREATED;

  it("create bounty submission acc correctly", async () => {
    const TEST_BOUNTY_BOARD_PK = new PublicKey(
      "9S7uqktweEZrvdnppa5f8rUvv8skbmoBWDBwPBzMqptS"
    );
    console.log(
      "Test bounty board public key",
      TEST_BOUNTY_BOARD_PK.toString()
    );
    const TEST_BOUNTY_PK = Keypair.fromSeed(
      TEST_BOUNTY_BOARD_PK.toBytes()
    ).publicKey;
    console.log("Test bounty public key", TEST_BOUNTY_PK.toString());

    // Test bounty board public key 9S7uqktweEZrvdnppa5f8rUvv8skbmoBWDBwPBzMqptS
    // Test bounty public key 2LkNiKFNKF6cD7AGzC5ZKNLLopXKmyDPbSpTac5bNBWt
    // Test contributor record public key jauoJpFXGe3XnSteB4sdPQZ2oLacs7VmWTJQi2fnULm
    // Bounty submission PDA CYW5HnYgymAp112KyM2CdqEkPqRQmjVSpSUo77kNBbbG

    const {
      bountySubmissionPDA,
      bountySubmissionAcc,
      contributorRecordPubkey: TEST_CONTRIBUTOR_RECORD_PK,
    } = await setupBountySubmission(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_PK,
      provider.wallet.publicKey
    );
    ACC_CREATED = bountySubmissionPDA;

    assert.equal(
      bountySubmissionAcc.bounty.toString(),
      TEST_BOUNTY_PK.toString()
    );

    // assert.equal(bountySubmissionAcc.linkToSubmission, LINK_TO_SUBMISSION);
    assert.equal(
      bountySubmissionAcc.contributorRecord.toString(),
      TEST_CONTRIBUTOR_RECORD_PK.toString()
    );
    assert.deepEqual(bountySubmissionAcc.state, { pendingReview: {} });
    assert.equal(bountySubmissionAcc.requestChangeCount, 0);
    // first_submitted_at
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    // clean up acc created
    await cleanUpBountySubmission(provider, program, ACC_CREATED);
  });
});
