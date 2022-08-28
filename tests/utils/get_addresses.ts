import { BN, utils } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import {
  PROGRAM_AUTHORITY_SEED,
  BOUNTY_BOARD_PROGRAM_ID,
} from "../../app/api/constants";

// get Addresses
export const getBountyBoardAddress = (realmPubkey: PublicKey) =>
  PublicKey.findProgramAddress(
    [utils.bytes.utf8.encode(PROGRAM_AUTHORITY_SEED), realmPubkey.toBytes()],
    new PublicKey(BOUNTY_BOARD_PROGRAM_ID)
  );

export const getBountyBoardVaultAddress = (
  bountyBoardPubkey: PublicKey,
  mintPubkey: PublicKey
) =>
  getAssociatedTokenAddress(
    mintPubkey,
    bountyBoardPubkey,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

export const getBountyAddress = (
  bountyBoardPubkey: PublicKey,
  bountyIndex: number
) =>
  PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(PROGRAM_AUTHORITY_SEED),
      bountyBoardPubkey.toBytes(),
      utils.bytes.utf8.encode("bounty"),
      new BN(bountyIndex).toBuffer("le", 8),
    ],
    new PublicKey(BOUNTY_BOARD_PROGRAM_ID)
  );

export const getBountyEscrowAddress = (
  bountyPubkey: PublicKey,
  mintPubkey: PublicKey
) =>
  getAssociatedTokenAddress(
    mintPubkey,
    bountyPubkey,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

export const getBountyApplicationAddress = (
  bountyPubkey: PublicKey,
  contributorRecordPubkey: PublicKey // system account
) =>
  PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(PROGRAM_AUTHORITY_SEED),
      bountyPubkey.toBytes(),
      utils.bytes.utf8.encode("bounty_application"),
      contributorRecordPubkey.toBytes(),
    ],
    new PublicKey(BOUNTY_BOARD_PROGRAM_ID)
  );

export const getContributorRecordAddress = (
  bountyBoardPubkey: PublicKey,
  userWalletPubkey: PublicKey
) =>
  PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(PROGRAM_AUTHORITY_SEED),
      bountyBoardPubkey.toBytes(),
      utils.bytes.utf8.encode("contributor_record"),
      userWalletPubkey.toBytes(),
    ],
    new PublicKey(BOUNTY_BOARD_PROGRAM_ID)
  );

export const getPayoutRecordAddress = (bountyPubkey: PublicKey) =>
  PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(PROGRAM_AUTHORITY_SEED),
      bountyPubkey.toBytes(),
      utils.bytes.utf8.encode("payout_record"),
    ],
    new PublicKey(BOUNTY_BOARD_PROGRAM_ID)
  );

export const getBountySubmissionAddress = (
  bountyPubkey: PublicKey,
  bountyAssignCount: number
) =>
  PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(PROGRAM_AUTHORITY_SEED),
      bountyPubkey.toBytes(),
      utils.bytes.utf8.encode("bounty_submission"),
      new BN(bountyAssignCount).toBuffer("le", 1),
    ],
    new PublicKey(BOUNTY_BOARD_PROGRAM_ID)
  );

export const getBountyActivityAddress = (
  bountyPubkey: PublicKey,
  activityIndex: number
) =>
  PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(PROGRAM_AUTHORITY_SEED),
      bountyPubkey.toBytes(),
      utils.bytes.utf8.encode("bounty_activity"),
      new BN(activityIndex).toBuffer("le", 2),
    ],
    new PublicKey(BOUNTY_BOARD_PROGRAM_ID)
  );

export const getBountyBookmarkAddress = (
  bountyPubkey: PublicKey,
  userWalletPubkey: PublicKey
) =>
  PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(PROGRAM_AUTHORITY_SEED),
      userWalletPubkey.toBytes(),
      utils.bytes.utf8.encode("bounty_bookmark"),
      bountyPubkey.toBytes(),
    ],
    new PublicKey(BOUNTY_BOARD_PROGRAM_ID)
  );
