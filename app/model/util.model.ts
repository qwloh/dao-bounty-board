import { PublicKey } from "@solana/web3.js";

export interface BountyBoardProgramAccount<T> {
  pubkey: PublicKey;
  account: T;
}

export interface CallbacksForUI {
  onSuccess?: (data: unknown, variables: unknown, context: unknown) => void;
  onError?: (error: unknown, variables: unknown, context: unknown) => void;
}
