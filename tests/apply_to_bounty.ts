import { AnchorProvider, Program, setProvider } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { assert } from "chai";
import { BOUNTY_BOARD_PROGRAM_ID } from "../app/api/constants";
import idl from "../target/idl/dao_bounty_board.json";
import { DaoBountyBoard } from "../target/types/dao_bounty_board";
import { cleanUpBounty, setupBounty } from "./setup_fixtures/bounty";
import {
  cleanUpBountyApplication,
  setupBountyApplication,
} from "./setup_fixtures/bounty_application";
import {
  cleanUpBountyBoard,
  setupBountyBoard,
} from "./setup_fixtures/bounty_board";

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
  let TEST_REALM_GOVERNANCE_PK = Keypair.fromSeed(
    TEST_REALM_PK.toBytes()
  ).publicKey;
  let TEST_BOUNTY_BOARD_PK;
  let TEST_BOUNTY_BOARD_VAULT_PK;
  let TEST_BOUNTY_PK;
  let TEST_BOUNTY_ESCROW_PK;
  let TEST_CONTRIBUTOR_RECORD_PDA;
  let TEST_BOUNTY_APPLICATION_PDA;

  // Test realm governance public key Ex1qQwFhSGd9zWDDUcPMdm85Yhbf4B7sHUae72cD7j3T
  // Bounty board PDA 8PcA5yYD8arfLqUoS64EGj7oThwdryPimSz25s8r675D
  // Bounty board vault PDA GXpz7h8JjzdSVkca86oaN7XFGM5Vcaw2VNdUoT4bUtgu
  // Bounty PDA H6SsysGz2RXnmEKZDky1tCvDaBsyzHrxLfYcR7rPuT82
  // Bounty Escrow PDA E7gsQTiueywup8Xg2UfJFhA5wd6c3ugMFHBNMmShHB32
  // Test applicant public key CxhnAJoZYEhgQzyCfpfEmmuCaLHzBVr2bQSNmQDWDhrj
  // Contributor record PDA 5doaKH4W5uTKyPY3t37nEsudw9LPqL9MqtUp7YoGGESi
  // Bounty application PDA HEhaghgWADC9attz5JFFcdNou5SACSNwZ7E4kBp9SrVk

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
  });

  it("create bounty application acc correctly", async () => {
    const TEST_APPLICANT_PK = provider.wallet.publicKey;
    console.log("Test applicant public key", TEST_APPLICANT_PK.toString());

    const {
      bountyApplicationPDA,
      bountyApplicationAcc,
      contributorRecordPDA,
      contributorRecordAcc,
    } = await setupBountyApplication(
      provider,
      program,
      TEST_BOUNTY_BOARD_PK,
      TEST_BOUNTY_PK,
      TEST_APPLICANT_PK
    );
    TEST_BOUNTY_APPLICATION_PDA = bountyApplicationPDA;
    TEST_CONTRIBUTOR_RECORD_PDA = contributorRecordPDA;

    // assert bounty application is okay
    assert.equal(
      bountyApplicationAcc.bounty.toString(),
      TEST_BOUNTY_PK.toString()
    );
    assert.equal(
      bountyApplicationAcc.applicant.toString(),
      TEST_APPLICANT_PK.toString()
    );
    assert.equal(
      bountyApplicationAcc.contributorRecord.toString(),
      TEST_CONTRIBUTOR_RECORD_PDA.toString()
    );
    assert.equal(
      bountyApplicationAcc.validity.toNumber(),
      new BN(7 * 24 * 3600).toNumber()
    );
    // applied_at
    // status

    // assert contributorRecordAcc is created
    assert.equal(
      contributorRecordAcc.realm.toString(),
      TEST_REALM_PK.toString()
    );
    assert.equal(
      contributorRecordAcc.associatedWallet.toString(),
      TEST_APPLICANT_PK.toString()
    );
  });

  afterEach(async () => {
    console.log("--- Cleanup logs ---");
    // clean up bounty application created
    await cleanUpBountyApplication(
      provider,
      program,
      TEST_BOUNTY_APPLICATION_PDA,
      TEST_CONTRIBUTOR_RECORD_PDA
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
