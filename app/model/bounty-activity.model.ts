import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export interface BountyActivity {
  bounty: PublicKey;
  activityIndex: number;
  timestamp: BN;
  payload: ActivityPayload;
}

export type ActivityPayload =
  | Apply
  | Assign
  | UnassignOverdue
  | Submit
  | RequestChange
  | UpdateSubmission
  | Accept
  | ForceAccept
  | Reject
  | RejectForUnaddressedChangeRequest;

export interface Apply {
  apply: {
    applicantWallet: PublicKey;
  };
}

export interface Assign {
  assign: {
    actorWallet: PublicKey;
    submissionIndex: number;
    assigneeWallet: PublicKey;
  };
}

export interface UnassignOverdue {
  unassignOverdue: {
    actorWallet: PublicKey;
    submissionIndex: number;
    assigneeWallet: PublicKey;
    repDeducted: number;
  };
}

export interface Submit {
  submit: {
    assigneeWallet: PublicKey;
    submissionIndex: number;
  };
}

export interface RequestChange {
  requestChange: {
    actorWallet: PublicKey;
    submissionIndex: number;
    comment: string;
  };
}

export interface UpdateSubmission {
  updateSubmission: {
    assigneeWallet: PublicKey;
    submissionIndex: number;
  };
}

export interface Accept {
  accept: {};
}

export interface ForceAccept {
  forceAccept: {};
}

export interface Reject {
  reject: {
    actorWallet: PublicKey;
    submissionIndex: number;
    comment: string;
  };
}

export interface RejectForUnaddressedChangeRequest {
  rejectForUnaddressedChangeRequest: {
    actorWallet: PublicKey;
    submissionIndex: number;
  };
}
