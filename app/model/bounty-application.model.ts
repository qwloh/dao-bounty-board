import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export enum BountyApplicationStatus {
  assigned,
  notAssigned,
}

export interface BountyApplication {
  bounty: PublicKey;
  applicant: PublicKey;
  contributorRecord: PublicKey;
  validity: BN;
  appliedAt: BN;
  status: keyof typeof BountyApplicationStatus;
}
