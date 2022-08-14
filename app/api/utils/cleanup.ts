import "dotenv/config";
import {
  AnchorProvider,
  Program,
  setProvider,
  Wallet,
} from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { Keypair, PublicKey } from "@solana/web3.js";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { DaoBountyBoard } from "../../../target/types/dao_bounty_board";
import { BOUNTY_BOARD_PROGRAM_ID } from "../constants";
import { cleanUpBountyBoard, cleanUpContributorRecord } from "./test-assist";
import idl from "../../../target/idl/dao_bounty_board.json";

// bounty board PDA 3q3na9snfaaVi5e4qNNFRzQiXyRF6RiFQ15aSPBWxtKf
// bounty board vault PDA EMZypZAEaHxGhJPbU6HCYYJxYzGnNGPDgmH1GsKcEjBN
// First vault mint ATA ApSd7STwzfVVopcMGVAHfHAAJ89g1y1RouCWphTwWN1m
// Council mint governance 63t4tEfLcBwRvhHuTX9BGVT1iHm5dJjez1Bbb5QS9XJF
// Contributor record 3Vcc8yZ8TStRVNGA79RFVNZ42PonYGztv7bLsD7Nje7B

const TEST_REALM_PK = new PublicKey(
  "885LdWunq8rh7oUM6kMjeGV56T6wYNMgb9o6P7BiT5yX"
);
const TEST_BOUNTY_BOARD_PK = new PublicKey(
  "3q3na9snfaaVi5e4qNNFRzQiXyRF6RiFQ15aSPBWxtKf"
);
const TEST_BOUNTY_BOARD_VAULT_PK = new PublicKey(
  "EMZypZAEaHxGhJPbU6HCYYJxYzGnNGPDgmH1GsKcEjBN"
);
const TEST_REALM_TREASURY_USDC_ATA = new PublicKey(
  "ApSd7STwzfVVopcMGVAHfHAAJ89g1y1RouCWphTwWN1m"
);
const TEST_CONTRIBUTOR_RECORD_PK = new PublicKey(
  "3Vcc8yZ8TStRVNGA79RFVNZ42PonYGztv7bLsD7Nje7B"
);

(async () => {
  const paperWalletKeypair = Keypair.fromSecretKey(
    bs58.decode(process.env.SK as string)
  );

  const connection = new Connection(clusterApiUrl("devnet"), "recent");
  const provider = new AnchorProvider(
    connection,
    new Wallet(paperWalletKeypair),
    {
      commitment: "recent",
    }
  );
  setProvider(provider);

  const programId = new PublicKey(BOUNTY_BOARD_PROGRAM_ID);
  const program = new Program(
    JSON.parse(JSON.stringify(idl)),
    programId
  ) as Program<DaoBountyBoard>;

  console.log("--- Cleanup logs ---");
  await cleanUpContributorRecord(provider, program, TEST_CONTRIBUTOR_RECORD_PK);
  await cleanUpBountyBoard(
    provider,
    program,
    TEST_BOUNTY_BOARD_PK,
    TEST_BOUNTY_BOARD_VAULT_PK,
    TEST_REALM_TREASURY_USDC_ATA
  );
})();
