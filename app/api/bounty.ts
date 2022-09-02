import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { DUMMY_MINT_PK } from "./constants";
import { Bounty, Skill } from "../model/bounty.model";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import {
  getBountyActivityAddress,
  getBountyAddress,
  getBountyBoardVaultAddress,
  getBountyEscrowAddress,
  getBountySubmissionAddress,
  getContributorRecordAddress,
} from "./utils";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BountyBoard } from "../model/bounty-board.model";

export const getBounty = (
  program: Program<DaoBountyBoard>,
  bountyPK: PublicKey
) => program.account.bounty.fetchNullable(bountyPK);

export const getBounties = async (
  connection: Connection,
  program: Program<DaoBountyBoard>,
  bountyBoardPK: PublicKey
) => {
  // filter by bounty baord PK
  const bounties = await connection.getProgramAccounts(program.programId, {
    dataSlice: { offset: 0, length: 0 },
    filters: [
      { memcmp: program.coder.accounts.memcmp("bounty") },
      { memcmp: { offset: 8, bytes: bountyBoardPK.toString() } },
    ],
  });
  return bounties.map((b) => b.pubkey);
};

interface CreateBountyArgs {
  program: Program<DaoBountyBoard>;
  bountyBoard: { pubkey: PublicKey; account: BountyBoard };
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
  const bountyIndex = bountyBoard.account.bountyIndex;
  console.log("Bounty index", bountyIndex.toNumber());

  const bountyBoardVault = await getBountyBoardVaultAddress(
    bountyBoard.pubkey,
    rewardMint
  );
  console.log("Bounty board vault PDA", bountyBoardVault.toString());
  const [bountyPDA] = await getBountyAddress(
    bountyBoard.pubkey,
    bountyIndex.toNumber()
  );
  console.log("Bounty PDA", bountyPDA.toString());

  const bountyEscrowPDA = await getBountyEscrowAddress(bountyPDA, rewardMint);
  console.log("Bounty Escrow PDA", bountyEscrowPDA.toString());

  const [contributorRecordPDA] = await getContributorRecordAddress(
    bountyBoard.pubkey,
    provider.wallet.publicKey
  );
  console.log("Contributor Record PDA", contributorRecordPDA.toString());

  return (
    program.methods
      //@ts-ignore
      .createBounty({
        title,
        description, // to be replaced with ipfs impl
        bountyBoard: bountyBoard.pubkey,
        tier,
        skill: { [skill as string]: {} },
      })
      .accounts({
        bountyBoard: bountyBoard.pubkey,
        bountyBoardVault,
        bounty: bountyPDA,
        bountyEscrow: bountyEscrowPDA,
        rewardMint,
        contributorRecord: contributorRecordPDA,
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

interface DeleteBountyArgs {
  program: Program<DaoBountyBoard>;
  bounty: { pubkey: PublicKey; account: Bounty };
}

export const deleteBounty = async ({ program, bounty }: DeleteBountyArgs) => {
  const provider = program.provider as AnchorProvider;
  const bountyBoardPubkey = bounty.account.bountyBoard;

  // const rewardMint = bounty.account.rewardMint;
  console.log("Bounty board PDA", bountyBoardPubkey.toString());
  const rewardMint = new PublicKey(DUMMY_MINT_PK.USDC);

  const bountyBoardVaultPDA = await getBountyBoardVaultAddress(
    bountyBoardPubkey,
    rewardMint
  );
  console.log("Bounty board vault PDA", bountyBoardVaultPDA.toString());

  const bountyEscrowPDA = await getBountyEscrowAddress(
    bounty.pubkey,
    rewardMint
  );
  console.log("Bounty escrow PDA", bountyEscrowPDA.toString());

  const [contributorRecordPDA] = await getContributorRecordAddress(
    bountyBoardPubkey,
    provider.wallet.publicKey
  );
  console.log("Contributor Record PDA", contributorRecordPDA.toString());

  return program.methods
    .deleteBounty()
    .accounts({
      bounty: bounty.pubkey,
      bountyBoardVault: bountyBoardVaultPDA,
      bountyEscrow: bountyEscrowPDA,
      contributorRecord: contributorRecordPDA,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
};

interface AssignBountyArgs {
  provider: AnchorProvider;
  program: Program<DaoBountyBoard>;
  bounty: { pubkey: PublicKey; account: Bounty };
  bountyApplicationPK: PublicKey;
}

export const assignBounty = async ({
  provider,
  program,
  bounty,
  bountyApplicationPK,
}: AssignBountyArgs) => {
  const { pubkey: bountyPK, account: bountyAcc } = bounty;

  console.log("Current assign count", bountyAcc.assignCount);
  const [bountySubmissionPDA] = await getBountySubmissionAddress(
    bountyPK,
    bountyAcc.assignCount
  );
  console.log("Bounty submission PDA", bountySubmissionPDA.toString());

  console.log("Current activity index", bountyAcc.activityIndex);
  const [bountyActivityPDA] = await getBountyActivityAddress(
    bountyPK,
    bountyAcc.activityIndex
  );
  console.log("Bounty activity (Assign) PDA", bountyActivityPDA.toString());

  return program.methods
    .assignBounty()
    .accounts({
      bounty: bountyPK,
      bountyApplication: bountyApplicationPK,
      bountySubmission: bountySubmissionPDA,
      bountyActivity: bountyActivityPDA,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      clock: SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
};

interface UnassignOverdueBountyArgs {
  program: Program<DaoBountyBoard>;
}

export const unassignOverdueBounty = async ({
  program,
}: UnassignOverdueBountyArgs) => {};

interface SubmitToBountyArgs {
  program: Program<DaoBountyBoard>;
}

export const submitToBounty = async ({ program }: SubmitToBountyArgs) => {};
