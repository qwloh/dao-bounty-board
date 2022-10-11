import { utils } from "@project-serum/anchor";

export const bytesToStr = (bytes: Iterable<number>) => {
  return utils.bytes.utf8
    .decode(Uint8Array.from(bytes))
    .trim()
    .replace(/\0/g, ""); // replace null bytes if the byte array was padded to certain length
};

export const bytesToAddressStr = (bytes: Iterable<number>) => {
  return utils.bytes.bs58.encode(Uint8Array.from(bytes));
};

export const bytesToNumber = (bytes: Iterable<number>, endianness = "le") => {
  let binary = "";
  for (const byte of bytes) {
    switch (endianness) {
      case "be":
        binary += byte.toString(2);
        break;
      case "le":
        binary = byte.toString(2) + binary;
        break;
      default:
        console.warn("Unknown endianness", endianness);
        break;
    }
  }
  return parseInt(binary, 2);
};
