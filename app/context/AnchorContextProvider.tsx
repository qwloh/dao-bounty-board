import { AnchorProvider, Program, setProvider } from '@project-serum/anchor';
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import React, { createContext } from 'react';

import idl from '../../target/idl/dao_bounty_board.json';
import { DaoBountyBoard } from '../../target/types/dao_bounty_board';
import { BOUNTY_BOARD_PROGRAM_ID } from '../api/constants';

interface AnchorContextInterface {
  wallet: AnchorWallet
  provider: AnchorProvider
  program: Program<DaoBountyBoard>
}

export const AnchorContext = createContext<AnchorContextInterface | null>(null)

const AnchorContextProvider = ({ children }) => {
  const anchorWallet = useAnchorWallet()

  let provider
  let bountyBoardProgram

  if (anchorWallet) {
    const connection = new Connection(clusterApiUrl('devnet'), 'processed')
    provider = new AnchorProvider(connection, anchorWallet, {
      preflightCommitment: 'processed',
    })
    setProvider(provider)
    bountyBoardProgram = new Program(
      JSON.parse(JSON.stringify(idl)),
      new PublicKey(BOUNTY_BOARD_PROGRAM_ID),
    ) as Program<DaoBountyBoard>
  }

  return (
    <AnchorContext.Provider
      value={{
        wallet: anchorWallet,
        provider,
        program: bountyBoardProgram,
      }}
    >
      {children}
    </AnchorContext.Provider>
  )
}

export default AnchorContextProvider
