import { useMutation } from "@tanstack/react-query";
import { deleteBounty } from "../../api";
import { useAnchorContext } from "../useAnchorContext";
import { useBounty } from "./useBounty";

export const useDeleteBounty = (bountyPK: string) => {
  const { program } = useAnchorContext();
  const { data } = useBounty(bountyPK);

  return useMutation(() =>
    deleteBounty({
      program,
      bounty: {
        pubkey: data.pubkey,
        // @ts-ignore
        account: data.bounty,
      },
    })
  );
};
