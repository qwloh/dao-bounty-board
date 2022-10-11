import React from "react";

import { DAOItem } from "../components/DAOItem";
import { H1 } from "../components/H1";
import { SearchField } from "../components/Searchfield";

import type { NextPage } from "next";
import { useRealms } from "../hooks/realm/useRealms";
import { useSearch } from "../hooks/ui-list-engine/useSearch";
import { useSelector } from "../hooks/useSelector";
import { Demo } from "../components/demo/Demo";

const Home: NextPage = () => {
  // const { data: realms } = useRealms();
  // const realmSubset = useSelector({
  //   data: realms,
  //   selector: (r) => !!r.meta,
  // });
  // const { result, updateSearchTerm } = useSearch(realmSubset, {
  //   fieldsToSearch: ["name", "pubkey"],
  // });

  return (
    <div className="flex flex-col gap-4">
      <Demo />
      {/* <div className="flex justify-between">
        <H1>DAOs</H1>
        <div className="flex gap-4">
          <SearchField
            placeholder="Search DAOs..."
            onChange={(e) => updateSearchTerm(e.currentTarget.value)}
          />
        </div>
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        {result.map((props) => (
          <DAOItem key={props.pubkey.toString()} {...props.meta} />
        ))}
      </div> */}
    </div>
  );
};

export default Home;
