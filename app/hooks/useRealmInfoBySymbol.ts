import { useQuery } from 'react-query';

import { useRealmInfos } from './useRealmInfos';

export const useRealmInfoBySymbol = (symbol: string) => {
  const { realmInfos } = useRealmInfos();

  const { data: realmInfo } = useQuery(
    ["realm-metadata", symbol],
    () => {
      if (realmInfos && symbol) {
        return realmInfos.find(
          (r) => r.symbol.toString() === symbol.toString()
        );
      }
    },
    {
      enabled: !!realmInfos,
    }
  );

  return {
    realmInfo,
  };
};
