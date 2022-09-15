import { Wallet } from "@project-serum/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";

// workaround for not being able to call anchor `Program` to fetch data before user connects wallet
export class PaperWallet implements Wallet {
  mock: boolean;

  constructor(readonly payer: Keypair, mock: boolean) {
    this.payer = payer;
    this.mock = mock;
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    if (this.mock) return Promise.reject("Connect your wallet first.");
    tx.partialSign(this.payer);
    return tx;
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    if (this.mock) return Promise.reject("Connect your wallet first.");
    return txs.map((t) => {
      t.partialSign(this.payer);
      return t;
    });
  }

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }
}
