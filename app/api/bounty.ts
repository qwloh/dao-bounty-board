import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { AnchorProvider, Program, BN } from "@project-serum/anchor";
import { DUMMY_MINT_PK } from "./constants";
import { Bounty, BountyState, Skill } from "../model/bounty.model";
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
import { bytesToStr } from "../utils/encoding";

export const getBounty = async (
  program: Program<DaoBountyBoard>,
  bountyPK: PublicKey
) => {
  const bounty = await program.account.bounty.fetchNullable(bountyPK);
  return bounty
    ? {
        ...bounty,
        tier: bytesToStr(bounty.tier),
        // convert rust enums into more convenient form
        // original: state: {open: {}}
        // after conversion: state: 'open'
        state: BountyState[BountyState[Object.keys(bounty.state)[0]]],
        skill: Skill[Skill[Object.keys(bounty.skill)[0]]],
      }
    : null;
};

export const getBounties = async (
  connection: Connection,
  program: Program<DaoBountyBoard>,
  bountyBoardPK: PublicKey
) => {
  // filter by bounty board PK
  const bounties = await connection.getProgramAccounts(program.programId, {
    dataSlice: { offset: 8 + 32, length: 34 },
    filters: [
      { memcmp: program.coder.accounts.memcmp("bounty") },
      { memcmp: { offset: 8, bytes: bountyBoardPK.toString() } },
    ],
  });
  // Example data buffer: [0,0,0,0,0,0,0,0, 0, 69,110,116,114,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0]
  return bounties.map((b) => {
    const dataBuffer = b.account.data;
    return {
      pubkey: b.pubkey.toString(),
      account: {
        bountyIndex: new BN(dataBuffer.subarray(0, 8), "le"),
        state: BountyState[dataBuffer[8]],
        tier: bytesToStr(dataBuffer.subarray(9, 9 + 24)),
        skill: Skill[dataBuffer[33]],
      },
    };
  });
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
        skill: { [Skill[skill]]: {} },
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
  contributorRecordPK: PublicKey;
}

export const assignBounty = async ({
  provider,
  program,
  bounty,
  bountyApplicationPK,
  contributorRecordPK,
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
      contributorRecord: contributorRecordPK,
      contributorWallet: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      clock: SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
};

interface UnassignOverdueBountyArgs {
  provider: AnchorProvider;
  program: Program<DaoBountyBoard>;
  bounty: { pubkey: PublicKey; account: Bounty };
  bountySubmissionPK: PublicKey;
  assigneeContributorRecordPK: PublicKey;
  reviewerContributorRecordPK: PublicKey;
}

export const unassignOverdueBounty = async ({
  provider,
  program,
  bounty,
  bountySubmissionPK,
  assigneeContributorRecordPK,
  reviewerContributorRecordPK,
}: UnassignOverdueBountyArgs) => {
  console.log("Bounty Submission PK", bountySubmissionPK.toString());
  const { pubkey: bountyPK, account: bountyAcc } = bounty;

  console.log("Current activity index", bountyAcc.activityIndex);
  const [bountyActivityPDA] = await getBountyActivityAddress(
    bountyPK,
    bountyAcc.activityIndex
  );
  console.log(
    "Bounty activity (Unassign Overdue) PDA",
    bountyActivityPDA.toString()
  );

  return (
    program.methods
      //@ts-ignore
      .unassignOverdueBounty()
      .accounts({
        bounty: bountyPK,
        bountySubmission: bountySubmissionPK,
        bountyActivity: bountyActivityPDA,
        assigneeContributorRecord: assigneeContributorRecordPK,
        contributorRecord: reviewerContributorRecordPK,
        contributorWallet: provider.wallet.publicKey,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .rpc()
  );
};

interface SubmitToBountyArgs {
  provider: AnchorProvider;
  program: Program<DaoBountyBoard>;
  bounty: { pubkey: PublicKey; account: Bounty };
  bountySubmissionPK: PublicKey;
  assigneeContributorRecordPK: PublicKey;
  linkToSubmission: string;
}

export const submitToBounty = async ({
  provider,
  program,
  bounty,
  bountySubmissionPK,
  assigneeContributorRecordPK,
  linkToSubmission,
}: SubmitToBountyArgs) => {
  console.log("Bounty Submission PK", bountySubmissionPK.toString());
  const { pubkey: bountyPK, account: bountyAcc } = bounty;

  console.log("Current activity index", bountyAcc.activityIndex);
  const [bountyActivityPDA] = await getBountyActivityAddress(
    bountyPK,
    bountyAcc.activityIndex
  );
  console.log("Bounty activity (Submit) PDA", bountyActivityPDA.toString());

  return program.methods
    .submitToBounty({
      linkToSubmission,
    })
    .accounts({
      bounty: bountyPK,
      bountySubmission: bountySubmissionPK,
      bountyActivity: bountyActivityPDA,
      contributorRecord: assigneeContributorRecordPK,
      contributorWallet: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      clock: SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
};
