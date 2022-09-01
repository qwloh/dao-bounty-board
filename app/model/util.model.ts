import { PublicKey } from "@solana/web3.js";

export interface BountyBoardProgramAccount<T> {
  pubkey: PublicKey;
  account: T;
}
