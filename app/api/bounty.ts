import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";

import {
  AnchorProvider,
  BN,
  Program,
  ProgramAccount,
  setProvider,
  Wallet,
} from "@project-serum/anchor";
import { BOUNTY_BOARD_PROGRAM_ID, TEST_REALM_PK } from "./constants";
import { Skill } from "../model/bounty.model";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {
  getBountyAddress,
  getBountyBoardVaultAddress,
  getBountyEscrowAddress,
} from "./utils";
import { program } from "@project-serum/anchor/dist/cjs/spl/token";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BountyBoard } from "../model/bounty-board.model";

// export const getBounty = (
//   program: Program<DaoBountyBoard>,
//   bountyPDA: PublicKey
// ) => program.account.bounty.fetch(bountyPDA);

export const getBountiesForBoard = (
  program: Program<DaoBountyBoard>,
  bountyBoardPDA: PublicKey
) => {
  // add filter by DAO (bountyboardPDA)
  // discriminator takes up 8 bytes
  // anchor handle the filter by discriminator for us
  return program.account.bounty.all([
    { memcmp: { offset: 8, bytes: bountyBoardPDA.toString() } },
  ]);
};

export interface CreateBountyArgs {
  program: Program<DaoBountyBoard>;
  bountyBoard: { publicKey: PublicKey; account: BountyBoard };
  skill: Skill;
  tier: string;
  title: string;
  description: string; // max char 400 first. Implement IPFS if possible
}

export const createBounty = async ({
  program,
  bountyBoard,
  skill,
  tier,
  title,
  description,
}: CreateBountyArgs) => {
  const provider = program.provider as AnchorProvider;

  const rewardConfigForTier = bountyBoard.account.config.tiers.find(
    (t) => t.tierName === tier
  );
  if (!rewardConfigForTier) {
    throw Error("Tier does not exist in bounty board config");
  }
  const rewardMint = rewardConfigForTier.payoutMint;
  const bountyIndex = bountyBoard.account.bountyCount;
  console.log("Bounty index", bountyIndex.toNumber());

  const bountyBoardVault = await getBountyBoardVaultAddress(
    bountyBoard.publicKey,
    rewardMint
  );
  console.log("Bounty board vault PDA", bountyBoardVault.toString());
  const [bountyPDA] = await getBountyAddress(
    bountyBoard.publicKey,
    bountyIndex.toNumber()
  );
  console.log("Bounty PDA", bountyPDA.toString());

  const bountyEscrowPDA = await getBountyEscrowAddress(bountyPDA, rewardMint);
  console.log("Bounty Escrow PDA", bountyEscrowPDA.toString());

  return (
    program.methods
      //@ts-ignore
      .createBounty({
        title,
        description, // to be replaced with ipfs impl
        bountyBoard: bountyBoard.publicKey,
        tier,
        skill: { [skill as string]: {} },
      })
      .accounts({
        bountyBoard: bountyBoard.publicKey,
        bountyBoardVault,
        bounty: bountyPDA,
        bountyEscrow: bountyEscrowPDA,
        rewardMint,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .rpc()
  );
};

// Test realm public key 885LdWunq8rh7oUM6kMjeGV56T6wYNMgb9o6P7BiT5yX
// Test realm governance public key 25N47DNLjSt7LZS2HrvHVG1Qq1mCeLMy74YsWDAQfr4Y
// Bounty board PDA 3q3na9snfaaVi5e4qNNFRzQiXyRF6RiFQ15aSPBWxtKf
// Bounty board vault PDA HpM2sETmKVfnbZ4Hz8vdQpXnCrVdwEeQHgfGUyQUy9Kp
// Bounty PDA 3gG77UevaCzSXC1uEe7DPRvpCEFmhxr3RREmoPFhjoLQ
// Bounty Escrow PDA BW9AGwi59q7HWJAga4ErFtpD2WFtNNBpDmmhUhL2h1j5

// (async () => {
//   // test script
//   const paperWalletKeypair = Keypair.fromSecretKey(
//     bs58.decode(process.env.SK as string)
//   );
//   const connection = new Connection(clusterApiUrl("devnet"), "recent");
//   const provider = new AnchorProvider(
//     connection,
//     new Wallet(paperWalletKeypair),
//     { commitment: "recent" }
//   );
//   setProvider(provider);

//   const programId = new PublicKey(BOUNTY_BOARD_PROGRAM_ID);
//   const program = new Program(
//     JSON.parse(JSON.stringify(idl)),
//     programId
//   ) as Program<DaoBountyBoard>;

//   const REALM_PK = new PublicKey(TEST_REALM_PK);
//   console.log("Test realm public key", REALM_PK.toString());

//   const { bountyBoardPDA, bountyBoardVaultPDA } = await setupBountyBoard(
//     provider,
//     program,
//     REALM_PK
//   );

//   // pre-populate with bounties
//   const { bountyPDA, bountyEscrowPDA } = await setupBounty(
//     provider,
//     program,
//     bountyBoardPDA,
//     bountyBoardVaultPDA
//   );

//   // testing the method
//   const bounties = await getBountiesForBoard(program, bountyBoardPDA);
//   console.log("Bounties", bounties);

//   console.log("--- Clenup logs ---");
//   await cleanUpBounty(provider, program, bountyPDA, bountyEscrowPDA);
//   await cleanUpBountyBoard(
//     provider,
//     program,
//     bountyBoardPDA,
//     bountyBoardVaultPDA
//   );
// })();
