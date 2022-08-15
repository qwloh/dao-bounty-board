import { Account } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export const readableTokenAcc = (account: Account) => {
  let readablePrint = {} as any;
  for (const [key, val] of Object.entries(account)) {
    readablePrint[key] =
      val instanceof PublicKey
        ? val.toString()
        : val instanceof BigInt
        ? val.valueOf()
        : val;
  }
  return readablePrint;
};
