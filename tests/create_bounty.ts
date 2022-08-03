import {
  Program,
  web3,
  BN,
  setProvider,
  AnchorProvider,
  workspace,
  utils,
} from "@project-serum/anchor";
import { DaoBountyBoard } from "../target/types/dao_bounty_board";
import { assert } from "chai";

describe("create bounty", () => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  setProvider(provider);
  const providerWalletPublicKey = provider.wallet.publicKey;
  const program = workspace.DaoBountyBoard as Program<DaoBountyBoard>;
  const programId = new web3.PublicKey(
    "H72kd3NLBGpsc1DcPk5bnjJtu7BXzwNSDFa2BeVQaTEL"
  );

  it("should create bounty PDA with correct data", async () => {
    //  const mockAccount = web3.Keypair.generate();
    const bountyCreatorPublicKey = providerWalletPublicKey;

    // data
    const BOUNTY_BOARD_ID = programId; // hard code first
    const TITLE = "Test bounty";
    const CONTRIBUTOR_RECORD = bountyCreatorPublicKey;

    const [bountyPDA, bump] = await web3.PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode("test9"),
        // senderPublicKey.toBuffer(),
      ],
      programId
    );

    const tx = await program.methods
      .createBounty({
        bountyBoard: BOUNTY_BOARD_ID,
        title: "Test bounty",
        contributorRecord: bountyCreatorPublicKey,
      })
      .accounts({
        // list of all affected accounts
        bounty: bountyPDA,
        user: bountyCreatorPublicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    const account = await program.account.bounty.fetch(bountyPDA);
    console.log(account, new Date(account.createdAt.toNumber() * 1000));

    assert.equal(account.bountyBoard.toString(), BOUNTY_BOARD_ID.toString());
    assert.equal(account.title, TITLE);
    assert.property(account.state, "open");
    assert.equal(
      account.contributorRecord.toString(),
      CONTRIBUTOR_RECORD.toString()
    );
    assert.closeTo(
      account.createdAt.toNumber(),
      new Date().getTime() / 1000,
      3000 // 3s tolerance?
    );

    // const accountInfo = await program.account.bounty.getAccountInfo(bountyPDA);
    // console.log(accountInfo);
  });
});
