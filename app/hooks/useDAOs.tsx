import { useQuery } from 'react-query';

import { querykeys } from './queryKeys';

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

export const useDAOs = () => {
  return useQuery(querykeys.getDAOs(), async () => {
    return mockDaoData as typeof mockDaoData
  })
}
