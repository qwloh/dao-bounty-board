import React, { useMemo } from 'react';

import { useRealmInfoBySymbol } from '../hooks/useRealmInfoBySymbol';
import { useRouter } from '../hooks/useRouter';
import { Back } from './Back';
import { DAOHeader } from './DAOHeader';
import { DAONav } from './DAONav';

export const DAOPageHeader = () => {
  const { symbol } = useRouter()
  const { realmInfo } = useRealmInfoBySymbol(symbol)

  return (
    <div className="flex flex-col gap-6">
      <Back />
      <DAOHeader {...realmInfo} />
      <DAONav />
    </div>
  )
}
