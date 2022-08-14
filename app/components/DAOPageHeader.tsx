import React, { useMemo } from 'react';

import { useDAOs } from '../hooks/useDAOs';
import { useRouter } from '../hooks/useRouter';
import { Back } from './Back';
import { DAOHeader } from './DAOHeader';
import { DAONav } from './DAONav';

export const DAOPageHeader = () => {
  const { ids } = useRouter()
  const { data: DAOs } = useDAOs()
  const daoId = ids[0]

  const selectedDaoInfo = useMemo(() => DAOs?.find((d) => d?.id === daoId), [
    JSON.stringify(DAOs),
    daoId,
  ])

  const imgUrl = selectedDaoInfo?.imgUrl
  const name = selectedDaoInfo?.name
  return (
    <div className="flex flex-col gap-6">
      <Back />
      <DAOHeader daoId={String(daoId)} imgUrl={imgUrl} name={name} />
      <DAONav />
    </div>
  )
}
