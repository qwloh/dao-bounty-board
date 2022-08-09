import "dotenv/config";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {
  AnchorProvider,
  Program,
  setProvider,
  utils,
  Wallet,
} from "@project-serum/anchor";
import idl from "../../target/idl/dao_bounty_board.json";
import { BOUNTY_BOARD_PROGRAM_ID } from "../pages/api/initBountyBoardProgram";
import { PROGRAM_AUTHORITY_SEED, TEST_DAO_PK } from "../pages/constants";

const closeAccount = async () => {
  const connection = new Connection("http://localhost:8899");
  // const connection = new Connection(clusterApiUrl("devnet"), "recent");

  const wallet = Keypair.fromSecretKey(bs58.decode(process.env.SK as string));
  console.log("Provider wallet public key", wallet.publicKey.toString());

  const provider = new AnchorProvider(connection, new Wallet(wallet), {
    commitment: "recent",
  });
  setProvider(provider);

  const program = new Program(
    JSON.parse(JSON.stringify(idl)),
    new PublicKey(BOUNTY_BOARD_PROGRAM_ID)
  );

  const seeds = [
    utils.bytes.utf8.encode(PROGRAM_AUTHORITY_SEED),
    new PublicKey(TEST_DAO_PK).toBytes(),
  ];
  const [pda] = await PublicKey.findProgramAddress(
    seeds,
    new PublicKey(BOUNTY_BOARD_PROGRAM_ID)
  );
  console.log("Seeds", seeds);
  console.log("Derived PDA", pda.toString());

  await program.methods
    .test({
      programId: new PublicKey(BOUNTY_BOARD_PROGRAM_ID),
      realmKey: new PublicKey(TEST_DAO_PK),
    })
    .accounts({
      accToClose: pda,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
};

closeAccount();
