import React, { useMemo } from "react";
import { useRealm } from "../hooks/realm/useRealm";

import { useRouter } from "../hooks/useRouter";
import { Back } from "./Back";
import { DAOHeader } from "./DAOHeader";
import { DAONav } from "./DAONav";

export const DAOPageHeader = () => {
  const { symbol } = useRouter();
  const { data: realm } = useRealm(symbol);

  return (
    <div className="flex flex-col gap-6">
      <Back />
      {realm && <DAOHeader {...realm.metadata} />}
      <DAONav />
    </div>
  );
};
