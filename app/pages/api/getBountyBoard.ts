import { PublicKey } from "@solana/web3.js";
import "dotenv/config";
import bountyBoardProgram from "./initBountyBoardProgram";

export const getBountyBoards = async (): Promise<PublicKey[]> => {
  // fetch only pub key
  return [] as PublicKey[];
};

export const getBountyBoard = async (bountyBoardPk: string) => {
  const bountyBoardPubkey = new PublicKey(bountyBoardPk);
  const bountyBoard =
    await bountyBoardProgram.account.bountyBoard.fetchNullable(
      bountyBoardPubkey
    );
  console.log("Bounty board", bountyBoard);

  return bountyBoard;
};

getBountyBoard("8B5wLgaVbGbi1WUmMceyusjVSKP24n8wZRwDNGsUHH1a");
