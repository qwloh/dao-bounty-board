import { useMemo, useState } from 'react';

import { DAOItem } from '../components/DAOItem';
import { H1 } from '../components/H1';
import { SearchField } from '../components/Searchfield';

import type { NextPage } from 'next'
const mockDaoData = [
  {
    name: 'Ukraine.SOL',
    id: 'Ukraine',
    imgUrl: 'https://app.realms.today/realms/Ukraine/img/Ukraine_Logo.png',
  },
  {
    name: 'Mango DAO',
    id: 'MNGO',
    imgUrl: 'https://trade.mango.markets/assets/icons/logo.svg',
  },
  {
    name: 'Psy Finance',
    id: 'PSY',
    imgUrl:
      'https://user-images.githubusercontent.com/32071703/149460918-3694084f-2a37-4c95-93d3-b5aaf078d444.png',
  },
  {
    name: 'GRAPE',
    id: 'GRAPE',
    imgUrl: 'https://app.realms.today/realms/Grape/img/grape.png',
  },
  {
    name: 'Realms Ecosystem DAO',
    id: 'RED',
    imgUrl: 'https://app.realms.today/realms/RED/RED.png',
  },
  {
    name: 'Solend DAO',
    id: 'SLND',
    imgUrl:
      'https://solend-image-assets.s3.us-east-2.amazonaws.com/1280-circle.png',
  },
  {
    name: 'Mango Liquidity Council',
    id: 'MangoLiquidityDAO',
    imgUrl: 'https://trade.mango.markets/assets/icons/logo.svg',
  },
]

const Home: NextPage = () => {
  const [searchText, setSearchText] = useState('')

  const filteredData = useMemo(() => {
    return searchText === ''
      ? mockDaoData
      : mockDaoData.filter(({ name }) =>
          name.toLowerCase().includes(searchText.toLowerCase()),
        )
  }, [searchText])
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <H1>DAOs</H1>
        <div className="flex gap-4">
          <SearchField
            placeholder="Search DAOs..."
            onChange={(e) => setSearchText(e.currentTarget.value)}
          />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        {filteredData?.map((props) => (
          <DAOItem key={props.id} {...props} />
        ))}
      </div>
    </div>
  )
}

export default Home
