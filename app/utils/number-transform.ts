import BN from "bn.js";

export const _BNtoBigInt = (n: BN): bigint => {
  const nStr = n.toString();
  return BigInt(nStr);
};
