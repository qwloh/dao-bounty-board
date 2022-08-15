import { AnchorProvider, Program } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { DaoBountyBoard } from "../../../../target/types/dao_bounty_board";
import { DUMMY_MINT_PK } from "../../constants";
import { getBountyAddress, getBountyEscrowAddress } from "../pda-utils";
import { readableTokenAcc } from "./common";

export enum Skill {
  Development = "development",
  Design = "design",
  Marketing = "marketing",
  Operations = "operations",
}

export const setupBounty = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyBoardPubkey: PublicKey,
  bountyBoardVaultPubkey: PublicKey
) => {
  const TITLE = "My First Bounty";
  const DESCRIPTION =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet.";
  const BOUNTY_BOARD_PK = bountyBoardPubkey;
  const TIER = "Entry";
  const SKILL = Skill.Development;

  const BOUNTY_BOARD_VAULT_PK = bountyBoardVaultPubkey;
  const BOUNTY_INDEX = 0;
  const REWARD_MINT_PK = new PublicKey(DUMMY_MINT_PK.USDC);
  const [BOUNTY_PDA] = await getBountyAddress(BOUNTY_BOARD_PK, BOUNTY_INDEX);
  console.log("Bounty PDA", BOUNTY_PDA.toString());

  const BOUNTY_ESCROW_PDA = await getBountyEscrowAddress(
    BOUNTY_PDA,
    REWARD_MINT_PK
  );
  console.log("Bounty Escrow PDA", BOUNTY_ESCROW_PDA.toString());

  try {
    const createBountyTx = await program.methods
      //@ts-ignore
      .createBounty({
        title: TITLE,
        description: "", // to be replaced with ipfs impl
        // description: DESCRIPTION,
        bountyBoard: BOUNTY_BOARD_PK,
        tier: TIER,
        skill: { [SKILL]: {} },
      })
      .accounts({
        bountyBoard: BOUNTY_BOARD_PK,
        bountyBoardVault: BOUNTY_BOARD_VAULT_PK,
        bounty: BOUNTY_PDA,
        bountyEscrow: BOUNTY_ESCROW_PDA,
        rewardMint: REWARD_MINT_PK,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .rpc();
    console.log("Your transaction signature", createBountyTx);
  } catch (err) {
    console.log("Transaction / Simulation fail.", err);
  }

  let bountyAcc;
  let bountyEscrowAcc;
  console.log("--- Bounty Acc ---");
  try {
    bountyAcc = await program.account.bounty.fetch(BOUNTY_PDA);
    console.log("Found", JSON.parse(JSON.stringify(bountyAcc)));
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  console.log("--- Bounty Escrow Acc ---");
  try {
    bountyEscrowAcc = await getAccount(
      provider.connection,
      BOUNTY_ESCROW_PDA,
      "recent",
      TOKEN_PROGRAM_ID
    );
    console.log("Found", readableTokenAcc(bountyEscrowAcc));
  } catch (err) {
    console.log(
      "Not found. Error",
      err.name,
      "for",
      BOUNTY_ESCROW_PDA.toString(),
      err
    );
  }

  return {
    bountyPDA: BOUNTY_PDA,
    bountyAcc,
    bountyEscrowPDA: BOUNTY_ESCROW_PDA,
    bountyEscrowAcc,
  };
};

export const assignBounty = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyPubkey: PublicKey,
  bountyApplicationPubkey: PublicKey
) => {
  const TEST_BOUNTY_PK = bountyPubkey;
  const TEST_BOUNTY_APPLICATION_PK = bountyApplicationPubkey;

  try {
    const tx = await program.methods
      .assignBounty()
      .accounts({
        bounty: TEST_BOUNTY_PK,
        bountyApplication: TEST_BOUNTY_APPLICATION_PK,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      // .simulate();
      .rpc();
    console.log("[AssignBounty] Your transaction signature", tx);
  } catch (err) {
    console.log("Transaction / Simulation fail.", err);
  }

  // get updated bounty acc
  let updatedBountyAcc;
  console.log("--- Bounty Acc ---");
  try {
    updatedBountyAcc = await program.account.bounty.fetch(TEST_BOUNTY_PK);
    console.log("Found", JSON.parse(JSON.stringify(updatedBountyAcc)));
  } catch (err) {
    console.log("Not found. Error", err.message);
  }
  // get updated bounty application acc
  let updatedBountyApplicationAcc;
  console.log("--- Bounty Application Acc ---");
  try {
    updatedBountyApplicationAcc = await program.account.bountyApplication.fetch(
      TEST_BOUNTY_APPLICATION_PK
    );
    console.log(
      "Found",
      JSON.parse(JSON.stringify(updatedBountyApplicationAcc))
    );
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  return {
    updatedBountyAcc,
    updatedBountyApplicationAcc,
  };
};

export const cleanUpBounty = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyPDA: PublicKey,
  bountyEscrowPDA: PublicKey
) => {
  // close bounty escrow account first
  try {
    await program.methods
      .closeBountyEscrow()
      .accounts({
        bounty: bountyPDA,
        bountyEscrow: bountyEscrowPDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log(`Bounty board escrow acc ${bountyEscrowPDA.toString()} closed`);
  } catch (err) {
    console.log(
      `Error clearing bounty escrow acc ${bountyEscrowPDA.toString()}`,
      err.message || err.name
    );
    return; // don't clear bounty board account if bounty board vault account is not successfully cleared
  }

  // close bounty account
  try {
    await program.methods
      .closeBounty()
      .accounts({
        bounty: bountyPDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`Bounty acc ${bountyPDA.toString()} closed`);
  } catch (err) {
    console.log(
      `Error clearing bounty acc ${bountyPDA.toString()}`,
      err.message
    );
  }
};
