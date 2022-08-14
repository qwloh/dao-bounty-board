import React from 'react';

import { Card } from '../../../components/Card';
import { SetupBountyBoard } from '../../../components/Graphics/SetUpBountyBoard';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { useRouter } from '../../../hooks/useRouter';

export const BountyBoard = () => {
  const { push, ids } = useRouter()
  const propose = () => push(`${ids?.join('/')}/propose`)
  return (
    <Card glow className="h-[44rem] p-12 flex items-center justify-between">
      <div className="flex flex-col gap-8">
        <div className="text-5xl text-tnight-200 font-black leading-snug">
          <span>Set Up</span>
          <span className="text-accent">{` Bounty Board`}</span>
          <br />
          <span>For Your DAO</span>
        </div>
        <div className="text-base font-medium text-tnight-500 leading-6">
          Lorem ipsum dolor sit amet, consectetur
          <br /> adipiscing elit. Sagittis amet tincidunt tellus
        </div>
        <div>
          <PrimaryButton onClick={propose}>Propose</PrimaryButton>
        </div>
      </div>
      <SetupBountyBoard className="fixed bottom-0 right-0 max-w-full max-h-[50%] md:max-h-full opacity-20 blur-sm z-0 md:relative md:w-auto md:h-full md:opacity-100 md:blur-0" />
    </Card>
  )
}
