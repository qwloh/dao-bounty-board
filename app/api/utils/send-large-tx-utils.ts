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

  console.log("Chunked ixns", chunkedIxs);
  const unsignedTxns: Transaction[] = [];
  for (const ixChunk of chunkedIxs) {
    const transaction = new Transaction();
    ixChunk.forEach((ix) => transaction.add(ix));
    transaction.recentBlockhash = block.blockhash;
    unsignedTxns.push(transaction);
  }
  console.log(
    "Ix in unsigned txns",
    unsignedTxns.map((tx) => tx.instructions)
  );
  console.log(
    "Txns size",
    unsignedTxns.map(
      (tx) =>
        32 +
        32 +
        tx.signatures.length * 32 +
        getInstructionsSize(tx.instructions)
    )
  );

  //   const signedTxns = await wallet.signAllTransactions(unsignedTxns);
  //   console.log("Signed transactions", signedTxns);

  return provider.sendAll(unsignedTxns.map((tx) => ({ tx })));
};

const getInstructionsSize = (ixns: TransactionInstruction[]) => {
  let totalSize = 0;
  for (const ix of ixns) {
    const keySize = 32 * ix.keys.length;
    const dataSize = ix.data.byteLength;
    totalSize += 32 + keySize + dataSize; // first 32 is program id
  }
  return totalSize;
};
