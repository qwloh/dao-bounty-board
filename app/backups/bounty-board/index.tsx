import { useMemo } from 'react';

import { DAOPageHeader } from '../../components/DAOPageHeader';
import { PageContainer } from '../../components/PageContainer';
import { BountyBoard } from '../../sub-pages/dao/[id]/bounty-board';

import type { NextPage } from 'next'
export type DAOTabsType = 'bounty-board' | 'proposals' | 'about'

const BountyBoardPage: NextPage = () => {
  return (
    <PageContainer>
      <DAOPageHeader />
      <BountyBoard />
    </PageContainer>
  )
}

export default BountyBoardPage
