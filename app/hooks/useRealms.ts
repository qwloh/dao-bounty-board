import { getRealms } from '@solana/spl-governance';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from 'react-query';

import { GOVERNANCE_PROGRAM_ID } from '../api/constants';
import { useAnchorContext } from './useAnchorContext';

export const useRealms = () => {
  const { provider } = useAnchorContext();
  const { data: realms } = useQuery(
    ["realms"],
    () => getRealms(provider.connection, new PublicKey(GOVERNANCE_PROGRAM_ID)),
    {
      enabled: !!provider,
    }
  );
  return {
    realms,
  };
};
