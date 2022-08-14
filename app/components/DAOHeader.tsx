import Link from 'next/link';
import React from 'react';

import { H1 } from './H1';

interface IDAOHeader extends React.HTMLAttributes<HTMLDivElement> {
  daoId?: string
  imgUrl?: string
  name?: string
}

export const DAOHeader = ({ daoId, imgUrl, name }: IDAOHeader) => {
  return (
    <div className="flex justify-between">
      <div className="flex gap-4 items-center">
        <div className="rounded-full w-20 h-20 flex items-center justify-center bg-white/5">
          {imgUrl && <img src={imgUrl} />}
        </div>
        <div className="flex flex-col gap-1">
          <H1>{name || ''}</H1>
          {daoId && (
            <Link href={`https://app.realms.today/dao/${daoId}`} passHref>
              <a
                className="text-sm font-medium hover:opacity-60"
                target="_blank"
              >
                View on Realm
              </a>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
