import Link from 'next/link';
import React from 'react';

import { RealmInfo } from '../api';
import { H1 } from './H1';
import { Globe } from './Icons/Globe';
import { MoreIcon } from './Icons/MoreIcon';
import { SettingIcon } from './Icons/SettingIcon';
import { TwitterPlain } from './Icons/TwitterPlain';

export const DAOHeader = ({
  displayName,
  symbol,
  bannerImage,
  ogImage,
  website,
  twitter,
}: RealmInfo) => {
  return (
    <div className="flex justify-between">
      <div className="flex gap-4 items-center w-full">
        <div className="rounded-full w-20 h-20 flex items-center justify-center bg-white/5">
          {ogImage && <img src={ogImage} />}
          {!ogImage && symbol && (
            <span className=" text-2xl font-bold uppercase">
              {symbol?.slice(0, 3)}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <div className="w-full flex justify-between">
            <H1>{displayName || symbol || ''}</H1>
            <div className="ml-auto flex gap-4 items-center justify-center">
              {website && (
                <Link href={website} passHref>
                  <a
                    className="text-xl font-medium hover:opacity-60"
                    target="_blank"
                  >
                    <Globe />
                  </a>
                </Link>
              )}
              {twitter && (
                <Link href={website} passHref>
                  <a
                    className="text-2xl font-medium hover:opacity-60"
                    target="_blank"
                  >
                    <TwitterPlain />
                  </a>
                </Link>
              )}
              <span className="text-2xl cursor-pointer font-medium hover:opacity-60">
                <SettingIcon />
              </span>
              <span className="text-2xl cursor-pointer font-medium hover:opacity-60">
                <MoreIcon />
              </span>
            </div>
          </div>
          {symbol && (
            <Link href={`https://app.realms.today/dao/${symbol}`} passHref>
              <a
                className="text-sm font-medium hover:opacity-60 w-fit"
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
