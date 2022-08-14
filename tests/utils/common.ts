import { PublicKey } from "@solana/web3.js";

// print util
export const readableTokenAcc = (account: any) => {
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
