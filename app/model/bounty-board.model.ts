import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";

export interface BountyBoard {
  realm: PublicKey;
  authority: PublicKey; // to be the council/community mint governance
  config: BountyBoardConfig;
  bountyIndex: BN;
}

export interface BountyBoardConfig {
  tiers: BountyTier[];
  roles: RoleSetting[];
  lastRevised: BN; // date in epoch seconds
}

export enum Permission {
  createBounty,
  updateBounty,
  deleteBounty,
  assignBounty,
  requestChangeToSubmission,
  acceptSubmission,
  rejectSubmission,
}

// to allow looping of permission in useProposeInitBountyBoard
export namespace Permission {
  const _names: string[] = Object.values(Permission).filter(
    (v): v is string => typeof v === "string"
  );

  export function names(): string[] {
    return _names;
  }
}

export interface RoleSetting {
  roleName: string;
  default: boolean;
  permissions: Partial<Record<keyof typeof Permission, {}>>[];
}

export interface BountyTier {
  tierName: string;
  difficultyLevel: string;

  minRequiredReputation: number;
  minRequiredSkillsPt: BN;

  reputationReward: number;
  skillsPtReward: BN;
  payoutReward: BN;
  payoutMint: PublicKey;

  taskSubmissionWindow: number;
  submissionReviewWindow: number;
  addressChangeReqWindow: number;
}
