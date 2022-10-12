import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Skill } from "./bounty.model";

interface SkillsPt {
  skill: Skill;
  point: BN;
}

export interface ContributorRecord {
  initialized: boolean;

  bountyBoard: PublicKey;
  realm: PublicKey;
  associatedWallet: PublicKey;
  role: string;

  reputation: BN;
  skillsPt: SkillsPt[];
  bountyCompleted: number;
  recentRepChange: BN;
}

export interface ContributorRecordItem {
  role: string;
  reputation: bigint;
}
