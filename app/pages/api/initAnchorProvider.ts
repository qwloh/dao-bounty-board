// might not need this file after setting up wallet adapter
import "dotenv/config";
import { AnchorProvider, setProvider, Wallet } from "@project-serum/anchor";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

export const paperWalletKeypair = Keypair.fromSecretKey(
  bs58.decode(process.env.SK as string)
);

export default () => {
  //   const connection = new Connection("http://localhost:8899");
  const connection = new Connection(clusterApiUrl("devnet"), "recent");

  const provider = new AnchorProvider(
    connection,
    new Wallet(paperWalletKeypair),
    {
      commitment: "recent",
    }
  );

  setProvider(provider);
  console.log("Provider set.");
};
