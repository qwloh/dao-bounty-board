import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export type BountyState =
  | "open"
  | "assigned"
  | "submissionUnderReview"
  | "completeAndPaid";

export type Skill = "development" | "design" | "marketing" | "operation";

export interface Bounty {
  bountyBoard: PublicKey;
  bountyIndex: BN;

  state: Record<BountyState, {}>;
  creator: PublicKey;
  createdAt: number; // date in epoch seconds

  rewardPayout: BN;
  rewardMint: PublicKey; // address of payout token
  skill: Record<Skill, {}>;
  rewardSkillPt: BN;
  rewardReputation: BN;
  tier: string;

  title: string;
  description: string; // max char 400 first. Implement IPFS if possible
  assignee: PublicKey | null;
  assignedAt: number | null; // date in epoch seconds
  completedAt: number | null;
}
