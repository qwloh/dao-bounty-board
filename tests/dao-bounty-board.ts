import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { DaoBountyBoard } from "../target/types/dao_bounty_board";

describe("dao-bounty-board", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.DaoBountyBoard as Program<DaoBountyBoard>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
