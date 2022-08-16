import { PublicKey } from "@solana/web3.js";
import React, { useMemo, useState } from "react";

import { TEST_REALM_PK } from "../api/constants";
import { DAOItem } from "../components/DAOItem";
import { H1 } from "../components/H1";
import { SearchField } from "../components/Searchfield";
import { useAnchorContext, useRealm } from "../hooks";
import { useRealmInfos } from "../hooks/useRealmInfos";

import type { NextPage } from "next";
const Home: NextPage = () => {
  const { realmInfos } = useRealmInfos();

  const [searchText, setSearchText] = useState("");

  console.log("realmInfos, ", realmInfos);

  const filteredData = useMemo(() => {
    return searchText === ""
      ? realmInfos
      : realmInfos?.filter((info) => {
          return (
            info.displayName &&
            info.displayName.toLowerCase().includes(searchText.toLowerCase())
          );
        });
  }, [searchText, JSON.stringify(realmInfos)]);

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
          <DAOItem key={props.symbol} {...props} />
        ))}
      </div>
    </div>
  );
};

export default Home;
