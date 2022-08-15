import Link from 'next/link';
import React from 'react';

import { RealmInfo } from '../api';
import { H3 } from './H3';

interface IDAOItem {
  name: string
  id: string
  imgUrl: string
}

// symbol: string;
//   programId: PublicKey;
//   programVersion?: number;
//   realmId: PublicKey;
//   website?: string;
//   // Specifies the realm mainnet name for resource lookups
//   // It's required for none mainnet environments when the realm name is different than on mainnet
//   displayName?: string;
//   // Website keywords
//   keywords?: string;
//   // twitter:site meta
//   twitter?: string;
//   // og:image
//   ogImage?: string;

//   // banner mage
//   bannerImage?: string;

//   // Allow Realm to send email/SMS/Telegram/etc., notifications to governance members using Notifi
//   enableNotifi?: boolean;

//   isCertified: boolean;

//   // 3- featured DAOs  ,2- new DAO with active proposals, 1- DAOs with active proposal,
//   sortRank?: number;

//   // The default shared wallet of the DAO displayed on the home page
//   // It's used for crowdfunding DAOs like  Ukraine.SOL or #Unchain_Ukraine
//   sharedWalletId?: PublicKey;

export const DAOItem = ({
  displayName,
  symbol,
  bannerImage,
  ogImage,
}: RealmInfo) => (
  <Link href={`/dao/${symbol}/bounty-board`} passHref>
    <a className="group rounded-lg p-8 flex flex-col gap-5 items-center cursor-pointer text-center transition-all bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10">
      <div className="w-16 h-16 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center transition-all group-hover:scale-110">
        {ogImage && <img src={ogImage} className="w-10" />}
        {!ogImage && bannerImage && <img src={bannerImage} className="w-10" />}
        {!ogImage && symbol && (
          <span className=" text-2xl font-bold uppercase">
            {symbol.slice(0, 3)}
          </span>
        )}
      </div>
      <H3>{displayName || symbol}</H3>
    </a>
  </Link>
)
