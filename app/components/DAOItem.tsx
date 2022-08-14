import Link from 'next/link';
import React from 'react';

import { H3 } from './H3';

interface IDAOItem {
  name: string
  id: string
  imgUrl: string
}

export const DAOItem = ({ name, id, imgUrl }: IDAOItem) => (
  <Link href={`/dao/${id}`} passHref>
    <a className="group rounded-lg p-8 flex flex-col gap-5 items-center cursor-pointer text-center transition-all bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10">
      <div className="w-16 h-16 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center transition-all group-hover:scale-110">
        <img src={imgUrl} className="w-10" />
      </div>
      <H3>{name}</H3>
    </a>
  </Link>
)
