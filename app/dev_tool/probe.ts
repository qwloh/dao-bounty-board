import "dotenv/config";
import { AnchorProvider, setProvider, Wallet } from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {
  getAllGovernances,
  getGovernance,
  getNativeTreasuryAddress,
  Governance,
  GovernanceAccountType,
} from "@solana/spl-governance";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { GOVERNANCE_PROGRAM_ID, TEST_REALM_PK } from "../api/constants";
import { readableTokenAcc } from "../api/utils";

(async () => {
  const paperWalletKeypair = Keypair.fromSecretKey(
    bs58.decode(process.env.SK as string)
  );
  const connection = new Connection(clusterApiUrl("devnet"), "recent");
  const provider = new AnchorProvider(
    connection,
    new Wallet(paperWalletKeypair),
    { commitment: "recent" }
  );
  setProvider(provider);
  // const someAcc = await getAccount(
  //   provider.connection,
  //   new PublicKey("ApSd7STwzfVVopcMGVAHfHAAJ89g1y1RouCWphTwWN1m")
  // );
  // console.log(someAcc.owner.toString());
  // console.log({
  //   ...someAcc,
  //   address: someAcc.address.toString(),
  //   mint: someAcc.mint.toString(),
  //   owner: someAcc.owner.toString(),
  // });

  // const add = await getAssociatedTokenAddress(
  //   someAcc.mint,
  //   someAcc.owner,
  //   true,
  //   TOKEN_PROGRAM_ID,
  //   ASSOCIATED_TOKEN_PROGRAM_ID
  // );
  // console.log(add.toString());

  // const nativeTreasuryAddress = await getNativeTreasuryAddress(
  //   new PublicKey(GOVERNANCE_PROGRAM_ID),
  //   new PublicKey("63t4tEfLcBwRvhHuTX9BGVT1iHm5dJjez1Bbb5QS9XJF")
  // );
  // console.log(nativeTreasuryAddress.toString());

  // const tokenAccounts = await provider.connection.getTokenAccountsByOwner(
  //   new PublicKey("9XxWeFutsxzmLNxRuUj9pwipKgQkAFwHUmGVbxE3EnxK"),
  //   {
  //     mint: new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"),
  //   },
  //   "recent"
  // );
  // console.log(tokenAccounts);

  const ata = await getAccount(
    connection,
    new PublicKey("CVCtwsNWqvAJUcq3QvEaUAaL8dZtxDfD27UKc9fVnmP9")
  );
  console.log("ATA", readableTokenAcc(ata));
  console.log("ATA owner", ata.owner.toString());
  console.log("ATA mint", ata.mint.toString());

  // const governances = await getAllGovernances(
  //   provider.connection,
  //   new PublicKey(GOVERNANCE_PROGRAM_ID),
  //   new PublicKey(TEST_REALM_PK)
  // );
  // console.log(
  //   governances.map((g) => ({
  //     ...g,
  //     pubkey: g.pubkey.toString(),
  //     owner: g.owner.toString(),
  //     accountType: GovernanceAccountType[g.account.accountType],
  //     governedAccount: g.account.governedAccount.toString(),
  //   }))
  // );
})();
