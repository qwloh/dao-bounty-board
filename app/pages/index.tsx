import React, { useMemo, useState } from 'react';

import { DAOItem } from '../components/DAOItem';
import { H1 } from '../components/H1';
import { SearchField } from '../components/Searchfield';
import { useDAOs } from '../hooks/useDAOs';

import type { NextPage } from 'next'
const Home: NextPage = () => {
  const [searchText, setSearchText] = useState('')

  const { data: DAOs } = useDAOs()

  const filteredData = useMemo(() => {
    return searchText === ''
      ? DAOs
      : DAOs?.filter(({ name }) =>
          name.toLowerCase().includes(searchText.toLowerCase()),
        )
  }, [searchText, JSON.stringify(DAOs)])

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
