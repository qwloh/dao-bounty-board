import { AnchorProvider } from "@project-serum/anchor";
import { Transaction, TransactionInstruction } from "@solana/web3.js";

export const sendLargeTx = async (
  provider: AnchorProvider,
  chunkedIxs: TransactionInstruction[][]
) => {
  const connection = provider.connection;
  const wallet = provider.wallet;

  const signerChunks = Array(chunkedIxs.length);
  signerChunks.fill([]); // for our purpose no signers is needed

  console.log(`Creating proposal using ${chunkedIxs.length} chunks`);

  if (!wallet.publicKey) throw new Error("Wallet not connected!");
  //block will be used for timeout calculation
  const block = await connection.getLatestBlockhash("confirmed");

  const unsignedTxns: Transaction[] = [];
  for (const ixChunk of chunkedIxs) {
    const transaction = new Transaction();
    ixChunk.forEach((ix) => transaction.add(ix));
    transaction.recentBlockhash = block.blockhash;
    unsignedTxns.push(transaction);
  }

  //   const signedTxns = await wallet.signAllTransactions(unsignedTxns);
  //   console.log("Signed transactions", signedTxns);

  return provider.sendAll(unsignedTxns.map((tx) => ({ tx })));
};
