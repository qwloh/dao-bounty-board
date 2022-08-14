import Link from 'next/link';
import React from 'react';

import { useRouter } from '../hooks/useRouter';

const routes = [
  {
    label: 'Bounty Board',
    value: 'bounty-board',
  },
  {
    label: 'Proposal',
    value: 'proposal',
  },
  {
    label: 'About',
    value: 'about',
  },
]

export const DAONav = () => {
  const { ids } = useRouter()
  const id = ids?.[0]
  const activeTab = ids?.[1]

  return (
    <div className="flex justify-center items-center gap-4 h-14 sticky top-14 overflow-auto">
      {routes?.map(({ label, value }) => (
        <Link key={value} href={`/dao/${id}/${value}`} replace passHref>
          <a
            className={`relative shrink-0 flex flex-col gap-2 items-center justify-center font-bold duration-300 text-sm md:text-base transition-all group px-4 ${
              activeTab === value ? 'opacity-100 text-accent' : 'opacity-60'
            } hover:opacity-100`}
          >
            <span>{label}</span>
            <span
              className={`absolute -bottom-2 h-1 rounded-full w-full bg-current transition-all duration-300 scale-x-0 ${
                value === activeTab
                  ? 'opacity-100 scale-x-100'
                  : 'opacity-0 group-hover:opacity-50 group-hover:scale-x-50'
              }`}
            />
          </a>
        </Link>
      ))}
    </div>
  )
}
