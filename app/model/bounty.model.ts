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
  operation,
}

export interface Bounty {
  bountyBoard: PublicKey;
  bountyIndex: BN;

  state: Record<keyof typeof BountyState, {}>;

  creator: PublicKey;
  createdAt: number; // date in epoch seconds

  title: string;
  description: string; // max char 400 first. Implement IPFS if possible
  skill: Record<keyof typeof Skill, {}>;
  tier: string;

  taskSubmissionWindow: number; // how much time the assignee has to submit work
  submissionReviewWindow: number; // how much time the reviewer has to respond to submission
  addressChangeReqWindow: number; // how much time the assignee has to respond to change requested by reviewer

  rewardMint: PublicKey; // address of payout token
  rewardPayout: BN;
  rewardSkillPt: BN;
  rewardReputation: BN;
  minRequiredReputation: number;
  minRequiredSkillsPt: BN;

  assignCount: number;
  unassignCount: number;

  activityIndex: number;

  completedAt: number | null;
}
