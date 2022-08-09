import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "../../../target/idl/dao_bounty_board.json";
import initAnchorProvider from "./initAnchorProvider";

export const BOUNTY_BOARD_PROGRAM_ID =
  "5A1DLgMJbQPUnhfFR6pCpDYVTuGn9YBjiW4aCatm41tH";

initAnchorProvider();

const program = new Program(
  JSON.parse(JSON.stringify(idl)),
  new PublicKey(BOUNTY_BOARD_PROGRAM_ID)
);
console.log("Program init success.");

export default program;
