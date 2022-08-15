import { useQuery } from 'react-query';

import { getCertifiedRealmInfos } from '../api';
import { useAnchorContext } from './useAnchorContext';

export const useRealmInfos = () => {
  const { provider } = useAnchorContext();
  const { data: realmInfos } = useQuery(
    ["realms-metadata"],
    // () => getRealms(provider.connection, new PublicKey(GOVERNANCE_PROGRAM_ID)),
    () => getCertifiedRealmInfos("devnet"),
    {
      enabled: !!provider,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );

  return {
    realmInfos,
  };
};
