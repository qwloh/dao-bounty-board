import { Account } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export enum BountyState {
  open,
  assigned,
  submissionUnderReview,
  completeAndPaid,
}

export enum Skill {
  development,
  design,
  marketing,
  operations,
}

export interface BountyOnChain {
  bountyBoard: PublicKey;
  bountyIndex: BN;

  state: Record<keyof typeof BountyState, {}>;

  tier: Iterable<number>;
  skill: Record<keyof typeof Skill, {}>;
  title: string;
  description: string; // max char 400 first. Implement IPFS if possible

  creator: PublicKey;
  createdAt: number; // date in epoch seconds

  taskSubmissionWindow: number; // how much time the assignee has to submit work
  submissionReviewWindow: number; // how much time the reviewer has to respond to submission
  addressChangeReqWindow: number; // how much time the assignee has to respond to change requested by reviewer

  rewardMint: PublicKey; // address of payout token
  rewardPayout: BN;
  rewardSkillPt: BN;
  rewardReputation: number;
  minRequiredReputation: number;
  minRequiredSkillsPt: BN;

  assignCount: number;
  unassignCount: number;

  activityIndex: number;

  completedAt: number | null;
}

export interface Bounty {
  bountyBoard: PublicKey;
  bountyIndex: bigint;

  state: keyof typeof BountyState;

  creator: PublicKey;
  createdAt: number; // date in epoch seconds

  title: string;
  description: string; // max char 400 first. Implement IPFS if possible
  skill: keyof typeof Skill;
  tier: string;

  taskSubmissionWindow: number; // how much time the assignee has to submit work
  submissionReviewWindow: number; // how much time the reviewer has to respond to submission
  addressChangeReqWindow: number; // how much time the assignee has to respond to change requested by reviewer

  rewardMint: PublicKey; // address of payout token
  rewardPayout: bigint;
  rewardSkillPt: bigint;
  rewardReputation: number;
  minRequiredReputation: number;
  minRequiredSkillsPt: bigint;

  assignCount: number;
  unassignCount: number;

  activityIndex: number;

  completedAt: number | null;

  escrow: Account;
}

// light weight version to store as list
export interface BountyItem {
  bountyIndex: bigint;
  state: keyof typeof BountyState;
  skill: keyof typeof Skill;
  tier: string;
}
