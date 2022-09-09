import { utils } from "@project-serum/anchor";

export const mapBytesToStr = (bytes: Iterable<number>) => {
  return utils.bytes.utf8
    .decode(Uint8Array.from(bytes))
    .trim()
    .replace(/\0/g, "");
};
