import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";

export interface BountyBoardConfig {
  tiers: BountyTier[];
  roles: BN;
  functions: BN;
  lastRevised: BN; // date in epoch seconds
}

export interface BountyTier {
  tierName: string;
  difficultyLevel: string;

  minRequiredReputation: number;
  minRequiredSkillsPt: number;

  reputationReward: number;
  skillsPtReward: number;
  payoutReward: number;
  payoutMint: PublicKey;
}
