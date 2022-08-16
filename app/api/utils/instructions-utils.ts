import { AnchorProvider, Program } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { DaoBountyBoard } from "../../../target/types/dao_bounty_board";
import {
  BountyBoardConfig,
  BountyTier,
  RoleSetting,
} from "../../model/bounty-board.model";
import {
  getBountyBoardVaultAddress,
  getContributorRecordAddress,
} from "./pda-utils";

export const _getInitBountyBoardInstruction = async (
  program: Program<DaoBountyBoard>,
  realmPubkey: PublicKey,
  realmGovernance: PublicKey,
  bountyBoardPDA: PublicKey,
  firstVaultMint: PublicKey,
  roles: RoleSetting[]
) => {
  const provider = program.provider as AnchorProvider; // anchor provider is stored in program obj after being init

  const bountyBoardVaultPDA = await getBountyBoardVaultAddress(
    bountyBoardPDA,
    firstVaultMint
  );
  console.log(`Bounty board vault PDA ${bountyBoardVaultPDA.toString()}`);

  // generate init bounty board instruction without actually sending it
  // defer sending to after proposal is passed and when it's executed
  const proposerPubkey = provider.wallet.publicKey;
  const ix = await program.methods
    // @ts-ignore
    .initBountyBoard({
      realmPk: realmPubkey,
      roles,
    })
    .accounts({
      // list of all affected accounts
      bountyBoard: bountyBoardPDA,
      realmGovernance,
      bountyBoardVault: bountyBoardVaultPDA,
      firstVaultMint: firstVaultMint,
      user: proposerPubkey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
      clock: SYSVAR_CLOCK_PUBKEY,
    })
    .instruction();

  console.log("Init Bounty Board ix", {
    ...ix,
    keys: ix.keys.map((k) => ({ ...k, pubkey: k.pubkey.toString() })),
  });

  return ix;
};

export const _getAddBountyBoardTierConfigInstruction = async (
  program: Program<DaoBountyBoard>,
  bountyBoardPubkey: PublicKey,
  realmGovernancePubkey: PublicKey,
  tiers: BountyTier[]
) => {
  console.log("Tiers to add", tiers);
  const TEST_BOUNTY_BOARD_PK = bountyBoardPubkey;
  const TEST_REALM_GOVERNANCE_PK = realmGovernancePubkey;

  const ix = await program.methods
    //@ts-ignore
    .addBountyBoardTierConfig({
      tiers,
    })
    .accounts({
      bountyBoard: TEST_BOUNTY_BOARD_PK,
      realmGovernance: TEST_REALM_GOVERNANCE_PK,
    })
    .instruction();

  console.log("Add Bounty Board Tiers Config ix", {
    ...ix,
    keys: ix.keys.map((k) => ({ ...k, pubkey: k.pubkey.toString() })),
  });

  return ix;
};

export const _getFundBountyBoardVaultInstruction = async (
  program: Program<DaoBountyBoard>,
  bountyBoardPubkey: PublicKey,
  realmTreasuryPubkey: PublicKey,
  mintPubkey: PublicKey,
  amount: number
) => {
  const bountyBoardVaultPDA = await getBountyBoardVaultAddress(
    bountyBoardPubkey,
    mintPubkey
  );
  console.log("Bounty board vault address", bountyBoardVaultPDA.toString());

  const ATAPubkey = await getAssociatedTokenAddress(
    mintPubkey,
    realmTreasuryPubkey,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  console.log("Treasury ATA", ATAPubkey.toString());

  const ix = createTransferInstruction(
    ATAPubkey,
    bountyBoardVaultPDA,
    realmTreasuryPubkey,
    amount
  );

  console.log("Fund Bounty Board ix", {
    ...ix,
    keys: ix.keys.map((k) => ({ ...k, pubkey: k.pubkey.toString() })),
  });

  return ix;
};

export interface InitialContributorWithRole {
  contributorWallet: PublicKey;
  roleName: string;
}

export const _getAddContributorWithRoleInstruction = async (
  program: Program<DaoBountyBoard>,
  bountyBoardPubkey: PublicKey,
  realmGovernancePubkey: PublicKey, // authority of bounty board
  initialContributor: InitialContributorWithRole,
  proposalExecutorPubkey: PublicKey
) => {
  const [contributorRecordPDA] = await getContributorRecordAddress(
    bountyBoardPubkey,
    initialContributor.contributorWallet
  );
  console.log("Contributor record PDA", contributorRecordPDA.toString());

  const ix = await program.methods
    .addContributorWithRole(initialContributor)
    .accounts({
      bountyBoard: bountyBoardPubkey,
      contributorRecord: contributorRecordPDA,
      realmGovernance: realmGovernancePubkey,
      proposalExecutor: proposalExecutorPubkey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  console.log("Add Contributor with Role ix", {
    ...ix,
    keys: ix.keys.map((k) => ({ ...k, pubkey: k.pubkey.toString() })),
  });
  return ix;
};

export const _getUpdateBountyBoardInstruction = async (
  program: Program<DaoBountyBoard>,
  realmGovernance: PublicKey,
  bountyBoardPubkey: PublicKey,
  boardConfig: BountyBoardConfig
) => {
  // try {
  const ix = await program.methods
    // @ts-ignore
    .updateBountyBoard({
      config: boardConfig,
    })
    .accounts({
      bountyBoard: bountyBoardPubkey,
      realmGovernance,
    })
    .instruction();
  //     .simulate();
  //   console.log("[UpdateBountyBoard] Simulate result", ix);
  // } catch (err) {
  //   console.log("[UpdateBountyBoard] Transaction/Simulation fail", err);
  // }

  console.log("Update Bounty Board ix", {
    ...ix,
    keys: ix.keys.map((k) => ({ ...k, pubkey: k.pubkey.toString() })),
  });
  return ix;
};
