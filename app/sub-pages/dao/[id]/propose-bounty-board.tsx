import React, { useState } from 'react';

import { AddButton } from '../../../components/AddButton';
import { Card } from '../../../components/Card';
import { H2 } from '../../../components/H2';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { Tag, TagColors } from '../../../components/Tag';
import { useDAOs } from '../../../hooks/useDAOs';

type TagType = {
  color: TagColors
  text: string
}

const defaultTags: TagType[] = [
  {
    color: 'blue',
    text: 'Development',
  },
  {
    color: 'purple',
    text: 'Marketing',
  },
  {
    color: 'yellow',
    text: 'Sale',
  },
  {
    color: 'pink',
    text: 'Design',
  },
]

const assets = ['usdc', 'sol', 'mngo']

const compensationStructure = [
  {
    tier: 's',
    difficulty: 'complex',
    awards: 2000,
    asset: 'usdc',
    skillPoints: 50,
    reputation: 50,
    minSkillPoints: 0,
    minReputation: 0,
  },
  {
    tier: 'aa',
    difficulty: 'moderate',
    awards: 50,
    asset: 'usdc',
    skillPoints: 50,
    reputation: 50,
    minSkillPoints: 0,
    minReputation: 0,
  },
  {
    tier: 'a',
    difficulty: 'easy',
    awards: 50,
    asset: 'usdc',
    skillPoints: 50,
    reputation: 50,
    minSkillPoints: 0,
    minReputation: 0,
  },
  {
    tier: 'entry',
    difficulty: 'first contributor',
    awards: 50,
    asset: 'usdc',
    skillPoints: 50,
    reputation: 50,
    minSkillPoints: 0,
    minReputation: 0,
  },
]
const labels = [
  'Task Tier',
  'Difficulty',
  'Awards',
  '',
  '',
  'Min. Requirements',
  '',
]

export const ProposeBountyBoard = () => {
  const { data: daoData } = useDAOs()
  const [confirming, setConfirming] = useState(false)

  const [tags, setTags] = useState<TagType[]>(defaultTags)
  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 px-6 py-8">
          <H2>SKILLS</H2>
          <div className="flex gap-4">
            {tags?.map((t) => (
              <Tag key={t?.text} disabled={confirming} {...t} />
            ))}
          </div>
          {!confirming && <AddButton>Add Skills</AddButton>}
        </div>
      </Card>
      <Card className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 px-6 py-8">
          <H2>COMPENSATION STRUCTURE</H2>
          <div className="grid grid-cols-7 gap-4 text-text-primary text-base leading-5 capitalize font-medium">
            {labels.map((l) => (
              <span key={l} className="text-text-secondary">
                {l}
              </span>
            ))}
            {compensationStructure.map(
              ({
                tier,
                difficulty,
                awards,
                skillPoints,
                reputation,
                minSkillPoints,
                minReputation,
              }) => (
                <React.Fragment key={tier}>
                  <div className="uppercase">{tier}</div>
                  <div>{difficulty}</div>
                  <div className="flex">
                    {confirming ? (
                      <span>{awards}</span>
                    ) : (
                      <div className=" w-44 rounded outline outline-1 outline-white/20 flex">
                        <Input
                          className="w-1/2 text-right rounded-tr-none rounded-br-none"
                          prefix="$"
                        />
                        <Select className="w-1/2 rounded-tl-none rounded-bl-none">
                          {assets?.map((asset) => (
                            <option value={asset}> {asset}</option>
                          ))}
                        </Select>
                      </div>
                    )}
                  </div>
                  <div>{skillPoints}</div>
                  <div>{reputation}</div>
                  <div>{minSkillPoints}</div>
                  <div>{minReputation}</div>
                </React.Fragment>
              ),
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
