import { useEffect, useMemo, useState } from 'react';

import { DAOPageHeader } from '../../../components/DAOPageHeader';
import { PageContainer } from '../../../components/PageContainer';
import { useRouter } from '../../../hooks/useRouter';
import { BountyBoard } from '../../../sub-pages/dao/[id]/bounty-board';
import { ProposeBountyBoard } from '../../../sub-pages/dao/[id]/propose-bounty-board';

import type { NextPage } from 'next'
export type DAOTabsType = 'bounty-board' | 'proposals' | 'about'

const DAO: NextPage = () => {
  const { ids, replace, currentRoute } = useRouter()
  const daoId = ids?.[0]
  const activeTab = ids?.[1]
  useEffect(() => {
    if (!activeTab && daoId) {
      replace(`/dao/${daoId}/bounty-board`)
    }
  }, [daoId])
  return (
    <PageContainer>
      <DAOPageHeader />
      {currentRoute === 'bounty-board' && <BountyBoard />}
      {currentRoute === 'propose' && <ProposeBountyBoard />}
    </PageContainer>
  )
}

export default DAO
