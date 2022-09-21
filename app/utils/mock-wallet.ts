import { Wallet } from "@project-serum/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";

// workaround for not being able to call anchor `Program` to fetch data before user connects wallet
export class MockWallet implements Wallet {
  allowSign: boolean;

  constructor(readonly payer: Keypair, allowSign: boolean = false) {
    this.payer = payer;
    this.allowSign = allowSign;
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    if (!this.allowSign) return Promise.reject("Connect your wallet first.");
    tx.partialSign(this.payer);
    return tx;
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    if (!this.allowSign) return Promise.reject("Connect your wallet first.");
    return txs.map((t) => {
      t.partialSign(this.payer);
      return t;
    });
  }

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }
}
