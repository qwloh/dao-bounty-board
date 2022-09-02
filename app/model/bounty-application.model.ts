import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export type BountyApplicationStatus = "assigned" | "notAssigned";

export interface BountyApplication {
  bounty: PublicKey;
  applicant: PublicKey;
  contributorRecord: PublicKey;
  validity: BN;
  appliedAt: BN;
  status: Partial<Record<BountyApplicationStatus, {}>>;
}
