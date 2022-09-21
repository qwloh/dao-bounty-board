import { AnchorProvider, Program, setProvider } from "@project-serum/anchor";
import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import React, { createContext } from "react";

import idl from "../../target/idl/dao_bounty_board.json";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import { BOUNTY_BOARD_PROGRAM_ID } from "../api/constants";
import { MockWallet } from "../utils/mock-wallet";

interface AnchorContextInterface {
  connection: Connection;
  walletConnected: boolean;
  wallet: AnchorWallet;
  provider: AnchorProvider;
  program: Program<DaoBountyBoard>;
}

export const AnchorContext = createContext<AnchorContextInterface | null>(null);

const AnchorContextProvider = ({ children }) => {
  const connection = new Connection(clusterApiUrl("devnet"), "processed");

  const anchorWallet = useAnchorWallet();
  const walletConnected = !!anchorWallet;

  const wallet = anchorWallet || new MockWallet(Keypair.generate()); // anchor program needs a wallet anyhow to fetch data

  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });
  setProvider(provider);

  const bountyBoardProgram = new Program(
    JSON.parse(JSON.stringify(idl)),
    new PublicKey(BOUNTY_BOARD_PROGRAM_ID)
  ) as Program<DaoBountyBoard>;

  return (
    <AnchorContext.Provider
      value={{
        connection,
        walletConnected,
        wallet,
        provider,
        program: bountyBoardProgram,
      }}
    >
      {children}
    </AnchorContext.Provider>
  );
};

export default AnchorContextProvider;
